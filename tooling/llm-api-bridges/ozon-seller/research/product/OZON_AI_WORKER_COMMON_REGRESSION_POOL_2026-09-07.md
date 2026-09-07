# Ozon AI Worker — common regression pool

Date: 2026-09-07
Branch: `repair/ozon-provider-lifecycle-terminalization-2026-09-07`
Status: `COMMON_REGRESSION_POOL_ACTIVE`

Parent hardening authority:
`OZON_AI_WORKER_SOL_44_HARDENING_DESIGN_AND_REGRESSION_MATRIX_2026-09-07.md`

This file is the shared/common regression pool for live defects discovered after the original H3 matrix was frozen.

Rules:

- entries here are **not** new STD/CAP business rows;
- do not renumber `STD-01..STD-20` or `CAP-01..CAP-24` because of a shared regression;
- a shared regression may interrupt an active business test when it exposes a production reliability defect;
- the interrupted business test remains frozen at its evidence-backed cursor and resumes only after the blocking shared regression is closed;
- root cause must be proven before implementation;
- implementation requires explicit operator authorization;
- one explicit command must remain at most one physical business request;
- no hidden retry, pagination, fanout, polling or chaining may be introduced to make a regression green;
- PRE-HANDOFF PASS never substitutes for installed LIVE PASS;
- a candidate that fails the exact live reproducer must be marked failed and rolled back before another repair attempt.

## Shared regression ledger

| ID | Priority | Class | Status | Production symptom | Required closure |
|---|---|---|---|---|---|
| `REG-P0-PROVIDER-LIFECYCLE-01` | P0 | `BRIDGE_EXECUTION_LIFECYCLE_HANG` | `LIVE_FAIL__ROLLED_BACK__EXACT_TRIGGER_UNDER_INVESTIGATION` | Original runtime accepted a valid finance command, completed capability/query planning, then showed no terminal progress. The first repair candidate instead exposed `OPERATION_BLOCKED` immediately after query planning and still did not execute the command. | Investigate and prove the exact `OPERATION_BLOCKED` trigger and its relationship to the original hang before any new executable repair. Re-run the same live command only after a separately authorized replacement patch. |

## Exact live reproducer

```text
OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}
```

## Original live incident

Observed on runtime `0.1.19` before the failed lifecycle patch:

1. `MANUAL_BRIDGE_BUSY`
2. `MANUAL_BATCH_ACCEPTED`
3. `BATCH_CAPABILITY_PLANNING_COMPLETED`
4. `BATCH_QUERY_PLANNING_COMPLETED`
5. no subsequent observed provider/result/terminal collection evidence in the captured log

Observed boundary:

`manual admission -> capability planning COMPLETE -> query planning COMPLETE -> NO OBSERVED TERMINAL PROGRESS`

The exact immediate trigger of that original incident was not directly observed.

## Failed repair attempt

Authorized candidate:
`OZON_BRIDGE_v0.1.19_PROVIDER_LIFECYCLE_TERMINALIZATION_a81d4fba.zip`

Candidate HEAD:
`a81d4fbab7a58fb387c00a930b4376fea82fe950`

The repair addressed two real hardening gaps found during investigation:

1. detached manual/autorun batch processor lifecycle without guaranteed catch/recovery terminalization;
2. unbounded Seller/Performance/report-file transport without a deadline.

These are valid product hardening findings, but the installed live test proved they were **not sufficient to restore the failing command path** and therefore they cannot be treated as the complete causal root fix for this regression.

### Installed live result — FAIL

Observed after installing the candidate and rerunning the exact command:

- sequence 12: `MANUAL_BRIDGE_BUSY`, reason `manual_batch_admission`
- sequence 13: `MANUAL_BATCH_ACCEPTED`, one command, zero pre-execution errors
- sequence 14: `BATCH_CAPABILITY_PLANNING_COMPLETED`
- sequence 15: `BATCH_QUERY_PLANNING_COMPLETED`
- sequence 16: `BATCH_PROCESSOR_UNCAUGHT`, `code=OPERATION_BLOCKED`, `source=manual_admission`
- sequence 17: `MANUAL_BATCH_FAILED`, `code=OPERATION_BLOCKED`

Verdict:

`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_TERMINALIZATION_PASS` was **not obtained**.

The patch converted the previous silent/indefinite state into a visible terminal failure, but the business command still did not execute. Therefore the patch failed live acceptance.

Detailed evidence:
`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_FAIL_2026-09-07.md`

## Rollback

Operator explicitly ordered rollback after the live failure.

Rollback authority/runtime target:
`74e0589b5034581664c17727b8efba18ed0711d0`

Exact restored production blobs:

- `dist-step7-candidate/service_worker.js` -> `6beac3005cbac2f1913e1fe8c77acfc25f29c946`
- `dist-step7-candidate/shared/provider_transport_core.js` -> `346332d6e298c461e225487ba75faf41b0d51288`

Rollback commit on the failed repair branch:
`eeadd2c10f39eff578a42e321f2ef831f2744101`

A separate rollback branch was also created directly from the pre-patch authority:
`rollback/ozon-provider-lifecycle-terminalization-2026-09-07`

No failed lifecycle/timeout runtime code is part of the rollback artifact.

## Current investigation requirement

Before any new patch, prove the first exact cause of `OPERATION_BLOCKED` in the live path:

`query planning -> owner/state read -> local policy / entitlement / privacy / capability state -> cache/acquisition profile -> request claim -> provider dispatch`

Required questions:

- which exact statement throws or returns `OPERATION_BLOCKED` after `BATCH_QUERY_PLANNING_COMPLETED`;
- whether `OPERATION_BLOCKED` existed in the pre-patch runtime but was previously swallowed/stranded;
- what durable owner/entry/request state existed when it happened;
- whether the command was blocked locally before any physical provider request;
- which branch constructs `OPERATION_BLOCKED` and why this valid finance command enters it;
- whether any stale work-session/manual-operation state from the prior run contributes;
- whether the problem reproduces on a fresh conversation/fresh worker with the restored runtime;
- all dependent consumers and state boundaries before a replacement fix is authorized.

Do **not** patch again until the exact trigger is proven and the operator explicitly authorizes another executable change.

## Active-work relationship

`CAP-24` remains separately frozen at its preserved business cursor. This regression does not renumber or rewrite CAP-24.

Current order:

1. rollback failed lifecycle candidate;
2. investigate exact `OPERATION_BLOCKED` trigger;
3. obtain explicit authorization before any replacement patch;
4. after a future successful live regression, resume CAP-24 from its preserved cursor rather than restarting it.
