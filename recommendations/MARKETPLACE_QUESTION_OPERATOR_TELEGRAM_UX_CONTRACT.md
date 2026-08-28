# Marketplace Question Operator — Telegram UX Contract

Status: **FROZEN FOR IMPLEMENTATION — PRODUCT OWNER CORRECTION**  
Date: 2026-08-28

This document is the authoritative V1 Telegram UX contract for Marketplace Question Operator.

It **supersedes every older MQO statement** that conflicts with the flows, button sets or Codex-profile behavior below, including older statements in A0/A2/BOT/prompts that exposed successful-answer regeneration or `/codex` as the operator profile-switch UX.

When implementation, tests, acceptance prompts or older docs disagree with this file, **this file wins for Telegram product UX**.

## 1. Non-negotiable product rules

```text
MARKETPLACE QUESTION -> TELEGRAM OPERATOR FIRST
NO HUMAN SEND ACTION -> NO MARKETPLACE REPLY
AI_DRAFT != PUBLISHED_REPLY
```

Every marketplace answer — manual, Codex-generated or edited — must be shown to the operator for review and may reach Ozon/Wildberries only after the operator presses the revision-bound `✅ Отправить` button.

`🤖 Сменить Codex` is not a separate admin-only surface. It is a normal inline action available **in every question menu/state**.

There is no user-facing `/codex` dependency for profile switching.

## 2. Global Codex profiles

Known profiles:

```text
codex1 -> CODEX_HOME=/root/.codex
codex2 -> CODEX_HOME=/root/.codex_second
codex3 -> CODEX_HOME=/root/.codex_third
```

SQLite stores:

```text
active_codex_profile = codex1 | codex2 | codex3
```

A currently running Codex attempt keeps the profile captured when that attempt started. Changing `active_codex_profile` affects later attempts only.

There is no automatic failover.

## 3. Hard menu invariant

Every question-state menu/card must contain:

```text
[🤖 Сменить Codex]
```

This includes at minimum:

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

A renderer or acceptance test that omits `🤖 Сменить Codex` from one of these question menus is wrong.

## 4. NEW question card

The card shows at minimum:

```text
Q-ID
Marketplace
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

Actions:

- `✍️ Ответить самому` -> enter manual-answer input for this exact Q-ID;
- `🤖 Отправить в Codex` -> create a Codex attempt for this exact Q-ID using the profile active when the attempt is claimed;
- `🚫 Игнорировать` -> local `IGNORED`, no marketplace write;
- `🤖 Сменить Codex` -> choose global active profile, then return to the same NEW question without generation.

## 5. Manual-answer input

The operator selects an exact question with:

```text
[✍️ Ответить самому]
```

The bot enters a deterministic manual-input context for that Q-ID and shows the original question plus an instruction to enter the answer.

The user-facing contract is:

```text
NEW
 -> Ответить самому
 -> enter manual text for exact Q-ID
 -> persist immutable answer revision source=manual
 -> REVIEW
```

The input-correlation implementation must be deterministic and must never attach arbitrary text to another question. Telegram reply correlation may be used internally if implementation needs it, but **ForceReply/reply-to-message is not the product meaning of `Ответить самому` and must not distort the user flow**.

During manual input the question menu still contains:

```text
[🤖 Сменить Codex]
```

Changing Codex during manual input changes only the global active profile and returns to the same manual-input context. It does not generate anything and does not alter the entered/manual answer workflow.

## 6. Manual answer review

After valid manual text is received:

1. persist an immutable `answer_revision(source='manual')` for the exact question;
2. set it as the current answer revision;
3. move the question to `REVIEW`;
4. show the original buyer question and the exact manual answer.

Exact review buttons:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

The manual answer is **not** sent immediately after text entry.

Only `✅ Отправить` may claim that exact revision for `SENDING` and call the marketplace write adapter.

## 7. Codex start and CODEX_RUNNING

From NEW:

```text
[🤖 Отправить в Codex]
 -> capture active profile
 -> create draft_attempt for same Q-ID
 -> CODEX_RUNNING
