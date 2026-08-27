# Marketplace Question Operator — A0 Architecture Contract

Status: **FROZEN FOR IMPLEMENTATION**  
Date: 2026-08-27

This document is the implementation authority for the first working version of the Ozon/Wildberries marketplace question operator service.

Codex does **not** design this system. Codex implements the contracts frozen here and in later A1/A2 documents.

## 1. Product goal

Build one standalone server service that:

1. polls new/unanswered buyer questions from Ozon and Wildberries approximately every 10 minutes;
2. stores each marketplace question once;
3. sends the original question to the owner in Telegram **before any Codex generation**;
4. lets the owner choose one of three actions:
   - answer manually;
   - send this question to Codex;
   - ignore it;
5. if Codex is requested, runs the currently selected local Codex authorization and returns its draft to Telegram;
6. lets the owner send, edit, regenerate/retry, or ignore the draft;
7. sends a reply to Ozon/Wildberries only after explicit human approval in Telegram.

Hard rule:

```text
MARKETPLACE QUESTION -> TELEGRAM OPERATOR FIRST
```

Hard rule:

```text
NO HUMAN SEND ACTION -> NO MARKETPLACE REPLY
```

There is no automatic `marketplace -> Codex -> Telegram` path in V1.

## 2. Runtime topology

Standalone project path:

```text
/opt/marketplace-question-operator
```

Persistent state:

```text
/var/lib/marketplace-question-operator/
    state.sqlite3
    jobs/
```

Secrets:

```text
/etc/marketplace-question-operator/secrets.env
```

Recommended V1 process model: **one Python 3.12 daemon**, managed by systemd.

The daemon owns:

- Ozon polling;
- Wildberries polling;
- SQLite state;
- Telegram bot updates/callbacks;
- manual-answer input correlation;
- Codex subprocess execution;
- approved marketplace sends;
- retention cleanup.

Do not split V1 into many microservices unless a demonstrated reliability problem requires it.

## 3. High-level flow

```text
Ozon API ---------\
                   -> poll -> normalize -> SQLite -> Telegram question card
Wildberries API --/                               |
                                                   +-> Manual answer
                                                   +-> Send to Codex
                                                   +-> Ignore

Manual answer -> Telegram confirmation -> explicit Send -> marketplace API

Send to Codex -> selected Codex -> draft -> Telegram draft card
                                      |
                                      +-> Send
                                      +-> Edit
                                      +-> Regenerate
                                      +-> Ignore
```

## 4. Question identity and correlation

Every marketplace question has two identities:

```text
internal public ID: Q-000184
external marketplace ID: marketplace-native question id
```

Database uniqueness:

```text
UNIQUE(marketplace, external_question_id)
```

The internal public ID is visible in **every Telegram message related to that question**.

Mandatory invariant:

```text
DRAFT.question_id == QUESTION.id
MANUAL_ANSWER.question_id == QUESTION.id
SEND.question_id == QUESTION.id
TELEGRAM_CALLBACK.question_id == QUESTION.id
```

A Codex answer must never appear in Telegram without:

- the same `Q-...` ID;
- the original buyer question;
- the marketplace name.

The backend owns this correlation. It must not trust Codex to return a correct question ID.

## 5. Initial Telegram question card

A newly discovered question produces a card similar to:

```text
🟣 WILDBERRIES

ID: Q-000184
Marketplace question ID: <external id>

Товар:
<product title / article if available>

Вопрос покупателя:
<original question verbatim>
```

Buttons:

```text
[✍️ Ответить самому]
[🤖 Отправить в Codex]
[🚫 Игнорировать]
```

The original question is shown verbatim. Product fields may be omitted if the marketplace does not return them reliably.

## 6. Manual-answer workflow

`Ответить самому` does not send anything immediately.

The bot creates an input request containing:

```text
ID: Q-000184
Вопрос:
<original question>

Ответьте reply-сообщением на это сообщение.
```

### Input correlation

Do not depend only on one global `editing_question_id`.

Store a mapping:

```text
telegram_prompt_message_id -> question_id + input_mode
```

The operator replies to that Telegram message. This allows several question-edit sessions to coexist without mixing answers.

After text is received, show a confirmation card:

```text
ID: Q-000184

Вопрос:
<original question>

Ваш ответ:
<manual answer>
```

