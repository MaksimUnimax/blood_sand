# MQO Telegram bot contract

MQO uses `python-telegram-bot` **22.8** and long polling only. Production calls `deleteWebhook(drop_pending_updates=False)` before one Updater starts with `allowed_updates=["message", "callback_query"]`, `timeout=30`, and `drop_pending_updates=False`. The systemd lifetime `flock` remains mandatory. Inbound updates are durably inserted before PTB can advance its in-memory offset, and completed after the handler's durable business decision. Projection errors after that point are recorded and do not replay business work.

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

## Initial delivery recovery

SQLite creates the question before the card is attempted. A failed card creates
one durable `telegram_delivery_failures` row (`INITIAL_CARD`, result class,
detail, timestamps, and no message id); the question has no Telegram message
id. Polling never auto-resends it, including after a restart. An operator may
explicitly resend with `/recover Q-ID DUPLICATE_RISK_ACKNOWLEDGED`; this is an
intentional duplicate-risk acknowledgement because an ambiguous request might
already have created a card. Only a positive returned id clears the failure and
is persisted.

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
