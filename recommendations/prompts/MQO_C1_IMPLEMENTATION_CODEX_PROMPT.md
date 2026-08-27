# Marketplace Question Operator — C1 Codex Implementation Prompt

## Role

You are the implementation agent. **Do not redesign the product.** Implement the already-frozen contracts exactly. If a detail is not specified, choose the smallest implementation that preserves the contracts and report the choice; do not invent new product flows.

This is the first coding milestone for a new standalone server project. It does **not** reuse the old browser bridges/extensions.

## Authoritative contracts

The product/architecture authority is the following frozen documentation in `MaksimUnimax/blood_sand`:

- `recommendations/MARKETPLACE_QUESTION_OPERATOR_A0_ARCHITECTURE.md`
- `recommendations/MARKETPLACE_QUESTION_OPERATOR_A1_API_CONTRACTS.md`
- `recommendations/MARKETPLACE_QUESTION_OPERATOR_A2_STATE_TELEGRAM_CONTRACT.md`
- `recommendations/MARKETPLACE_QUESTION_OPERATOR_BOT.md`

The future Codex answer prompt may reference:

- `recommendations/CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`
- `recommendations/RECOMMENDATION_MATRIX.md`
- `recommendations/PRODUCT_CLASSIFICATION.md`
- `recommendations/OZON_PRODUCT_LINKS.md`
- `recommendations/WILDBERRIES_PRODUCT_LINKS.md`
- `recommendations/MARKETPLACE_QUESTION_REPLY_GUIDE.md`

If those reference files are not locally present on this server, **do not fetch the full `blood_sand` repository and do not block C1**. Make their root path configurable and let the later integration step populate/sync them.

## Existing Codex installation/auth profiles

Server discovery already established:

```text
codex-cli 0.149.1
executable: /root/.nvm/versions/node/v22.22.1/bin/codex

codex1 -> CODEX_HOME=/root/.codex
codex2 -> CODEX_HOME=/root/.codex_second
codex3 -> CODEX_HOME=/root/.codex_third
```

`codex1` is the normal/base Codex authorization; there is no requirement for a shell command literally named `codex1`.

The current interactive shell may already contain a different `CODEX_HOME`; the application must never inherit profile choice implicitly. Every Codex run must explicitly select the configured profile.

## C1 objective

Create a complete **offline-testable V1 application implementation** at:

```text
/opt/marketplace-question-operator
```

C1 should implement the application core, production adapter code, Telegram interaction code, Codex runner abstraction/command builder, persistence, retention, and tests — but **must not request or store real credentials, make live marketplace requests, send live Telegram messages, run a real Codex generation, install/enable systemd units, or publish anything**.

The result must be testable entirely with fakes/mocked HTTP/subprocesses.

## Hard product rules

These are non-negotiable:

```text
MARKETPLACE QUESTION -> TELEGRAM OPERATOR FIRST
NO HUMAN SEND ACTION -> NO MARKETPLACE REPLY
```

A newly polled question is shown to the operator before Codex sees it.

Initial Telegram actions:

```text
[✍️ Ответить самому]
[🤖 Отправить в Codex]
[🚫 Игнорировать]
```

Codex is called only after the operator explicitly chooses it.

Every Telegram card related to an answer/error must contain:

- internal Q-ID (`Q-000001` style);
- marketplace;
- original buyer question;
- current answer/error when applicable.

Correlation is backend-owned. Never trust model output for question identity.

No software-side date/question classifier. **Do not implement regex routing, DATE/GENERAL modes, LLM pre-routing, or conditional reference selection.** Every Codex request goes through the same composite prompt path. The prompt content is editable configuration and will be tuned later.

## Technology choices — fixed for C1

Use:

- Python 3.12;
- `asyncio`;
- SQLite;
- `aiosqlite`;
- `httpx`;
- `python-telegram-bot` async API;
- `pytest` + `pytest-asyncio` for tests;
- stdlib `dataclasses`/`enum`/`pathlib` where practical;
- no ORM;
- no Redis/Postgres/Celery/Docker for V1.

Create an isolated virtual environment:

```text
/opt/marketplace-question-operator/.venv
```

Do not alter global Python packages.

Pin the exact installed dependency versions into `requirements.txt` after successful installation in the venv.

## Project layout

Use this structure unless Python packaging requires one tiny adjustment:

