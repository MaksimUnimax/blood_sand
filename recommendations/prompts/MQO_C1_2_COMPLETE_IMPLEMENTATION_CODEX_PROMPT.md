# Marketplace Question Operator — C1.2 Complete Implementation Prompt

## Role

You are the implementation agent. Do not redesign the product. Complete the existing `/opt/marketplace-question-operator` implementation against the frozen A0/A1/A2 contracts and the C1.1 audit.

Start from local Git HEAD `776cb751eeafb663d081fd293a29bd30ca541429`.

C1.1 proved C1 is incomplete. Treat the following as mandatory blockers to close:

- repository/database operations are partial;
- transactional orchestration is missing;
- Telegram production wiring is a stub;
- Ozon adapter is a stub;
- Wildberries adapter is a stub;
- polling orchestration is missing;
- send/reconciliation path is missing;
- Codex workflow integration is partial;
- retention is a stub;
- error coalescing is missing;
- existing marker tests are mostly non-behavioral.

Do not request credentials. Do not make live HTTP requests. Do not start Telegram polling. Do not run a real Codex model request. Do not install systemd. Do not touch unrelated services.

## 1. Database/repository completion

Implement real aiosqlite repository operations for:

- question insert/dedup + `Q-%06d` public ID;
- question load/list/open queue;
- guarded transactional state transitions;
- immutable answer revisions;
- current revision selection;
- draft attempts;
- Telegram reply-input correlation;
- settings (`active_codex_profile`, default `codex1`);
- recent error upsert/coalescing;
- send claim/finalize/fail/unknown;
- retention-safe deletes.

Use `PRAGMA foreign_keys=ON`, WAL where supported, and explicit transactions for state-sensitive operations.

## 2. Ozon production adapter

Implement real HTTP request construction/parsing using `httpx.AsyncClient` for:

- `POST /v1/question/list` with `status=UNPROCESSED`, `limit=100`, cursor pagination, max 10 pages;
- `POST /v1/question/answer/create` using stored `external_question_id`, stored SKU, exact approved text;
- `POST /v1/question/answer/list` for ambiguous-send reconciliation.

Auth headers are configured from future settings: `Client-Id`, `Api-Key`. Never log secrets.

Normalize question identity/text/SKU/date/product URL/status. Do not guess SKU. Do not blindly retry ambiguous writes.

## 3. Wildberries production adapter

Implement real HTTP request construction/parsing for:

- `GET /api/v1/questions?isAnswered=false&take=100&skip=...&order=dateDesc`, max 20 pages;
- `PATCH /api/v1/questions` body `{id,text,state:"wbRu"}`;
- `GET /api/v1/question?id=...` for ambiguous-send reconciliation.

Auth: `Authorization: Bearer <WB_API_TOKEN>`.

Telegram Ignore is local only and must never call `state:none`.

## 4. Polling/orchestration

Implement one coherent service/orchestrator connecting DB, adapters, Telegram transport, Codex runner, state machine and retention.

Required behavior:

- independent Ozon and WB polling;
- one failing marketplace does not block the other;
- no overlapping poll for same marketplace;
- only newly inserted questions generate an initial Telegram card;
- repeated external question IDs do not create duplicate Q-ID/card.

No live scheduler/systemd yet, but production polling functions must exist and be mock-tested.

## 5. Telegram production wiring

Implement async `python-telegram-bot` handlers without starting them in tests.

Commands:

- `/questions`
- `/codex`
- `/errors`
- `/status`

Callbacks/actions:

- manual
- codex
- ignore
- send
- edit
- regenerate
- retry_codex
- choose_codex
- cancel_input
- retry_send

Reply handling:

- manual answer must be a Reply to the stored prompt message;
- edit answer must be a Reply to the stored edit prompt message;
- unrelated plain messages are not treated as answers.

Only `TELEGRAM_OPERATOR_USER_ID` is authorized. Unauthorized users must not receive question text.

Every relevant card contains Q-ID + marketplace + original question. Codex cards additionally show generated answer, generating profile and current active profile. Error cards show Q-ID + question + failed profile + error + current active profile.

Callback data stores IDs/actions only, never question/answer text.

## 6. Codex workflow integration

Keep existing profile mapping:

- codex1 -> `/root/.codex`
- codex2 -> `/root/.codex_second`
- codex3 -> `/root/.codex_third`

Use `asyncio.create_subprocess_exec`, never `shell=True`.

Always explicitly set `CODEX_HOME`. Child environment is allowlisted; Telegram/Ozon/WB secrets must never reach the child.

Use one composite PromptBuilder for all questions. No date regex router, no content classifier, no DATE/GENERAL software modes.

Implement actual async service flow around the runner, but tests must mock subprocess output. Parse representative Codex JSONL into answer text.

Error categories at minimum: LIMIT, AUTH, TIMEOUT, NONZERO_EXIT, INVALID_OUTPUT, PROCESS_ERROR.

Retry after profile switch creates a new draft attempt for the same question, using whichever profile is active when Retry is pressed.

## 7. Revision-bound send path

A Send callback must identify both `question_id` and `answer_revision_id`.

Before marketplace write, transactionally verify:

- question state is REVIEW;
- current revision equals callback revision;
- revision belongs to same question.

Then claim `REVIEW -> SENDING` exactly once. Double-tap must yield only one adapter send invocation.

On clear success -> SENT + external reply ID.

On clear failure -> SEND_FAILED.

On ambiguous transport outcome -> SEND_UNKNOWN and reconciliation; no blind resend.

## 8. Retention

Implement daily-callable cleanup logic with `TECHNICAL_RETENTION_DAYS=5`.

Delete safe technical history older than 5 days:

