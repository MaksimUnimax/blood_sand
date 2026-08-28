# Marketplace Question Operator — A0 Architecture Contract

Status: **FROZEN FOR IMPLEMENTATION — UX CORRECTED**  
Original freeze: 2026-08-27  
Product-owner UX correction: 2026-08-28

This document is the implementation authority for the first working version of the Ozon/Wildberries marketplace question operator service.

Codex does **not** design this system. Codex implements the contracts frozen here, in A1/A2 and in the dedicated Telegram UX authority:

`MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md`

For Telegram menus, button sets and profile-switch behavior, that UX contract is the most specific authority and supersedes older interpretations.

The 2026-08-28 correction explicitly retires:

- successful-answer `Сгенерировать` / `Сгенерировать заново` actions;
- `/codex` as the required operator profile-switch UX;
- question menus that omit `🤖 Сменить Codex`;
- automatic Codex restart immediately after selecting another profile from `CODEX_ERROR`;
- manual text auto-publication without an explicit review/send step.

## 1. Product goal

Build one standalone server service that:

1. polls new/unanswered buyer questions from Ozon and Wildberries approximately every 10 minutes;
2. stores each marketplace question once;
3. sends the original question to the owner in Telegram **before any Codex generation**;
4. lets the owner answer manually, send the question to Codex, ignore it, or change the active Codex authorization;
5. if Codex is requested, runs the currently selected local Codex authorization and returns its answer to Telegram;
6. lets the owner review the exact manual/Codex/edited answer before publication;
7. publishes only after an explicit revision-bound `✅ Отправить` action;
8. lets the operator switch the active Codex authorization from every question menu.

Hard rules:

```text
MARKETPLACE QUESTION -> TELEGRAM OPERATOR FIRST
NO HUMAN SEND ACTION -> NO MARKETPLACE REPLY
AI_DRAFT != PUBLISHED_REPLY
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
- Telegram updates/callbacks;
- manual/edit text correlation;
- Codex subprocess execution;
- approved marketplace sends;
- retention cleanup.

Do not split V1 into many microservices unless a demonstrated reliability problem requires it.

## 3. Correct high-level flow

```text
Ozon API ---------\
                   -> poll -> normalize -> SQLite -> Telegram NEW card
Wildberries API --/                               |
                                                   +-> Ответить самому
                                                   +-> Отправить в Codex
                                                   +-> Игнорировать
                                                   +-> Сменить Codex

Manual:
NEW -> manual input -> persist manual revision -> REVIEW
    -> Send / Edit / Ignore / Switch Codex
    -> explicit Send -> marketplace API

Codex:
NEW -> selected Codex -> CODEX_RUNNING
    -> success -> persist Codex revision -> REVIEW
       -> Send / Edit / Ignore / Switch Codex
    -> error -> CODEX_ERROR
       -> Repeat / Manual / Ignore / Switch Codex
```

There is **no successful REVIEW regeneration branch**.

## 4. Question identity and correlation

Every marketplace question has:

```text
internal public ID: Q-000184
external marketplace ID: marketplace-native question id
```

Database uniqueness:

```text
UNIQUE(marketplace, external_question_id)
```

Q-ID and the original buyer question must be visible in every important Telegram message related to the question.

Mandatory invariants:

```text
DRAFT.question_id == QUESTION.id
MANUAL_ANSWER.question_id == QUESTION.id
ANSWER_REVISION.question_id == QUESTION.id
SEND.question_id == QUESTION.id
TELEGRAM_CALLBACK.question_id == QUESTION.id
```

The backend owns correlation. It must never trust Codex or free-form operator input to select another question implicitly.

## 5. Global Codex profile control

Known authorizations:

```text
codex1 -> CODEX_HOME=/root/.codex
codex2 -> CODEX_HOME=/root/.codex_second
codex3 -> CODEX_HOME=/root/.codex_third
```

Global setting:

```text
active_codex_profile = codex1 | codex2 | codex3
```

Hard UX invariant:

```text
EVERY QUESTION MENU CONTAINS [🤖 Сменить Codex]
```

At minimum this applies to:

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

The operator switches profile through the inline `🤖 Сменить Codex` action. `/codex` is not required for the product UX.

Selecting another profile normally:

1. changes `active_codex_profile` transactionally;
2. changes no question state;
3. starts no Codex process;
4. creates no draft attempt;
5. performs no marketplace call;
6. returns to the same question/state/menu.

A currently running Codex attempt keeps its captured profile.

## 6. Initial Telegram question card

A new question card contains at minimum:

```text
Marketplace
Q-ID
Marketplace question ID
product context when available
original buyer question
active Codex profile
```

Exact buttons:

```text
[✍️ Ответить самому]
[🤖 Отправить в Codex]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

