# Codex Prompt — Marketplace Question Operator A3

Use this prompt verbatim for the server Codex implementation session.

```text
You are implementing A3 of a pre-designed service.

IMPORTANT ROLE BOUNDARY

You are the implementation engineer, not the product architect.
Do not redesign the workflow, database model, Telegram UX, marketplace API semantics, Codex profile model, or security model.
Do not add alternative frameworks/infrastructure because you prefer them.
If a specification detail is genuinely impossible to implement, stop and report the exact blocker instead of silently changing architecture.

PROJECT

Marketplace Question Operator

Target path:
/opt/marketplace-question-operator

This is a standalone project. Do NOT clone or modify unrelated repositories/projects.

DO NOT TOUCH:
- /opt/autopostmanager
- /opt/autopostmanager_runtime
- /opt/ai-starter-community
- /opt/ai-starter-community-worktrees
- /opt/opendesign-lab
- /opt/business-bridge-2
- /opt/business-bridge-80
- existing nginx configuration
- existing systemd services
- existing Codex auth directories

A3 IS LOCAL CORE ONLY.

NO Ozon API calls.
NO Wildberries API calls.
NO Telegram network calls.
NO Codex subprocess calls.
NO secrets required.
NO production systemd unit yet.
NO marketplace writes.

==================================================
ARCHITECTURE AUTHORITY
==================================================

Implement exactly this V1 model.

The product flow later will be:

marketplace question
-> SQLite
-> Telegram operator FIRST
-> operator chooses manual answer / send to Codex / ignore
-> answer review
-> explicit Send only
-> marketplace API

There is no automatic marketplace -> Codex path.

Every question has:
- internal integer DB id
- public ID Q-%06d
- marketplace external question id

Correlation invariant:
answer/draft/send always belongs to the exact question id.

==================================================
LANGUAGE / INFRASTRUCTURE
==================================================

Python 3.12.

For A3 use standard library only where practical.
Do not add PostgreSQL, Redis, Celery, Docker, SQLAlchemy or another ORM.
Use sqlite3 directly.

Tests must run without internet and without credentials.
Prefer unittest from stdlib for A3 so no dependency installation is required.

Initialize a local Git repository at /opt/marketplace-question-operator if it does not already exist.
Do not configure/push a remote in A3.

==================================================
TARGET PROJECT SHAPE
==================================================

Create at minimum:

/opt/marketplace-question-operator/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models.py
│   ├── state_machine.py
│   ├── db.py
│   ├── repositories.py
│   ├── marketplaces/
│   │   └── __init__.py
│   ├── telegram/
│   │   └── __init__.py
│   └── codex/
│       └── __init__.py
├── scripts/
│   └── a3_selftest.py
├── tests/
│   ├── __init__.py
│   ├── test_database.py
│   ├── test_state_machine.py
│   └── test_repository_flows.py
├── pyproject.toml
├── README.md
└── .gitignore

Exact split between db.py/repositories.py may be adjusted only for code clarity; responsibilities and contracts below are mandatory.

Do NOT implement network adapters in A3.

==================================================
PATH DEFAULTS
==================================================

Production defaults later:

PROJECT_DIR=/opt/marketplace-question-operator
STATE_DIR=/var/lib/marketplace-question-operator
DB_PATH=/var/lib/marketplace-question-operator/state.sqlite3
JOBS_DIR=/var/lib/marketplace-question-operator/jobs
SECRETS_PATH=/etc/marketplace-question-operator/secrets.env

Tests MUST override DB/state paths to temporary directories.
A3 tests must never create/modify /etc secrets.

==================================================
QUESTION STATES
==================================================

Canonical states exactly:

NEW
MANUAL_INPUT
CODEX_RUNNING
CODEX_ERROR
REVIEW
EDITING
IGNORED
SENDING
SENT
SEND_FAILED
SEND_UNKNOWN

Allowed transitions:

NEW -> MANUAL_INPUT
NEW -> CODEX_RUNNING
NEW -> IGNORED

MANUAL_INPUT -> REVIEW
MANUAL_INPUT -> IGNORED
MANUAL_INPUT -> NEW

CODEX_RUNNING -> REVIEW
CODEX_RUNNING -> CODEX_ERROR

CODEX_ERROR -> CODEX_RUNNING
CODEX_ERROR -> MANUAL_INPUT
CODEX_ERROR -> IGNORED

REVIEW -> EDITING
REVIEW -> CODEX_RUNNING
REVIEW -> SENDING
REVIEW -> IGNORED

EDITING -> REVIEW
EDITING -> IGNORED

SENDING -> SENT
SENDING -> SEND_FAILED
SENDING -> SEND_UNKNOWN

SEND_FAILED -> SENDING
SEND_FAILED -> REVIEW
SEND_FAILED -> IGNORED

SEND_UNKNOWN -> SENT
SEND_UNKNOWN -> SENDING
SEND_UNKNOWN -> REVIEW

SENT and IGNORED are terminal for V1.

Create one central transition validator/guard.
No caller may force arbitrary state strings.

==================================================
SQLITE
==================================================

Enable:
- foreign_keys=ON
- WAL mode when supported
- reasonable busy_timeout

Use a schema version mechanism, e.g. PRAGMA user_version = 1.

Create these tables.

questions:

id INTEGER PRIMARY KEY AUTOINCREMENT
public_id TEXT UNIQUE
marketplace TEXT NOT NULL CHECK marketplace in ozon,wildberries
external_question_id TEXT NOT NULL
product_id TEXT NULL
product_article TEXT NULL
product_title TEXT NULL
question_text TEXT NOT NULL
question_created_at TEXT NULL
raw_status TEXT NULL
status TEXT NOT NULL
current_answer_revision_id INTEGER NULL
current_draft_attempt_id INTEGER NULL
telegram_question_message_id INTEGER NULL
telegram_current_message_id INTEGER NULL
external_reply_id TEXT NULL
created_at TEXT NOT NULL
updated_at TEXT NOT NULL
sent_at TEXT NULL
UNIQUE(marketplace, external_question_id)

answer_revisions:

id INTEGER PRIMARY KEY AUTOINCREMENT
question_id INTEGER NOT NULL
source TEXT NOT NULL CHECK source in manual,codex,edited
text TEXT NOT NULL
draft_attempt_id INTEGER NULL
based_on_revision_id INTEGER NULL
created_at TEXT NOT NULL
FK question_id -> questions.id

draft_attempts:

id INTEGER PRIMARY KEY AUTOINCREMENT
question_id INTEGER NOT NULL
codex_profile TEXT NOT NULL CHECK codex1,codex2,codex3
status TEXT NOT NULL
answer_text TEXT NULL
error_type TEXT NULL
error_message TEXT NULL
started_at TEXT NOT NULL
finished_at TEXT NULL
FK question_id -> questions.id

telegram_inputs:

telegram_prompt_message_id INTEGER PRIMARY KEY
question_id INTEGER NOT NULL
mode TEXT NOT NULL CHECK manual_answer,edit_answer
based_on_revision_id INTEGER NULL
created_at TEXT NOT NULL
expires_at TEXT NULL
FK question_id -> questions.id

settings:

key TEXT PRIMARY KEY
value TEXT NOT NULL
updated_at TEXT NOT NULL

Seed:
active_codex_profile=codex1

recent_errors:

id INTEGER PRIMARY KEY AUTOINCREMENT
component TEXT NOT NULL
error_type TEXT NOT NULL
message TEXT NOT NULL
question_id INTEGER NULL
fingerprint TEXT NULL
first_seen_at TEXT NOT NULL
last_seen_at TEXT NOT NULL
occurrence_count INTEGER NOT NULL DEFAULT 1
telegram_notified_at TEXT NULL

Create useful indexes where justified, especially status/current work and draft_attempt question lookup.
Do not over-index.

==================================================
PUBLIC Q-ID
==================================================

After allocating integer question id, public ID must be:

Q-%06d

Examples:
1 -> Q-000001
184 -> Q-000184

It must be stable.

==================================================
REPOSITORY/API CONTRACTS TO IMPLEMENT
==================================================

Names may vary slightly, behavior may not.

1. initialize_database(path)

Creates/migrates schema deterministically.
Safe to call repeatedly.

2. upsert_discovered_question(...)

Input includes:
marketplace
external_question_id
question_text
optional product/status/timestamps

Behavior:
- first discovery inserts one row in NEW
- assign public_id
- returns inserted=True + question
- repeated (marketplace, external_question_id) returns existing row inserted=False
- repeat MUST NOT reset state, current answer or Telegram ids

3. get_question(question_id)
4. get_question_by_public_id(public_id)
5. list_actionable_questions(limit)

Actionable should exclude at minimum SENT and IGNORED.

6. transition_question(question_id, expected_state, target_state, mutation fields)

Must use a transaction/conditional expected-state update.
Return a typed stale-state error/result if state no longer matches.

7. create_manual_revision(question_id, text)

Only valid from MANUAL_INPUT.
Create answer revision source=manual,
set it current,
transition to REVIEW atomically.

8. create_edit_revision(question_id, based_on_revision_id, text)

Only valid from EDITING.
Require expected base/current revision relationship.
Create source=edited,
set current,
return REVIEW atomically.

9. create_telegram_input(prompt_message_id, question_id, mode, based_on_revision_id=None)
10. resolve_telegram_input(prompt_message_id)
11. consume_telegram_input(prompt_message_id)

Must allow multiple simultaneous question inputs without a global single editing_question_id.

12. get_active_codex_profile()
13. set_active_codex_profile(profile)

Only codex1/codex2/codex3 accepted.

14. claim_codex_generation(question_id)

Allowed source states:
NEW
REVIEW
CODEX_ERROR

Behavior atomically/logically:
- capture current active profile
- create draft_attempt status RUNNING (or equivalent internal attempt status)
- set questions.current_draft_attempt_id
- transition question -> CODEX_RUNNING
- return question + attempt + captured profile

Duplicate claim while CODEX_RUNNING must fail stale/invalid state without creating a second active attempt.

15. complete_codex_success(question_id, attempt_id, answer_text)

Require that attempt_id is still question.current_draft_attempt_id and question state CODEX_RUNNING.
- mark attempt SUCCESS
- store answer_text in attempt
- create answer_revision source=codex pointing to attempt
- set current revision
- question -> REVIEW

16. complete_codex_error(question_id, attempt_id, error_type, sanitized_error_message)

Require current attempt/state.
- mark attempt ERROR
- question -> CODEX_ERROR
- do not delete question

17. claim_send(question_id, answer_revision_id)

CRITICAL.
Require:
- question.status == REVIEW
- question.current_answer_revision_id == answer_revision_id

Load exact revision text.
Transition to SENDING atomically.
Return immutable send payload.

A stale revision must be rejected, never substituted with latest text.

18. mark_send_success(question_id, external_reply_id=None)
SENDING -> SENT, set sent_at/external_reply_id

19. mark_send_failed(question_id, error info as appropriate)
SENDING -> SEND_FAILED

20. mark_send_unknown(question_id)
SENDING -> SEND_UNKNOWN

21. ignore_question(question_id, expected allowed state)
Must transition to IGNORED with state guard.
No external work.

22. upsert_recent_error(...)
Coalesce by fingerprint where supplied and increment occurrence_count/update last_seen_at.

==================================================
TRANSACTION RULES
==================================================

Use short SQLite transactions.
No simulated network/Codex long task inside a write transaction.

State claim happens in DB first, then future external work occurs outside transaction.

Use BEGIN IMMEDIATE or equivalent only where needed for state claims.

==================================================
TYPED MODELS / ERRORS
==================================================

Use simple dataclasses/enums where useful.

Provide explicit errors/results for at least:
- InvalidTransition
- StaleState
- QuestionNotFound
- RevisionNotFound
- StaleAnswerRevision
- InvalidCodexProfile

Do not expose raw sqlite exceptions as the normal domain API.

==================================================
A3 TESTS — MANDATORY
==================================================

Tests run against temporary SQLite DB(s).

Must prove at minimum:

1 PUBLIC_QID_STABLE_PASS
- Q formatting exact.

2 QUESTION_DEDUP_UNIQUE_PASS
- same marketplace+external id inserts once.
- repeat does not reset changed status.

3 STATE_TRANSITION_GUARD_PASS
- allowed transition works.
- illegal transition rejects.
- stale expected state rejects.

4 TELEGRAM_REPLY_INPUT_CORRELATION_PASS
- two prompt message ids can point to two different questions simultaneously.
- lookup resolves correct question/mode.

5 MANUAL_REVISION_REVIEW_PASS
- MANUAL_INPUT -> manual revision -> REVIEW.

6 EDIT_REVISION_REVIEW_PASS
- edit creates new revision and preserves base relation.

7 CODEX_PROFILE_SETTING_PASS
- default codex1.
- codex2/codex3 switch.
- invalid profile rejected.

8 CODEX_GENERATION_CLAIM_PASS
- captures active profile into attempt.
- question becomes CODEX_RUNNING.
- second claim while running rejected.

9 CODEX_SUCCESS_CORRELATION_PASS
- success only accepted for current question attempt.
- creates codex answer revision linked to same question.

10 CODEX_ERROR_RETRY_SAME_QID_PASS
- error retains same question/public id.
- switching active profile then new claim creates a new attempt for same question with new profile.

11 ANSWER_REVISION_STALE_BUTTON_REJECT_PASS
- revision A current then revision B becomes current.
- claim_send(question, revision A) rejects.
- claim_send(question, revision B) succeeds and returns exact B text.

12 SEND_DOUBLE_TAP_PASS
- first send claim -> SENDING.
- second same send claim rejected; cannot double claim.

13 SEND_RESULT_TRANSITIONS_PASS
- success -> SENT.
- failure -> SEND_FAILED.
- unknown -> SEND_UNKNOWN.

14 IGNORE_LOCAL_STATE_PASS
- supported state -> IGNORED.
- no external/network functionality exists in A3.

15 DATABASE_REOPEN_PASS
- initialize, write state, close/reopen, data persists and schema init is idempotent.

==================================================
SELFTEST
==================================================

scripts/a3_selftest.py must:
- create a temporary DB
- exercise one representative question flow
- print concise marker lines
- exit nonzero on failure
- leave no persistent temp state

Expected final marker:

MARKETPLACE_QUESTION_OPERATOR_A3_SELFTEST_PASS

==================================================
README
==================================================

Document:
- this is A3 local core only
- no credentials needed
- how to run tests
- how to run selftest
- next stage is adapters/UI, not implemented yet

Do not claim the service is live.

==================================================
GIT
==================================================

Before changes:
- if target does not exist, create it
- initialize local git repository
- choose branch main

At end:
- ensure no secrets/auth files are present
- ensure .gitignore covers .env, secrets, runtime DB, jobs, __pycache__, virtualenvs, logs
- run tests
- run selftest
- git status
- commit all A3 files locally with message:

feat: implement marketplace question operator A3 core

Do not configure/push any remote.

==================================================
FINAL REPORT
==================================================

Return exactly a concise report in this shape:

MARKETPLACE_QUESTION_OPERATOR_A3_REPORT

PATH=
PYTHON_VERSION=
GIT_BRANCH=
GIT_COMMIT=
FILE_COUNT=
SCHEMA_VERSION=
DEFAULT_CODEX_PROFILE=
TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=
SELFTEST_COMMAND=
SELFTEST_RESULT=
NETWORK_CALLS_PERFORMED=0
CREDENTIALS_USED=0
SECRETS_CREATED=0
UNRELATED_PROJECTS_MODIFIED=0
GIT_STATUS=

MARKERS=
PUBLIC_QID_STABLE_PASS
QUESTION_DEDUP_UNIQUE_PASS
STATE_TRANSITION_GUARD_PASS
TELEGRAM_REPLY_INPUT_CORRELATION_PASS
MANUAL_REVISION_REVIEW_PASS
EDIT_REVISION_REVIEW_PASS
CODEX_PROFILE_SETTING_PASS
CODEX_GENERATION_CLAIM_PASS
CODEX_SUCCESS_CORRELATION_PASS
CODEX_ERROR_RETRY_SAME_QID_PASS
ANSWER_REVISION_STALE_BUTTON_REJECT_PASS
SEND_DOUBLE_TAP_PASS
SEND_RESULT_TRANSITIONS_PASS
IGNORE_LOCAL_STATE_PASS
DATABASE_REOPEN_PASS
MARKETPLACE_QUESTION_OPERATOR_A3_SELFTEST_PASS

FINAL_STATUS=MARKETPLACE_QUESTION_OPERATOR_A3_PASS

If any mandatory marker fails, do not claim PASS. Report the blocker and use:
FINAL_STATUS=MARKETPLACE_QUESTION_OPERATOR_A3_BLOCKED
```
