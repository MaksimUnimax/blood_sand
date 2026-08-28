MARKETPLACE QUESTION OPERATOR — T3A TELEGRAM FOUNDATION FINALIZATION

Project runtime:
/opt/marketplace-question-operator

Documentation authority for Telegram UX:
recommendations/MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md

This task closes the remaining Telegram-foundation defects before any T4 live UX acceptance.

Do not redesign the product. Do not invent alternate UX. Implement the frozen Telegram UX contract exactly and close the remaining outbound Telegram mutation/error-policy gap found during T3.

==================================================
1. START / SOURCE OF TRUTH
==================================================

Work only in:
/opt/marketplace-question-operator

Do not assume the server HEAD from an older chat or prompt.

At start:
- cd /opt/marketplace-question-operator
- print START_HEAD = current `git rev-parse HEAD`
- require clean working tree; if not clean, STOP and report exact status without discarding anything
- inspect the current Telegram runtime, state/repository layer, tests and docs before editing
- run the full existing test suite once and record the baseline count/result

The current runtime repository on the server is the implementation source of truth. Preserve all already-working durability behavior unless this task explicitly changes it.

The frozen product rules below are mandatory even if older runtime code/tests/docs disagree.

==================================================
2. NON-NEGOTIABLE PRODUCT INVARIANTS
==================================================

MARKETPLACE QUESTION -> TELEGRAM OPERATOR FIRST
NO HUMAN SEND ACTION -> NO MARKETPLACE REPLY
AI_DRAFT != PUBLISHED_REPLY

No automatic marketplace reply publication.
No automatic Codex generation for a newly discovered marketplace question.
No marketplace write from Manual/Edit text entry.
No marketplace write from profile switching.

Every marketplace send must use the exact persisted answer revision bound to the operator's explicit `✅ Отправить` action.

==================================================
3. FROZEN TELEGRAM UX — IMPLEMENT EXACTLY
==================================================

Known profiles:

codex1 -> CODEX_HOME=/root/.codex
codex2 -> CODEX_HOME=/root/.codex_second
codex3 -> CODEX_HOME=/root/.codex_third

SQLite stores one global active profile:

active_codex_profile = codex1 | codex2 | codex3

Changing active profile never changes a currently running Codex attempt; the running attempt keeps its captured profile.
There is no automatic failover.

--------------------------------------------------
3.1 Hard menu invariant
--------------------------------------------------

Every question-state menu/card must expose:

[🤖 Сменить Codex]

This includes at minimum:

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

Do not implement profile switching only behind `/codex`.
`/codex` may remain as a diagnostic/admin convenience if already present, but the product must not depend on it.

--------------------------------------------------
3.2 NEW
--------------------------------------------------

Exact visible action set:

[✍️ Ответить самому]
[🤖 Отправить в Codex]
[🚫 Игнорировать]
[🤖 Сменить Codex]

`Ответить самому`:
- claim the exact Q-ID for manual input
- no marketplace write
- no Codex generation

`Отправить в Codex`:
- capture the profile active when the callback is successfully claimed
- create one new draft_attempt for the same Q-ID
- transition to CODEX_RUNNING
- no marketplace write

`Игнорировать`:
- local IGNORED only
- no Ozon/WB write

`Сменить Codex`:
- open profile chooser
- choose codex1/codex2/codex3
- persist global active profile
- return to the same NEW question/menu
- no draft attempt
- no Codex process
- no marketplace call

--------------------------------------------------
3.3 MANUAL_INPUT
--------------------------------------------------

User-facing flow:

NEW
 -> Ответить самому
 -> enter manual text for the exact Q-ID
 -> persist immutable answer_revision(source='manual')
 -> REVIEW

Manual input correlation must remain deterministic. It must never attach arbitrary operator text to another question.

If the current implementation uses Telegram reply-to-message / ForceReply correlation internally, it may remain as an implementation mechanism, but it must not alter the product flow above.

