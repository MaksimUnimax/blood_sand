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
| `REG-P0-PROVIDER-LIFECYCLE-01` | P0 | `DISABLED_ALIAS_ADMITTED_THEN_LATE_PREFLIGHT_REJECTION` | `EXACT_TRIGGER_PROVEN__FAILED_PATCH_ROLLED_BACK__REPLACEMENT_PATCH_NOT_AUTHORIZED` | Explicit `finance_transaction_list_v3` is accepted as a pending command even though the registry marks it `execution_enabled:false`; after query planning, quota preparation calls execution preflight, throws `OPERATION_BLOCKED`, and the pre-patch detached batch processor leaves the manual owner BUSY. | Replacement repair must reject disabled aliases before they become executable queue entries, preserve zero-request accounting and deliver a local terminal result; it must also close the detached processor error path generically without changing disabled/currentness policy unless separately authorized. |

## Exact command that exposed the defect

```text
OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}
```

## Exact trigger — proven

The exact trigger is now proven from the installed live log plus the exact candidate/pre-patch source.

### 1. The alias is intentionally disabled

`OzonOperationRegistry.OPERATIONS.finance_transaction_list_v3` is:

- `effect: "READ"`
- `execution_enabled: false`
- `currentness: "sunset_2026_09_08"`
- `guidance_visibility: "hidden"`
- `template_runnable: false`
- replacement guidance: `use finance accrual replacement operations`

This state was introduced intentionally by DEFECT-015 on commit:

`2892a1ddeee5ac8f72f63214e5a38628dc08ee33`

The DEFECT-015 regression explicitly says the route is **proactively disabled ahead of the provider sunset** and asserts local preflight rejection.

Therefore the finance command used for the regression was not executable by policy. The assistant test selection was wrong because it checked the parameter maximum but failed to check `execution_enabled`/currentness before issuing the command.

### 2. Command discovery does not enforce execution_enabled

`OzonContract.parseCommand()` ends with `normalizeCommand(raw)`.

`normalizeCommand()` / `resolveOperation()` verify that:

- the alias exists;
- the effect is READ;
- params are structurally/provider-contract valid.

They do **not** reject `execution_enabled:false`.

`OzonContract.discoverCommands()` calls `parseCommand(commandText)` and emits `ok:true` when parsing/normalization succeeds.

`service_worker.batchEntryFromDiscovery()` then maps every `ok:true` discovery to:

- `kind: "command"`
- `status: "pending"`

without checking `execution_enabled`.

That is why the live admission log truthfully showed:

- `command_count=1`
- `pre_execution_error_count=0`

for an alias that execution policy had already disabled.

### 3. The first throwing statement after query planning is proven

For a normal single command, `processBatchQueue()` reaches:

`prepareProviderQuotaForCommand(physicalCommandForQuota)`

That function starts with:

```js
const normalized = OzonContract.normalizeCommand(command);
const preflight = OzonContract.preflightExecution(normalized);
```

`OzonContract.preflightExecution()` contains the exact producer:

```js
if (meta.execution_enabled !== true) {
  fail("OPERATION_BLOCKED", `Операция ${normalized.operation} отключена политикой bridge.`);
}
```

Thus, for `finance_transaction_list_v3`, `OPERATION_BLOCKED` is thrown locally **before any physical provider request**.

This exactly matches the patched live log:

- `BATCH_QUERY_PLANNING_COMPLETED`
- immediately `BATCH_PROCESSOR_UNCAUGHT code=OPERATION_BLOCKED`
- then `MANUAL_BATCH_FAILED code=OPERATION_BLOCKED`

No provider/network hypothesis is needed to explain this incident.

### 4. Why the pre-patch runtime hung

The pre-patch runtime used:

```js
void processManualBatch(key, operationId);
```

for manual admission.

The `OPERATION_BLOCKED` exception thrown from `prepareProviderQuotaForCommand()` therefore rejected the detached batch promise with no admission-level catch/terminalization. The manual owner had already entered BUSY/collecting state, so no normal batch result/finalization path completed.

Causal chain:

```text
explicit disabled alias
-> discoverCommands parse/normalize PASS
-> batchEntryFromDiscovery => kind=command, pending
-> MANUAL_BATCH_ACCEPTED / BUSY
-> capability planning PASS
-> query planning PASS
-> prepareProviderQuotaForCommand
-> preflightExecution
-> execution_enabled:false
-> OPERATION_BLOCKED throw
-> detached processManualBatch rejection
-> no terminal owner transition in pre-patch runtime
-> indefinite BUSY
```

This fully explains the original hang.

### 5. The failed lifecycle candidate exposed, but did not remove, the trigger

The rolled-back candidate added a managed catch around the batch processor. That changed the final part of the chain from silent/stranded rejection to:

- `BATCH_PROCESSOR_UNCAUGHT`
- `MANUAL_BATCH_FAILED`

This made the hidden error visible, but the command still could not execute because the alias was intentionally disabled. The candidate therefore failed the operator's live acceptance and was rolled back.

