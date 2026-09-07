# Ozon AI Worker — common regression pool

Date: 2026-09-07
Branch: `repair/ozon-disabled-alias-admission-2026-09-07`
Status: `COMMON_REGRESSION_POOL_ACTIVE`

Parent hardening authority:
`OZON_AI_WORKER_SOL_44_HARDENING_DESIGN_AND_REGRESSION_MATRIX_2026-09-07.md`

Rules:

- entries here are shared product regressions, not new STD/CAP rows;
- do not renumber `STD-01..STD-20` or `CAP-01..CAP-24` because of a shared regression;
- an interrupted business test remains frozen at its evidence-backed cursor until the blocking shared regression has LIVE PASS;
- one explicit command remains at most one physical business request;
- no hidden retry, pagination, fanout, polling or chaining is permitted;
- PRE-HANDOFF PASS never substitutes for installed LIVE PASS;
- a live-failed candidate remains recorded as failed even if it helped expose the next causal boundary.

## Shared regression ledger

| ID | Priority | Class | Status | Production symptom | Required closure |
|---|---|---|---|---|---|
| `REG-P0-PROVIDER-LIFECYCLE-01` | P0 | `DISABLED_ALIAS_ADMITTED_THEN_LATE_PREFLIGHT_REJECTION` | `EXACT_TRIGGER_PROVEN__REPLACEMENT_PATCH_PREHANDOFF_PASS__LIVE_PENDING` | Explicit `finance_transaction_list_v3` was admitted as executable although registry policy had `execution_enabled:false`; late preflight raised `OPERATION_BLOCKED`, and the detached batch rejection could strand BUSY | Install exact replacement candidate; disabled finance reproducer must terminate locally with `OPERATION_BLOCKED`, zero physical requests and READY restoration; then run one enabled-operation positive control with truthful single-request accounting |

## Exact disabled-alias reproducer

```text
OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}
```

## Proven root cause

`finance_transaction_list_v3` is intentionally disabled by DEFECT-015:

- `execution_enabled:false`
- `currentness:"sunset_2026_09_08"`
- `guidance_visibility:"hidden"`
- `template_runnable:false`

The policy was introduced on commit:
`2892a1ddeee5ac8f72f63214e5a38628dc08ee33`.

The product defect was the split between parsing and execution policy:

```text
parseCommand / normalizeCommand PASS
-> discoverCommands emitted ok:true
-> batchEntryFromDiscovery => kind=command,pending
-> executable batch admission / BUSY
-> capability/query planning
-> prepareProviderQuotaForCommand
-> preflightExecution
-> execution_enabled:false
-> OPERATION_BLOCKED
-> detached batch promise rejection
-> no guaranteed terminal owner transition
```

The exact `OPERATION_BLOCKED` producer is `OzonContract.preflightExecution()`.

The current disabled READ closed set is exactly:

1. `fbs_carriage_available_list`
2. `fbs_stock_by_warehouse_v1`
3. `finance_transaction_list_v3`

This is therefore a shared disabled-alias admission defect, not a finance-only special case.

## Why the first repair failed

Failed candidate:
`OZON_BRIDGE_v0.1.19_PROVIDER_LIFECYCLE_TERMINALIZATION_a81d4fba.zip`

Failed HEAD:
`a81d4fbab7a58fb387c00a930b4376fea82fe950`

Installed live evidence exposed:

- `BATCH_QUERY_PLANNING_COMPLETED`
- `BATCH_PROCESSOR_UNCAUGHT code=OPERATION_BLOCKED`
- `MANUAL_BATCH_FAILED code=OPERATION_BLOCKED`

That candidate made the hidden rejection terminal but did not fix disabled-alias admission, so it correctly remained LIVE FAIL and was rolled back.

Rollback runtime authority:
`74e0589b5034581664c17727b8efba18ed0711d0`

Detailed failure evidence:
`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_FAIL_2026-09-07.md`

## Authorized replacement repair

Replacement branch:
`repair/ozon-disabled-alias-admission-2026-09-07`

Base authority:
`bf7168998d64b7b8007e7a02791856c73d70b34b`

Runtime repair commit:
`d97ec75c5a11acd3d0816bf5a5109b23a573fe2f`

Production runtime delta is limited to:

- `dist-step7-candidate/shared/ozon_contract.js`
- `dist-step7-candidate/service_worker.js`