```

The running card contains Q-ID, original question and generating profile, plus:

```text
[🤖 Сменить Codex]
```

If the operator changes active profile while an attempt is already running:

- the existing attempt continues with its captured profile;
- the global profile changes for future attempts;
- no second attempt is created automatically.

Outcomes:

```text
CODEX_RUNNING -> REVIEW      success
CODEX_RUNNING -> CODEX_ERROR failure
```

## 8. Successful Codex answer -> REVIEW

On success, persist an immutable Codex answer revision and show:

```text
Q-ID
Marketplace
original buyer question
exact Codex answer
profile that generated this answer
currently active profile
```

Exact buttons:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

### Explicit prohibition

A successful REVIEW must **never** contain any of:

```text
[Сгенерировать]
[Сгенерировать заново]
[Перегенерировать]
```

There is no successful-review regeneration feature in V1.

Therefore there is no ordinary transition:

```text
REVIEW -> CODEX_RUNNING
```

for regeneration.

## 9. Edit flow

From REVIEW:

```text
[✏️ Редактировать]
 -> EDITING
 -> operator enters replacement text
 -> persist immutable answer_revision(source='edited', based_on_revision_id=...)
 -> REVIEW
```

During EDITING the question menu includes:

```text
[🤖 Сменить Codex]
```

After edited text is saved, the REVIEW buttons are again exactly:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Editing never publishes automatically and never adds a regenerate button.

## 10. CODEX_ERROR

The error card shows at minimum:

```text
Q-ID
Marketplace
original buyer question
failed Codex profile
sanitized error
currently active profile
```

Exact buttons:

```text
[🔄 Повторить]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

### `🔄 Повторить`

`Повторить` immediately creates a **new draft attempt for the same Q-ID using the profile that is active when `Повторить` is pressed**.

```text
CODEX_ERROR
 -> Повторить
 -> new attempt with current active profile
 -> CODEX_RUNNING
```

It does not open profile selection first.

## 11. Special `Сменить Codex` flow from CODEX_ERROR

This flow is intentionally different from profile switching in every other state.

```text
CODEX_ERROR
 -> [🤖 Сменить Codex]
 -> choose codex1/codex2/codex3
 -> persist new active_codex_profile
 -> SHOW PROFILE-CHANGE CONFIRMATION MENU
```

**Selecting a profile must NOT start Codex automatically.**

The confirmation menu shows old/new profile and contains:

```text
[🔄 Перегенерировать]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Only after the operator explicitly presses:

```text
[🔄 Перегенерировать]
```

may the service:

1. create a new `draft_attempt` for the same Q-ID;
2. capture the newly selected active profile;
3. transition to `CODEX_RUNNING`;
4. launch Codex.

Then:

```text
success -> REVIEW
error   -> CODEX_ERROR
```

This CODEX_ERROR profile-change confirmation is the **only V1 place** where the user-facing action `Перегенерировать` exists.

## 12. `Сменить Codex` in all non-error contexts

From NEW, MANUAL_INPUT, CODEX_RUNNING, REVIEW, EDITING, IGNORED, SENDING, SENT, SEND_FAILED or SEND_UNKNOWN:

```text
[🤖 Сменить Codex]
 -> show profile chooser
 -> select codex1/codex2/codex3
 -> persist active_codex_profile
 -> return to the same question/state/menu
```

No question-state transition occurs solely because the profile changed.

No `draft_attempt` is created.

No Codex process starts.

No marketplace call occurs.

## 13. Profile chooser

The chooser shows the currently active profile and all three choices, for example:

```text
🤖 СМЕНИТЬ CODEX

Сейчас: codex2

[codex1]
[codex2 ✓]
[codex3]
```

The chooser is reached from the inline `🤖 Сменить Codex` button in the current question menu. The product must not require `/codex` to access it.

## 14. REVIEW send contract

For manual, Codex and edited answers, `✅ Отправить` must be bound to:

```text
question_id
answer_revision_id
```

Before any marketplace write:

1. load the exact question;
2. require the expected current state;
3. require that callback revision is still the current revision;
4. load the exact persisted revision text;
5. atomically claim `SENDING`;
6. acknowledge the Telegram callback promptly;
7. invoke the correct marketplace adapter;
8. finish as `SENT`, `SEND_FAILED` or `SEND_UNKNOWN` according to A1 reconciliation rules.

A stale/double-clicked Send must never send a different or duplicate answer.

## 15. Terminal/failure menus

### IGNORED

```text
[🤖 Сменить Codex]
```

Ignore is local only and performs no marketplace answer write.

### SENDING

```text
[🤖 Сменить Codex]
```

Changing Codex does not affect the in-flight marketplace send.

### SENT

```text
[🤖 Сменить Codex]
```

### SEND_FAILED

```text
[🔄 Повторить отправку]
[🤖 Сменить Codex]
```

Retry remains revision-bound and must not double-post.

### SEND_UNKNOWN

```text
[🤖 Сменить Codex]
```

No blind automatic retry. Follow A1 marketplace-specific reconciliation before any explicit retry can become available.

## 16. Canonical V1 state transitions

```text
NEW
 +-> MANUAL_INPUT
 +-> CODEX_RUNNING
 +-> IGNORED

