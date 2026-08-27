# MQO V1 Telegram bot contract

MQO uses long polling (`getUpdates`) through **python-telegram-bot 22.8**. The
production daemon is the one and only update consumer; it starts one PTB
`Updater`, with `timeout=30`, `allowed_updates=["message", "callback_query"]`
and `drop_pending_updates=False`. Before it starts polling it calls
`deleteWebhook(drop_pending_updates=False)`. A non-empty webhook is therefore
an operational fault, not an alternative production transport. The systemd unit
starts only this daemon and holds `/run/marketplace-question-operator.poller.lock`
through `flock` for its whole lifetime, so a second unit process cannot become
an overlapping poller.

Telegram treats an update as confirmed when a later `getUpdates` uses an offset
higher than its `update_id` ([getUpdates](https://core.telegram.org/bots/api#getupdates)).
This is a material PTB 22.8 crash boundary: `Updater._start_polling` awaits
`update_queue.put(update)` for every update, then sets `_last_update_id`, while
`Application._update_fetcher` independently takes updates from that queue and
runs handlers. The next poll may therefore confirm an update **before handler
start** and **before handler commit**. PTB's offset is only in memory.

MQO supplies PTB with `DurableUpdateQueue`. Its `put` transactionally inserts
the full update JSON into `telegram_updates` before it returns to PTB. The row
is completed only after the blocking command/callback/message handler returns.
At daemon startup, before polling resumes, all incomplete rows are reconstructed
with `Update.de_json` and requeued. Consequently Telegram confirmation cannot
silently lose an operator action: the receipt is either pending for replay or
completed. Duplicate deliveries and the crash-after-business-commit window are
safe through SQLite claims/correlations. Prompt creation is also replay-aware:
MANUAL_INPUT/EDITING without a persisted prompt correlation sends and stores the
missing ForceReply; an existing correlation prevents duplicate prompts. Manual
and edit reply consumption, revision creation and state transition share one
SQLite transaction.

Only the configured private operator is accepted: both `from_user.id` and
private `chat.id` equal `TELEGRAM_OPERATOR_USER_ID`. Unauthorized messages have
no effect; unauthorized callback queries receive a harmless acknowledgement.
Every callback is parsed, authorized, state/revision guarded and answered with
`answerCallbackQuery`; malformed, legacy-version and duplicate callbacks mutate
nothing. Only the current `mqo1:` grammar is actionable, so cards from any
earlier deployment fail closed.

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
second. That `sendMessage` boundary honours a 429 `retry_after` once; all other
Telegram calls (callback acknowledgement, reply, and UI edit) deliberately use
PTB's normal error reporting: a failed UI edit is recorded, while a failed
handler leaves its ingress receipt pending for replay. Deterministic 400s are
not blindly retried. Authentication/forbidden/chat-not-found and
conflict-consumer failures are persistent operational errors; network/5xx
failures surface normally for PTB's polling retry loop. Tokens and token URLs
are never logged.

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