## 7. Manual-answer workflow

`✍️ Ответить самому` selects the exact Q-ID for manual input.

The user-facing flow is:

```text
NEW
 -> Ответить самому
 -> enter manual answer for exact Q-ID
 -> persist immutable answer_revision(source='manual')
 -> REVIEW
```

The input-correlation mechanism must be deterministic. It must not attach unrelated text to another question. Telegram reply correlation may be used internally if required for safety, but ForceReply is not the product definition of the Manual action.

During manual input, `🤖 Сменить Codex` remains available and changes only the future active Codex profile.

After manual text is accepted, the bot shows the original question and exact manual answer with:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

The manual answer is **not** auto-published after text entry. Only `✅ Отправить` may enter the marketplace-send path.

## 8. Codex workflow

`🤖 Отправить в Codex`:

1. verifies the exact question/state;
2. reads the active profile at claim time;
3. creates `draft_attempt` for that question and captured profile;
4. moves to `CODEX_RUNNING`;
5. acknowledges Telegram callback promptly;
6. launches Codex asynchronously.

The running card includes:

```text
[🤖 Сменить Codex]
```

Changing profile while a run is in flight affects later attempts only.

Codex receives one composite prompt assembled from base instructions, allowed local references, marketplace/product context, Q-ID and buyer question.

V1 must not add a software-side date/general router, recommendation classifier or pre-LLM classifier. Codex decides which allowed reference material applies.

## 9. Successful Codex output

On success:

1. verify the attempt is still current;
2. persist its result;
3. create immutable `answer_revision(source='codex', draft_attempt_id=...)`;
4. set it current;
5. move `CODEX_RUNNING -> REVIEW`;
6. show Q-ID, original question, answer, generating profile and currently active profile.

Exact buttons:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Explicit prohibition for successful REVIEW:

```text
NO [Сгенерировать]
NO [Сгенерировать заново]
NO [Перегенерировать]
```

There is no V1 successful-answer regeneration action and no ordinary `REVIEW -> CODEX_RUNNING` regenerate transition.

## 10. Editing

From REVIEW:

```text
Редактировать
 -> EDITING
 -> operator enters replacement text
 -> persist immutable answer_revision(source='edited', based_on_revision_id=...)
 -> REVIEW
```

During edit input, `🤖 Сменить Codex` remains available.

After editing, REVIEW again has exactly:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

No edit action auto-publishes.

## 11. Codex errors and retry

A Codex failure produces `CODEX_ERROR` with Q-ID, original question, failed profile, sanitized error and active profile.

Exact buttons:

```text
[🔄 Повторить]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

`🔄 Повторить` immediately creates a new attempt for the **same Q-ID** using the profile active when Repeat is pressed.

### Special CODEX_ERROR profile-change flow

From CODEX_ERROR:

```text
Сменить Codex
 -> choose codex1/codex2/codex3
 -> save new active profile
 -> show profile-change confirmation menu
```

Selecting a profile must **not** launch Codex automatically.

The confirmation menu contains:

```text
[🔄 Перегенерировать]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Only the explicit `🔄 Перегенерировать` callback may create the new attempt and move back to `CODEX_RUNNING` using the newly selected profile.

This is the only V1 context where a user-facing `Перегенерировать` action exists.

## 12. Ignore

`🚫 Игнорировать` changes local state to `IGNORED`.

It never publishes an answer and never maps to WB `state:none` unless a future separately approved marketplace contract says otherwise.

The IGNORED card still contains:

```text
[🤖 Сменить Codex]
```

## 13. Marketplace send rule

Every displayed answer is represented by an immutable revision before it can be sent.

`✅ Отправить` must bind both:

```text
question_id
answer_revision_id
```

Before a marketplace write:

1. reload the question;
2. require the allowed current state;
3. require callback revision == current revision;
4. load the exact persisted revision text;
5. transactionally claim `SENDING`;
6. acknowledge callback promptly;
7. call the correct adapter;
8. record `SENT`, `SEND_FAILED` or `SEND_UNKNOWN` according to A1.

Never substitute a newer revision for a stale Send button. Double-clicking Send must not double-post.

Ambiguous marketplace write outcomes must use A1 reconciliation and must not be blindly retried.

## 14. Terminal/failure UI

Every menu retains `🤖 Сменить Codex`.

Required minimums:

```text
IGNORED:
[🤖 Сменить Codex]

SENDING:
[🤖 Сменить Codex]

SENT:
[🤖 Сменить Codex]

SEND_FAILED:
[🔄 Повторить отправку]
[🤖 Сменить Codex]

SEND_UNKNOWN:
[🤖 Сменить Codex]
```