During MANUAL_INPUT the question menu still exposes:

[🤖 Сменить Codex]

Changing Codex during MANUAL_INPUT:
- changes only global active_codex_profile
- returns to the same manual-input context
- does not start generation
- does not discard or alter the manual-answer flow

--------------------------------------------------
3.4 REVIEW — manual / Codex / edited
--------------------------------------------------

All successful answer reviews use exactly:

[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]

A successful REVIEW MUST NOT contain any user-facing action equivalent to:

Сгенерировать
Сгенерировать заново
Перегенерировать
Regenerate

There is no ordinary successful-review regeneration feature in V1.

Therefore remove/disable any ordinary transition:

REVIEW -> CODEX_RUNNING

that exists only for successful-answer regeneration.

Do not remove CODEX_ERROR retry behavior described below.

--------------------------------------------------
3.5 EDITING
--------------------------------------------------

Flow:

REVIEW
 -> Редактировать
 -> EDITING
 -> operator enters replacement text
 -> persist immutable answer_revision(source='edited', based_on_revision_id=...)
 -> REVIEW

During EDITING expose:

[🤖 Сменить Codex]

Changing Codex does not leave EDITING and does not create a draft attempt.

After edited text is persisted, return to the exact REVIEW action set:

[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]

Editing never publishes automatically.

--------------------------------------------------
3.6 CODEX_RUNNING
--------------------------------------------------

The card includes Q-ID, original question, generating profile and:

[🤖 Сменить Codex]

If active profile changes while an attempt is running:
- running attempt continues with captured profile
- global active profile changes for future attempts only
- no second attempt is created automatically

Outcomes remain:

CODEX_RUNNING -> REVIEW on success
CODEX_RUNNING -> CODEX_ERROR on failure

--------------------------------------------------
3.7 CODEX_ERROR
--------------------------------------------------

Exact visible action set:

[🔄 Повторить]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]

`🔄 Повторить`:
- immediately creates a NEW draft_attempt for the same Q-ID
- captures whichever profile is active when Repeat is pressed
- transitions to CODEX_RUNNING
- does not first require profile chooser

Special profile-change flow from CODEX_ERROR:

CODEX_ERROR
 -> [🤖 Сменить Codex]
 -> choose codex1/codex2/codex3
 -> persist active_codex_profile
 -> show a profile-change confirmation menu

Selecting the profile MUST NOT start Codex automatically.

The confirmation menu must contain:

[🔄 Перегенерировать]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]

Only explicit `🔄 Перегенерировать` may:
- create a new draft_attempt for the same Q-ID
- capture the newly active profile
- transition to CODEX_RUNNING
- launch Codex

This CODEX_ERROR profile-change confirmation is the ONLY V1 location where the user-facing action `Перегенерировать` exists.

--------------------------------------------------
3.8 Profile switch from all non-error states
--------------------------------------------------

From:
NEW
MANUAL_INPUT
CODEX_RUNNING
REVIEW
EDITING
IGNORED
SENDING
SENT
SEND_FAILED
SEND_UNKNOWN

flow is:

[🤖 Сменить Codex]
 -> profile chooser
 -> select codex1/codex2/codex3
 -> persist global active_codex_profile
 -> return to the SAME question/state/menu

Profile switch alone must cause:
- zero question-state transition
- zero draft_attempt creation
- zero Codex process start
- zero marketplace call

--------------------------------------------------
3.9 Profile chooser
--------------------------------------------------

Show current active profile and all three choices, e.g.:

🤖 СМЕНИТЬ CODEX

Сейчас: codex2

[codex1]
[codex2 ✓]
[codex3]

The chooser is reached from the current question's inline `🤖 Сменить Codex` action.

==================================================
4. SEND / REVISION CONTRACT
==================================================

For manual, Codex and edited REVIEW answers, `✅ Отправить` must remain bound to:

question_id
answer_revision_id

