# MQO V1 Telegram bot contract

MQO uses long polling (`getUpdates`) through **python-telegram-bot 22.8**. The
production daemon is the one and only update consumer; it starts one PTB
`Updater`, with `timeout=30`, `allowed_updates=["message", "callback_query"]`
and `drop_pending_updates=False`. Before it starts polling it calls
`deleteWebhook(drop_pending_updates=False)`. A non-empty webhook is therefore
an operational fault, not an alternative production transport. The systemd unit
starts only this daemon and its normal restart policy must never create an
overlapping instance.

Telegram treats an update as confirmed when a later `getUpdates` uses an offset
higher than its `update_id` ([getUpdates](https://core.telegram.org/bots/api#getupdates)).
PTB 22.8 starts with offset 0, enqueues returned updates, then advances its
in-memory offset to the final update ID plus one. Its graceful shutdown performs
one zero-timeout call at that offset. Thus a crash after enqueue/offset advance
can replay updates; all business actions use SQLite state claims/correlation and
must be idempotent. PTB does not durably own an offset.

Only the configured private operator is accepted: both `from_user.id` and
private `chat.id` equal `TELEGRAM_OPERATOR_USER_ID`. Unauthorized messages have
no effect; unauthorized callback queries receive a harmless acknowledgement.
Every callback is parsed, authorized, state/revision guarded and answered with
`answerCallbackQuery`; malformed, stale and duplicate callbacks mutate nothing.

Initial NEW cards are `sendMessage` results. Their first successful returned
positive `message_id` is persisted in `questions.telegram_question_message_id`;
NULL/zero is never recorded as success. Buttons are InlineKeyboardButton
`callback_data` only. The grammar is `mqo1:` plus unpadded URL-safe base64 of
`action|question_id|revision_id|arg`, UTF-8 1--64 bytes. Proposed-answer actions
(`send`, `edit`, `regenerate`, `retry_send`, and REVIEW ignore) bind the exact
immutable `answer_revisions.id`.

Manual moves NEW to MANUAL_INPUT and creates a ForceReply prompt correlation in
`telegram_inputs` (`manual_answer`, no base revision). Edit moves REVIEW to
EDITING and stores the exact base revision. Only an authorized textual reply to
that prompt consumes the one-time correlation and creates a new revision; an
unrelated/replayed reply cannot create one. SQLite, not Telegram message text,
is canonical.

Codex is callback-only. An atomic SQLite claim changes state to CODEX_RUNNING
and creates one attempt before the callback is acknowledged; the isolated job is
then scheduled asynchronously. Success creates a revision and REVIEW; failure
is CODEX_ERROR. Codex child environments exclude Telegram and marketplace
secrets. Ignore never calls a marketplace adapter and disables old UI buttons.

Send is only REVIEW plus exact current revision: SQLite atomically claims
SENDING, the persisted revision text is loaded and supplied to the marketplace
adapter, and normal reconciliation determines SENT/SEND_FAILED/SEND_UNKNOWN.
No valid human Send callback means no marketplace write. UI editing failures are
recorded and never roll back business state; later rendering can reconcile it.

Outbound per-chat initial-card sends are serialized to no more than one per
second. A 429 honours `retry_after` once; deterministic 400s are not blindly
retried. Authentication/forbidden/chat-not-found and conflict-consumer failures
are persistent operational errors; network/5xx failures surface normally for
PTB's retry loop. Tokens and token URLs are never logged.

Acceptance is isolated by database path and fail-closed marketplace/Codex
adapters, but reuses the production Application, transport, handlers, renderer,
repository and service. It must stop production before obtaining exclusive
polling ownership, uses no diagnostic `getUpdates` baseline reader, and may only
claim ARMED while its process and poller remain live. No live acceptance is part
of T1.

Protocol references: [Bot API](https://core.telegram.org/bots/api),
[getUpdates](https://core.telegram.org/bots/api#getupdates),
[CallbackQuery](https://core.telegram.org/bots/api#callbackquery),
[InlineKeyboardButton](https://core.telegram.org/bots/api#inlinekeyboardbutton),
[ForceReply](https://core.telegram.org/bots/api#forcereply),
[FAQ](https://core.telegram.org/bots/faq).