### 6. Existing DEFECT-015 test gap

The DEFECT-015 suite asserts disabled-currentness behavior by calling `contract.preflightExecution()` directly.

It does **not** run the real manual product path:

```text
discoverCommands
-> batchEntryFromDiscovery
-> MANUAL_BATCH_ACCEPTED
-> processBatchQueue
-> prepareProviderQuotaForCommand
```

The same suite explicitly expects `normalizeCommand(finance_transaction_list_v3, valid params)` to PASS while separately expecting `preflightExecution()` to reject it.

That contract split is valid for parsing/introspection, but the manual admission integration layer failed to bridge the split. This is why unit/currentness gates were green while the production workflow hung.

### 7. Affected disabled aliases — shared defect, not finance-only

The exact candidate registry contains three `execution_enabled:false` READ aliases:

1. `finance_transaction_list_v3` — sunset 2026-09-08; replacement: finance accrual operations;
2. `fbs_carriage_available_list` — retired; replacement: `carriage_delivery_list_v2`;
3. `fbs_stock_by_warehouse_v1` — retired; replacement: `fbs_stock_by_warehouse_v2`.

Because discovery/admission only requires parse/normalize success, all three belong to the same affected class when supplied explicitly as `OZON_API_V1` commands.

A replacement patch must cover the whole disabled-alias class, not special-case finance.

### 8. Error-result recursion hazard

Several normal result/error builders call `OzonContract.preflightExecution(command)` again, including `buildExecutionErrorResult()`.

Therefore attempting to handle a late disabled-alias failure only inside the execution-error builder can throw `OPERATION_BLOCKED` again while formatting the error result.

The safe architectural boundary is before an execution-disabled discovery becomes `kind:"command"`, with a local `pre_execution_error`/guidance result and zero provider requests. Independent generic batch-promise terminalization remains a separate hardening dependency.

## Correct replacement-fix requirements — not yet authorized

No executable replacement patch is authorized by this evidence update.

A future authorized repair must at minimum prove:

1. explicit disabled/retired/sunset alias is rejected locally before executable queue admission;
2. `MANUAL_BATCH_ACCEPTED` must not report it as `command_count=1, pre_execution_error_count=0`;
3. result is delivered through the existing local pre-execution/guidance path;
4. `external_request_executed=false`;
5. physical business request count `0`;
6. Bridge returns to READY;
7. no hidden retry/pagination/fanout/polling;
8. all three current `execution_enabled:false` aliases have deterministic integration regressions;
9. one enabled positive-control alias still executes once;
10. parser/normalize semantics remain available where intentionally used for contract validation/introspection;
11. generic uncaught batch processor failure cannot strand the owner BUSY;
12. error-result builders cannot recursively rethrow execution-policy rejection;
13. manual and autorun consumers are both covered;
14. exact package Linux/Windows/fresh-extraction/byte-for-byte gates pass;
15. installed live test uses an **actually execution-enabled** operation for success-path acceptance and a disabled alias separately for zero-request local-reject acceptance.

## Failed repair and rollback

Failed candidate:
`OZON_BRIDGE_v0.1.19_PROVIDER_LIFECYCLE_TERMINALIZATION_a81d4fba.zip`

Failed candidate HEAD:
`a81d4fbab7a58fb387c00a930b4376fea82fe950`

Installed LIVE FAIL evidence:

- seq 12 `MANUAL_BRIDGE_BUSY`
- seq 13 `MANUAL_BATCH_ACCEPTED`
- seq 14 `BATCH_CAPABILITY_PLANNING_COMPLETED`
- seq 15 `BATCH_QUERY_PLANNING_COMPLETED`
- seq 16 `BATCH_PROCESSOR_UNCAUGHT code=OPERATION_BLOCKED`
- seq 17 `MANUAL_BATCH_FAILED code=OPERATION_BLOCKED`

Rollback authority/runtime target:
`74e0589b5034581664c17727b8efba18ed0711d0`

Restored runtime blobs:

- `dist-step7-candidate/service_worker.js` -> `6beac3005cbac2f1913e1fe8c77acfc25f29c946`
- `dist-step7-candidate/shared/provider_transport_core.js` -> `346332d6e298c461e225487ba75faf41b0d51288`

Rollback runtime commit on the failed repair branch:
`eeadd2c10f39eff578a42e321f2ef831f2744101`

Separate exact rollback branch:
`rollback/ozon-provider-lifecycle-terminalization-2026-09-07`

No failed lifecycle/timeout runtime code is part of the rollback artifact.

## Active-work relationship

`CAP-24` remains separately frozen at its preserved business cursor. This regression does not renumber or rewrite CAP-24.

Current order:

1. exact trigger — PROVEN;
2. failed repair — ROLLED BACK;
3. replacement patch — NOT AUTHORIZED;
4. after a future authorized repair, run both disabled-alias zero-request reject acceptance and enabled-operation success acceptance;
5. only after shared regression closure resume CAP-24 from its preserved cursor rather than restarting it.
