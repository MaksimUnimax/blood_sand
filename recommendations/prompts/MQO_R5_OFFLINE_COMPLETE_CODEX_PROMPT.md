# MARKETPLACE QUESTION OPERATOR — R5 OFFLINE COMPLETION

Project:
`/opt/marketplace-question-operator`

Current HEAD:
`46b2fd1fa336944c939ae94768677164f02dc537`

Implement the remaining OFFLINE operator functionality end-to-end.

This is an implementation task. Modify the project, add behavioral tests, run the full suite, and commit the completed work.

## Existing implemented foundation

Preserve and build on the current code:

- SQLite question persistence/dedup/public Q-IDs
- immutable answer revisions
- guarded state transitions
- revision-bound send claims / stale revision rejection / double-send protection
- SENT / SEND_FAILED / SEND_UNKNOWN persistence
- Codex profile settings and draft-attempt persistence
- Telegram reply-correlation persistence
- recent-error coalescing
- five-day technical retention
- production Ozon adapter with read/send/reconcile
- production Wildberries adapter with read/send/reconcile
- service/orchestration boundary
- marketplace ingestion and initial card transport calls
- manual answer flow to REVIEW
- local Ignore
- revision-bound marketplace send dispatch
- basic async python-telegram-bot handler wiring
- /questions /codex /errors /status registration
- operator authorization gate
- edit-entry transition and Reply correlation capture

## Goal

Finish all remaining offline functionality in one coherent run:

1. Complete Telegram rendering/buttons and handler behavior.
2. Complete edit workflow.
3. Complete explicit send retry + reconciliation orchestration.
4. Complete robust marketplace polling concurrency/aggregation behavior.
5. Integrate the real Codex runner abstraction into the service.
6. Implement the one composite prompt path.
7. Implement Telegram -> Codex -> review/error/retry/profile-switch flow.
8. Add comprehensive fake E2E tests.

No real Telegram, marketplace, or Codex network/model calls in this run.
No credentials are requested or stored.

---

## Telegram rendering and buttons

Create production-capable renderers for the operator flow.

Initial question card must contain:

- Q-ID
- marketplace
- product context if available
- original buyer question
- currently active Codex profile

Actions:

- `manual`
- `codex`
- `ignore`

Review card must contain:

- Q-ID
- marketplace
- original buyer question
- current answer
- source (`manual`, `edited`, or `codex`)
- generating Codex profile when source is Codex
- currently active Codex profile

Actions:

- `send`
- `edit`
- `regenerate`
- `ignore`

Codex error card must contain:

- Q-ID
- marketplace
- original buyer question
- failed Codex profile
- error type/message
- currently active Codex profile

Actions:

- `retry_codex`
- `choose_codex`
- `manual`
- `ignore`

Send-failure/unknown cards must preserve Q-ID, marketplace, question, answer, and safe next actions.

Buyer/operator text is untrusted plain text. Do not allow buyer content to become Telegram formatting instructions.

If content exceeds a Telegram message limit, split deterministically into continuation messages. Do not silently truncate question/answer text. Every continuation retains Q-ID/context.

Callbacks carry only compact action/IDs. Never put buyer question or answer text into callback data.

Send callbacks remain bound to both question_id and answer_revision_id.

Unauthorized users must receive no buyer content, answer content, external marketplace IDs, or detailed operational errors.

---

## Complete edit workflow

From REVIEW, `edit`:

1. transition REVIEW -> EDITING
2. create Reply-linked prompt containing Q-ID, original question, and current answer
3. persist mode=`edit_answer` and based_on_revision_id=current revision

On Reply:

1. resolve the exact telegram_prompt_message_id
2. consume once
3. create NEW immutable answer revision source=`edited`
4. set based_on_revision_id to the prior revision
5. make new revision current
6. transition EDITING -> REVIEW
7. render updated review card

Never overwrite old revision text.

---

## Complete send retry/reconciliation orchestration

Use the existing marketplace adapters and repository send primitives.

Normal Send:

1. callback supplies question_id + answer_revision_id
2. call atomic claim_send
3. use the exact immutable text returned by the claim
4. dispatch to Ozon or Wildberries adapter based on stored marketplace

Outcomes:

- SUCCESS -> mark SENT and persist external reply/answer ID when available
- CLEAR_FAILURE -> mark SEND_FAILED and show explicit retry action
- AMBIGUOUS -> mark SEND_UNKNOWN and perform ONE reconciliation check; do not make a second write automatically

Reconcile:

- MATCHED -> mark SENT
- UNKNOWN -> remain SEND_UNKNOWN; no automatic write
- NOT_FOUND -> expose an explicit safe retry path; still do not write automatically

`retry_send` is always an explicit operator action.

For SEND_FAILED, explicit retry may perform a new write.

For SEND_UNKNOWN, explicit retry may perform a new write only after reconciliation has positively established NOT_FOUND or equivalent safe evidence.

Stale send callback -> zero marketplace writes.
Double send -> one marketplace write maximum.

Telegram Ignore remains local only. Never map Ignore to Wildberries `state="none"`.

---

## Polling concurrency and aggregation

Complete robust async polling behavior for both marketplaces.

Required behavior:

- Ozon and WB polls are independent
- failure in Ozon does not prevent WB poll/ingestion
- failure in WB does not prevent Ozon poll/ingestion
- same-marketplace poll cannot overlap itself
- second concurrent poll of the same marketplace is suppressed/no-op or shares the in-flight result; it must not issue a duplicate external fetch
- only `inserted=True` produces an initial Telegram card
- repeated marketplace question does not duplicate DB row, Q-ID, or initial Telegram card

Keep scheduler start dormant in tests.

---

## Codex runner integration

Integrate the existing local Codex CLI into the service, but tests use a fake runner/subprocess only.

Profiles:

- codex1 -> `/root/.codex`
- codex2 -> `/root/.codex_second`
- codex3 -> `/root/.codex_third`

Executable:

`/root/.nvm/versions/node/v22.22.1/bin/codex`

Every attempt captures the active profile at start and keeps it immutable.

Use `asyncio.create_subprocess_exec`, never `shell=True`.

Explicitly construct a child environment allowlist. Set at least:

- HOME=/root
- PATH
- CODEX_HOME=<captured profile>
- locale variables if required

Never pass these into the child environment:

- TELEGRAM_BOT_TOKEN
- OZON_CLIENT_ID
- OZON_API_KEY
- WB_API_TOKEN

Use a per-attempt job directory under the configured jobs directory.

Use the supported Codex exec shape for this server:

- `codex exec`
- `-C <job-dir>`
- `--json`
- `--ephemeral`
- workspace-write sandbox

Parse JSONL deterministically and extract the final draft answer.

Classify failures at least as:

- LIMIT
- AUTH
- TIMEOUT
- NONZERO_EXIT
- INVALID_OUTPUT
- PROCESS_ERROR

No real model request during tests.

---

## Composite prompt

There is ONE prompt-building path for every buyer question.

Do not implement:

- date regex router
- DATE_RECOMMENDATION / GENERAL modes
- application-level question classifier
- LLM pre-router
- programmatic semantic document selection

The application simply assembles one composite prompt from editable files plus runtime context.

Use the existing prompt files (`prompts/base.md`, `prompts/references.md`) and keep prompt text outside Python where practical.

Composite prompt includes:

- role/base instructions
- general answer rules
- reference/document instructions
- marketplace/product context
- Q-ID
- buyer question verbatim

Reference root remains configurable. Missing reference files in offline tests must not break the test suite; report them as pending integration rather than silently inventing content.

Buyer question is untrusted data, not application instructions.

---

## Telegram -> Codex workflow

When authorized operator presses `codex` on a NEW question:

1. capture current active Codex profile
2. create a new draft_attempt linked to the SAME question
3. set current_draft_attempt_id
4. transition NEW -> CODEX_RUNNING
5. acknowledge/update Telegram state
6. asynchronously run the Codex runner

Regenerate from REVIEW:

1. create a NEW attempt for the same question
2. capture active profile at regeneration time
3. REVIEW -> CODEX_RUNNING
4. do not destroy prior revisions/attempt history

On Codex success:

1. verify the completed attempt is still the current attempt for the question
2. mark attempt success and persist answer_text
3. create NEW immutable answer revision source=`codex`, linked to draft_attempt_id
4. set it current
5. CODEX_RUNNING -> REVIEW
6. render review card with SAME Q-ID and original buyer question
7. show both `generated by` profile and `current active` profile

Do not trust any question ID emitted by Codex output. Server-side draft_attempt.question_id is authoritative.

