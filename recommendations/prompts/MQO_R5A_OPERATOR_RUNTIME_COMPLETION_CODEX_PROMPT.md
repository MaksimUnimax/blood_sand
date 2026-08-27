MARKETPLACE QUESTION OPERATOR — R5A OPERATOR RUNTIME COMPLETION

Project: /opt/marketplace-question-operator
Current HEAD: 46b2fd1fa336944c939ae94768677164f02dc537

Continue implementation from the current codebase. This is a coding task, not an audit or scope assessment.

Make a brief internal plan, then immediately edit the code and keep iterating until the requested work is implemented and tests pass. Do not stop merely because the task is substantial. Task size/complexity by itself is not a blocker. Only stop without code changes for a concrete environment/tool failure; if that happens, report the exact failing command and exact error.

Implement the remaining NON-CODEX operator runtime in this run. Real Codex generation/composite-prompt integration is intentionally left for the next run.

Existing code already includes persistence/state primitives, Ozon and Wildberries adapters, service orchestration basics, manual answer flow, send dispatch basics, Telegram handler registration/authorization, and edit-entry correlation. Preserve and extend those implementations rather than replacing them.

Deliver these four connected areas:

1. Complete Telegram operator UI/runtime
- Finish production python-telegram-bot rendering and callbacks for question, review, edit, ignore, send failure and uncertain-send states.
- Initial card: Q-ID, marketplace, product context if available, original buyer question, active Codex profile; buttons Manual / Send to Codex / Ignore.
- Review card: Q-ID, marketplace, original question, current answer/source; buttons Send / Edit / Regenerate / Ignore. Codex-generation buttons may remain disabled/pending in this run, but must perform zero generation.
- Only TELEGRAM_OPERATOR_USER_ID may see buyer/operator data.
- Callback data carries only action + IDs; Send carries question_id + answer_revision_id.
- Treat buyer/operator text as plain untrusted text. Split long messages deterministically instead of silently truncating them.
- Finish /questions, /codex, /errors, /status behavior. /codex may switch codex1/codex2/codex3 using existing persisted settings, but must not start generation.

2. Complete edit/manual correlation behavior
- REVIEW -> EDITING creates a Reply-linked prompt persisted by telegram_prompt_message_id with based_on_revision_id.
- Reply creates a NEW immutable source=edited revision, points current revision to it, returns EDITING -> REVIEW, and leaves the old revision unchanged.
- Manual and edit replies must resolve only through their exact persisted Telegram prompt message. Two simultaneous prompts for different questions must never mix. Consumed prompts cannot be reused.

3. Complete send retry + reconciliation orchestration
- Normal Send uses existing claim_send(question_id, answer_revision_id) and sends the exact immutable text returned by the claim.
- SUCCESS -> SENT and persist external reply/answer ID when available.
- CLEAR_FAILURE -> SEND_FAILED and expose explicit operator retry.
- AMBIGUOUS -> SEND_UNKNOWN, then perform exactly one adapter reconciliation check and no automatic second write.
- Reconcile MATCHED -> SENT.
- Reconcile UNKNOWN -> remain SEND_UNKNOWN with no second write.
- Reconcile NOT_FOUND -> expose a safe explicit retry path; do not write until the operator explicitly retries.
- Retry from SEND_FAILED is explicit only.
- Stale revision callback performs zero writes.
- Double Send results in at most one marketplace write.
- Telegram Ignore remains local only; never send Wildberries state="none".

4. Complete polling concurrency/aggregation
- Ozon and Wildberries polls are independent.
- Failure of one marketplace does not prevent polling/ingestion of the other.
- Prevent overlapping polls of the same marketplace using actual async coordination.
- A second concurrent same-marketplace poll must not issue another external fetch.
- Only repository insert inserted=True creates an initial Telegram card; duplicate marketplace questions never create duplicate DB rows, Q-IDs or cards.

Add behavioral tests against production code using temporary SQLite, fake Telegram objects/transport, and fake marketplace adapters. Do not use public network.

At minimum verify:
- unauthorized user gets no buyer content;
- initial card contains Q-ID/marketplace/question;
- manual reply through handler/service creates REVIEW revision;
- simultaneous reply prompts do not mix;
- consumed prompt cannot be reused;
- edit creates a new immutable revision and preserves old text;
- Ignore causes zero marketplace writes;
- stale send causes zero writes;
- double send causes at most one write;
- clear failure enters SEND_FAILED and explicit retry performs one new write;
- ambiguous result performs one write + one reconcile only;
- MATCHED -> SENT, UNKNOWN -> SEND_UNKNOWN, NOT_FOUND exposes explicit retry without automatic write;
- /codex switch persists profile and performs zero generation;
- long Telegram content is not silently truncated;
- Ozon polling failure does not block WB and vice versa;
- overlapping same-marketplace polls issue one fetch maximum.

Run focused tests while implementing, then run:

.venv/bin/python -m pytest -q

All existing tests must stay green.

No live Telegram/Ozon/Wildberries calls. No real Codex execution. No credentials or systemd changes. Do not modify /root/.codex, /root/.codex_second, or /root/.codex_third. Do not touch unrelated services/projects.

When the implementation is complete, inspect git diff/status, ensure no secrets/auth material are tracked, and commit:

feat: complete operator runtime and reconciliation

Return only a concise implementation summary with START_HEAD, FINAL_HEAD, files changed, test command/result/count, and the remaining Codex-generation integration work.