Profile changes in these states affect future Codex attempts only.

## 15. State model

Canonical lifecycle:

```text
NEW
 +-> MANUAL_INPUT
 +-> CODEX_RUNNING
 +-> IGNORED

MANUAL_INPUT
 +-> REVIEW             valid manual revision
 +-> IGNORED            explicit ignore

CODEX_RUNNING
 +-> REVIEW             success
 +-> CODEX_ERROR        failure

CODEX_ERROR
 +-> CODEX_RUNNING      Repeat with current active profile
 +-> CODEX_RUNNING      explicit Перегенерировать after profile-change confirmation
 +-> MANUAL_INPUT
 +-> IGNORED

REVIEW
 +-> EDITING
 +-> SENDING            explicit revision-bound Send
 +-> IGNORED

EDITING
 +-> REVIEW             valid edited revision

SENDING
 +-> SENT
 +-> SEND_FAILED
 +-> SEND_UNKNOWN

SEND_FAILED
 +-> SENDING            explicit revision-bound retry

SEND_UNKNOWN
 +-> SENT               reconciliation confirms sent
 +-> SENDING            only after reconciliation proves not sent + explicit retry
```

Changing active Codex profile alone is not a question-state transition.

There is no successful-answer `REVIEW -> CODEX_RUNNING` regeneration path.

## 16. SQLite V1

A2 owns the refined exact schema, but A0 requires at minimum:

- `questions` with stable public Q-ID, marketplace identity, state, current revision/attempt and Telegram message identities;
- `answer_revisions` with immutable manual/codex/edited text and revision lineage;
- `draft_attempts` with captured Codex profile and outcome;
- input-correlation persistence for manual/edit text where needed;
- `settings` with `active_codex_profile`;
- small recent error persistence.

Question identity rows remain long-term for deduplication. Technical attempt/job traces are retained no more than five days where no longer required by current state.

## 17. Codex runtime safety

Every run explicitly sets the intended `CODEX_HOME`; do not inherit profile implicitly.

Conceptual invocation remains:

```text
env CODEX_HOME=<selected-home> \
  /root/.nvm/versions/node/v22.22.1/bin/codex exec \
  -C <job-dir> \
  -s workspace-write \
  --json \
  --ephemeral \
  <prompt>
```

Critical invariant:

```text
CODEX_CHILD_ENV_HAS_NO_MARKETPLACE_OR_TELEGRAM_SECRETS
```

Codex never receives a marketplace-send function. Buyer text is untrusted data.

## 18. Telegram operator authorization

Only the configured private Telegram operator user/chat is accepted.

Operational/status surfaces may exist, but **Codex profile switching is an inline question-menu capability, not a slash-command dependency**.

## 19. Polling

Poll both marketplaces approximately every 600 seconds.

Rules:

- failure of one marketplace does not block the other;
- `(marketplace, external_question_id)` deduplicates repeated results;
- only newly inserted/relevant questions create initial Telegram cards;
- no overlapping poll for the same marketplace;
- A1 owns exact API pagination/rate-limit/write/reconciliation mechanics.

## 20. Retention

Keep detailed Codex attempts, job directories, JSONL/stdout/stderr and diagnostic traces for no more than five days when they are no longer required for the current question state.

Do not delete minimal question identity/state needed for marketplace deduplication and sent history.

## 21. Acceptance authority

Before continuing live T4 product acceptance, implementation and offline tests must match:

`MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md`

Especially:

```text
SWITCH_CODEX_IN_EVERY_MENU
MANUAL_TEXT -> REVIEW -> EXPLICIT SEND
CODEX_SUCCESS -> REVIEW WITHOUT REGENERATION
CODEX_ERROR -> REPEAT OR SWITCH
CODEX_ERROR SWITCH -> PROFILE CHOICE -> CONFIRMATION -> EXPLICIT ПЕРЕГЕНЕРИРОВАТЬ
NO /codex DEPENDENCY
REVISION_BOUND MARKETPLACE SEND
```

Freeze markers:

```text
MQO_A0_UX_CORRECTION_FROZEN
MQO_TELEGRAM_FIRST_GATE_FROZEN
MQO_HUMAN_SEND_GATE_FROZEN
MQO_SWITCH_CODEX_EVERY_MENU_FROZEN
MQO_NO_SUCCESS_REGENERATION_FROZEN
MQO_ERROR_SWITCH_CONFIRM_REGENERATE_FROZEN
MQO_MANUAL_REVIEW_BEFORE_SEND_FROZEN
```
