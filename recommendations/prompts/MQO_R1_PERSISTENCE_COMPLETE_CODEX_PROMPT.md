# Marketplace Question Operator — R1 Persistence Complete

## Task

Continue implementation in:

```text
/opt/marketplace-question-operator
```

Start from current HEAD:

```text
ad39fd7de435d67d014468f35330a750854f8491
```

This is a coding task. Do not re-audit the whole project and do not redesign the architecture.

Complete the remaining persistence-side operator workflow in one coherent slice:

1. Codex draft attempts + profile settings/retry capture;
2. Telegram reply-input correlation storage;
3. 5-day technical retention;
4. recent error coalescing;
5. behavioral tests for all of the above.

Do not implement Telegram production handlers, marketplace HTTP adapters, polling, live Codex execution, credentials, or systemd in this run.

## Existing implementation to preserve

Already implemented and passing:

- question persistence/dedup/public `Q-%06d` IDs;
- immutable answer revisions;
- guarded transactional question state transitions;
- revision-bound send claim;
- stale revision rejection;
- double-send protection;
- `SENDING -> SENT|SEND_FAILED|SEND_UNKNOWN` completion.

Extend these existing repository/state patterns instead of replacing them.

## 1. Codex profile setting

Use `settings` table.

Required setting:

```text
active_codex_profile
```

Default:

```text
codex1
```

Allowed values only:

```text
codex1
codex2
codex3
```

Implement repository operations to get/set the active profile. Invalid profile values must be rejected.

Profile switching only changes the global current selection. It must never mutate historical attempts.

## 2. Draft attempts

Implement real repository operations for `draft_attempts`.

Required stored fields:

```text
id
question_id
codex_profile
status
answer_text
error_type
error_message
started_at
finished_at
```

Implement at least:

```text
create_draft_attempt(question_id, codex_profile)
get_draft_attempt(attempt_id)
get_current_draft_attempt(question_id)
finish_draft_success(attempt_id, answer_text)
finish_draft_error(attempt_id, error_type, error_message)
```

When a draft attempt starts, capture the active Codex profile into that attempt permanently.

Example behavioral contract:

```text
active profile = codex1
attempt #1 created -> codex1
switch global active profile -> codex2
attempt #1 remains codex1
retry creates attempt #2 for same question -> codex2
```

Retry means a NEW `draft_attempt` row for the SAME `question_id`; never recreate the marketplace question or Q-ID.

Where consistent with existing state implementation, update `questions.current_draft_attempt_id` transactionally when a new current attempt is created.

## 3. Telegram input correlation storage

Implement real repository operations for `telegram_inputs`.

Fields:

```text
telegram_prompt_message_id
question_id
mode
based_on_revision_id
created_at
expires_at
```

Allowed modes:

```text
manual_answer
edit_answer
```

Required operations:

```text
create_telegram_input(...)
get_telegram_input(telegram_prompt_message_id)
consume_telegram_input(telegram_prompt_message_id)
delete_or_expire_telegram_input(...)
```

The correlation key is the Telegram prompt message ID, not a global `editing_question_id`.

Prove two simultaneous input prompts can resolve to two different questions without mixing.

`consume_telegram_input` should be safe against duplicate processing: once consumed/deleted, the same prompt message must not be accepted a second time.

## 4. Recent error coalescing

Implement real repository logic for `recent_errors`.

Use a stable fingerprint based on logical error identity such as:

```text
component + error_type + normalized message
```

First occurrence:

```text
insert row
occurrence_count = 1
first_seen_at = now
last_seen_at = now
```

Repeated occurrence with same fingerprint:

```text
DO NOT create another logical row
occurrence_count += 1
last_seen_at = now
```

Implement retrieval of recent errors in deterministic newest-first order.

Do not log or store secret values in fingerprints/messages.

## 5. Five-day technical retention

Default retention:

```text
TECHNICAL_RETENTION_DAYS=5
```

Implement DB cleanup for technical history.

Delete rows older than retention only when safe:

- completed/failed draft attempts that are not the question's current draft attempt;
- non-current answer revisions;
- expired Telegram input rows;
- recent errors older than retention.

Preserve:

- all `questions` rows needed for deduplication;
- question external IDs/public Q-IDs/status;
- current answer revision;
- current draft attempt;
- unsent `REVIEW` answer;
- `SEND_UNKNOWN` state/data;
- `SENT` identity and `external_reply_id`.

Boundary tests:

```text
4 days 23 hours old -> remains
older than 5 days -> removed if safe
```

If a row is referenced as current by a question, it must remain even when older than 5 days.

## 6. Behavioral tests

Add real tests against temporary SQLite databases. Do not add marker-name-only assertions.

Required behavior coverage:

```text
test_active_codex_profile_default_and_switch

test_invalid_codex_profile_rejected

test_draft_attempt_captures_profile_immutably

test_retry_uses_new_active_profile_same_question

test_draft_success_persists_answer

test_draft_error_persists_error

test_two_telegram_inputs_do_not_mix_questions

test_consumed_telegram_input_cannot_be_reused

test_error_coalescing_keeps_one_row_and_increments_count

test_distinct_error_fingerprints_create_distinct_rows

test_retention_keeps_4d23h_rows

test_retention_removes_safe_rows_older_than_5_days

test_retention_preserves_current_revision_and_attempt
```

Keep all existing tests passing.

## 7. Verification

Run targeted tests for this slice, then the full suite:

```bash
.venv/bin/python -m pytest -q
```

No public network calls. No Telegram. No Ozon/WB API. No real Codex execution. No credentials.

Before committing, inspect:

```bash
git status --short
git diff --stat
git diff -- app/db app/maintenance.py tests
```

There must be a real implementation diff.

## 8. Commit

Commit only this slice with:

```text
feat: complete operator persistence workflow
```

PASS requires `FINAL_HEAD != START_HEAD` and a clean working tree after commit.

## 9. Final report

Return:

```text
MQO_R1_REPORT

START_HEAD=
FINAL_HEAD=

FILES_CHANGED=

CODEX_SETTINGS=IMPLEMENTED
DRAFT_ATTEMPTS=IMPLEMENTED
TELEGRAM_INPUT_CORRELATION=IMPLEMENTED
RETENTION=IMPLEMENTED
ERROR_COALESCING=IMPLEMENTED

TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=

BEHAVIOR_EVIDENCE=
- active profile:
- immutable attempt profile:
- retry same question/new profile:
- draft success/error:
- Telegram correlation:
- duplicate Telegram consume:
- error coalescing:
- retention boundary:
- protected current rows:

GIT_STATUS=

NETWORK_CALLS=0
SECRETS_TOUCHED=none
UNRELATED_SERVICES_MODIFIED=none

FINAL_STATUS=MQO_R1_PASS
```

PASS is forbidden if there is no code diff, tests do not exercise real repository behavior, or `FINAL_HEAD == START_HEAD`.