Before any marketplace write:
1. load exact question
2. require expected current state
3. require callback revision is still current
4. load exact persisted revision text
5. atomically claim SENDING
6. acknowledge Telegram callback promptly
7. invoke correct marketplace adapter
8. finish as SENT / SEND_FAILED / SEND_UNKNOWN using existing marketplace reconciliation rules

A stale/double-clicked Send must not send a different or duplicate answer.

Fix callback ordering for BOTH ordinary Send and retry-send:

validate
-> durable SENDING claim
-> answerCallbackQuery promptly
-> marketplace call/reconciliation
-> Telegram UI projection

The marketplace call must not run before callback acknowledgment is attempted.

Callback-ack failure must not roll back the already durable SENDING claim.

==================================================
5. TELEGRAM MUTATION / ERROR POLICY
==================================================

Complete the outbound Telegram policy gap found during T3.

Use the exact installed python-telegram-bot version/source in the runtime. Do not guess exception behavior.

At minimum classify the installed PTB exceptions corresponding to:
- RetryAfter
- BadRequest
- Forbidden
- NetworkError
- TimedOut
- Conflict
- generic TelegramError

Inventory every production Telegram mutation call site, including at minimum current uses equivalent to:
- bot.send_message
- Message.reply_text
- CallbackQuery.answer
- message/edit-message reply markup
- message/edit-message text

Do NOT create one blind generic retry wrapper for all Telegram operations.

Classify by operation semantics:

A. CALLBACK_ACK
- answerCallbackQuery
- UI acknowledgment only
- failure never rolls back canonical business state
- bounded safe retry for rate/network/timeout is allowed

B. UI_EDIT
- editMessageReplyMarkup / editMessageText or PTB equivalents
- projection/reconstructable UI
- bounded safe retry is allowed where semantically idempotent
- projection failure never rolls back canonical business state

C. MESSAGE_CREATE
- sendMessage / reply_text or equivalents that create a new Telegram message
- ambiguous network/timeout may mean Telegram created the message but the client lost the response
- DO NOT blindly retry ambiguous network/timeout failures because that can create duplicate cards/prompts
- RetryAfter may be bounded-retried after the actual specified wait
- never invent/fake a message_id
- no positive returned Telegram Message => no correlation record that depends on its message_id

D. POLLING
- Conflict belongs to inbound poller ownership/lifecycle
- classify explicitly as single-poller operational fault
- no tight retry loop and no spawning a second poller

Use explicit result categories or equivalent internal representation:

SUCCESS
DETERMINISTIC_FAILURE
PERMISSION_FAILURE
RATE_LIMIT_EXHAUSTED
AMBIGUOUS_NETWORK_FAILURE
TRANSIENT_FAILURE
POLLING_CONFLICT

--------------------------------------------------
5.1 RetryAfter
--------------------------------------------------

Use the actual PTB retry_after value.
Bound retries.
No tight loop.
Do not repeat canonical business mutations while retrying a Telegram projection/ack.

--------------------------------------------------
5.2 BadRequest
--------------------------------------------------

No blind retry.
Only treat a known exact idempotent UI-edit condition specially if the installed API behavior and current call semantics prove it safe.

--------------------------------------------------
5.3 Forbidden
--------------------------------------------------

No tight retry.
Record/surface as a persistent Telegram permission/operator-delivery fault.
Do not roll back marketplace/business state already committed.

--------------------------------------------------
5.4 NetworkError / TimedOut
--------------------------------------------------

CALLBACK_ACK:
- bounded retry allowed

UI_EDIT:
- bounded safe retry allowed

MESSAGE_CREATE:
- ambiguous outcome
- no blind immediate resend
- no fabricated message_id

Initial question-card create ambiguous failure:
- do not persist a fake delivered message ID
- canonical question remains recoverable for later queue/re-render/reconciliation

Manual/Edit input-prompt create ambiguous failure:
- do not create a telegram_inputs mapping without a real prompt message_id
- state must remain recoverable
- arbitrary later operator messages must not be accepted as answers merely because the prompt creation failed

