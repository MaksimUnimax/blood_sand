# MQO Telegram bot contract

MQO uses `python-telegram-bot` **22.8** and long polling only. Production calls `deleteWebhook(drop_pending_updates=False)` before one Updater starts with `allowed_updates=["message", "callback_query"]`, `timeout=30`, and `drop_pending_updates=False`. The systemd lifetime `flock` remains mandatory. Inbound updates are durably inserted before PTB can advance its in-memory offset, and completed after the handler's durable business decision. Projection errors after that point are recorded and do not replay business work.

## PTB 22.8 error facts

`RetryAfter`, `Forbidden`, and `Conflict` inherit directly from `TelegramError`. `NetworkError` inherits `TelegramError`; `TimedOut` inherits `NetworkError`; and `BadRequest` also inherits `NetworkError`. `RetryAfter.retry_after` returns installed-default `int` seconds (with PTB's v22.2 deprecation warning), or `datetime.timedelta` if `PTB_TIMEDELTA=1`; the edge handles either. PTB provides no typed individual-400 exception.

Authorities: [Bot API](https://core.telegram.org/bots/api), [getUpdates](https://core.telegram.org/bots/api#getupdates), [answerCallbackQuery](https://core.telegram.org/bots/api#answercallbackquery).

## Mutation matrix

| Operation | Telegram method | Class | RetryAfter | BadRequest | Forbidden | timeout/network | Roll back state? | Ambiguous policy |
|---|---|---|---|---|---|---|---|---|
| Initial card | sendMessage | MESSAGE_CREATE | server delay, one retry; 2 attempts total | fail/no retry | record/no retry | no retry; record | never | no id persisted; NEW is operationally recoverable |
| ForceReply | reply_text | MESSAGE_CREATE | same | fail | record | no retry; no correlation | never | MANUAL_INPUT/EDITING remains; original button stays usable |
| Command/review card | reply_text | MESSAGE_CREATE | same | fail | record | no retry | never | no invented correlation |
| Callback ack | answerCallbackQuery | CALLBACK_ACK | same | fail | record | one bounded retry | never | cannot undo claim |
| UI projection | edit_reply_markup | UI_EDIT | same | fail except exact `message is not modified` success | record | one bounded retry | never | SQLite wins; later render may reconcile |
| Polling | getUpdates | POLLING | PTB lifecycle | error | error | PTB lifecycle | never | Conflict is ownership fault |

The common edge returns `SUCCESS`, `DETERMINISTIC_FAILURE`, `PERMISSION_FAILURE`, `RATE_LIMIT_EXHAUSTED`, `AMBIGUOUS_NETWORK_FAILURE`, `TRANSIENT_FAILURE`, or `POLLING_CONFLICT`. It records failures without tokens and never retries a SQLite mutation.

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

Ack failure never undoes a durable claim. Initial cards persist only a real positive `message_id`; ForceReply correlations are written only after a real positive prompt id. A failed/ambiguous prompt leaves the state waiting but leaves the old button available for a safe retry, and `/errors` reports it. `Conflict` is never an outbound retry or replacement-poller trigger; supervision exposes the PTB polling fault.
