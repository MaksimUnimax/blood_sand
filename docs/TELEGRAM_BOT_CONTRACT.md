# MQO Telegram bot contract

MQO uses `python-telegram-bot` **22.8** and long polling only. Production calls `deleteWebhook(drop_pending_updates=False)` before one Updater starts with `allowed_updates=["message", "callback_query"]`, `timeout=30`, and `drop_pending_updates=False`. The systemd lifetime `flock` remains mandatory. Inbound updates are durably inserted before PTB can advance its in-memory offset, and completed after the handler's durable business decision. Projection errors after that point are recorded and do not replay business work.

## Clean T4 acceptance harness

`app.acceptance` is an isolated, opt-in harness, not a production mode. A clean run uses `/var/lib/marketplace-question-operator/t4-runs/<unique-run-id>/` with an explicit database and evidence file; it rejects both the production database and the historical `t4-acceptance` database. Startup sends no cards and creates no questions. `prepare` creates exactly one explicit scenario (`A_MANUAL`, `B_CODEX_SUCCESS`, `C_CODEX_ERROR_REPEAT`, `D_CODEX_ERROR_SWITCH`, or `E_IGNORE`); a second scenario is refused until the active one is closed. `status --run-dir` is read-only and never polls or sends Telegram.

The harness retains production Repository, QuestionService, renderer, callbacks, revisions, attempts and durable Telegram inbox. Its only external substitutions are deterministic scripted Codex (which cannot spawn a process) and an acceptance send sink (which records an exact would-send payload and returns a synthetic reply id without an HTTP client). Evidence contains scenario/state/attempt/revision/profile/send facts and zero-side-effect counters, never secrets. `systemd/mqo-t4-clean@.service` is the unique-run template; live T4 must first stop production before it can acquire the shared poller lock, and cleanup must restore production. `/var/lib/marketplace-question-operator/t4-acceptance/` is historical evidence only.

## PTB 22.8 error facts

