# Marketplace Question Operator — C1.3 DB/State Core Implementation Prompt

## Purpose

The previous C1.2 run did not modify any files. This run is intentionally narrow and must produce code, tests, and a commit.

Work only in:

`/opt/marketplace-question-operator`

Current HEAD expected at start:

`776cb751eeafb663d081fd293a29bd30ca541429`

Do not redesign the product. Do not audit the whole project again. Do not return a report before implementation work is complete.

## Mandatory outcome

Implement the complete persistence/state/send-safety core only. Do not implement Telegram production wiring, marketplace HTTP adapters, polling, or live Codex in this run.

The run may return PASS only if files changed, behavioral tests were added, all tests pass, and a new Git commit was created.

If the working tree cannot be modified, report the exact OS/filesystem/tooling blocker. Otherwise you are explicitly authorized to edit/create files under `/opt/marketplace-question-operator`.

## Implement

### Database repository

Use `aiosqlite`. Implement real operations for:

- insert/deduplicate marketplace question by `UNIQUE(marketplace, external_question_id)`;
- generate `public_id = Q-%06d` from allocated DB id;
- get question by id/public id;
- list open questions;
- immutable answer revisions (`manual`, `codex`, `edited`);
- get/set current answer revision;
- create/update draft attempts;
- Telegram reply-input correlation by Telegram prompt message id;
- settings get/set with `active_codex_profile` default `codex1`;
- recent error upsert/coalescing by fingerprint;
- retention-safe deletion helpers;
- exact send claim/finalize/fail/unknown operations.

### Transactional state transitions

Implement central guarded transition logic using an expected-current-state condition inside one SQLite transaction.

Canonical states:

`NEW, MANUAL_INPUT, CODEX_RUNNING, CODEX_ERROR, REVIEW, EDITING, IGNORED, SENDING, SENT, SEND_FAILED, SEND_UNKNOWN`

Required transitions:

- NEW -> MANUAL_INPUT | CODEX_RUNNING | IGNORED
- MANUAL_INPUT -> REVIEW | IGNORED | NEW
- CODEX_RUNNING -> REVIEW | CODEX_ERROR
- CODEX_ERROR -> CODEX_RUNNING | MANUAL_INPUT | IGNORED
- REVIEW -> EDITING | CODEX_RUNNING | SENDING | IGNORED
- EDITING -> REVIEW | IGNORED
- SENDING -> SENT | SEND_FAILED | SEND_UNKNOWN
- SEND_FAILED -> SENDING | REVIEW | IGNORED only by explicit caller action
- SEND_UNKNOWN -> SENT | SENDING | REVIEW only by explicit reconciliation/operator action

Stale expected state must fail as `STALE_STATE` without mutation.

### Revision-bound send claim

Implement an atomic operation that accepts:

- question_id
- answer_revision_id

and only claims send if:

- question.status == REVIEW
- question.current_answer_revision_id == answer_revision_id
- revision.question_id == question.id

Then transition atomically to `SENDING` and return the exact immutable text that is authorized for sending.

A duplicate/double Send callback after the first claim must fail and must not produce a second send claim.

A stale revision Send callback must fail and must never resolve to a newer answer revision.

### Draft retry/profile capture

Implement creation of draft attempts that captures the active Codex profile at the moment the attempt is created.

Profile values only:

- codex1
- codex2
- codex3

Changing the global active profile later must not mutate historical attempts.

A retry must create a new attempt for the same question id and capture the newly active profile.

### Telegram input correlation storage

Implement `telegram_inputs` operations so a reply is correlated by `telegram_prompt_message_id`, not by a single global editing question.

Support modes:

- manual_answer
- edit_answer

Include optional based_on_revision_id.

### Error coalescing

Implement recent error fingerprint coalescing:

first occurrence inserts;
repeated same fingerprint increments `occurrence_count` and updates `last_seen_at` rather than inserting another logical error.

### Retention

Default technical retention: 5 days.

Implement DB retention that may remove when safe:

- completed/failed non-current draft attempts older than retention;
- non-current answer revisions older than retention;
- expired telegram_inputs;
- recent_errors older than retention.

Must preserve:

- questions rows needed for dedup;
- current answer revision;
- current draft attempt;
- unsent REVIEW answer;
- SEND_UNKNOWN data;
- SENT question identity and external reply id.

Test 4 days 23 hours remains. Older than 5 days is removed only when safe.

## Behavioral tests

Delete/replace fake marker-prefix acceptance assertions for this slice.

Add actual tests proving at least:

- `C1_DB_SCHEMA_PASS`
- `C1_QUESTION_DEDUP_PASS`
- `C1_PUBLIC_QID_PASS`
- `C1_STATE_TRANSITION_GUARD_PASS`
- `C1_STALE_CALLBACK_REJECT_PASS`
- `C1_TELEGRAM_REPLY_CORRELATION_PASS`
- `C1_REVISION_BOUND_SEND_PASS`
- `C1_DOUBLE_SEND_PREVENTED_PASS`
- `C1_CODEX_PROFILE_SELECTION_PASS`
- `C1_CODEX_RETRY_USES_CURRENT_PROFILE_PASS`
- `C1_RETENTION_5_DAY_PASS`
- `C1_ERROR_COALESCING_PASS`

Each marker must correspond to a real behavioral test. Do not add tests that merely assert marker strings.

## Verification

Run:

`.venv/bin/python -m pytest -q`

Also run:

`.venv/bin/python -m app.cli doctor --offline`

`.venv/bin/python -m app.cli selftest`

Fix failures caused by this slice.

## Git

Show `git diff --stat` and verify no credentials/auth/token files are present.

Commit all C1.3 changes as:

`feat: implement marketplace operator persistence state core`

Do not return PASS if `FINAL_HEAD == START_HEAD`.

## Safety

Do not request credentials.
Do not call Ozon/WB/Telegram/OpenAI network endpoints.
Do not run real Codex generation.
Do not modify existing Codex auth directories.
Do not touch APM, OpenScript, OpenDesign, Business Bridge, nginx, Docker/containerd, ISPmanager.

## Final report

Return:

```text
MARKETPLACE_QUESTION_OPERATOR_C1_3_REPORT

START_HEAD=
FINAL_HEAD=

FILES_CHANGED=

DB_REPOSITORY=
STATE_TRANSITIONS=
REVISION_BOUND_SEND=
DRAFT_PROFILE_CAPTURE=
TELEGRAM_INPUT_CORRELATION=
RETENTION=
ERROR_COALESCING=

TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=

MARKER_EVIDENCE=
<marker -> test function -> behavior actually asserted>

OFFLINE_DOCTOR=
SELFTEST=

NETWORK_CALLS_DURING_TESTS=0
SECRETS_REQUESTED=0
SECRETS_STORED=0
UNRELATED_SERVICES_MODIFIED=none

FINAL_STATUS=
MARKETPLACE_QUESTION_OPERATOR_C1_3_PASS
```

PASS is allowed only if files were actually modified, behavioral tests pass, and a new commit exists.