Buttons:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
```

Only `✅ Отправить` may call a marketplace write API.

## 7. Codex workflow

`Отправить в Codex` creates a `draft_attempt` for the existing question.

No marketplace re-fetch is required for a retry unless a later API-specific reconciliation rule explicitly requires it.

Codex receives a **single composite prompt** assembled by `PromptBuilder` from:

- base instructions;
- allowed local reference/document paths;
- marketplace/product context;
- internal Q-ID;
- original buyer question.

### No software-side content filter

V1 must NOT contain:

- a date regex router;
- `DATE_RECOMMENDATION` vs `GENERAL` modes;
- a classifier deciding whether recommendation documents apply;
- an LLM pre-router;
- conditional document selection based on a software classifier.

The same composite prompt path is used for every question.

Prompt content will evolve during live testing. Prompt wording is configuration/content, not hard-coded business branching.

The prompt may reference recommendation documents, matrices, marketplace link registries, copy guides and other local sources. Codex itself decides how those instructions apply to the question.

## 8. Codex output

For V1, the useful product is the generated answer text.

The backend records:

```text
question_id
codex_profile
attempt_id
started_at
finished_at
status
answer_text OR error
```

The backend then creates a Telegram card:

```text
🤖 ОТВЕТ CODEX

ID: Q-000184
Marketplace: Wildberries

Вопрос покупателя:
<original question>

Ответ Codex:
<draft>

🤖 Подготовил: codex2
🟢 Сейчас активен: codex3
```

Buttons:

```text
[✅ Отправить]
[✏️ Редактировать]
[🔄 Сгенерировать заново]
[🚫 Игнорировать]
```

`Подготовил` is immutable historical information about this draft. `Сейчас активен` reflects current global Codex selection.

## 9. Editing a Codex draft

`Редактировать` creates a Telegram reply-input request tied to the same `question_id` and draft.

The bot always shows:

- Q-ID;
- original buyer question;
- current draft/edited answer.

After operator text is received, show confirmation buttons:

```text
[✅ Отправить]
[✏️ Редактировать]
[🔄 Сгенерировать заново]
[🚫 Игнорировать]
```

No edit action auto-publishes.

## 10. Ignore

`Игнорировать` changes local state to `IGNORED`.

No marketplace answer write is performed.

Whether the marketplace question should separately be marked viewed/processed is an A1 marketplace-contract decision and must not be invented in A0.

## 11. Codex profiles

Server discovery established these existing authorization stores:

```text
codex1 -> CODEX_HOME=/root/.codex
codex2 -> CODEX_HOME=/root/.codex_second
codex3 -> CODEX_HOME=/root/.codex_third
```

`codex1` means the normal/base `codex` authorization. There does not need to be a shell command named `codex1`.

Installed CLI:

```text
codex-cli 0.149.1
```

Executable discovered:

```text
/root/.nvm/versions/node/v22.22.1/bin/codex
```

The current interactive shell may already contain a `CODEX_HOME` value, therefore the service must **never inherit profile selection implicitly**.

Every run explicitly sets the intended `CODEX_HOME`.

Conceptual invocation:

```text
env CODEX_HOME=<selected-home> \
  /root/.nvm/versions/node/v22.22.1/bin/codex exec \
  -C <job-dir> \
  -s workspace-write \
  --json \
  --ephemeral \
  <prompt>
```

Exact CLI invocation is implementation-tested before live use.

## 12. Codex selection through Telegram

The service stores one global setting:

```text
active_codex_profile = codex1 | codex2 | codex3
```

Telegram admin screen:

```text
🤖 CODEX

Активен: codex2

[codex1]
[codex2 ✓]
[codex3]
```

Profile switching is explicit and manual. There is **no automatic failover** between authorizations in V1.

Changing active profile affects new/retried generations only. A currently running attempt keeps the profile captured when that attempt started.

## 13. Codex errors and retry

Codex failures must produce Telegram notifications containing the original question and Q-ID.

Example:

```text
⚠️ CODEX ERROR

ID: Q-000184
Marketplace: Wildberries

Вопрос:
<original question>

Не удалось получить ответ.
Codex: codex1
Ошибка: LIMIT

