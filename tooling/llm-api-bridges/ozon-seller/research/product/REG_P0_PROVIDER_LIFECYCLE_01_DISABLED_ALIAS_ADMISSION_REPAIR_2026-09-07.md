# REG-P0-PROVIDER-LIFECYCLE-01 — disabled-alias admission replacement repair

Date: 2026-09-07
Branch: `repair/ozon-disabled-alias-admission-2026-09-07`
Base authority: `bf7168998d64b7b8007e7a02791856c73d70b34b`
Runtime repair commit: `d97ec75c5a11acd3d0816bf5a5109b23a573fe2f`
Status: `EXACT_TRIGGER_PROVEN__REPLACEMENT_PATCH_PREHANDOFF_CERTIFICATION_IN_PROGRESS`

## 1. Exact live reproducer

```text
OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}
```

This alias is intentionally not executable in the current registry:

- `execution_enabled: false`
- `currentness: sunset_2026_09_08`
- `guidance_visibility: hidden`
- `template_runnable: false`

The correct installed result for this command is therefore a **local terminal `OPERATION_BLOCKED` result with zero provider requests**, not a successful Ozon provider call.

## 2. Proven root cause

The failure chain was:

```text
execution-disabled READ alias
-> parseCommand / normalizeCommand PASS
-> discoverCommands emitted ok:true
-> batchEntryFromDiscovery emitted kind=command,status=pending
-> manual/autorun executable batch admission
-> capability/query planning
-> prepareProviderQuotaForCommand
-> preflightExecution
-> OPERATION_BLOCKED
-> detached processManualBatch/processAutoBatch rejection
-> owner could remain non-terminal/BUSY
```

The exact `OPERATION_BLOCKED` producer is `OzonContract.preflightExecution()` when `meta.execution_enabled !== true`.

The existing DEFECT-015 gate correctly asserted direct `preflightExecution()` rejection, but did not cover the integrated product path `discoverCommands -> batchEntryFromDiscovery -> processBatchQueue`.

## 3. Pre-fix deterministic reproduction

Workflow run: `34113164571`.

The pre-fix candidate failed exactly at:

`finance_transaction_list_v3: disabled alias must not be admitted as executable command`

Actual discovery state was `ok:true`; required state was `ok:false`.

This is the deterministic pre-fix reproduction for the live defect class.

## 4. Replacement repair

### Runtime file 1 — `shared/ozon_contract.js`

`discoverCommands()` now performs execution preflight after parse/normalize and before emitting `ok:true`:

```js
const command = parseCommand(commandText);
preflightExecution(command);
discovered.push(...);
```

Consequences:

- `normalizeCommand()` remains available for metadata/currentness/parameter validation;
- all registered READ aliases with `execution_enabled:false` fail discovery as `ok:false` / `OPERATION_BLOCKED`;
- `batchEntryFromDiscovery()` routes them into the existing `pre_execution_error` path rather than executable `kind:"command"` state;
- no provider layer is reached.

Current disabled READ closed set is exactly:

1. `fbs_carriage_available_list`
2. `fbs_stock_by_warehouse_v1`
3. `finance_transaction_list_v3`

No alias-specific special case was added.

### Runtime file 2 — `service_worker.js`

All six detached manual/autorun batch launch sites use one `launchBatchProcessor()` wrapper:

- manual admission;
- manual quota wake;
- manual recovery;
- autorun admission;
- autorun quota wake;
- autorun recovery.

The wrapper preserves the existing processor logic. It adds only a terminal catch:

- manual uncaught failure -> existing `failManualBatch()`;
- autorun uncaught failure -> existing `markRunError()`;
- diagnostic -> `BATCH_PROCESSOR_UNCAUGHT`;
- no retry, replay, pagination, polling, provider fanout or new state class.

The previous failed candidate's provider transport timeout changes were **not restored** in this replacement patch.

## 5. Deterministic regression coverage

Permanent gate:

`validation/disabled-alias-admission-v1/run_disabled_alias_admission_gate.mjs`

It proves on the candidate itself:

- exact three-alias disabled READ closed set;
- normalization remains available;
- preflight remains fail-closed;
- discovery returns `ok:false`, `OPERATION_BLOCKED` for every disabled alias;
- actual `batchEntryFromDiscovery` maps each disabled discovery to `pre_execution_error`;
- `external_request_executed=false`;
- enabled `seller_product_list` remains an executable positive control;
- actual `processBatchQueue()` consumes the disabled finance entry, stores the local result, increments `next_index`, returns to `request_state=idle`, calls finalization exactly once and performs **zero provider calls**;
- no `BATCH_REQUEST_STARTED` diagnostic appears on the disabled-alias path;
- actual `launchBatchProcessor()` terminalizes manual uncaught failure through `failManualBatch()`;
- actual `launchBatchProcessor()` terminalizes autorun uncaught failure through `markRunError()`;
- positive processor control returns normally without false failure.

Required markers:

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

## 6. Dependency audit

Root changed behavior:

`execution-disabled READ command discovery/admission + generic uncaught batch terminalization`.

Complete affected dependency inventory:

1. registry `execution_enabled` producer — module-static operation metadata;
2. registry `currentness` producer — module-static operation metadata;
3. registry `guidance_visibility` producer — module-static operation metadata;
4. `normalizeCommand()` — parser/introspection consumer, intentionally unchanged semantically;
5. `preflightExecution()` — execution-policy authority, intentionally unchanged;
6. `discoverCommands()` — execution discovery boundary, repaired;
7. `batchEntryFromDiscovery()` — discovery-to-durable-entry conversion;
8. `batchErrorEntry()` — local pre-execution error materialization;
9. `localGuidanceResult()` — sanitized local result generation;
10. manual admission — durable manual owner in `chrome.storage.local`;
11. autorun admission — durable autorun owner in `chrome.storage.local`;
12. `processBatchQueue()` pre-execution branch — local result store/finalization;
13. manual quota wake — worker-local launch of durable owner;
14. autorun quota wake — worker-local launch of durable owner;
15. manual recovery — worker-local relaunch of durable owner;
16. autorun recovery — worker-local relaunch of durable owner;
17. `failManualBatch()` — existing manual terminal state path;
18. `markRunError()` — existing autorun terminal state path;
19. provider/request accounting — disabled path remains zero-request / external false;
20. guidance/currentness visibility — disabled aliases remain hidden and not re-enabled;
21. downstream execution/error builders that call `preflightExecution()` — unreachable for newly rejected disabled aliases;
22. provider transport — not modified by this replacement repair;
23. privacy/redaction/SSRF/credentials — no new data surface or destination;
24. permanent deterministic tests and cross-platform CI;
25. exact packaged `dist-step7-candidate` copy.

Lifetime classification:

- operation registry/contract functions: packaged module-static runtime;
- manual/autorun owner state: durable `chrome.storage.local`;
- batch `singleFlight`: service-worker memory only and not relied on as durable truth;
- command/result entry: durable inside owner batch;
- provider execution for disabled path: absent by construction;
- diagnostics: observational only, not execution authority.

Boundary invariants:

- no disabled alias becomes `kind:"command"`;
- no disabled alias reaches capability/query/provider execution;
- no hidden provider request or retry;
- manual and autorun use their existing terminal state writers;
- no new host permission, credential path or signed URL handling;
- no provider state mutation in pre-handoff tests.

Secondary defect sweep:

- checked all current `execution_enabled:false` READ aliases: 3/3 covered;
- checked direct preflight authority remains unchanged;
- checked hidden/currentness policy remains unchanged;
- checked late error builders that call preflight: disabled alias no longer reaches them;
- checked all six detached batch launch consumers: managed by one terminal wrapper;
- checked manual and autorun terminal writers: existing `failManualBatch` / `markRunError` reused;
- checked positive enabled alias discovery is preserved;
- checked provider request cardinality on disabled path: zero;
- checked previous read-effect/DEFECT-015/report/session/XLSX regression family through final CI.

Dependency closure:

```text
Historical closed-set audit: PASS
First-failure-stop guard: PASS
Unaccounted dependencies: 0
Stale assumptions: 0
Available-but-unverified dependencies: 0
```

Live-only dependencies:

- actual installed ChatGPT content-script delivery of the local `OPERATION_BLOCKED` result;
- actual UI transition back from BUSY to READY on the installed candidate;
- an independent enabled-operation live positive control proving one explicit command still produces at most one physical provider request.

These remain `PENDING POST-INSTALL` and cannot be converted to LIVE PASS by CI.

## 7. Pre-handoff CI state before final documentation commit

Certification run `34114776017`:

- Linux full regression: PASS;
- Windows full regression: PASS;
- exact 21-file package job: PASS.

The permanent CI runs:

- syntax checks;
- exact disabled-alias E2E gate;
- full available `read-effect-repair-v1/run_*.mjs` family;
- dependency/runtime diff boundary assertions;
- Linux and Windows certification;
- exact deterministic 21-file ZIP build;
- fresh extraction tree equality;
- byte-for-byte source/extraction equality;
- SHA-256 recording.

Because this document and the common regression pool are updated after that run, a new final `GATE-35` run on the final HEAD is still mandatory before handoff.

## 8. Installed LIVE acceptance — still pending

After installing the exact final package, rerun the exact disabled finance command.

PASS requires:

1. command is not admitted as executable business command;
2. local result contains `OPERATION_BLOCKED`;
3. `external_request_executed=false`;
4. physical business request count `0`;
5. no hidden retry/pagination/fanout/polling;
6. batch reaches terminal delivery/result state;
7. Bridge returns to READY;
8. no indefinite BUSY;
9. no `BATCH_REQUEST_STARTED` for the disabled command.

Then run one separate **execution-enabled** read positive control and require at most one physical business request with truthful accounting.

Required live marker after both sides pass:

`REG_P0_PROVIDER_LIFECYCLE_01_LIVE_TERMINALIZATION_PASS`

## 9. CAP-24 relationship

CAP-24 remains frozen at its preserved placement cursor `2200/9519` while this shared P0 regression is open.

After shared regression LIVE PASS, resume CAP-24 from that cursor. Do not restart it from zero.
