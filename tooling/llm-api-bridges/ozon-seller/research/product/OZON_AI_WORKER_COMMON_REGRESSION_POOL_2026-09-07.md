# Ozon AI Worker — common regression pool

Date: 2026-09-07
Branch: `repair/ozon-xlsx-implicit-cell-ref-2026-09-07`
Status: `COMMON_REGRESSION_POOL_ACTIVE`

Parent hardening authority:
`OZON_AI_WORKER_SOL_44_HARDENING_DESIGN_AND_REGRESSION_MATRIX_2026-09-07.md`

This file is the shared/common regression pool for live defects discovered after the original H3 matrix was frozen.

Rules:

- entries here are **not** new STD/CAP business rows;
- do not renumber `STD-01..STD-20` or `CAP-01..CAP-24` because of a shared regression;
- a shared regression may interrupt an active business test when it exposes a production reliability defect;
- the interrupted business test remains frozen at its evidence-backed cursor and resumes only after the blocking shared regression is closed;
- no executable Bridge change is authorized by this document;
- root cause must be proven before implementation;
- implementation requires explicit operator authorization;
- after implementation the exact live reproducer below must be rerun;
- one explicit command must remain at most one physical business request;
- no hidden retry, pagination, fanout, polling or chaining may be introduced to make a regression green.

## Shared regression ledger

| ID | Priority | Class | Status | Production symptom | Required closure |
|---|---|---|---|---|---|
| `REG-P0-PROVIDER-LIFECYCLE-01` | P0 | `BRIDGE_EXECUTION_LIFECYCLE_HANG` | `OPEN_REPRODUCED__ROOT_CAUSE_NOT_YET_PROVEN` | Accepted manual command reaches capability planning and query planning, then no provider/result/terminal collection evidence appears and the Bridge remains busy instead of reaching a bounded terminal state | Prove exact root cause; after authorized fix rerun the exact command below; command must either complete normally or terminate with an explicit bounded error/recovery result, never remain indefinitely BUSY |

## REG-P0-PROVIDER-LIFECYCLE-01 — live reproducer

### Purpose

Prove that a valid large finance read cannot leave the production Bridge in an indefinite busy state after query planning.

This regression is shared infrastructure/reliability coverage. It is **not CAP-25**, **not CAP-26**, and does not replace or renumber any business/capability test.

### Exact command that exposed the defect

```text
OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}
```

### Live incident evidence

Observed on runtime `0.1.19` on 2026-09-07:

1. `MANUAL_BRIDGE_BUSY`
   - sequence `1009`
   - reason `manual_batch_admission`
2. `MANUAL_BATCH_ACCEPTED`
   - sequence `1010`
   - `command_count=1`
   - `item_count=1`
   - `pre_execution_error_count=0`
   - `operation_id=ozmanual-97761c01-3b99-4f00-85e8-814f11e4e2ee`
3. `BATCH_CAPABILITY_PLANNING_COMPLETED`
   - sequence `1011`
   - `capability_probe_performed=false`
   - `capability_status=not_needed`
   - `planned_command_count=1`
   - `planning_error_count=0`
4. `BATCH_QUERY_PLANNING_COMPLETED`
   - sequence `1012`
   - `coalesced_group_count=0`
   - `coalesced_logical_count=0`

After sequence `1012`, the captured live log contains no subsequent evidence for this operation of:

- provider dispatch completion;
- provider HTTP result;
- stored business result;
- `BATCH_COLLECTION_COMPLETED`;
- explicit terminal error;
- normal delivery completion.

Therefore the proven current boundary is:

`manual admission -> capability planning COMPLETE -> query planning COMPLETE -> NO OBSERVED TERMINAL PROGRESS`

The exact deeper root cause is **not yet proven** and must not be guessed in documentation.

### Mandatory investigation before any patch

Trace and prove the first missing/blocked transition through:

`query planning -> queue claim/state transition -> entitlement/privacy recheck -> quota/state gate -> provider execution dispatch -> transport timeout/abort -> response parse -> result storage -> batch collection/finalization -> delivery state`

Audit at minimum:

- whether queue entry is claimed after query planning;
- whether a state/store race can leave the entry permanently non-terminal;
- whether provider execution is actually invoked;
- whether fetch/transport has a bounded timeout and abort path;
- whether an exception/promise rejection can escape without terminalizing the manual owner;
- whether worker suspension/restart can strand the operation;
- whether finance-specific execution/planning branches differ from previously successful operations;
- whether quota/entitlement/privacy gates can wait without a persisted wake/terminal path;
- whether every post-planning branch has exactly one terminal outcome.

### Post-fix live acceptance test

Rerun the **exact same command** above in a fresh live state.

PASS requires all of the following:

1. `MANUAL_BATCH_ACCEPTED` with one valid command and zero pre-execution errors.
2. Capability and query planning complete.
3. The operation then reaches a bounded terminal state:
   - successful provider result and batch collection/delivery; **or**
   - explicit sanitized provider/transport timeout/failure result followed by normal batch collection/delivery.
4. No indefinite `MANUAL_BRIDGE_BUSY` state.
5. No silent disappearance after `BATCH_QUERY_PLANNING_COMPLETED`.
6. No hidden automatic retry.
7. One explicit command -> at most one physical business request.
8. If the provider request is never executed, result/accounting must explicitly show `external_request_executed=false` and physical request count `0`.
9. If the provider request is executed, request accounting must explicitly prove the physical count and terminal outcome.
10. Fresh-state regression must confirm the Bridge returns to READY after terminal delivery/error handling.

Required PASS marker after repair:

`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_TERMINALIZATION_PASS`

## Active-work relationship

At discovery time, the SKU monthly unit-economics / placement work for `CAP-24` was manually frozen by the operator while evaluating file/large-output delivery behavior.

This shared regression does not modify CAP-24 evidence, arithmetic or numbering.

Execution discipline:

1. investigate `REG-P0-PROVIDER-LIFECYCLE-01` root cause;
2. do not patch until explicit operator authorization;
3. after an authorized repair, run the exact regression command and obtain the PASS marker;
4. then CAP-24 may resume from its preserved business cursor rather than restart from zero.