🟢 Сейчас активен: codex1
```

Buttons:

```text
[🔄 Повторить]
[🤖 Сменить Codex]
[✍️ Ответить самому]
[🚫 Игнорировать]
```

After profile change, the same card should expose a retry using the newly active profile.

`Повторить` creates a **new draft attempt for the same question**. It must not create another marketplace-question row or another logical Q-ID.

## 14. Regeneration after successful draft

A successful draft card also has:

```text
[🔄 Сгенерировать заново]
```

This creates a new draft attempt for the same question through the currently active Codex profile.

The previous draft is not sent automatically and is superseded in the UI by the newly selected/current draft.

## 15. Lightweight V1 Codex safety

Do not block V1 behind a large isolation project.

V1 safety is intentionally simple:

1. **operator sees the buyer question before deciding whether Codex receives it**;
2. Codex never has a marketplace-send function;
3. the Codex child process receives a sanitized environment that excludes Ozon/WB/Telegram secrets;
4. Codex runs with `--ephemeral`;
5. Codex runs in `workspace-write` sandbox scoped to a per-attempt job directory;
6. the prompt states that buyer text is untrusted data and must not be executed as instructions.

The service itself may initially run with the existing root-owned Codex authorizations. Stronger OS isolation is a later hardening task, not a V1 blocker.

Critical lightweight invariant:

```text
CODEX_CHILD_ENV_HAS_NO_MARKETPLACE_OR_TELEGRAM_SECRETS
```

## 16. Telegram administration

Only the configured Telegram operator user/chat is accepted.

Minimum commands/menu surfaces:

```text
/questions   -> current/open question queue
/codex       -> active Codex + switch buttons
/errors      -> recent service/Codex errors
/status      -> polling/service state
```

Exact command names may be adjusted during UI testing, but capabilities are required.

## 17. Marketplace send rule

A write adapter can execute only after an explicit Telegram send callback tied to the question and answer revision being displayed.

Before a send:

1. reload question from SQLite;
2. verify it is not already `SENT`;
3. verify answer belongs to the same question ID;
4. capture the exact text to send;
5. transition to `SENDING` transactionally;
6. call the correct marketplace adapter;
7. record success/failure;
8. update the Telegram card.

Double-clicking `Send` must not double-post.

## 18. State model

V1 question lifecycle:

```text
NEW
 |
 +-> MANUAL_INPUT
 |      -> REVIEW
 |
 +-> CODEX_PENDING
 |      -> CODEX_RUNNING
 |             +-> CODEX_ERROR
 |             +-> REVIEW
 |
 +-> IGNORED

REVIEW
 |
 +-> EDITING -> REVIEW
 +-> CODEX_PENDING       (regenerate)
 +-> IGNORED
 +-> SEND_PENDING -> SENDING -> SENT
                           |
                           +-> SEND_FAILED
                           +-> SEND_UNKNOWN (only if API outcome is ambiguous)
```

State transitions must be validated centrally. Telegram callbacks may request transitions; they do not directly mutate arbitrary fields.

## 19. SQLite V1

Required tables:

### `questions`

```text
id INTEGER PRIMARY KEY
public_id TEXT UNIQUE                      -- Q-000184
marketplace TEXT NOT NULL                  -- ozon | wildberries
external_question_id TEXT NOT NULL
product_id TEXT NULL
product_article TEXT NULL
product_title TEXT NULL
question_text TEXT NOT NULL
question_created_at TEXT NULL
status TEXT NOT NULL
current_answer_text TEXT NULL
current_answer_source TEXT NULL            -- manual | codex | edited
current_draft_attempt_id INTEGER NULL
telegram_question_message_id INTEGER NULL
telegram_current_message_id INTEGER NULL
external_reply_id TEXT NULL
created_at TEXT NOT NULL
updated_at TEXT NOT NULL
sent_at TEXT NULL
UNIQUE(marketplace, external_question_id)
```

### `draft_attempts`

```text
id INTEGER PRIMARY KEY
question_id INTEGER NOT NULL
codex_profile TEXT NOT NULL
status TEXT NOT NULL
answer_text TEXT NULL
error_type TEXT NULL
error_message TEXT NULL
started_at TEXT NOT NULL
finished_at TEXT NULL
```

### `telegram_inputs`

Correlates reply-based manual/edit input:

```text
telegram_prompt_message_id INTEGER PRIMARY KEY
question_id INTEGER NOT NULL
mode TEXT NOT NULL                          -- manual_answer | edit_answer
created_at TEXT NOT NULL
expires_at TEXT NULL
```

### `settings`

```text
key TEXT PRIMARY KEY
value TEXT NOT NULL
updated_at TEXT NOT NULL
```

Required setting:

```text
active_codex_profile
```

Optional small `operator_actions` audit table may be added if implementation stays simple.

## 20. Retention

Do not accumulate detailed Codex history indefinitely.

Keep detailed technical generation history for **no more than 5 days**:

```text
draft_attempts older than 5 days -> delete when no longer needed by current question state
Codex JSONL/stdout/stderr traces older than 5 days -> delete
per-attempt job directories older than 5 days -> delete
old detailed diagnostic traces older than 5 days -> delete
```

Run cleanup at least once per day.

Do **not** delete the minimal question identity/state needed for marketplace deduplication:

```text
marketplace
external_question_id
public_id
final/local state
sent status/timestamp
```

Question rows are small and may be retained long-term in V1.

## 21. Polling

Poll both marketplaces approximately every 10 minutes.

Rules:

- failure of Ozon does not block Wildberries;
- failure of Wildberries does not block Ozon;
- repeated marketplace results are deduplicated by `(marketplace, external_question_id)`;
- only newly inserted/relevant questions create initial Telegram cards;
- API-specific pagination/rate-limit mechanics are frozen in A1, not guessed here.

## 22. Prompt files

Prompt is composite and editable during testing.

Suggested structure:

```text
/opt/marketplace-question-operator/prompts/
    base.md
    references.md
    response_contract.md