`RetryAfter`, `Forbidden`, and `Conflict` inherit directly from `TelegramError`. `NetworkError` inherits `TelegramError`; `TimedOut` inherits `NetworkError`; and `BadRequest` also inherits `NetworkError`. `RetryAfter.retry_after` returns installed-default `int` seconds (with PTB's v22.2 deprecation warning), or `datetime.timedelta` if `PTB_TIMEDELTA=1`; the edge handles either. PTB provides no typed individual-400 exception.

Authorities: [Bot API](https://core.telegram.org/bots/api), [getUpdates](https://core.telegram.org/bots/api#getupdates), [answerCallbackQuery](https://core.telegram.org/bots/api#answercallbackquery).

## Polling Conflict and systemd restart semantics

An external `getUpdates` owner is a polling ownership fault.  The daemon records
`POLLING_CONFLICT`, performs orderly PTB shutdown, and exits with code **75**.
The deployed `marketplace-question-operator.service` uses `Restart=on-failure`
for ordinary daemon crashes but `RestartPreventExitStatus=75`; therefore a
Conflict does not trigger a replacement poller. `RestartSec=5`,
`StartLimitIntervalSec=10`, and `StartLimitBurst=5` remain a second bounded
guard for unrelated repeated failures.  Operators must resolve the competing
owner and start the unit deliberately. No live conflict is induced for testing.

## Mutation matrix

| Operation | Telegram method | Class | RetryAfter | BadRequest | Forbidden | timeout/network | Roll back state? | Ambiguous policy |
|---|---|---|---|---|---|---|---|---|
| Initial card | sendMessage | MESSAGE_CREATE | server delay, one retry; 2 attempts total | fail/no retry | record/no retry | no retry; record | never | no id persisted; durable `INITIAL_CARD` failure is recoverable |
| ForceReply | reply_text | MESSAGE_CREATE | same | fail | record | no retry; no correlation | never | durable `MANUAL_PROMPT`/`EDIT_PROMPT` failure; original button stays usable |
| Command/review card | reply_text | MESSAGE_CREATE | same | fail | record | no retry | never | no invented correlation |
| Callback ack | answerCallbackQuery | CALLBACK_ACK | same | fail | record | one bounded retry | never | cannot undo claim |
| UI projection | edit_reply_markup | UI_EDIT | same | fail except exact `message is not modified` success | record | one bounded retry | never | SQLite wins; later render may reconcile |
| Polling | getUpdates | POLLING | PTB lifecycle | error | error | PTB lifecycle | never | Conflict is ownership fault |

The common edge returns `SUCCESS`, `DETERMINISTIC_FAILURE`, `PERMISSION_FAILURE`, `RATE_LIMIT_EXHAUSTED`, `AMBIGUOUS_NETWORK_FAILURE`, `TRANSIENT_FAILURE`, or `POLLING_CONFLICT`. MESSAGE_CREATE has five final result classes: confirmed success; deterministic failure; permission failure; rate-limit exhaustion after the bounded retry; and ambiguous network failure. It records failures without tokens and never retries a SQLite mutation.

## Callback ordering

| Action | Durable operation | Ack | Long operation | UI projection |
|---|---|---|---|---|
| Manual | NEW → MANUAL_INPUT | then | ForceReply | disable after prompt succeeds |
| Edit | REVIEW → EDITING | then | ForceReply | disable after prompt succeeds |
| Codex/regenerate/retry | CODEX_RUNNING claim | then | async Codex | disable/render later |
| Ignore | → IGNORED | then | none | disable |
| Send | SENDING claim | then | marketplace/reconciliation | render/disable |
| retry_send | retry transition + SENDING claim | then | marketplace/reconciliation | render/disable |
| profile switch | active-profile update | then | none | confirmation reply |
| malformed/stale/legacy/unauthorized/duplicate | none | attempted via ack policy | none | none |

## Frozen operator UX

Every question-state card (`NEW`, `MANUAL_INPUT`, `CODEX_RUNNING`, `CODEX_ERROR`,
`REVIEW`, `EDITING`, `IGNORED`, `SENDING`, `SENT`, `SEND_FAILED`, and
`SEND_UNKNOWN`) includes **🤖 Сменить Codex**. It is the normal product path;
`/codex` remains diagnostic only. In every non-error state a selection commits
only the global active profile and returns to the same question/state: it makes
no attempt, starts no Codex run, and writes no marketplace answer. A running
attempt retains the profile captured by its durable claim.

NEW exposes exactly Manual, Send to Codex, Ignore, and Switch Codex. Manual
enters `MANUAL_INPUT`, correlates only a reply to its real ForceReply prompt,
creates an immutable manual revision, then enters REVIEW. Edit similarly
creates an immutable `edited` revision based on the prior revision and returns
to REVIEW. Neither text entry publishes.

Successful REVIEW (manual, Codex, and edited) exposes exactly Send, Edit,
Ignore, and Switch Codex. It has no regenerate action or transition to Codex.
Legacy successful-review regeneration callbacks are rejected and acknowledged
without mutation. Send callback data binds the question and revision; the
durable `SENDING` claim verifies the revision is current before acknowledgement
and before the marketplace call.

CODEX_ERROR exposes Repeat, Manual, Ignore, and Switch Codex. Repeat captures
the current active profile and starts one claimed attempt. Switching profile in
this state never starts Codex: it shows a confirmation with **🔄
Перегенерировать**, Manual, Ignore, and Switch Codex. That confirmation is the
only V1 location of Перегенерировать; only its explicit callback claims and
starts the next attempt.

## Initial delivery recovery

SQLite creates the question before the card is attempted. A failed card creates
one durable `telegram_delivery_failures` row (`INITIAL_CARD`, result class,
detail, timestamps, and no message id); the question has no Telegram message
id. Polling never auto-resends it, including after a restart. An operator may
explicitly resend with `/recover Q-ID DUPLICATE_RISK_ACKNOWLEDGED`; this is an
intentional duplicate-risk acknowledgement because an ambiguous request might
already have created a card. Only a positive returned id clears the failure and
is persisted.

Review and Codex-error cards are MESSAGE_CREATE projections. Their failure does
not alter the canonical question or revision; `/recover Q-ID` explicitly
renders the current canonical review/error card again. Command/status cards are
informational only and have no future-correlation requirement.

## Manual and Edit prompt creation recovery

Manual changes `NEW → MANUAL_INPUT`, and Edit changes `REVIEW → EDITING`, before
the callback acknowledgement and ForceReply attempt. A failed or ambiguous
ForceReply leaves a durable `MANUAL_PROMPT` or `EDIT_PROMPT` failure, no
`telegram_inputs` row, and no invented id. The original Manual/Edit callback
button remains enabled; clicking it is an explicit operator retry, never an
automatic retry. It creates at most one active correlation because an existing
`telegram_inputs` row suppresses another prompt. Unrelated text is ignored.
For Edit, the original current revision remains unchanged; only a correlated
reply can create the next revision. These rows survive restart and are not
automatically resent.

Ack failure never undoes a durable claim. It is distinct from MESSAGE_CREATE:
the state transition remains canonical, while recovery depends on whether a
prompt/card was confirmed. `Conflict` is never an outbound retry or
replacement-poller trigger.