MANUAL_INPUT
 +-> REVIEW             after valid manual text revision
 +-> IGNORED            if explicitly chosen

CODEX_RUNNING
 +-> REVIEW             success
 +-> CODEX_ERROR        failure

CODEX_ERROR
 +-> CODEX_RUNNING      via Повторить
 +-> CODEX_RUNNING      via Перегенерировать after profile-change confirmation
 +-> MANUAL_INPUT
 +-> IGNORED

REVIEW
 +-> EDITING
 +-> SENDING            explicit revision-bound Send
 +-> IGNORED

EDITING
 +-> REVIEW             after valid edited revision

SENDING
 +-> SENT
 +-> SEND_FAILED
 +-> SEND_UNKNOWN

SEND_FAILED
 +-> SENDING            explicit revision-bound retry

SEND_UNKNOWN
 +-> SENT               reconciliation confirms sent
 +-> SENDING            only after reconciliation proves not sent and operator explicitly retries
```

Changing `active_codex_profile` by itself is **not** a question-state transition.

There is no V1 `REVIEW -> CODEX_RUNNING` successful-answer regeneration transition.

## 17. Button matrix — acceptance authority

| State/menu | Required buttons |
|---|---|
| NEW | `✍️ Ответить самому`, `🤖 Отправить в Codex`, `🚫 Игнорировать`, `🤖 Сменить Codex` |
| MANUAL_INPUT | `🤖 Сменить Codex` plus the manual text-entry interaction |
| CODEX_RUNNING | `🤖 Сменить Codex` |
| CODEX_ERROR | `🔄 Повторить`, `✍️ Ответить самому`, `🚫 Игнорировать`, `🤖 Сменить Codex` |
| CODEX_ERROR profile-change confirmation | `🔄 Перегенерировать`, `✍️ Ответить самому`, `🚫 Игнорировать`, `🤖 Сменить Codex` |
| REVIEW | `✅ Отправить`, `✏️ Редактировать`, `🚫 Игнорировать`, `🤖 Сменить Codex` |
| EDITING | `🤖 Сменить Codex` plus the edit text-entry interaction |
| IGNORED | `🤖 Сменить Codex` |
| SENDING | `🤖 Сменить Codex` |
| SENT | `🤖 Сменить Codex` |
| SEND_FAILED | `🔄 Повторить отправку`, `🤖 Сменить Codex` |
| SEND_UNKNOWN | `🤖 Сменить Codex` |

Acceptance must compare the real renderer and callbacks against this matrix before live product testing proceeds.

## 18. Explicitly retired UX

The following older V1 behaviors are retired and must not be reintroduced:

```text
successful REVIEW -> Сгенерировать
successful REVIEW -> Сгенерировать заново
successful REVIEW -> Перегенерировать
REVIEW -> CODEX_RUNNING merely to regenerate a successful answer
profile selection from CODEX_ERROR -> automatic immediate Codex run
profile selection from CODEX_ERROR -> requires a second generic Повторить instead of explicit confirmation-menu Перегенерировать
/codex as the required operator UX for profile switching
question cards without Сменить Codex
manual text -> immediate marketplace send without review
```

## 19. Acceptance freeze

No T4/live Telegram UX acceptance should be considered valid until implementation has been aligned to this contract and offline tests prove the exact button/state matrix.

Freeze markers:

```text
MQO_TELEGRAM_UX_OWNER_CORRECTION_FROZEN
SWITCH_CODEX_IN_EVERY_MENU_FROZEN
NO_SUCCESS_REGENERATION_FROZEN
CODEX_ERROR_SWITCH_CONFIRM_REGENERATE_FROZEN
MANUAL_REVIEW_BEFORE_SEND_FROZEN
REVISION_BOUND_SEND_FROZEN
NO_SLASH_CODEX_DEPENDENCY_FROZEN
```