```

`PromptBuilder` appends runtime context:

```text
marketplace
Q-ID
product context
original buyer question
```

No content-classification branch is allowed in the builder.

Reference paths may include the recommendation matrix, customer copy guide, product classification, Ozon/WB product links and other approved local documents.

## 23. Secrets onboarding

Secrets are not pasted into source code, GitHub, logs, test fixtures or Codex prompts.

Required live credentials are expected to include:

- Telegram bot token;
- Telegram allowed operator user/chat ID (already available to owner);
- Wildberries API token;
- Ozon Seller API credential fields required by the verified A1 contract.

Implementation must provide an interactive server-side secret configuration command/script.

At the integration stage, Codex will be instructed to run that command and **wait for terminal input**. The owner enters the real values directly in the terminal. The input routine must not echo secrets, and Codex must not read or print the resulting secret file.

Target storage:

```text
/etc/marketplace-question-operator/secrets.env
```

with restrictive permissions.

The exact fields are frozen only after A1 verifies current official Ozon/WB authorization requirements.

## 24. Implementation language and dependencies

V1 target:

```text
Python 3.12
asyncio
sqlite3 (stdlib)
httpx
python-telegram-bot
```

Avoid PostgreSQL, Redis, Celery, Docker and other infrastructure unless a real requirement appears.

## 25. Project module layout

Target shape:

```text
/opt/marketplace-question-operator/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── state_machine.py
│   ├── db.py
│   ├── models.py
│   ├── marketplaces/
│   │   ├── base.py
│   │   ├── ozon.py
│   │   └── wildberries.py
│   ├── telegram/
│   │   ├── bot.py
│   │   ├── callbacks.py
│   │   └── rendering.py
│   └── codex/
│       ├── runner.py
│       ├── profiles.py
│       └── prompt_builder.py
├── prompts/
├── scripts/
├── tests/
├── pyproject.toml
└── README.md
```

Exact filenames may change only when implementation has a concrete reason; architectural responsibilities must remain separated.

## 26. Startup/recovery

On service restart:

- SQLite is authoritative;
- `NEW` questions remain actionable;
- `REVIEW` answers remain reviewable;
- stale `CODEX_RUNNING` attempts are moved to a recoverable Codex error state;
- `SENDING` is not blindly resent: use the A1 marketplace-specific reconciliation rule;
- no automatic marketplace publishing occurs during recovery.

## 27. A0 acceptance invariants

```text
TELEGRAM_FIRST_GATE_PASS
NO_AUTOMATIC_CODEX_PASS
QUESTION_ID_CORRELATION_PASS
ORIGINAL_QUESTION_VISIBLE_WITH_EVERY_DRAFT_PASS
MANUAL_ANSWER_CONFIRMATION_REQUIRED_PASS
CODEX_DRAFT_CONFIRMATION_REQUIRED_PASS
IGNORE_WITHOUT_SEND_PASS
CODEX_PROFILE_EXPLICIT_SELECTION_PASS
CODEX_PROFILE_SWITCH_FROM_TELEGRAM_PASS
CODEX_ERROR_RETRY_SAME_QUESTION_PASS
CODEX_REGENERATE_SAME_QUESTION_PASS
NO_AUTOMATIC_CODEX_FAILOVER_PASS
CODEX_CHILD_SECRETS_STRIPPED_PASS
DOUBLE_SEND_PREVENTED_PASS
FIVE_DAY_TECHNICAL_RETENTION_PASS
MARKETPLACE_POLL_ISOLATION_PASS
```

## 28. Development gates

Codex receives implementation prompts only after the relevant contract is frozen.

```text
A0  this architecture contract
A1  exact current Ozon/WB question read/write API contracts
A2  detailed state transitions + DB migration + Telegram callback contract
A3  project scaffold + SQLite/state machine
A4  marketplace read adapters
A5  Telegram question-first moderation
A6  Codex runner + three-profile Telegram control + retry/regenerate
A7  marketplace write adapters
A8  secrets installation + live credential smoke
A9  systemd + retention + recovery
A10 controlled real end-to-end test
```

Real keys are not required before A8 unless an earlier read-adapter smoke explicitly needs them and the owner approves that gate.

Final V1 acceptance path:

```text
real Ozon/WB question
-> Telegram question card
-> operator chooses manual or Codex
-> Telegram answer review
-> explicit Send
-> answer appears on the correct marketplace question
```
