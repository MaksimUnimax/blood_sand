# Marketplace Question Operator — R2A Ozon Adapter

PROJECT: `/opt/marketplace-question-operator`

START HEAD: `1810cbce137d05a7d47737bfbad645e76c387a7e`

This is a coding task. Do not audit the whole project. Implement one complete marketplace adapter slice: Ozon read + send + reconcile, with behavioral tests using mocked HTTP only.

## Goal

Implement production-capable Ozon adapter code and tests. Do not implement Wildberries, Telegram handlers, polling/orchestrator, credentials installation, live Codex, or systemd in this run.

Preserve existing persistence/state code already passing.

## Files

Work primarily in existing:

- `app/marketplaces/base.py`
- `app/marketplaces/ozon.py`
- `app/config.py` only if needed for non-secret adapter config
- `tests/test_ozon_adapter.py`

Make the smallest schema/repository change only if required to persist Ozon SKU/write identity.

## HTTP contract

Use an injected `httpx.AsyncClient` so tests can pass `httpx.MockTransport`.

Base URL:

`https://api-seller.ozon.ru`

Future headers:

- `Client-Id: <OZON_CLIENT_ID>`
- `Api-Key: <OZON_API_KEY>`
- `Content-Type: application/json`

Do not request or store real credentials in this run.

Timeout policy for production-created clients:

- connect 10s
- read 20s
- write 20s
- pool 20s

No generic retry wrapper around writes.

## Read

Implement:

`async fetch_unanswered_questions()`

Request:

`POST /v1/question/list`

Initial body:

```json
{
  "filter": {"status": "UNPROCESSED"},
  "limit": 100,
  "last_id": "",
  "sort_dir": "DESC"
}
```

Paginate with returned `last_id` while `has_next` is true, maximum 10 pages.

Normalize each question into the shared adapter model/result with at least:

- marketplace=`ozon`
- external_question_id
- question_text
- question_created_at
- raw_status
- product_id / SKU
- product_article/title if present
- product/question URL if present

Critical: preserve exact SKU/write identity. Never reconstruct SKU from URL/title.

Clear Ozon permission/plan/auth failures must surface as a structured adapter error, not browser fallback.

## Send

Implement:

`async send_answer(question, text)`

Validate exact text length 2..3000 before HTTP call.

Request:

`POST /v1/question/answer/create`

Body:

```json
{
  "question_id": "<stored external question id>",
  "sku": <stored SKU>,
  "text": "<exact approved revision text>"
}
```

Do not trim, rewrite, or rephrase approved text.

Parse returned `answer_id` when available.

Result semantics:

- SUCCESS
- CLEAR_FAILURE
- AMBIGUOUS

If transport failure occurs after a write may have been transmitted, return AMBIGUOUS. Do not issue a second write automatically.

## Reconcile

Implement:

`async reconcile_answer(question, expected_text, send_started_at)`

Use:

`POST /v1/question/answer/list`

with the stored `question_id` and SKU according to the existing A1 contract.

Return:

- MATCHED — exact expected text found in plausible send-time context
- NOT_FOUND — only with positive evidence it is absent
- UNKNOWN — insufficient evidence

Insufficient/shape-ambiguous response must be UNKNOWN, never guessed as NOT_FOUND.

## Errors/secrets

Use the existing/shared adapter result/error types or define the smallest coherent shared types in `base.py`.

Credential values must never appear in exception messages, result reprs, or logs.

## Behavioral tests

Tests must exercise production adapter code via `httpx.MockTransport`.

Add at least these tests:

1. first list request has correct URL, headers, body
2. pagination uses returned `last_id`
3. pagination stops at max 10 pages
4. normalization preserves external question ID and SKU
5. send uses exact revision text and stored SKU
6. invalid text length performs zero HTTP write requests
7. success parses `answer_id`
8. ambiguous transport result performs exactly one write request and returns AMBIGUOUS
9. reconciliation exact-text match returns MATCHED
10. insufficient reconciliation evidence returns UNKNOWN
11. errors/results do not expose Client-Id or Api-Key

No public network calls.

## Verification

Run targeted tests:

`.venv/bin/python -m pytest tests/test_ozon_adapter.py -q`

Then full suite:

`.venv/bin/python -m pytest -q`

Existing 46 tests must remain passing.

Before report:

- `git status --short`
- `git diff --stat`
- inspect diff for secrets

Commit:

`feat: implement Ozon marketplace adapter`

PASS requires a real diff, behavioral tests, clean working tree after commit, and `FINAL_HEAD != START_HEAD`.

## Report

Return:

```text
MQO_R2A_REPORT

START_HEAD=
FINAL_HEAD=
FILES_CHANGED=

OZON_READ=IMPLEMENTED
OZON_SEND=IMPLEMENTED
OZON_RECONCILIATION=IMPLEMENTED
AMBIGUOUS_WRITE_NO_RETRY=IMPLEMENTED

TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=

BEHAVIOR_EVIDENCE=
- request/headers/body:
- pagination:
- 10-page cap:
- normalization/SKU:
- exact send body:
- invalid length zero write:
- answer_id:
- ambiguous one-write:
- reconcile MATCHED:
- reconcile UNKNOWN:
- credential redaction:

GIT_STATUS=
NETWORK_CALLS=0
LIVE_MARKETPLACE_READS=0
LIVE_MARKETPLACE_WRITES=0
SECRETS_TOUCHED=none
UNRELATED_SERVICES_MODIFIED=none

FINAL_STATUS=MQO_R2A_PASS
```

PASS is forbidden if Ozon adapter remains a stub, writes are blindly retried, tests are not behavioral, or `FINAL_HEAD == START_HEAD`.
