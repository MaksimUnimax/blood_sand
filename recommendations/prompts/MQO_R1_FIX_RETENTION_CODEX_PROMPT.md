# Marketplace Question Operator — R1 Fix: Retention Completion

Project: `/opt/marketplace-question-operator`

Expected start HEAD: `91db5c3d1bf6cab580ac6a1a67e66a9b5ea065d1`

This is a corrective coding task. The previous R1 report incorrectly declared PASS while `RETENTION=NOT IMPLEMENTED`, which violated its own acceptance contract. Do not re-audit the project. Implement only the missing retention contract, add behavioral tests, run the full suite, and commit.

## Task

Implement five-day technical retention in production code.

Default retention: `TECHNICAL_RETENTION_DAYS=5`.

Delete only safe technical rows older than the cutoff:

- completed/failed draft attempts that are not the question's `current_draft_attempt_id`;
- answer revisions that are not the question's `current_answer_revision_id`;
- expired Telegram input rows;
- recent errors older than retention.

Never delete:

- `questions` rows used for deduplication;
- marketplace external question IDs;
- public Q-IDs;
- current answer revision;
- current draft attempt;
- unsent REVIEW answer;
- SEND_UNKNOWN question/state data;
- SENT identity;
- external reply ID.

Boundary behavior:

- age `4 days 23 hours` => keep;
- age strictly older than `5 days` => delete if safe;
- a current/referenced revision or attempt remains even if older than five days.

Use actual SQLite queries/transactions through the existing repository/maintenance layer. Do not implement an in-memory-only fake.

## Behavioral tests

Add real tests against temp SQLite DB:

1. `test_retention_keeps_4d23h_rows`
2. `test_retention_removes_safe_rows_older_than_5_days`
3. `test_retention_preserves_current_revision`
4. `test_retention_preserves_current_draft_attempt`
5. `test_retention_preserves_question_identity_and_sent_metadata`
6. `test_retention_preserves_send_unknown`
7. `test_retention_removes_expired_telegram_inputs`
8. `test_retention_removes_old_recent_errors`

Run targeted retention tests, then full suite:

`.venv/bin/python -m pytest -q`

No network, no Telegram, no marketplace API, no real Codex, no credentials.

Before report:

- `git status --short`
- `git diff --stat`
- verify no secrets/auth files are staged.

Commit:

`fix: implement five day technical retention`

PASS requires `FINAL_HEAD != START_HEAD`, real code changes, behavioral retention tests, and a clean working tree after commit.

## Final report

Return:

`MQO_R1_FIX_REPORT`

- `START_HEAD=`
- `FINAL_HEAD=`
- `FILES_CHANGED=`
- `RETENTION=IMPLEMENTED`
- `TEST_COMMAND=`
- `TEST_RESULT=`
- `TEST_COUNT=`
- `BEHAVIOR_EVIDENCE=`
- `GIT_STATUS=`
- `NETWORK_CALLS=0`
- `SECRETS_TOUCHED=none`
- `UNRELATED_SERVICES_MODIFIED=none`
- `FINAL_STATUS=MQO_R1_FIX_PASS`

PASS is forbidden if retention is not actually implemented or if `FINAL_HEAD == START_HEAD`.