Repair behavior:

1. `discoverCommands()` performs `preflightExecution()` after parse/normalize and before `ok:true` executable discovery;
2. disabled READ aliases therefore become local `OPERATION_BLOCKED` discovery failures and are mapped to `pre_execution_error`, never executable `kind:"command"` entries;
3. `normalizeCommand()` remains available for metadata/currentness/parameter validation;
4. all six manual/autorun detached batch launch sites use one managed launcher;
5. uncaught manual processor failure uses existing `failManualBatch()`;
6. uncaught autorun processor failure uses existing `markRunError()`;
7. no hidden retry/replay/pagination/fanout/polling is introduced;
8. no provider transport timeout changes from the failed candidate were restored.

Detailed replacement-repair authority:
`REG_P0_PROVIDER_LIFECYCLE_01_DISABLED_ALIAS_ADMISSION_REPAIR_2026-09-07.md`

## Deterministic evidence

Pre-fix reproduction run:
`34113164571`

It failed on the exact assertion that `finance_transaction_list_v3` was still discovered as `ok:true` although disabled.

Permanent regression:
`validation/disabled-alias-admission-v1/run_disabled_alias_admission_gate.mjs`

It proves:

- all 3/3 disabled READ aliases reject during discovery as `OPERATION_BLOCKED`;
- each maps to `pre_execution_error` with `external_request_executed=false`;
- actual candidate `processBatchQueue()` stores the local result, advances the queue and finalizes with **zero provider calls**;
- no `BATCH_REQUEST_STARTED` appears on the disabled path;
- enabled `seller_product_list` remains an executable positive control;
- actual managed launcher terminalizes uncaught manual and autorun processor failures through existing terminal writers.

Representative markers:

- `REG_DISABLED_ALIAS_DISCOVERY_PRE_EXECUTION_REJECT_PASS`
- `REG_DISABLED_ALIAS_TO_PRE_EXECUTION_ERROR_MAPPING_PASS`
- `REG_DISABLED_ALIAS_BATCH_LOCAL_FINALIZATION_PASS`
- `REG_DISABLED_ALIAS_ZERO_PROVIDER_REQUEST_E2E_PASS`
- `REG_ENABLED_ALIAS_POSITIVE_CONTROL_PASS`
- `REG_BATCH_UNCAUGHT_MANUAL_TERMINALIZATION_PASS`
- `REG_BATCH_UNCAUGHT_AUTORUN_TERMINALIZATION_PASS`
- `REG_BATCH_PROCESSOR_POSITIVE_CONTROL_PASS`
- `REG_DISABLED_ALIAS_ADMISSION_GATE_PASS`

Certification run before final documentation commit:
`34114776017`

- Linux full regression: PASS
- Windows full regression: PASS
- exact package: PASS

A final GATE-35 run on the documentation-final HEAD remains mandatory before handoff.

## Dependency closure

The replacement repair audits registry metadata, normalize/preflight/discovery, discovery-to-entry mapping, local guidance/pre-execution result storage, manual/autorun admission, all six launch/recovery consumers, durable owner state, existing terminal writers, request accounting, guidance/currentness, privacy/redaction/security and exact package materialization.

```text
Historical closed-set audit: PASS
First-failure-stop guard: PASS
Unaccounted dependencies: 0
Stale assumptions: 0
Available-but-unverified dependencies: 0
```

Live-only items remain `PENDING POST-INSTALL`:

- installed ChatGPT delivery of the local disabled-alias result;
- actual BUSY -> READY restoration;
- separate enabled-operation positive-control provider request/accounting.

## Correct installed LIVE acceptance

For the exact disabled finance command, PASS means:

1. local `OPERATION_BLOCKED` result;
2. `external_request_executed=false`;
3. physical business request count `0`;
4. no hidden retry/pagination/fanout/polling;
5. no `BATCH_REQUEST_STARTED` for the disabled alias;
6. terminal delivery/result path completes;
7. Bridge returns to READY;
8. no indefinite BUSY.

Then run one separate execution-enabled read positive control and require at most one physical business request with truthful accounting.

Required final live marker:
`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_TERMINALIZATION_PASS`

## Active-work relationship

`CAP-24` remains frozen at `2200/9519` placement rows.

After this shared regression obtains LIVE PASS, resume CAP-24 from that preserved cursor. Do not restart it from zero.