On Codex failure:

1. verify attempt is still current
2. mark attempt error
3. CODEX_RUNNING -> CODEX_ERROR
4. render error card with Q-ID/question/failed profile/error/current active profile

Changing active profile only changes the persisted global setting. It does NOT automatically retry a failed question.

`retry_codex` creates a NEW draft_attempt for the SAME question using the active profile at retry time.

Example required behavior:

- attempt #1: Q-000184, codex1 -> LIMIT
- operator switches active profile to codex2
- no generation occurs yet
- operator presses Retry
- attempt #2: same question_id / same Q-ID / codex2

Duplicate Codex taps while CODEX_RUNNING must not start another simultaneous attempt for that question.

---

## Commands

Complete command behavior:

`/questions`
- show nonterminal/open questions in operator-friendly form with Q-ID, marketplace, state, and enough context

`/codex`
- show active codex1/codex2/codex3
- allow manual switch
- switching alone performs zero generation

`/errors`
- show recent coalesced errors without secret values

`/status`
- DB availability
- active Codex profile
- open question count
- Ozon adapter availability
- WB adapter availability
- no secret values

---

## Behavioral tests

Use temporary SQLite, fake Telegram transport/update/context, fake marketplace adapters, and fake Codex runner/subprocess fixtures.

No public network.

Add coverage for at least:

### Telegram/operator
- unauthorized user receives no buyer content
- initial card includes Q-ID/marketplace/question
- manual Reply path works through handler/service layer
- two simultaneous Reply prompts cannot mix questions
- consumed Reply cannot be reused
- edit creates new immutable revision and preserves old revision
- long content is split without silent truncation
- malformed/stale callback performs zero marketplace writes

### Polling
- Ozon failure does not block WB ingestion
- WB failure does not block Ozon ingestion
- same-marketplace overlapping poll issues one external fetch maximum
- duplicate external question does not duplicate initial card

### Send/reconcile
- exact claimed revision text is sent
- stale revision -> zero writes
- double send -> one write maximum
- CLEAR_FAILURE -> SEND_FAILED
- explicit retry from SEND_FAILED -> one new write
- AMBIGUOUS -> one write + one reconcile only
- MATCHED -> SENT
- UNKNOWN -> remains SEND_UNKNOWN and zero second writes
- NOT_FOUND -> safe explicit retry path only
- local Ignore -> zero marketplace writes

### Codex
- active profile captured immutably into attempt
- child environment has explicit CODEX_HOME
- child environment contains none of the four service secrets
- JSONL fixture yields exact final draft
- success creates codex revision and REVIEW state
- failure creates CODEX_ERROR
- changing profile alone does not retry
- explicit retry uses new profile with same question/Q-ID
- duplicate tap while CODEX_RUNNING does not start second concurrent attempt
- no content/date router exists in application behavior

### Full fake E2E

Manual:
marketplace question -> poll -> Telegram -> Manual -> Reply -> REVIEW -> Send -> fake marketplace SUCCESS -> SENT

Codex:
marketplace question -> poll -> Telegram -> explicit Codex -> fake draft -> REVIEW -> Send -> fake marketplace SUCCESS -> SENT

Codex failure/retry:
marketplace question -> explicit Codex(codex1) -> fake LIMIT -> CODEX_ERROR -> switch active codex2 -> explicit Retry -> new attempt codex2 -> fake success -> REVIEW

Run focused tests as useful, then:

`.venv/bin/python -m pytest -q`

All existing tests must remain passing.

---

## Constraints

- no live Telegram requests
- no live Ozon requests
- no live Wildberries requests
- no real Codex model request
- no credentials requested or stored
- no systemd changes
- do not modify contents of `/root/.codex`, `/root/.codex_second`, `/root/.codex_third`
- do not touch unrelated server projects/services

## Finish

Inspect git status/diff, verify no secrets/auth material are tracked, and commit the completed work.

Commit message:

`feat: complete offline marketplace operator`

Return a concise report containing:

- START_HEAD
- FINAL_HEAD
- files changed
- Telegram completion summary
- polling/reconciliation summary
- Codex integration summary
- full test command/result/count
- any genuinely unresolved item

Expected result: after this commit, the application is OFFLINE-COMPLETE and the next stage is controlled credential installation + live read smoke testing.