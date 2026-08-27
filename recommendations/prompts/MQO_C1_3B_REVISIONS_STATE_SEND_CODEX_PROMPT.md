# Marketplace Question Operator — C1.3B Codex Prompt

Implement only the next narrow persistence/state slice in `/opt/marketplace-question-operator` starting from HEAD `aca2907504062f23d69c1476adbc6babedf7cb8c`.

This is a coding task, not an audit. Modify files, add behavioral tests, run them, and commit. Do not touch Telegram production handlers, Ozon/WB HTTP adapters, polling, live Codex, credentials, or systemd.

## Goal

Implement:

1. immutable answer revisions;
2. guarded transactional state transitions;
3. revision-bound send claim;
4. double-send prevention;
5. send completion/failure/unknown transitions.

## Required behavior

### Answer revisions

Implement repository operations to create/load immutable `answer_revisions` with:

- `question_id`
- `source` in `manual|codex|edited`
- `text`
- `draft_attempt_id` nullable
- `based_on_revision_id` nullable
- `created_at`

Implement setting/loading `questions.current_answer_revision_id`.

Never overwrite existing revision text.

### State transition guard

Canonical states:

`NEW`, `MANUAL_INPUT`, `CODEX_RUNNING`, `CODEX_ERROR`, `REVIEW`, `EDITING`, `IGNORED`, `SENDING`, `SENT`, `SEND_FAILED`, `SEND_UNKNOWN`.

Implement one transactional operation equivalent to:

```python
transition_question(question_id, expected_current_state, target_state, mutation_fields=None)
```

It must validate the allowed transition and execute an expected-state SQL update inside a transaction. If the stored state no longer equals `expected_current_state`, return/raise a dedicated stale-state result and make no mutation.

Required transitions for this slice:

- `NEW -> MANUAL_INPUT|CODEX_RUNNING|IGNORED`
- `MANUAL_INPUT -> REVIEW|IGNORED|NEW`
- `CODEX_RUNNING -> REVIEW|CODEX_ERROR`
- `CODEX_ERROR -> CODEX_RUNNING|MANUAL_INPUT|IGNORED`
- `REVIEW -> EDITING|CODEX_RUNNING|SENDING|IGNORED`
- `EDITING -> REVIEW|IGNORED`
- `SENDING -> SENT|SEND_FAILED|SEND_UNKNOWN`
- `SEND_FAILED -> SENDING|REVIEW|IGNORED`
- `SEND_UNKNOWN -> SENT|SENDING|REVIEW`

### Revision-bound send claim

Implement atomic:

```python
claim_send(question_id, answer_revision_id)
```

Within one transaction it must require:

- question exists;
- `question.status == REVIEW`;
- `question.current_answer_revision_id == answer_revision_id`;
- referenced revision exists;
- `revision.question_id == question.id`.

Then, in the same transaction, transition `REVIEW -> SENDING` and return the exact immutable revision text that was claimed.

A stale callback with an old revision ID must fail and must never substitute the current revision.

A second identical claim after the first successful claim must fail because the question is already `SENDING`.

### Send completion

Implement:

- `mark_sent(question_id, external_reply_id)` -> `SENDING -> SENT`, storing `external_reply_id` and `sent_at`;
- `mark_send_failed(question_id)` -> `SENDING -> SEND_FAILED`;
- `mark_send_unknown(question_id)` -> `SENDING -> SEND_UNKNOWN`.

No automatic retry.

## Behavioral tests

Add real tests exercising repository code. At minimum:

1. `test_answer_revision_is_immutable`
2. `test_current_revision_changes_without_overwriting_old_revision`
3. `test_allowed_state_transition_succeeds`
4. `test_forbidden_state_transition_fails_without_mutation`
5. `test_expected_state_mismatch_is_stale_without_mutation`
6. `test_claim_send_returns_exact_bound_revision`
7. `test_stale_revision_send_is_rejected`
8. `test_revision_from_other_question_is_rejected`
9. `test_double_send_claim_allows_only_first`
10. `test_mark_sent_stores_external_reply_id_and_sent_at`
11. `test_mark_send_failed`
12. `test_mark_send_unknown`

Do not use marker-name-only assertions.

## Verification

Run targeted tests, then full suite:

```bash
.venv/bin/python -m pytest tests/test_state_send.py -q
.venv/bin/python -m pytest -q
```

If another test filename is more natural, use it and report the actual command.

Before reporting, run:

```bash
git status --short
git diff --stat
git diff -- app/db app/state_machine.py tests
```

Then commit only this slice:

```text
feat: implement answer revisions and guarded send state
```

PASS requires a new commit and `FINAL_HEAD != START_HEAD`.

## Restrictions

Do not request/store secrets. No public network. No live Telegram. No real Codex generation. Do not touch `/root/.codex*` or unrelated server services/projects.

## Final report

Return:

```text
MQO_C1_3B_REPORT

START_HEAD=
FINAL_HEAD=
FILES_CHANGED=

ANSWER_REVISIONS=IMPLEMENTED
STATE_TRANSITIONS=IMPLEMENTED
REVISION_BOUND_SEND=IMPLEMENTED
DOUBLE_SEND_GUARD=IMPLEMENTED
SEND_COMPLETION=IMPLEMENTED

TEST_COMMAND=
TEST_RESULT=
TEST_COUNT=

BEHAVIOR_EVIDENCE=
- revision immutability:
- state guard:
- stale state:
- exact revision claim:
- stale revision rejection:
- cross-question revision rejection:
- double send:
- sent completion:
- failed completion:
- unknown completion:

GIT_STATUS=
SECRETS_TOUCHED=none
NETWORK_CALLS=0
UNRELATED_SERVICES_MODIFIED=none

FINAL_STATUS=MQO_C1_3B_PASS
```
