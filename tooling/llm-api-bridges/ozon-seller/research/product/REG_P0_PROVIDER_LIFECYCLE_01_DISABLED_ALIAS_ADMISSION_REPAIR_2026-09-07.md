# REG-P0-PROVIDER-LIFECYCLE-01 — disabled-alias admission replacement repair

Date: 2026-09-07
Branch: `repair/ozon-disabled-alias-admission-2026-09-07`
Base authority: `bf7168998d64b7b8007e7a02791856c73d70b34b`
Runtime repair commit: `d97ec75c5a11acd3d0816bf5a5109b23a573fe2f`
Status: `EXACT_TRIGGER_PROVEN__REPLACEMENT_PATCH_PREHANDOFF_PASS__LIVE_PENDING`

## Exact reproducer

```text
OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}
```

The alias is intentionally non-executable in the current registry:

- `execution_enabled:false`
- `currentness:sunset_2026_09_08`
- `guidance_visibility:hidden`
- `template_runnable:false`

Therefore the correct installed outcome is a **local terminal `OPERATION_BLOCKED` result with zero provider requests**, not a successful provider call.

## Proven root cause

The exact failure chain was:

```text
execution-disabled READ alias
-> parseCommand / normalizeCommand PASS
-> discoverCommands emitted ok:true
-> batchEntryFromDiscovery emitted kind=command,status=pending
-> executable manual/autorun batch admission
-> capability/query planning
-> prepareProviderQuotaForCommand
-> preflightExecution
-> OPERATION_BLOCKED
-> detached batch promise rejection
-> owner could remain non-terminal/BUSY
```

`OzonContract.preflightExecution()` is the exact producer of `OPERATION_BLOCKED` when `meta.execution_enabled !== true`.

DEFECT-015 correctly tested direct preflight rejection but did not cover the integrated `discoverCommands -> batchEntryFromDiscovery -> processBatchQueue` path.

Pre-fix workflow run `34113164571` reproduced the defect deterministically: `finance_transaction_list_v3` was discovered as `ok:true` although disabled.

## Replacement repair

### `shared/ozon_contract.js`

`discoverCommands()` now executes policy preflight after parse/normalize and before emitting executable discovery:

```js
const command = parseCommand(commandText);
preflightExecution(command);
discovered.push(...);
```

`normalizeCommand()` remains available for metadata/currentness/parameter validation. Disabled aliases instead produce `ok:false`, `code=OPERATION_BLOCKED` and are routed into the existing local pre-execution path.

Current disabled READ closed set is exactly:

1. `fbs_carriage_available_list`
2. `fbs_stock_by_warehouse_v1`
3. `finance_transaction_list_v3`

No finance-only special case was added.

### `service_worker.js`

All six detached manual/autorun batch launch sites use one `launchBatchProcessor()` wrapper:

- manual admission;
- manual quota wake;
- manual recovery;
- autorun admission;
- autorun quota wake;
- autorun recovery.

Uncaught failures reuse existing terminal writers:

- manual -> `failManualBatch()`;
- autorun -> `markRunError()`.

The wrapper adds no retry, replay, pagination, polling, fanout, provider call or new durable state type.

The failed previous candidate's provider transport-timeout changes were **not restored**.

## Deterministic regression authority

Permanent gate:

`validation/disabled-alias-admission-v1/run_disabled_alias_admission_gate.mjs`

The gate executes candidate code and proves:

- all 3/3 disabled READ aliases reject in discovery as `OPERATION_BLOCKED`;
- normalization remains available and execution preflight remains fail-closed;
- actual `batchEntryFromDiscovery()` maps disabled discovery to `pre_execution_error`;
- `external_request_executed=false`;
- actual `processBatchQueue()` consumes the disabled finance entry, stores the local result, advances `next_index`, returns `request_state=idle`, finalizes exactly once and performs **zero provider calls**;
- no `BATCH_REQUEST_STARTED` occurs on that path;
- enabled `seller_product_list` remains executable as positive control;
- actual `launchBatchProcessor()` terminalizes manual uncaught failure through `failManualBatch()`;
- actual `launchBatchProcessor()` terminalizes autorun uncaught failure through `markRunError()`;
- normal processor success remains normal.

Required PASS markers:

- `REG_DISABLED_ALIAS_REGISTRY_CLOSED_SET_PASS`
- `REG_DISABLED_ALIAS_NORMALIZATION_METADATA_PASS`
- `REG_DISABLED_ALIAS_DISCOVERY_PRE_EXECUTION_REJECT_PASS`
- `REG_DISABLED_ALIAS_TO_PRE_EXECUTION_ERROR_MAPPING_PASS`
- `REG_DISABLED_ALIAS_BATCH_LOCAL_FINALIZATION_PASS`
- `REG_DISABLED_ALIAS_ZERO_PROVIDER_REQUEST_E2E_PASS`
- `REG_DISABLED_ALIAS_ZERO_PROVIDER_PATH_STATIC_PASS`
- `REG_ENABLED_ALIAS_POSITIVE_CONTROL_PASS`
- `REG_BATCH_UNCAUGHT_MANUAL_TERMINALIZATION_PASS`
- `REG_BATCH_UNCAUGHT_AUTORUN_TERMINALIZATION_PASS`
- `REG_BATCH_PROCESSOR_POSITIVE_CONTROL_PASS`
- `REG_DISABLED_ALIAS_ADMISSION_GATE_PASS`

