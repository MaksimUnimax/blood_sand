# Marketplace Question Operator — R2 Marketplace Adapters

## Task

Implement the production-capable Ozon and Wildberries marketplace adapter layer in the existing project, with all behavior verified through mocked HTTP only.

## Project

`/opt/marketplace-question-operator`

Expected start HEAD:

`1810cbce137d05a7d47737bfbad645e76c387a7e`

This is a coding task. Do not re-audit the whole repository and do not redesign the architecture.

## Current state to preserve

Already implemented and passing:

- question persistence, deduplication and public Q-IDs;
- immutable answer revisions;
- guarded state transitions;
- revision-bound send claim and double-send protection;
- send completion states;
- Codex profile settings and draft-attempt persistence;
- Telegram reply correlation storage;
- recent error coalescing;
- five-day technical retention.

Do not replace these foundations.

## Scope

Implement only the marketplace layer:

1. common adapter contracts/results;
2. production Ozon HTTP adapter;
3. production Wildberries HTTP adapter;
4. read pagination and normalization;
5. approved-answer send operations;
6. ambiguous-write classification and reconciliation;
7. mocked behavioral tests.

Do not implement Telegram handlers, scheduler/polling orchestration, live Codex execution, credentials installation or systemd in this run.

## Common adapter contract

Provide a coherent async interface equivalent to:

```python
async fetch_unanswered_questions() -> list[NormalizedQuestion]
async send_answer(question, text) -> SendResult
async reconcile_answer(question, expected_text, send_started_at) -> ReconcileResult
```

Use structured result types rather than raw dictionaries where practical.

Normalized question identity must preserve the exact marketplace-native fields required later to send an answer. Never reconstruct or guess write identifiers from links or titles.

Required normalized fields at minimum:

- marketplace;
- external_question_id;
- question_text;
- question_created_at;
- raw_status;
- product_id / article / title when available;
- marketplace-specific send identity, especially Ozon SKU.

If the existing questions schema needs a narrowly scoped additional field to persist required send identity, make the smallest compatible schema/repository change and add migration-safe initialization for fresh/current SQLite databases. Do not redesign persistence.

## HTTP client policy

Use `httpx.AsyncClient`.

Production defaults:

- connect timeout: 10 seconds;
- read/write/pool timeout: 20 seconds.

No generic automatic retry around answer writes.

Read failures may simply be surfaced so the future poller retries on the next scheduled poll.

Never log or include credential values in errors/results.

All tests must use `httpx.MockTransport` or an equivalent injected fake transport. No public network calls.

# Ozon

Base URL:

`https://api-seller.ozon.ru`

Future auth headers:

```http
Client-Id: <OZON_CLIENT_ID>
Api-Key: <OZON_API_KEY>
Content-Type: application/json
```

Credentials are constructor/config inputs only. Do not request or store real credentials in this run.

## Ozon read

Endpoint:

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

Continue using returned pagination data while `has_next` is true, updating `last_id` from the response.

Hard application bound:

- maximum 10 pages per call to `fetch_unanswered_questions()`.

Normalize the actual supported response shape defensively. At minimum preserve:

- question ID;
- SKU;
- text;
- published timestamp;
- product/question link if present;
- status;
- product context if present.

Do not discard SKU because it is required for answer creation.

If Ozon question API access returns a clear permission/product-plan error, surface a structured adapter error. Do not add browser fallback.

## Ozon send

Endpoint:

`POST /v1/question/answer/create`

Body:

```json
{
  "question_id": "<stored external question id>",
  "sku": 646399170,
  "text": "<exact approved revision text>"
}
```

Requirements:

- use the stored marketplace question ID;
- use the stored SKU;
- send the exact supplied approved revision text;
- do not trim/rewrite/rephrase the approved text in the adapter;
- validate Ozon text length contract (2..3000 chars) before attempting the write;
- on clear successful response, return success and parsed `answer_id` when supplied.

## Ozon ambiguous send

A transport result can be ambiguous if the request may have reached Ozon but the client cannot know whether a response was received, for example timeout/read disconnect after write transmission.

Do not blindly retry such a write.

Return a result that distinctly represents `AMBIGUOUS`.

Reconciliation endpoint:

`POST /v1/question/answer/list`

Use the same stored `question_id` and SKU according to the API contract.

Reconciliation should inspect returned answers and determine:

- MATCHED: an answer matching the exact expected text and plausible send-time window is found;
- NOT_FOUND: evidence supports that the expected answer is absent;
- UNKNOWN: response does not provide enough evidence.

Do not claim NOT_FOUND when evidence is insufficient.

# Wildberries

Base URL:

`https://feedbacks-api.wildberries.ru`

Future auth:

```http
Authorization: Bearer <WB_API_TOKEN>
```

Do not request/store a real token in this run.

## Wildberries read

Endpoint:

`GET /api/v1/questions`

Query parameters:

```text
isAnswered=false
take=100
skip=0
order=dateDesc
```

Paginate by increasing `skip` by the actual page size / requested take in a deterministic way.

Hard application bound:

- maximum 20 pages per call;
- never exceed the API window where `take + skip > 10000`.

Stop when the response indicates no further records / returns fewer than requested / equivalent supported termination signal.

Normalize at minimum:

- external question ID;
- text;
- created timestamp;
- `nmId` / product identity if available;
- product title/article context if available;
- answered/raw status fields if present.

## Wildberries send

Endpoint:

`PATCH /api/v1/questions`

Body:

```json
{
  "id": "<stored external question id>",
  "text": "<exact approved revision text>",
  "state": "wbRu"
}
```

Requirements:

- send exact approved text;
- treat accepted API response as accepted for processing/moderation, not proof that it is already publicly visible;
- never use `state: "none"` for Telegram Ignore or as a generic failure action.