--------------------------------------------------
5.5 Conflict
--------------------------------------------------

Treat Telegram Conflict as poller-ownership fault.
The service already uses a lifetime flock single-poller lock; preserve it.
No tight restart/conflict loop.
No second diagnostic getUpdates consumer.
Use the installed PTB lifecycle behavior to implement/test the safest fail/terminate behavior for this service.

==================================================
6. DURABLE UPDATE RECEIPT SEMANTICS
==================================================

Preserve the existing durable `telegram_updates` ingestion boundary from T2/T3:

Telegram update
-> durable SQLite receipt commit
-> PTB queue return / offset may advance
-> business dispatcher

Startup replay of incomplete receipts must remain.

Audit outbound failures after canonical business mutation.

Critical rule:
If the canonical operator action has already been durably committed, a later Telegram callback-ack or UI-projection failure must NOT leave the same durable update receipt perpetually incomplete in a way that causes replay to repeat the business mutation.

Examples:
- IGNORE state commit succeeded, UI edit failed -> receipt completes; later UI can be reconstructed
- CODEX_RUNNING claim/draft_attempt creation succeeded, ack/UI failed -> receipt completes; do not replay and create a second attempt
- SENDING claim succeeded, ack failed -> do not roll back claim; receipt handling must not cause a duplicate send
- profile switch committed, projection failed -> do not replay into repeated semantic mutation or generation

Business idempotency guards remain required, but receipt completion policy must deliberately distinguish canonical business failure from projection failure.

==================================================
7. CALLBACK ACK ORDERING FOR ALL ACTIONS
==================================================

For every callback with a canonical mutation:

validate
-> durable state/claim/profile mutation
-> answerCallbackQuery promptly
-> any long work
-> UI projection

Required checks:

Send:
SENDING claim -> ACK -> marketplace operation/reconciliation -> UI

Retry send:
SENDING claim -> ACK -> marketplace operation/reconciliation -> UI

Codex start / Repeat / CODEX_ERROR Perегенерировать:
durable attempt + CODEX_RUNNING claim -> ACK -> async generation

Manual:
MANUAL_INPUT claim -> ACK -> create input prompt / render

Edit:
EDITING claim -> ACK -> create input prompt / render

Ignore:
IGNORED commit -> ACK -> UI projection

Profile switch:
active_codex_profile commit -> ACK -> return/confirmation projection
No generation except after separate explicit CODEX_ERROR `Перегенерировать` callback.

Rejected callbacks should also attempt prompt acknowledgment where Telegram permits it, with zero business mutation:
- malformed mqo1 payload
- stale state
- stale revision
- legacy callback
- unauthorized operator/chat
- duplicate/double tap

==================================================
8. CALLBACK / STATE CORRELATION
==================================================

Preserve compact deterministic callback_data under Telegram's 64-byte limit.

Do not trust public Q-ID text or Telegram-rendered text as business identity.
Use persisted integer question_id / revision_id / action/profile argument in the callback contract.

Profile-switch callbacks must retain enough question context to return to the same question/state after selection.

CODEX_ERROR profile-change confirmation must retain exact Q-ID context but must not itself create a draft attempt.

Successful REVIEW must have no regeneration callback route.
Legacy callback forms that could invoke removed successful-review regeneration must fail closed and be acknowledged without mutation.

==================================================
9. OFFLINE TEST MATRIX — REQUIRED
==================================================

Add focused regression tests. Do not rely only on manual inspection.

At minimum cover:

A. Button/menu matrix
- NEW exact four actions
- MANUAL_INPUT includes Switch Codex
- CODEX_RUNNING includes Switch Codex
- CODEX_ERROR exact four actions
- REVIEW exact four actions and NO regenerate token
- EDITING includes Switch Codex
- IGNORED includes Switch Codex
- SENDING includes Switch Codex
- SENT includes Switch Codex
- SEND_FAILED includes Switch Codex
- SEND_UNKNOWN includes Switch Codex

