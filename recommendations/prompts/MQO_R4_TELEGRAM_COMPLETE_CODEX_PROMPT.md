MARKETPLACE QUESTION OPERATOR — R4 TELEGRAM + OPERATOR FLOW COMPLETION

Project:
/opt/marketplace-question-operator

Current HEAD:
d910278567be614f7f1c2bb61dda50d170e1bb63

Implement the remaining operator-facing application layer on top of the existing service/orchestration code.

This is an implementation task.

Modify the project, add behavioral tests, run the full suite, and commit the completed work.

Existing code already provides:
- persistence/dedup/public Q-IDs
- answer revisions/state/send claim safety
- Codex profile/draft persistence
- Telegram reply-correlation storage
- retention/error coalescing
- Ozon adapter
- Wildberries adapter
- basic service/orchestration boundary
- polling ingestion into repository
- manual reply flow to REVIEW
- local Ignore
- revision-bound send dispatch
- send success/failure/ambiguous state handling

Goal for this run:
1. production python-telegram-bot wiring
2. complete Telegram rendering/buttons/authorization
3. edit workflow
4. explicit retry/reconciliation workflow
5. complete per-marketplace polling concurrency handling
6. operator commands /questions /codex /errors /status
7. behavioral tests around the real service/handler code

Do not implement real Codex generation yet.
No live credentials or public network calls are used.

TELEGRAM AUTHORIZATION
Only TELEGRAM_OPERATOR_USER_ID may see or operate on buyer questions. Unauthorized users must receive no buyer question text, answer text, external marketplace identifiers, or detailed errors.

Implement async python-telegram-bot handler wiring for:
/questions
/codex
/errors
/status

Callbacks:
manual
codex
ignore
send
edit
cancel_input
retry_send
choose_codex

Keep regenerate/retry_codex decodable if already part of callback contract, but they must perform zero model generation in this run.

INITIAL CARD
Every newly ingested question card shows:
Q-ID
marketplace
product context if available
original buyer question
currently active Codex profile

Buttons:
[✍️ Ответить самому]
[🤖 Отправить в Codex]
[🚫 Игнорировать]

Codex button in this run must not generate. It may return a safe informational response that generation integration is pending.

MANUAL FLOW
Use the existing service/repository path. Manual action creates a Reply prompt tied to the exact telegram_prompt_message_id. Valid reply creates immutable source=manual revision and moves MANUAL_INPUT -> REVIEW.

EDIT FLOW
From REVIEW, Edit must:
- transition REVIEW -> EDITING
- create Reply prompt containing Q-ID, original question, current answer
- persist mode=edit_answer and based_on_revision_id
- on reply, create NEW source=edited immutable revision
- set it current
- transition EDITING -> REVIEW
- old revision remains unchanged

IGNORE
Local only. No marketplace write. WB Ignore must never send state=none.

SEND / RETRY / RECONCILIATION
Use existing claim_send(question_id, answer_revision_id).

On SUCCESS: mark SENT and update Telegram card.
On CLEAR_FAILURE: mark SEND_FAILED and show explicit retry button.
On AMBIGUOUS: mark SEND_UNKNOWN and perform ONE reconciliation check, never another write automatically.

Reconcile MATCHED -> SENT.
Reconcile UNKNOWN -> remain SEND_UNKNOWN.
Reconcile NOT_FOUND -> present explicit safe retry possibility; no automatic write.

Retry from SEND_FAILED must be operator initiated.
Retry from SEND_UNKNOWN must only proceed after reconciliation has established NOT_FOUND or equivalent explicit safe state.

Stale send callback: zero marketplace writes.
Double send: one marketplace write maximum.

POLL CONCURRENCY
Complete same-marketplace overlap protection for actual async orchestration.
- Ozon poll failure must not block WB.
- WB poll failure must not block Ozon.
- concurrent second poll for same marketplace must be suppressed/no-op.
- duplicate question must not duplicate Telegram card.

TELEGRAM RENDERING
Buyer/operator text is untrusted plain text. Do not rely on buyer-controlled Markdown/HTML.
Every important card keeps Q-ID, marketplace, original question.
Do not silently truncate long text. Split deterministically into continuation messages retaining Q-ID/context.

/codex
Show active profile codex1/codex2/codex3 and allow manual switch using existing settings validation. Zero generations.

/questions
Show open questions with Q-ID, marketplace, state and enough context to identify the question.

/errors
Show recent coalesced errors without secrets.

/status
Show useful non-secret status: DB available, active profile, open question count, Ozon/WB adapter availability.

TESTING
Use temp SQLite, fake Telegram/update/context objects or a thin fake transport around handler/service boundaries, and fake marketplace adapters. No network.

Cover at least:
- unauthorized user sees no buyer content
- initial card contains Q-ID/marketplace/question
- manual callback/reply works through handler layer
- two simultaneous reply prompts cannot mix questions
- consumed reply cannot be reused
- edit creates a new immutable revision
- old revision remains unchanged
- local Ignore makes zero marketplace writes
- stale send callback makes zero writes
- double send makes max one write
- clear failure -> SEND_FAILED + explicit retry path
- explicit retry performs one new write
- ambiguous -> one write + one reconcile, no second write
- reconcile MATCHED -> SENT
- reconcile UNKNOWN -> remains SEND_UNKNOWN
- reconcile NOT_FOUND enables safe explicit retry path
- /codex switch persists profile with zero generation
- long content is not silently truncated
- Ozon failure does not block WB polling
- WB failure does not block Ozon polling
- same-marketplace poll overlap suppressed

Run focused tests as useful, then:
.venv/bin/python -m pytest -q

All existing tests must remain passing.

Constraints:
- no live Telegram
- no live Ozon/WB
- no real Codex generation
- no credentials requested/stored
- no systemd changes
- do not modify /root/.codex* contents
- do not touch unrelated services/projects

Finish:
- inspect git status/diff
- verify no secrets/auth material tracked
- commit all work

Commit message:
feat: complete Telegram operator workflow

Return a concise report with START_HEAD, FINAL_HEAD, files changed, implemented areas, test command/result/count, and remaining unresolved integration items.

Expected result: after this task, the only major offline subsystem still missing is real Codex generation workflow/composite prompt integration.

If an actual environment/tool failure prevents implementation, report the exact failing command and exact error.