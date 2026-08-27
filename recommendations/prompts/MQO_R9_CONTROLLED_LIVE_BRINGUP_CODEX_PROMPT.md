MARKETPLACE QUESTION OPERATOR — R9 CONTROLLED LIVE BRING-UP

Project: /opt/marketplace-question-operator
Current HEAD: 0bcb5fd78ae7eba9acfbdeb0a4df79067963c04a

Continue from the current codebase. This is a live bring-up task, not an implementation audit.

The offline runtime, daemon entry point, configuration loader, polling/retention loops, systemd unit, secret installer and deployment helpers already exist and the full suite passes. Use those existing paths. Do not redesign the service.

Goal for this run:
- install the five production secrets interactively without exposing them;
- run controlled Telegram/Ozon/Wildberries authentication + read smoke checks through the existing production code;
- install/enable/start the daemon;
- verify the service is healthy and polling;
- do NOT publish any marketplace answer and do NOT run a real Codex generation.

Start with a short preflight:
- verify HEAD is exactly 0bcb5fd78ae7eba9acfbdeb0a4df79067963c04a;
- verify working tree is clean;
- run `.venv/bin/python -m pytest -q` and continue only if it remains green;
- run the existing offline doctor/selftest if present;
- do not modify unrelated services or projects.

Then use the project’s existing secret installer/helper. Do not replace it with ad-hoc shell commands unless the helper itself is broken.

The production secret file is:
/etc/marketplace-question-operator/secrets.env

Required values:
TELEGRAM_BOT_TOKEN
TELEGRAM_OPERATOR_USER_ID
WB_API_TOKEN
OZON_CLIENT_ID
OZON_API_KEY

At this point PAUSE and ask the operator to enter those five values directly in the server terminal. Do not ask for them in chat. Do not echo them back. Do not print the completed file. After input, verify only ownership/mode and presence of the five variable names, never their values. Expected permission is root-owned mode 0600 or stricter.

After the operator finishes input, continue the same run.

Run controlled live smoke checks using the existing application configuration/adapters. No marketplace write endpoints are allowed in this run.

Telegram smoke:
- authenticate the configured bot with a safe Bot API identity/read call such as getMe through the existing integration or a minimal safe helper;
- verify the configured operator user id parses correctly;
- do not expose the bot token;
- do not send arbitrary messages unless the existing smoke helper already has an explicit safe operator-only test mode.

Ozon smoke:
- use the existing Ozon adapter read path for unanswered questions;
- this may use Ozon’s read-semantic POST `/v1/question/list`;
- verify authentication/permission and successful parsing/normalization;
- record only non-secret status/count/shape information;
- never call `/v1/question/answer/create`.

If the Ozon Question API is unavailable because of account plan/permission, record the exact HTTP/status condition and continue with WB and Telegram. Do not add browser automation or substitute another integration.

Wildberries smoke:
- use the existing WB adapter unanswered-question read path;
- verify authentication/permission and successful parsing/normalization;
- record only non-secret status/count/shape information;
- never PATCH `/api/v1/questions` in this run.

If a live smoke reveals a real adapter/config defect, fix that concrete defect in the project, add a regression test, rerun the full suite, commit it, and then resume the smoke. Do not broaden scope beyond the failing live path.

Once Telegram authentication and at least the available marketplace read paths are safe enough to run, install the existing deployment artifacts using the project’s deployment helper/systemd unit.

Expected service:
marketplace-question-operator.service

Expected paths:
/opt/marketplace-question-operator
/var/lib/marketplace-question-operator/state.sqlite3
/var/lib/marketplace-question-operator/jobs
/etc/marketplace-question-operator/secrets.env

Install/enable/start the service. Then verify:
- `systemctl is-active marketplace-question-operator.service` is active;
- no restart loop / stable NRestarts during a short observation window;
- expected process/working directory are correct;
- SQLite database opens successfully;
- polling tasks for Ozon and WB start;
- one marketplace poll failure does not stop the daemon or the other marketplace;
- retention loop starts;
- Telegram polling/handler runtime starts;
- journal contains no secret values;
- no marketplace answer write occurred;
- no real Codex generation occurred.

Do not touch:
- /opt/autopostmanager or its services/databases;
- /opt/ai-starter-community;
- /opt/opendesign-lab;
- /opt/business-bridge-2;
- /opt/business-bridge-80;
- existing Codex auth directories under /root/.codex*;
- nginx, Docker, PostgreSQL, control-panel/network configuration.

Do not rotate or combine marketplace credentials in this run.

After startup, inspect the service journal for startup/polling errors. If there is a concrete startup defect in this project, fix it, test it, commit it, and redeploy the service. Do not stop at the first fix; continue until the daemon is stably running or a specific external API/account condition prevents only that integration.

Do not perform a real marketplace answer acceptance test yet. Publishing remains a later explicit operator-controlled acceptance step.

At the end return a concise report with:
START_HEAD
FINAL_HEAD
COMMITS_CREATED (if any)
TEST_RESULT / TEST_COUNT
SECRETS_INSTALLED=yes/no (never values)
TELEGRAM_SMOKE=PASS/FAIL + non-secret reason
OZON_READ_SMOKE=PASS/FAIL/ACCOUNT_PERMISSION_BLOCKED + non-secret reason
WB_READ_SMOKE=PASS/FAIL + non-secret reason
SERVICE_ACTIVE=yes/no
SERVICE_NRESTARTS
POLLING_RUNTIME=PASS/FAIL
MARKETPLACE_WRITES_PERFORMED=0
REAL_CODEX_GENERATIONS=0
REMAINING_BEFORE_FIRST_EXPLICIT_SEND_ACCEPTANCE

Do the live bring-up work. Do not replace it with a readiness checklist.