B. Successful REVIEW regeneration prohibition
- manual REVIEW no regenerate
- Codex REVIEW no regenerate
- edited REVIEW no regenerate
- removed legacy regeneration callback cannot transition REVIEW -> CODEX_RUNNING

C. Manual flow
- manual text creates immutable manual revision
- transitions to REVIEW
- zero marketplace writes before explicit Send

D. Edit flow
- edited revision preserves based_on_revision_id
- returns to REVIEW
- zero marketplace writes before explicit Send

E. Profile switching
For every non-error relevant state:
- active profile changes
- question state unchanged
- no new draft_attempt
- no Codex process
- no marketplace write

F. CODEX_RUNNING profile switch
- running attempt profile immutable
- global profile changes only for future attempt
- no second attempt

G. CODEX_ERROR Repeat
- uses profile active at moment Repeat is pressed
- immediately creates one new attempt and CODEX_RUNNING

H. CODEX_ERROR special Switch Codex flow
- choosing profile changes global setting
- creates zero draft attempts
- starts zero Codex processes
- shows confirmation menu containing `Перегенерировать`
- only explicit `Перегенерировать` creates one attempt with newly active profile

I. Telegram mutation policy
Inject/mocks for each operation class:
- RetryAfter
- BadRequest
- Forbidden
- NetworkError
- TimedOut
- Conflict where applicable

Assert MESSAGE_CREATE network/timeout ambiguity does not blindly retry and never fabricates message_id.
Assert callback ack/UI projection failures do not roll back canonical business state.
Assert RetryAfter uses bounded actual wait semantics without tight loop.

J. Callback ordering
Assert for Send/retry-send that ACK attempt occurs after durable SENDING claim and before marketplace adapter call.
Assert Codex ACK before generation start.
Assert Manual/Edit ACK before prompt create.
Assert Ignore/Profile-switch ACK before UI projection.

K. Durable receipts
- canonical business success + callback ack failure => no business replay
- canonical business success + UI edit failure => no business replay
- message-create ambiguity does not create fake correlation
- duplicate/replayed update remains idempotent

L. Existing durable-poller regressions
All T2/T3 durable inbox/single-poller tests must remain green.

==================================================
10. PRODUCTION SAFETY / EXTERNAL ACTIVITY
==================================================

This task is implementation + offline/runtime verification only.

DO NOT:
- send synthetic Telegram question cards to the operator
- require the human to press buttons
- run a real Codex generation
- send any Ozon answer
- send any Wildberries answer
- call marketplace write endpoints
- run a second diagnostic getUpdates consumer
- rotate/change secrets
- change Codex auth directories

Allowed after all tests pass:
- restart ONLY `marketplace-question-operator.service`
- inspect its status/journal
- verify Telegram getMe/webhook configuration only through non-consuming/safe paths already used by production diagnostics
- verify the lifetime flock/single-poller invariant

Do not touch:
- /opt/autopostmanager
- /opt/ai-starter-community
- /opt/opendesign-lab
- /opt/business-bridge-2
- /opt/business-bridge-80
- /root/.codex*
- nginx
- Docker
- PostgreSQL
- control panel
- network configuration

==================================================
11. IMPLEMENTATION DISCIPLINE
==================================================

Keep one coherent production Telegram edge/policy layer where practical, but keep operation-specific semantics.
Do not hide behavior behind a universal retry decorator that treats message creation like UI edit.

Keep SQLite as canonical state.
Telegram UI is a projection.
A projection failure must not reverse a committed operator/business transition.

Do not broaden this task into marketplace adapter redesign, prompt-content changes, Codex quality tuning or T4 live acceptance.

If a failing test reveals an unrelated pre-existing defect that blocks this task, fix only the narrow concrete defect needed to restore the tested Telegram contract.