Full certification run `34115028073` passed Linux full regression, Windows full regression and exact package verification after the common-pool documentation update. This status-sync commit is documentation-only; the permanent workflow is required to pass again on the final handoff HEAD, and that final run is the handoff authority.

## Dependency audit

Root changed behavior:
`execution-disabled READ command discovery/admission + generic uncaught batch terminalization`.

Affected dependency inventory:

1. registry `execution_enabled` producer;
2. registry `currentness` producer;
3. registry `guidance_visibility` producer;
4. `normalizeCommand()` parser/introspection consumer;
5. `preflightExecution()` policy authority;
6. `discoverCommands()` execution-discovery boundary;
7. `batchEntryFromDiscovery()` discovery-to-entry conversion;
8. `batchErrorEntry()` local error materialization;
9. `localGuidanceResult()` sanitized local result;
10. manual admission durable owner;
11. autorun admission durable owner;
12. `processBatchQueue()` local pre-execution store/finalization;
13. manual quota wake;
14. autorun quota wake;
15. manual recovery;
16. autorun recovery;
17. `failManualBatch()` terminal path;
18. `markRunError()` terminal path;
19. provider/request accounting;
20. guidance/currentness visibility;
21. late execution/error builders using preflight;
22. provider transport non-dependency for this replacement patch;
23. privacy/redaction/SSRF/credential boundaries;
24. permanent deterministic/cross-platform tests;
25. exact packaged production copy.

Lifetime classification:

- registry/contract code: packaged module-static runtime;
- manual/autorun owner and batch entries: durable `chrome.storage.local`;
- batch `singleFlight`: service-worker memory only, not durable truth;
- disabled-path provider execution: absent by construction;
- diagnostics: observational only.

Secondary sweep results:

- current disabled READ aliases: 3/3 covered;
- preflight authority unchanged;
- hidden/currentness policy unchanged;
- late error builders are unreachable for newly rejected disabled aliases;
- six detached processor consumers covered by one terminal wrapper;
- existing manual/autorun terminal writers reused;
- enabled positive discovery preserved;
- disabled-path provider request cardinality = 0;
- intersecting DEFECT-015/read-effect/provider/report/session/XLSX regressions included in the permanent CI family;
- runtime delta from base is limited to `service_worker.js` and `shared/ozon_contract.js`;
- temporary patch-driver and mutating apply workflow removed before final certification.

Dependency closure:

```text
Historical closed-set audit: PASS
First-failure-stop guard: PASS
Unaccounted dependencies: 0
Stale assumptions: 0
Available-but-unverified dependencies: 0
```

Live-only dependencies remain `PENDING POST-INSTALL`:

- actual installed ChatGPT delivery of local `OPERATION_BLOCKED`;
- actual BUSY -> READY UI restoration;
- separate execution-enabled read positive control with truthful physical-request accounting.

## Pre-handoff certification contract

Permanent workflow:
`.github/workflows/ozon-disabled-alias-admission-regression-2026-09-07.yml`

It requires:

- syntax checks;
- exact disabled-alias E2E gate;
- full available `read-effect-repair-v1/run_*.mjs` family;
- dependency/runtime boundary assertions;
- Linux full PASS;
- Windows full PASS;
- exact deterministic 21-file package;
- fresh extraction tree equality;
- byte-for-byte equality;
- recorded SHA-256.

No real provider request is executed by pre-handoff certification.

## Installed LIVE acceptance — pending

After installing the exact final package, rerun the exact disabled finance command.

PASS requires:

1. local `OPERATION_BLOCKED` result;
2. command is not admitted as executable business command;
3. `external_request_executed=false`;
4. physical business request count `0`;
5. no `BATCH_REQUEST_STARTED` for the disabled alias;
6. no hidden retry/pagination/fanout/polling;
7. batch completes terminal result/delivery handling;
8. Bridge returns to READY;
9. no indefinite BUSY.

Then run a separate execution-enabled read positive control and require at most one physical business request with truthful accounting.

Required final live marker after both sides pass:
`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_TERMINALIZATION_PASS`

## CAP-24 relationship

CAP-24 remains frozen at placement cursor `2200/9519` while this shared regression is open.

After shared regression LIVE PASS, resume CAP-24 from `2200/9519`. Do not restart from zero.
