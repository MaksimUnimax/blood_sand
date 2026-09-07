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
- no executable Bridge change is authorized by this document;
- root cause must be proven before implementation;
- implementation requires explicit operator authorization;
- after implementation the exact live reproducer below must be rerun;
- one explicit command must remain at most one physical business request;
- no hidden retry, pagination, fanout, polling or chaining may be introduced to make a regression green.

## Shared regression ledger

| ID | Priority | Class | Status | Production symptom | Required closure |
|---|---|---|---|---|---|
| `REG-P0-PROVIDER-LIFECYCLE-01` | P0 | `BRIDGE_EXECUTION_LIFECYCLE_HANG` | `ROOT_CAUSE_PROVEN__PREHANDOFF_REPAIR_PASS__LIVE_ACCEPTANCE_PENDING` | Accepted manual command reached capability planning and query planning, then no terminal progress and Bridge remained busy | Install exact pre-handoff-certified candidate; rerun exact live command below; require bounded success/error, truthful request accounting and READY restoration |

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

After sequence `1012`, the captured live log contains no subsequent terminal evidence for this operation. The captured boundary was:

`manual admission -> capability planning COMPLETE -> query planning COMPLETE -> NO OBSERVED TERMINAL PROGRESS`

### Root cause — proven

The repair investigation found two independent product defects capable of producing indefinite BUSY:

1. **Detached batch processor lifecycle.** Manual and autorun admission/recovery paths launched `processManualBatch()` / `processAutoBatch()` as detached promises. The incoming MV3 message event returned after admission, the detached processor had no managed terminal catch, and ordinary active `pending/idle` batches were not enumerated by worker-start recovery. A service-worker interruption or uncaught processor failure could therefore leave durable active state without a guaranteed terminal path.
2. **Unbounded provider transport.** Seller, Performance and report-file transport used unbounded `fetch` / response-body reads. A stalled fetch or stalled body stream could keep a durably claimed `requesting` entry indefinitely active.

The finance command itself was valid and was not an analytics-coalescing or quota-specific case. The repair therefore targets shared lifecycle and transport rather than the finance operation contract.

### Authorized repair

Direct operator authorization was given in this repair cycle (`Делай патч` / `Делай`).

Runtime repair:

- all six detached manual/autorun batch launch/recovery call sites now use one managed launcher;
- managed launcher converts uncaught processor failure into durable terminal owner failure;
- startup/alarm recovery enumerates durable active manual/autorun batches;
- `requesting` state with a previous or missing worker owner fails closed as `REQUEST_OUTCOME_UNKNOWN_NO_RETRY` and never automatically retries;
- same-worker duplicate recovery is protected by existing owner-keyed `singleFlight`;
- Seller, Performance and report-file network+body transport has one bounded 60-second end-to-end deadline with AbortController where available;
- timeout is reported as `PROVIDER_REQUEST_TIMEOUT` with request-attempt accounting;
- no hidden retry, pagination, fanout, polling or implicit business chaining was added;
- no new network destination or permission was added.

Production runtime patch commit:

`2608c268be989511961bf58449c8b0713a9b7ac7`

Production runtime delta is limited to:

- `dist-step7-candidate/service_worker.js`
- `dist-step7-candidate/shared/provider_transport_core.js`

Permanent regression:

`validation/provider-lifecycle-terminalization-v1/run_provider_lifecycle_terminalization_gate.mjs`

### Pre-handoff evidence

Deterministic final-candidate gates prove:

- fresh worker discovers durable manual + autorun `pending/idle` batches;
- previous-worker `requesting` fails closed without provider retry;
- missing worker owner in `requesting` fails closed;
- same-worker in-flight state is not claimed again;
- Seller fetch stall times out;
- Seller body stall times out;
- Performance fetch stall times out;
- report-file fetch stall times out;
- positive transport control executes exactly one fetch;
- complete read-effect, provider taxonomy, report lifecycle/session, redaction/SSRF and XLSX regression families remain green on Linux;
- exact lifecycle gate and intersecting regressions pass on Windows;
- exact 21-file package is freshly extracted and byte-for-byte verified.

Representative required markers:

- `REG_P0_PROVIDER_FRESH_WORKER_PENDING_RESUME_PASS`
- `REG_P0_PROVIDER_FRESH_WORKER_REQUESTING_FAIL_CLOSED_PASS`
- `REG_P0_PROVIDER_MISSING_WORKER_OWNER_FAIL_CLOSED_PASS`
- `REG_P0_PROVIDER_SAME_WORKER_NO_DUPLICATE_CLAIM_PASS`
- `REG_P0_PROVIDER_SELLER_FETCH_TIMEOUT_PASS`
- `REG_P0_PROVIDER_SELLER_BODY_TIMEOUT_PASS`
- `REG_P0_PROVIDER_PERFORMANCE_TIMEOUT_PASS`
- `REG_P0_PROVIDER_REPORT_TIMEOUT_PASS`
- `REG_P0_PROVIDER_SINGLE_REQUEST_POSITIVE_CONTROL_PASS`
- `REG_P0_PROVIDER_LIFECYCLE_PREHANDOFF_GATE_PASS`

**This is PRE-HANDOFF evidence only. It is not LIVE PASS.**

### Post-fix live acceptance test

Rerun the **exact same command** above after installing the exact certified package.

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

Required LIVE PASS marker:

`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_TERMINALIZATION_PASS`

## Active-work relationship

At discovery time, the SKU monthly unit-economics / placement work for `CAP-24` was manually frozen by the operator while evaluating file/large-output delivery behavior.

This shared regression does not modify CAP-24 evidence, arithmetic or numbering.

Execution discipline:

1. install the exact pre-handoff-certified lifecycle repair;
2. run the exact live regression command and obtain the required LIVE PASS marker;
3. only then resume CAP-24 from its preserved cursor rather than restart from zero.