```text
/opt/marketplace-question-operator/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models.py
│   ├── state_machine.py
│   ├── service.py
│   ├── cli.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── schema.sql
│   │   ├── database.py
│   │   └── repository.py
│   ├── marketplaces/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── ozon.py
│   │   └── wildberries.py
│   ├── telegram/
│   │   ├── __init__.py
│   │   ├── callbacks.py
│   │   ├── render.py
│   │   └── bot.py
│   ├── codex/
│   │   ├── __init__.py
│   │   ├── profiles.py
│   │   ├── prompt_builder.py
│   │   └── runner.py
│   └── maintenance.py
├── prompts/
│   ├── base.md
│   └── references.md
├── tests/
│   ├── ...
├── pyproject.toml
├── requirements.txt
├── .gitignore
└── README.md
```

Initialize a **local Git repository** in this project on branch `main` if the path is new. Do not configure a remote in C1.

## Configuration contract

Implement a typed configuration object loaded from environment variables, but C1 must not create real secrets.

Expected future secret/environment names:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_OPERATOR_USER_ID
OZON_CLIENT_ID
OZON_API_KEY
WB_API_TOKEN
```

Non-secret defaults/config:

```text
DB_PATH=/var/lib/marketplace-question-operator/state.sqlite3
JOBS_DIR=/var/lib/marketplace-question-operator/jobs
REFERENCE_DIR=/opt/blood-sand-recommendations/recommendations
POLL_INTERVAL_SECONDS=600
TECHNICAL_RETENTION_DAYS=5
CODEX_EXECUTABLE=/root/.nvm/versions/node/v22.22.1/bin/codex
CODEX1_HOME=/root/.codex
CODEX2_HOME=/root/.codex_second
CODEX3_HOME=/root/.codex_third
```

For tests, all paths must be overrideable to temporary directories.

Do not log secret values. `repr()`/debug output of config must redact secrets.

## SQLite schema/state

Implement the A2 schema and state machine. Required tables:

- `questions`;
- `answer_revisions`;
- `draft_attempts`;
- `telegram_inputs`;
- `settings`;
- `recent_errors`.

Required uniqueness:

```text
UNIQUE(marketplace, external_question_id)
```

Public ID:

```text
Q-%06d
```

Default setting:

```text
active_codex_profile=codex1
```

Canonical question states:

```text
NEW
MANUAL_INPUT
CODEX_RUNNING
CODEX_ERROR
REVIEW
EDITING
IGNORED
SENDING
SENT
SEND_FAILED
SEND_UNKNOWN
```

All transitions must go through one central guarded repository/state-machine function using expected-current-state semantics inside a SQLite transaction. A stale/duplicate action must fail closed as `STALE_STATE`; it must not force a transition.

Enable SQLite foreign keys and use WAL mode where supported.

## Answer revisions and send safety

Every displayed answer has an immutable `answer_revision_id`.

A Send callback must be bound to both:

```text
question_id
answer_revision_id
```

Before a marketplace write, the application must re-load and verify:

```text
question.status == REVIEW
question.current_answer_revision_id == callback.answer_revision_id
revision.question_id == question.id
```

Only then transition to `SENDING` transactionally.

A stale Send button must never send a newer/different answer.

Double Send must not cause a second marketplace call.

## Telegram reply correlation

Manual answers and edited answers are entered as **Telegram replies to a specific bot input prompt**.

Store:

```text
telegram_prompt_message_id -> question_id + mode + based_on_revision_id
```

A free-standing operator message that is not a reply to an active input prompt must not be interpreted as a question answer.

This allows multiple open editing/manual-input sessions without mixing replies.

## Telegram callback encoding

Define a compact callback codec under Telegram's callback-data size limit. It must encode at least:

- action;
- question integer ID where relevant;
- revision ID where relevant;
- Codex profile where relevant.

Do not put question/answer text in callback data.

Required logical actions:

```text
manual
codex
ignore
send
edit
regenerate
retry_codex
choose_codex
cancel_input
retry_send   (for later SEND_FAILED handling)
```

Implement round-trip unit tests and malformed/stale callback rejection.

## Telegram render contract

Use plain text rendering for buyer/operator content; do not require Markdown/HTML parsing for untrusted text.

Initial question card must include:

```text
marketplace
Q-ID
external marketplace question ID
product context when available
original question verbatim
active Codex profile
```

Codex review card must include:

```text
Q-ID
marketplace
original question
answer
"Подготовил: codexN"
"Сейчас активен: codexN"
```

Codex error card must include:

```text
Q-ID
marketplace
original question
failed profile
error category
currently active profile
```

Required error-card actions:

```text
[🔄 Повторить]
[🤖 Сменить Codex]
[✍️ Ответить самому]
[🚫 Игнорировать]
```

Changing profile does not auto-retry. Retry uses the profile active when Retry is tapped.

Successful review actions:

```text
[✅ Отправить]
[✏️ Редактировать]
[🔄 Сгенерировать заново]
[🚫 Игнорировать]
```

Renderer must not mix responses between questions. Every rendered review/error must be generated from a DB-loaded question + exact revision/attempt.

If a Telegram message would exceed the platform text limit, provide a deterministic safe overflow strategy that keeps the Q-ID and original question visible with the answer content available in ordered continuation message(s). Unit-test it. Do not silently truncate an answer.

## Telegram transport implementation

Implement the production bot handlers/application wiring, but C1 tests must use mocked/fake Telegram transport and must not contact Telegram.

Only `TELEGRAM_OPERATOR_USER_ID` is authorized. All other users/chats are ignored/rejected without exposing data.

Minimum admin surfaces in code:

```text
/questions
/codex
/errors
/status
```

`/codex` must show `codex1/codex2/codex3` and allow switching the global active profile.

The production bot object must not be started in C1 acceptance tests.

## Marketplace adapters

Implement production HTTP adapter code exactly from A1, but unit-test with `httpx.MockTransport`/equivalent. **No live calls in C1.**

Common interface:

```python
async def fetch_unanswered_questions() -> list[NormalizedQuestion]
async def send_answer(question, text) -> SendResult
async def reconcile_answer(question, expected_text, send_started_at) -> ReconcileResult
```

### Ozon

Use:

```text
POST https://api-seller.ozon.ru/v1/question/list
POST https://api-seller.ozon.ru/v1/question/answer/create
POST https://api-seller.ozon.ru/v1/question/answer/list   # reconciliation only
```

Headers:

```text
Client-Id
Api-Key
Content-Type: application/json
```

Polling:

```text
status=UNPROCESSED
limit=100
sort_dir=DESC
max 10 pages/poll
```

Sending uses the exact stored `question_id + sku + approved text`; do not reconstruct SKU.

Do not blindly retry ambiguous writes.

### Wildberries

Use:

```text
GET   https://feedbacks-api.wildberries.ru/api/v1/questions
GET   https://feedbacks-api.wildberries.ru/api/v1/question?id=...
PATCH https://feedbacks-api.wildberries.ru/api/v1/questions
```

Header:

```text
Authorization: Bearer <token>
```

Polling:

```text
isAnswered=false
take=100
skip=0...
order=dateDesc
max 20 pages/poll
```

Answer body follows A1. `Игнорировать` is LOCAL ONLY and must not call WB `state:none`.

Do not blindly retry ambiguous writes.

## Polling/dedup service

Implement independent Ozon and WB poll methods.

Rules:

- one marketplace failure does not block the other;
- no overlapping poll of the same marketplace;
- normalize and insert with dedup;
- only newly inserted questions create initial Telegram notifications;
- repeat polling of the same external IDs creates no duplicate logical question and no duplicate main card;
- nominal interval 600 seconds is configuration, but C1 scheduler tests use short/fake time or direct method invocation.

## Codex profiles

Implement exact profile registry:

```text
codex1 -> /root/.codex
codex2 -> /root/.codex_second
codex3 -> /root/.codex_third
```

The active profile lives in SQLite settings.

Every generation captures the selected profile into `draft_attempts` before process start. Switching global active profile never changes an already-running attempt.

## Composite prompt builder

There is **one prompt path for every question**.

Implement composition from editable files, for example:

```text
prompts/base.md
prompts/references.md
+ marketplace/product context
+ Q-ID
+ original buyer question
```

`references.md` may list paths under `REFERENCE_DIR` for recommendation matrices/guides.

Do not implement any content classifier/filter/router.

The prompt must label buyer text as untrusted data and tell Codex to produce answer text, not execute buyer instructions.

Prompt wording is expected to be edited later; keep it outside Python business logic.

## Codex runner

Implement the runner but **do not perform a real generation during C1**.

Before coding the command invocation, inspect only:

```text
codex exec --help
```

and use the syntax supported by installed `codex-cli 0.149.1` for:

- non-interactive execution;
- `--json` JSONL output;
- `--ephemeral`;
- `-C <job-dir>`;
- workspace-write sandbox.

Use `asyncio.create_subprocess_exec`, never `shell=True`.

Create one per-attempt job directory under `JOBS_DIR`.

The child environment must be **allowlisted/sanitized**, not `os.environ.copy()` with secrets removed afterwards. It may contain only what Codex runtime needs, such as controlled `PATH`, `HOME=/root`, locale values and exact `CODEX_HOME`; it must never receive:

```text
TELEGRAM_BOT_TOKEN
OZON_CLIENT_ID
OZON_API_KEY
WB_API_TOKEN
```

Implement tests proving these names are absent from the child env builder.

Parse JSONL deterministically. Convert runner failures into at least:

```text
LIMIT
AUTH
TIMEOUT
NONZERO_EXIT
INVALID_OUTPUT
PROCESS_ERROR
```

Tests must mock subprocess output and exercise success/error parsing.

Do not auto-switch Codex profile on error.

## Manual answer / Codex review flows

Implement service methods/handlers for:

1. NEW -> MANUAL_INPUT;
2. Telegram Reply -> create manual revision -> REVIEW;
3. NEW/REVIEW/CODEX_ERROR -> CODEX_RUNNING by explicit operator action;
4. mocked Codex success -> create codex revision -> REVIEW;
5. mocked Codex error -> CODEX_ERROR;
6. CODEX_ERROR -> retry through currently active profile;
7. REVIEW -> EDITING -> reply -> edited revision -> REVIEW;
8. REVIEW -> regenerate -> CODEX_RUNNING;
9. NEW/REVIEW/CODEX_ERROR -> IGNORED where allowed;
10. REVIEW -> SENDING -> mocked marketplace success -> SENT;
11. mocked send failure -> SEND_FAILED;
12. mocked ambiguous send -> SEND_UNKNOWN.

## Technical retention — 5 days maximum

Do not allow attempt/error/job history to accumulate indefinitely.

Default:

```text
TECHNICAL_RETENTION_DAYS=5
```

Implement maintenance cleanup for:

- old completed/failed `draft_attempts` when no longer needed by the current displayed/final revision;
- old non-current answer revisions when safe;
- expired/stale `telegram_inputs`;
- `recent_errors` older than 5 days;
- per-attempt job directories older than 5 days;
- old Codex JSONL/stdout/stderr diagnostic files older than 5 days.

Preserve the minimal `questions` row, marketplace external ID, final/current answer needed for dedup/audit, `SENT` identity and external reply ID.

Cleanup must never delete an active running attempt, current answer revision, unsent review answer, or data needed for `SEND_UNKNOWN` reconciliation.

Unit-test retention boundaries at 4d23h/5d+ and protected-current records.

## Error coalescing

Implement `recent_errors` fingerprint/coalescing so identical poll/service errors do not send a Telegram alert every 10 minutes forever.

C1 tests only verify logic; no live Telegram notifications.

## CLI for C1

Implement a small CLI callable from project venv, with at least:

```text
python -m app.cli init-db
python -m app.cli doctor --offline
python -m app.cli selftest
```

`doctor --offline` must verify without network:

- project paths/config syntax;
- DB writable/initialized;
- Codex executable exists;
- three CODEX_HOME directories exist (report missing as warning/error clearly);
- prompt files exist;
- reference directory may be missing and should be reported as `PENDING_INTEGRATION`, not fatal to C1;
- no secret values printed.

`selftest` may run deterministic internal checks but must not invoke marketplaces, Telegram or a real Codex model.

## Tests — mandatory

Create comprehensive tests. At minimum demonstrate these acceptance markers:

```text
C1_DB_SCHEMA_PASS
C1_QUESTION_DEDUP_PASS
C1_PUBLIC_QID_PASS
C1_STATE_TRANSITION_GUARD_PASS
C1_STALE_CALLBACK_REJECT_PASS
C1_TELEGRAM_REPLY_CORRELATION_PASS
C1_REVISION_BOUND_SEND_PASS
C1_DOUBLE_SEND_PREVENTED_PASS
C1_TELEGRAM_RENDER_CORRELATION_PASS
C1_TELEGRAM_OVERFLOW_PASS
C1_CODEX_PROFILE_SELECTION_PASS
C1_CODEX_RETRY_USES_CURRENT_PROFILE_PASS
C1_CODEX_CHILD_ENV_SECRET_ISOLATION_PASS
C1_CODEX_JSONL_PARSE_PASS
C1_NO_CONTENT_ROUTER_PASS
C1_OZON_ADAPTER_CONTRACT_PASS
C1_WB_ADAPTER_CONTRACT_PASS
C1_IGNORE_HAS_ZERO_MARKETPLACE_WRITE_PASS
C1_AMBIGUOUS_SEND_NO_BLIND_RETRY_PASS
C1_RETENTION_5_DAY_PASS
C1_ERROR_COALESCING_PASS
C1_FAKE_E2E_MANUAL_PASS
C1_FAKE_E2E_CODEX_PASS
```

Add one fake end-to-end flow for manual answer:

```text
fake marketplace question
-> DB insert
-> initial Telegram card
-> manual input prompt
-> operator reply
-> REVIEW
-> Send callback bound to exact revision
-> fake marketplace send
-> SENT
```

And one fake Codex flow:

```text
fake marketplace question
-> initial Telegram card
-> Send to Codex
-> captured codex profile
-> fake Codex draft
-> Telegram review card with same Q-ID + original question + answer
-> edit or send
-> fake marketplace send
-> SENT
```

Also test:

```text
codex1 LIMIT
-> CODEX_ERROR
-> global profile switch codex2
-> Retry
-> new attempt uses codex2
-> same question ID
```

No test may contact the public network.

## No live credentials / no live execution in C1

Do **not** ask the operator for Telegram/Ozon/WB credentials during this milestone.

Do not create `/etc/marketplace-question-operator/secrets.env` yet.

Do not run live marketplace API requests.

Do not run the Telegram long-polling bot.

Do not invoke a real `codex exec` generation.

Do not create marketplace answers.

The next milestone will explicitly install secrets and perform controlled integration smokes with the operator present.

## Server safety

Do not modify, restart or stop unrelated workloads:

- AutoPostManager/APM;
- OpenScript/AI Starter Community;
- OpenDesign;
- Business Bridge;
- nginx global config;
- Docker/containerd;
- ISPmanager/control panel;
- existing Codex auth files/directories.

Do not clean/prune the server.

Do not alter `/root/.codex*` contents.

Only create/modify files under:

```text
/opt/marketplace-question-operator
/var/lib/marketplace-question-operator
```

for C1.

Do not install or enable systemd units yet.

## Implementation quality

- type hints for public/internal interfaces;
- explicit exceptions/error types;
- no giant single module;
- no hidden background retries of marketplace writes;
- no `shell=True`;
- no tokens in logs/test fixtures;
- HTTP timeouts from A1;
- deterministic tests;
- comments only where behavior is non-obvious.

## Local Git checkpoint

When implementation/tests pass:

1. show `git status`;
2. ensure no secrets or environment files are tracked;
3. commit all C1 project work locally with message:

```text
feat: implement marketplace question operator C1 core
```

Report the local commit SHA.

## Required final report

Return exactly a structured report containing:

```text
MARKETPLACE_QUESTION_OPERATOR_C1_REPORT

PROJECT_PATH=
PYTHON_VERSION=
VENV=
GIT_BRANCH=
GIT_HEAD=

IMPLEMENTED_MODULES=
DB_SCHEMA=
QUESTION_STATES=
CODEX_PROFILES=
PROMPT_STRUCTURE=
REFERENCE_DIR_STATUS=

TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=

ACCEPTANCE_MARKERS=

NETWORK_CALLS_DURING_TESTS=0
LIVE_TELEGRAM_MESSAGES=0
LIVE_MARKETPLACE_READS=0
LIVE_MARKETPLACE_WRITES=0
REAL_CODEX_GENERATIONS=0
SECRETS_REQUESTED=0
SECRETS_STORED=0

UNRELATED_SERVICES_MODIFIED=none

KNOWN_PENDING_INTEGRATION=

FINAL_STATUS=
MARKETPLACE_QUESTION_OPERATOR_C1_PASS
or
MARKETPLACE_QUESTION_OPERATOR_C1_BLOCKED
```

If blocked, stop and report the precise blocker. Do not work around it by changing unrelated server state or by requesting live secrets.