==================================================
12. VALIDATION / FINISH
==================================================

After implementation:
1. run full `.venv/bin/python -m pytest -q`
2. run any existing offline doctor/selftest relevant to Telegram/runtime
3. require all tests green
4. commit all project changes in one coherent commit unless a narrow prerequisite fix genuinely requires a separate commit
5. print FINAL_HEAD
6. restart only `marketplace-question-operator.service`
7. verify service active
8. verify NRestarts is stable during a short observation window
9. verify lifetime flock is held by the service process
10. verify no Telegram Conflict loop, auth loop or second poller
11. verify no marketplace writes occurred
12. verify no real Codex generation occurred
13. do not start T4

Return exactly a concise evidence report containing:

START_HEAD = ...
FINAL_HEAD = ...
COMMITS_CREATED = ...
BASELINE_TESTS = ...
FINAL_TESTS = ...
TEST_RESULT = PASS/FAIL

UX_AUTHORITY_IMPLEMENTED = yes/no
SWITCH_CODEX_PRESENT_IN_ALL_QUESTION_STATES = yes/no
NEW_BUTTON_SET = ...
REVIEW_BUTTON_SET = ...
CODEX_ERROR_BUTTON_SET = ...
SUCCESS_REVIEW_REGENERATE_PRESENT = yes/no
CODEX_ERROR_PROFILE_CHANGE_CONFIRMATION = PASS/FAIL
PROFILE_SELECTION_AUTO_STARTS_CODEX = yes/no
CODEX_ERROR_REGENERATE_IS_ONLY_REGENERATE = yes/no

TELEGRAM_MUTATION_CALL_SITES = ...
TELEGRAM_OPERATION_CLASSES = ...
COMMON_TELEGRAM_EDGE_POLICY = ...
MESSAGE_CREATE_POLICY = ...
CALLBACK_ACK_POLICY = ...
UI_EDIT_POLICY = ...
POLLING_CONFLICT_POLICY = ...
RETRY_AFTER_POLICY = ...
BAD_REQUEST_POLICY = ...
FORBIDDEN_POLICY = ...
NETWORK_TIMEOUT_POLICY = ...
AMBIGUOUS_MESSAGE_CREATE_POLICY = ...

SEND_ACK_BEFORE_MARKETPLACE_CALL = yes/no
RETRY_SEND_ACK_BEFORE_MARKETPLACE_CALL = yes/no
CODEX_ACK_BEFORE_GENERATION = yes/no
MANUAL_ACK_BEFORE_PROMPT = yes/no
EDIT_ACK_BEFORE_PROMPT = yes/no
IGNORE_ACK_BEFORE_UI = yes/no
PROFILE_SWITCH_ACK_BEFORE_UI = yes/no
REJECTED_CALLBACK_ACK_POLICY = ...

INITIAL_CARD_MESSAGE_ID_SAFETY = PASS/FAIL
MANUAL_PROMPT_MESSAGE_ID_SAFETY = PASS/FAIL
EDIT_PROMPT_MESSAGE_ID_SAFETY = PASS/FAIL
UI_PROJECTION_FAILURE_ROLLS_BACK_BUSINESS_STATE = yes/no
DURABLE_RECEIPT_REPLAYS_COMMITTED_BUSINESS_ACTION = yes/no
CONFLICT_TEST = PASS/FAIL
ERROR_POLICY_TEST_MATRIX = PASS/FAIL

TELEGRAM_LIVE_HUMAN_ACTIONS = 0
SYNTHETIC_TELEGRAM_CARDS_SENT = 0
REAL_CODEX_GENERATIONS = 0
OZON_WRITES = 0
WB_WRITES = 0

SERVICE_ACTIVE = yes/no
SERVICE_NRESTARTS = ...
SINGLE_POLLER_LOCK = PASS/FAIL

T3A_RESULT = PASS/FAIL

Stop after T3A. Do not perform T4 live UX acceptance in this run.