The adapter must not expose any method where local Ignore maps to a marketplace write.

## Wildberries ambiguous send

Do not blindly retry ambiguous PATCH outcomes.

Reconcile with:

`GET /api/v1/question?id=<external question id>`

Inspect the returned question/answer state.

Return:

- MATCHED if the current exposed answer text exactly equals `expected_text`;
- NOT_FOUND only when the response provides positive evidence that the expected answer was not applied;
- UNKNOWN when the API response is insufficient to decide.

# Error/result classification

Introduce the smallest coherent shared taxonomy needed by the future orchestrator, for example:

Read side:

- AUTH/PERMISSION;
- HTTP_ERROR;
- INVALID_RESPONSE;
- TRANSPORT_ERROR.

Write side:

- SUCCESS;
- CLEAR_FAILURE;
- AMBIGUOUS.

Reconciliation:

- MATCHED;
- NOT_FOUND;
- UNKNOWN.

Exact class/enum names are implementation choices, but tests must prove the semantic distinctions.

Do not put credentials in exception messages.

# Behavioral tests

Add real tests against the production adapter code with mocked HTTP.

At minimum cover:

### Ozon

1. `test_ozon_headers_and_first_page_request`
   - correct path, method, auth header names, filter/status, limit and sort direction.

2. `test_ozon_paginates_with_last_id`
   - two+ mocked pages;
   - second request uses returned `last_id`;
   - normalized questions from all pages are returned.

3. `test_ozon_stops_at_ten_pages`
   - server keeps saying `has_next=true`;
   - adapter makes no more than 10 page requests.

4. `test_ozon_normalization_preserves_question_id_and_sku`
   - exact external ID, text and SKU survive normalization.

5. `test_ozon_send_uses_exact_revision_and_stored_sku`
   - exact JSON body is asserted.

6. `test_ozon_answer_length_validation_prevents_http_call`
   - invalid text length fails before transport invocation.

7. `test_ozon_clear_success_returns_answer_id`

8. `test_ozon_ambiguous_write_is_not_retried`
   - mock raises an ambiguous transport failure;
   - exactly one write invocation;
   - result is AMBIGUOUS.

9. `test_ozon_reconcile_exact_text_match`

10. `test_ozon_reconcile_insufficient_evidence_is_unknown`

### Wildberries

11. `test_wb_headers_and_first_page_request`
   - correct Authorization bearer header and query parameters.

12. `test_wb_paginates_with_skip`

13. `test_wb_stops_at_twenty_pages`

14. `test_wb_never_exceeds_10000_window`

15. `test_wb_normalization_preserves_question_and_product_identity`

16. `test_wb_send_uses_exact_revision_and_wbru_state`

17. `test_wb_ignore_has_no_remote_state_none_operation`
   - prove adapter API contains no local-ignore write path and/or fake operator-ignore integration invokes zero HTTP writes if there is already a suitable abstraction to test.

18. `test_wb_ambiguous_write_is_not_retried`
   - exactly one PATCH invocation.

19. `test_wb_reconcile_exact_text_match`

20. `test_wb_reconcile_insufficient_evidence_is_unknown`

### Shared

21. `test_adapter_errors_do_not_expose_credentials`

22. `test_marketplace_adapter_tests_use_no_public_network`

Use representative mocked response fixtures. Do not write tests that only assert function names/constants exist.

# Verification

Run targeted adapter tests first, then full suite:

```bash
.venv/bin/python -m pytest tests/test_ozon_adapter.py tests/test_wildberries_adapter.py -q
.venv/bin/python -m pytest -q
```

Use actual filenames if different.

Existing 46 tests must remain passing.

Before commit run:

```bash
git status --short
git diff --stat
git diff -- app/marketplaces app/config.py app/db tests
```

There must be a real implementation diff.

# Restrictions

- no live Ozon requests;
- no live WB requests;
- no Telegram runtime;
- no real Codex execution;
- no secret entry/storage;
- no systemd changes;
- do not modify `/root/.codex`, `/root/.codex_second`, `/root/.codex_third`;
- do not touch unrelated server services/projects.

# Commit

After targeted and full tests pass:

```text
feat: implement Ozon and Wildberries marketplace adapters
```

Working tree must be clean after commit.

PASS requires `FINAL_HEAD != START_HEAD`.

# Final report

Return:

```text
MQO_R2_REPORT

START_HEAD=
FINAL_HEAD=

FILES_CHANGED=

COMMON_ADAPTER_CONTRACT=IMPLEMENTED
OZON_READ=IMPLEMENTED
OZON_SEND=IMPLEMENTED
OZON_RECONCILIATION=IMPLEMENTED
WB_READ=IMPLEMENTED
WB_SEND=IMPLEMENTED
WB_RECONCILIATION=IMPLEMENTED
AMBIGUOUS_WRITE_NO_RETRY=IMPLEMENTED

TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=

BEHAVIOR_EVIDENCE=
- Ozon pagination:
- Ozon normalization/SKU:
- Ozon exact send body:
- Ozon ambiguous write:
- Ozon reconciliation:
- WB pagination/window:
- WB normalization:
- WB exact send body:
- WB Ignore zero remote write:
- WB ambiguous write:
- WB reconciliation:
- credential redaction:

GIT_STATUS=

NETWORK_CALLS=0
LIVE_MARKETPLACE_READS=0
LIVE_MARKETPLACE_WRITES=0
SECRETS_TOUCHED=none
UNRELATED_SERVICES_MODIFIED=none

FINAL_STATUS=MQO_R2_PASS
```

PASS is forbidden if either marketplace adapter is still a stub, ambiguous writes are generically retried, behavioral tests are missing, or `FINAL_HEAD == START_HEAD`.