- completed/failed non-current draft attempts;
- non-current answer revisions when not needed by an active send/review;
- expired Telegram input rows;
- recent errors;
- old job directories/diagnostics.

Do not delete minimal question rows needed for dedup, current/final answer, SENT identity, external reply ID, active/current attempts/revisions, unsent REVIEW data, or SEND_UNKNOWN reconciliation data.

Behavioral tests must prove ~4d23h retained and >5d removed when safe.

## 9. Error coalescing

Implement fingerprinted recent-error upsert so identical poll/service errors increment occurrence count and update last_seen instead of producing a new logical admin alert every 10 minutes.

Tests must prove coalescing.

## 10. Replace fake acceptance tests

Remove/replace the parameterized `marker.startswith("C1_")` acceptance test. Marker names are not evidence.

Write real behavioral tests for every marker:

- C1_DB_SCHEMA_PASS
- C1_QUESTION_DEDUP_PASS
- C1_PUBLIC_QID_PASS
- C1_STATE_TRANSITION_GUARD_PASS
- C1_STALE_CALLBACK_REJECT_PASS
- C1_TELEGRAM_REPLY_CORRELATION_PASS
- C1_REVISION_BOUND_SEND_PASS
- C1_DOUBLE_SEND_PREVENTED_PASS
- C1_TELEGRAM_RENDER_CORRELATION_PASS
- C1_TELEGRAM_OVERFLOW_PASS
- C1_CODEX_PROFILE_SELECTION_PASS
- C1_CODEX_RETRY_USES_CURRENT_PROFILE_PASS
- C1_CODEX_CHILD_ENV_SECRET_ISOLATION_PASS
- C1_CODEX_JSONL_PARSE_PASS
- C1_NO_CONTENT_ROUTER_PASS
- C1_OZON_ADAPTER_CONTRACT_PASS
- C1_WB_ADAPTER_CONTRACT_PASS
- C1_IGNORE_HAS_ZERO_MARKETPLACE_WRITE_PASS
- C1_AMBIGUOUS_SEND_NO_BLIND_RETRY_PASS
- C1_RETENTION_5_DAY_PASS
- C1_ERROR_COALESCING_PASS
- C1_FAKE_E2E_MANUAL_PASS
- C1_FAKE_E2E_CODEX_PASS

Each test must assert behavior, not names/files/string presence only.

Add a network guard so accidental public network access fails tests. All HTTP tests use MockTransport/fakes. All Codex tests use fake subprocess/fixtures.

## 11. Fake E2E requirements

Manual E2E through actual orchestrator:

fake marketplace question -> ingest -> initial TG card -> manual action -> reply correlation -> immutable revision -> REVIEW -> revision-bound Send -> fake adapter -> SENT.

Codex E2E through actual orchestrator:

fake question -> initial TG card -> Send to Codex -> captured active profile -> fake Codex JSONL -> same Q-ID + original question + answer card -> Send/Edit -> fake adapter -> SENT.

Retry E2E:

codex1 -> fake LIMIT -> CODEX_ERROR -> switch active to codex2 -> Retry -> new draft attempt uses codex2 -> same question ID.

## 12. Offline verification

Run:

```bash
.venv/bin/python -m pytest -q
.venv/bin/python -m app.cli doctor --offline
.venv/bin/python -m app.cli selftest
```

No test may contact Ozon, WB, Telegram or OpenAI.

Expected:

- NETWORK_CALLS_DURING_TESTS=0
- LIVE_TELEGRAM_MESSAGES=0
- LIVE_MARKETPLACE_READS=0
- LIVE_MARKETPLACE_WRITES=0
- REAL_CODEX_GENERATIONS=0
- SECRETS_REQUESTED=0
- SECRETS_STORED=0

`REFERENCE_DIR_STATUS=PENDING_INTEGRATION` is acceptable.

## 13. Server safety

Do not modify/restart/stop APM, OpenScript, OpenDesign, Business Bridge, nginx global config, Docker/containerd, ISPmanager or existing Codex auth directories.

Do not clean/prune the server.

## 14. Git checkpoint

After all tests pass and there are no remaining stubs:

```bash
git status
git diff --stat HEAD
git diff HEAD
```

Confirm no credentials/auth/tokens/secrets.env are tracked.

Commit:

`fix: complete marketplace question operator C1 implementation`

## 15. Final report

Return:

```text
MARKETPLACE_QUESTION_OPERATOR_C1_2_REPORT

START_HEAD=
FINAL_HEAD=

DB=
STATE_MACHINE=
TELEGRAM_WIRING=
OZON_ADAPTER=
WB_ADAPTER=
POLLING_ORCHESTRATION=
CODEX_RUNNER=
PROMPT_BUILDER=
SEND_PATH=
RETENTION=
ERROR_COALESCING=

STUBS_REMAINING=
FILES_CHANGED=

TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=

OFFLINE_DOCTOR=
SELFTEST=

MARKER_EVIDENCE=
<for each marker: test function -> behavioral assertion>

NETWORK_CALLS_DURING_TESTS=0
LIVE_TELEGRAM_MESSAGES=0
LIVE_MARKETPLACE_READS=0
LIVE_MARKETPLACE_WRITES=0
REAL_CODEX_GENERATIONS=0
SECRETS_REQUESTED=0
SECRETS_STORED=0

REFERENCE_DIR_STATUS=
UNRELATED_SERVICES_MODIFIED=none

FINAL_STATUS=
MARKETPLACE_QUESTION_OPERATOR_C1_2_PASS
```

Only PASS if Telegram wiring, both adapters, polling/orchestration, Codex integration, revision-bound send, retention, error coalescing and behavioral acceptance tests are all implemented and `STUBS_REMAINING=none`.