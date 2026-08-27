MARKETPLACE QUESTION OPERATOR — R7 PRODUCTION BRING-UP

Project: /opt/marketplace-question-operator
Current HEAD: 351814a7bc81749236e88cc061360346fc9567ed

Continue implementation from the current codebase. This is a coding-and-bring-up task, not an audit.

Work through the full remaining production path in this session. Do not stop after one small subtask. Make code changes, run tests, continue to the next connected part, and only pause when you genuinely need the operator to enter secrets in the terminal.

The current code already has the marketplace adapters, persistence/state machine, Telegram operator basics, manual/edit/send flows, Codex prompt builder, Codex attempt lifecycle, JSONL extraction, job directories, and secret-free child environment. Preserve that work.

The goal of this run is to take the service from the current partially integrated state to a deployable production candidate and then perform controlled live-read smoke checks.

1. Finish the remaining Codex runtime integration.

Implement the missing connected pieces in the production service and Telegram layer:
- stale-attempt completion protection for both success and failure;
- subprocess timeout handling and behavioral fake coverage;
- Telegram callbacks for codex, regenerate, retry_codex, choose_codex;
- Codex success review card;
- Codex error card;
- explicit profile switch with zero automatic generation;
- explicit retry using the newly active profile and the same question/Q-ID;
- duplicate Codex tap protection while CODEX_RUNNING;
- manual fallback from CODEX_ERROR through the existing Reply-correlation path.

A stale Codex attempt must never create a revision, replace the current revision, replace the current attempt, or move question state.

2. Finish the Telegram operator presentation/runtime gaps that are still incomplete.

Make the production bot render complete operator cards and buttons for:
- NEW question;
- MANUAL_INPUT / EDITING prompts;
- REVIEW;
- CODEX_RUNNING;
- CODEX_ERROR;
- SEND_FAILED;
- SEND_UNKNOWN;
- SENT.

Every important card retains Q-ID, marketplace, original buyer question, and relevant answer/draft state. Keep buyer content plain/untrusted. Split long content instead of silently truncating it.

Only TELEGRAM_OPERATOR_USER_ID may see or operate on question data.

3. Complete polling/runtime coordination.

Ensure production polling supports Ozon and Wildberries independently at the configured 600-second cadence, with no overlap for the same marketplace. One marketplace failing must not stop the other. Duplicate external questions must not duplicate DB rows, public IDs, or Telegram cards.

4. Build the actual application entry point and production configuration loading.

Create or complete the runnable daemon entry point that wires:
- SQLite repository;
- Ozon adapter;
- Wildberries adapter;
- Telegram bot/application;
- service/orchestrator;
- Codex runner;
- polling loop;
- retention cleanup.

Use the frozen paths:

/opt/marketplace-question-operator
/var/lib/marketplace-question-operator/state.sqlite3
/var/lib/marketplace-question-operator/jobs
/etc/marketplace-question-operator/secrets.env

The application must fail clearly on missing required configuration and must never print secret values.

5. Add deployment/install scripts and systemd unit.

Create a minimal production deployment setup for one Python daemon managed by systemd. Do not introduce microservices.

The service must use the project virtualenv and the configured state/jobs paths. Add restart-on-failure behavior and bounded logging appropriate for the existing server.

Do not modify unrelated nginx, Docker, PostgreSQL, APM, OpenDesign, Business Bridge, AI Starter, or any other existing service.

6. Add an interactive secrets installer, then PAUSE for operator input.

Create a safe installer/helper that writes exactly these fields to:

/etc/marketplace-question-operator/secrets.env

TELEGRAM_BOT_TOKEN
TELEGRAM_OPERATOR_USER_ID
WB_API_TOKEN
OZON_CLIENT_ID
OZON_API_KEY

Use secure permissions (root-owned, mode 600 or stricter). Do not echo secret values back after entry and do not commit the secrets file.

Once all code/tests/deployment files are ready and committed, run the installer interactively. At that point pause and ask the operator to enter the five values directly in the terminal. Do not ask them to paste secrets into chat.

After the operator finishes entering them, continue the same task.

7. Controlled live smoke checks after secrets are installed.

Perform LIVE READ/IDENTITY checks only. Do not publish marketplace answers in this stage.

Telegram:
- verify bot authentication with a safe Bot API identity call;
- send one test message to TELEGRAM_OPERATOR_USER_ID confirming the service is connected.

Ozon:
- perform the unanswered-question READ path only;
- verify authentication/permission and normalized response shape;
- do not call answer/create.

Wildberries:
- perform the unanswered-question READ path only;
- verify authentication/permission and normalized response shape;
- do not PATCH an answer.

If Ozon question API access is blocked by plan/permission, record the exact structured condition and continue testing WB/Telegram. Do not substitute browser automation.

8. Start the daemon only after live-read checks succeed enough to run safely.

Initialize/create the production database, enable/start the systemd service, and verify:
- service is active;
- database opens;
- polling loop starts;
- Telegram command handling is alive;
- no startup secret leakage;
- no unexpected marketplace write occurred.

Do not perform a real marketplace answer write yet. Production marketplace writes remain operator-triggered and should be tested in a later explicit send acceptance step.

9. Behavioral validation before live bring-up.

Before asking for secrets, add/run tests covering the remaining implementation, including at least:
- stale Codex success cannot overwrite current attempt;
- stale Codex failure cannot move current state;
- timeout -> TIMEOUT;
- duplicate Codex action while CODEX_RUNNING creates one attempt/run maximum;
- profile switch alone creates zero generation attempts;
- retry after profile switch uses the new profile and same question/Q-ID;
- success/error Telegram cards contain the expected correlation data;
- unauthorized Telegram user receives no buyer content;
- same-marketplace poll overlap is suppressed;
- application configuration rejects missing required values without revealing any provided secret;
- secrets.env is not tracked by git.

Run:

.venv/bin/python -m pytest -q

Keep all existing tests green.

10. Git workflow.

You may make more than one logical commit during this run if useful, but do not stop after the first commit. Continue through implementation, tests, deployment preparation, secret-input pause, live-read smoke, and service startup unless a concrete environment/API error prevents further progress.

Suggested commit messages:
- feat: finish Codex and Telegram runtime
- feat: add production daemon deployment
- chore: add controlled live smoke tooling

Do not commit secrets or auth material.

At the end, return a concise report with:
- START_HEAD and FINAL_HEAD;
- commits created;
- files changed;
- full test result/count;
- Telegram live smoke result;
- Ozon live READ result;
- Wildberries live READ result;
- systemd service status;
- any exact remaining blocker before first explicit marketplace-send acceptance test.

Do the implementation first. Do not replace the requested work with a scope assessment or a checklist of what is missing.