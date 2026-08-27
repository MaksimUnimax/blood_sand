MARKETPLACE QUESTION OPERATOR — R6 CODEX GENERATION INTEGRATION

Project: /opt/marketplace-question-operator
Current HEAD: 5a7bc6480391d21632d753cefec572536a69bb5c

Continue implementation from the current codebase. This is a coding task, not an audit or scope assessment.

Make a brief internal plan, then immediately edit the code and keep iterating until the requested Codex-generation workflow is implemented and tests pass. Do not stop merely because the task is substantial. Task size/complexity by itself is not a blocker. Only stop without code changes for a concrete environment/tool failure; if that happens, report the exact failing command and exact error.

The existing codebase already provides the persistence/state layer, Ozon and Wildberries adapters, Telegram operator runtime, manual/edit/ignore workflows, polling, revision-bound send, retry/reconciliation, Codex profile settings, draft-attempt persistence, and Telegram reply correlation. Preserve and extend those implementations.

GOAL

Implement the complete OFFLINE Codex generation integration in one run:

1. one composite prompt builder/path for every buyer question
2. local Codex CLI runner with explicit profile selection
3. secure child-process environment and per-job work directory
4. deterministic JSONL final-answer extraction
5. Codex success/error state transitions and persistence
6. Telegram Send-to-Codex / Regenerate / Retry / profile-switch flow
7. fake end-to-end behavioral tests

No real Codex model request, Telegram network request, or marketplace network request is made in tests.

CODEX PROFILES

Use the existing persisted profile names and paths:

codex1 -> /root/.codex
codex2 -> /root/.codex_second
codex3 -> /root/.codex_third

Executable:

/root/.nvm/versions/node/v22.22.1/bin/codex

Every draft attempt captures the active profile at attempt creation time. Historical attempts keep that captured profile forever even if the global active profile later changes.

A profile switch changes only the persisted active_codex_profile. It does not automatically generate or retry anything.

LOCAL RUNNER

Implement/complete the production runner using asyncio.create_subprocess_exec. Do not use shell=True.

Run the installed Codex CLI with the server-supported exec flow, using explicit CODEX_HOME and per-attempt job directory. Use the valid argument form for codex-cli 0.149.1 already installed on the server, equivalent to:

codex exec
-C <job-directory>
--json
--ephemeral
with workspace-write sandbox configuration

Do not perform a real model invocation in tests. Tests inject a fake subprocess/runner or representative JSONL streams.

Use a per-attempt job directory under configured JOBS_DIR. The job directory should be unique per attempt and suitable for five-day cleanup by the existing retention layer.

CHILD ENVIRONMENT

Construct the child environment deliberately instead of blindly inheriting the service environment.

Set the required values explicitly, including:

HOME=/root
CODEX_HOME=<captured profile path>
PATH=<required executable path(s)>
locale variables only if needed

Do not pass these secrets into the Codex child environment:

TELEGRAM_BOT_TOKEN
TELEGRAM_OPERATOR_USER_ID
OZON_CLIENT_ID
OZON_API_KEY
WB_API_TOKEN

Do not log those values.

COMPOSITE PROMPT

There is exactly ONE application prompt-building path for every customer question explicitly sent to Codex.

Do not implement:

- regex/date router
- DATE_RECOMMENDATION vs GENERAL branches
- software semantic classifier
- application-level LLM pre-router
- content-based dispatch to different prompts

PromptBuilder should blindly assemble the configured prompt components and current question context.

Prefer editable local prompt files such as:

prompts/base.md
prompts/references.md
prompts/marketplace_context.md if useful

The composite prompt must include:

- role/base instructions
- general customer-answer rules
- reference-document instructions/local paths
- domain rules for using those references when relevant
- marketplace
- Q-ID
- product context when available
- buyer question verbatim

Buyer text is UNTRUSTED DATA. Make this clear inside the composite prompt: the buyer question is content to answer, not instructions controlling the service/runtime.

Missing optional recommendation/reference files in offline tests must not crash the service. The builder may clearly note unavailable optional references while still producing a valid prompt.

Do not return or trust a question ID from Codex. Server-side draft_attempt.question_id and the current attempt record are authoritative.

JSONL OUTPUT

Parse codex exec --json output deterministically.

Extract exactly the final assistant/draft answer from a representative Codex JSONL stream.

Do not concatenate debugging/reasoning/tool events into the customer draft.

Handle malformed/empty/incomplete JSONL safely.

Classify failures at minimum as:

LIMIT
AUTH
TIMEOUT
NONZERO_EXIT
INVALID_OUTPUT
PROCESS_ERROR

Keep error messages operator-useful but do not expose secrets.

SERVICE — START GENERATION

Wire the existing Telegram/service Codex action into the real runner abstraction.

For a NEW question when the authorized operator presses Send to Codex:

1. read current active Codex profile
2. create a new draft_attempt for the SAME question
3. captured codex_profile = active profile at that moment
4. set questions.current_draft_attempt_id to the new attempt
5. transition NEW -> CODEX_RUNNING using existing guarded state logic
6. acknowledge/update Telegram state
7. run the runner asynchronously for that attempt

For Regenerate from REVIEW:

1. preserve all old revisions and attempts
2. capture the active profile now
3. create a new draft_attempt for the SAME question
4. set it current
5. transition REVIEW -> CODEX_RUNNING
6. run generation asynchronously

Duplicate Codex taps while the same question is CODEX_RUNNING must not create another active attempt or second subprocess.

SUCCESS COMPLETION

When the runner returns a valid draft:

1. load/verify the attempt is still questions.current_draft_attempt_id
2. if it is stale, do not replace the current answer/revision
3. persist draft_attempt success + answer_text + finished_at
4. create NEW immutable answer_revision:
   source=codex
   draft_attempt_id=<attempt id>
   text=<exact parsed final draft>
5. set the new revision current
6. transition CODEX_RUNNING -> REVIEW
7. render/update Telegram review card for the SAME Q-ID

The review card must show:

Q-ID
marketplace
original buyer question
Codex draft
Generated by: <captured attempt profile>
Currently active: <current global profile>

Use the existing Send/Edit/Regenerate/Ignore controls.

Do not publish automatically. AI_DRAFT != PUBLISHED_REPLY.

FAILURE COMPLETION

When generation fails:

1. verify the attempt is still current
2. persist the attempt error + finished_at
3. transition CODEX_RUNNING -> CODEX_ERROR
4. render/update a Codex error card

Error card includes:

Q-ID
marketplace
original buyer question
failed profile
error type/message
currently active profile

Actions:

Retry
Change Codex
Answer manually
Ignore

PROFILE SWITCH + RETRY

Required behavior:

Attempt #1
Q-000184
profile codex1
-> LIMIT
-> CODEX_ERROR

Operator changes active profile to codex2.

That change performs ZERO generation and creates ZERO new draft attempts.

Operator then presses Retry.

Retry:

- uses the SAME question_id / SAME Q-ID
- creates attempt #2
- captures codex2
- transitions CODEX_ERROR -> CODEX_RUNNING
- runs the new attempt

On success it creates a new Codex answer revision and returns to REVIEW.

The failed attempt #1 remains historical and still says codex1.

MANUAL FALLBACK FROM CODEX ERROR

From CODEX_ERROR, Answer manually should reuse the existing Reply-correlation/manual workflow for the same question and create a manual revision rather than recreating the question.

IGNORE from CODEX_ERROR remains local only.

TELEGRAM CALLBACKS

Wire the existing callback actions for:

codex
regenerate
retry_codex
choose_codex

Use IDs only in callback_data. Do not put prompt text/question text/draft text in callback_data.

Malformed/stale callbacks must fail safely and must not start a subprocess.

FAKE BEHAVIORAL TESTS

Use temp SQLite, fake Telegram transport/handler objects, and fake runner/subprocess fixtures. No public network and no real model invocation.

Cover at minimum:

1. Prompt builder produces one composite prompt path for ordinary and date-looking questions; no software content router is invoked.
2. Composite prompt contains Q-ID, marketplace, product context and buyer question verbatim.
3. Buyer question is clearly delimited/treated as untrusted data.
4. Active profile is captured immutably in draft_attempt.
5. Changing global profile does not mutate an old attempt.
6. Runner command uses explicit captured CODEX_HOME.
7. Runner uses asyncio subprocess API without shell=True.
8. Child environment excludes TELEGRAM_BOT_TOKEN, TELEGRAM_OPERATOR_USER_ID, OZON_CLIENT_ID, OZON_API_KEY, WB_API_TOKEN.
9. Representative valid JSONL yields the exact final assistant draft only.
10. Empty/malformed JSONL -> INVALID_OUTPUT.
11. Timeout -> TIMEOUT.
12. non-zero exit -> NONZERO_EXIT unless a stronger recognized classification such as LIMIT/AUTH is detected.
13. NEW -> explicit Codex -> CODEX_RUNNING creates one attempt.
14. Duplicate Codex tap while CODEX_RUNNING creates no second attempt/subprocess.
15. Successful current attempt creates immutable source=codex revision and REVIEW.
16. A stale old attempt result cannot overwrite a newer current attempt/revision.
17. Generation failure -> CODEX_ERROR with persisted error.
18. Profile switch alone performs zero generation.
19. Explicit Retry from CODEX_ERROR uses the newly active profile and same question/Q-ID.
20. Manual fallback from CODEX_ERROR enters the existing manual Reply workflow.
21. Codex success review card displays generated-by and currently-active separately.
22. No Codex success path calls marketplace send automatically.

FULL FAKE E2E

Add at least these real-service fake flows:

A. Codex success:
marketplace question
-> poll/ingest
-> Telegram initial card
-> authorized operator presses Send to Codex
-> attempt captures codex1
-> fake runner returns valid JSONL draft
-> CODEX_RUNNING -> REVIEW
-> immutable codex revision current
-> Telegram review card
-> operator presses Send
-> existing fake marketplace adapter SUCCESS
-> SENT

B. Codex failure/profile retry:
marketplace question
-> operator Send to Codex with codex1
-> fake LIMIT
-> CODEX_ERROR
-> operator switches active profile to codex2
-> no automatic retry
-> explicit Retry
-> attempt #2 captures codex2
-> fake success
-> REVIEW

C. Stale attempt race:
attempt #1 becomes obsolete/current attempt changes
-> late result from attempt #1
-> no revision/state overwrite

VALIDATION

Run focused tests while implementing, then run the complete suite:

.venv/bin/python -m pytest -q

All existing tests must stay green.

No live Telegram requests.
No live Ozon requests.
No live Wildberries requests.
No real Codex model request.
No credentials requested or stored.
No systemd changes.
Do not modify the contents of /root/.codex, /root/.codex_second, or /root/.codex_third.
Do not touch unrelated projects/services.

FINISH

Inspect git status and git diff --stat. Verify no secrets/auth material are tracked.

Commit:

feat: integrate Codex generation workflow

Return a concise implementation summary containing START_HEAD, FINAL_HEAD, files changed, major implemented areas, test command/result/count, and any genuinely remaining work before controlled credential/live-read setup.
