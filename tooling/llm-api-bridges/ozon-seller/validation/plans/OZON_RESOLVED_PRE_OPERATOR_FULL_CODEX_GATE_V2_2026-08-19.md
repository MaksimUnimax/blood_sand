# Ozon Bridge v0.1.19 — resolved standalone pre-operator full Codex gate V2

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_RESOLVED_FULL_GATE_V2_JOB`

# RESOLVED V2 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

Development branch:
`dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

Project:
`tooling/llm-api-bridges/ozon-seller/`

Codex is the independent validator. Production/candidate are immutable.

This V2 job replaces the failed resolved construction job and the entire RERUN11-RERUN22 orchestration chain. Do not execute or inherit any prior RERUN runner/plan/bundle/package, and do not execute the prior resolved standalone plan at `43103cc9...`.

The prior resolved report `9884a4aed413dc93d6cd6ef8ad7f09d8b57b5dfa` is harness-error evidence only. It contains no production failure evidence. Its three primary failures were authority materialization mismatches; its other three failures were derivative blockers.

This job has:

1. an internal validation-construction/audit stage that may iteratively repair validation-only helper/runner defects without operator interaction; then
2. exactly one consolidated candidate full-gate execution; then
3. exactly one final report/result.

## 1. Direct authorities — verify as raw Git objects

Read/verify these exact authorities:

### A. Permanent living gate

Path:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Exact Git blob:
`28c82b263e6cbd01c744cbfc046241837f1d253e`

### B. Resolved direct authority + fixed 164-ledger

Path:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_RESOLVED_AUTHORITY_LEDGER_2026-08-19.md`

Commit:
`7d544b75bf31941af497064d7ae9ce170bda7225`

Exact Git blob:
`852b805b23b10fa53054ee7714ab04222bcc1c6c`

Exact bytes:
`23686`

### C. Resolved construction/non-fail-fast execution contract

Path:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_RESOLVED_EXECUTION_CONTRACT_2026-08-19.md`

Commit:
`979b3b963d2f5888f272d389578c05053dc1f482`

Exact Git blob:
`d366b466f32a6213bb4a139b120bf071c203cda4`

Exact bytes:
`16910`

### D. Raw-Git-object transport authority

Path:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_RESOLVED_GIT_OBJECT_TRANSPORT_2026-08-19.md`

Commit:
`88a408a29a4be7d9a604dcc4f5e2f0adf40aa6d7`

Exact Git blob:
`b99779cf79de84388ad747a12dea9faff9f20f34`

### E. Binary-safe Git object materializer

Path:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/RESOLVED_GIT_OBJECT_MATERIALIZER.mjs`

Commit:
`6d7db624247ab98de2a10dfb849e6f03ccc1d811`

Exact Git blob:
`195862c990a06879835683224630a6b97ff56c84`

Exact bytes:
`3195`

Exact SHA-256:
`d203b563d8a372bcf6804ba0a5cf19e7d1439a918783b1740f1c8ecc132e2b5d`

The old resolved standalone plan blob `6b3ffd121...` is NOT an authority input for V2 and does not need to be materialized or verified.

## 2. Mandatory binary-safe authority bootstrap

The failure in report `9884a4...` must not repeat.

Before any authority content is trusted:

1. use the local Git repository only as an object database;
2. `git fetch` the development branch and exact authority commits needed by A-E and the direct commits named inside authority B;
3. do not checkout/reset/switch the candidate working tree to materialize authority content;
4. verify each path+commit with `git rev-parse <commit>:<path>` or equivalent and require the expected blob;
5. obtain authority bytes only with `git cat-file blob <exact-blob-sha>` captured as binary bytes/Buffer with `shell:false`;
6. independently recompute `SHA1("blob " + byteLength + "\0" + rawBytes)` and require the same Git blob;
7. require pinned size/SHA-256 where provided;
8. direct-buffer write/readback must remain byte-identical.

Forbidden authority transports:

- connector-decoded text;
- copied chat/tool text;
- PowerShell text pipelines;
- HTTP text decode/re-encode;
- JSON round trips;
- newline/Unicode normalization;
- working-tree bytes subject to Git filters/autocrlf;
- any string-based rewrite of pinned authority bytes.

Bootstrap the materializer itself through raw Git object bytes. Do not obtain it through the failed text path. A minimal binary Node bootstrap using `spawnSync('git', ['-C', repo, 'cat-file', 'blob', sha], {encoding:null,shell:false})` is allowed solely to extract the pinned materializer blob, after which the materializer must pass `node --check` and exact blob/size/SHA-256 verification.

A text/connector materialization mismatch is a FIXABLE HARNESS TRANSPORT DEFECT. Do not stop the job because of such a mismatch. Switch to raw Git object transport and continue Stage 1.

Stage 1 may stop before candidate execution only when raw Git-object authority verification itself genuinely cannot be satisfied after exact fetch, or another construction defect cannot be fixed without production/dependency/system changes or assertion weakening.

## 3. Stage 1 — complete internal validation construction/audit

Create a fresh absolute workspace with unique nonce. No prior RERUN or prior resolved workspace/profile/package may be reused.

Materialize every direct authority named by B using the raw-Git-object rule above. Verify all authority identities and all required composites in one pass.

Then construct the complete helper suite required by authority C, including:

- H01_INTEGRITY
- H02_04_CONTRACT_CAPABILITY_SECURITY
- H05_PLANNER_PROJECTION
- H06_07_QUOTA_VERIFIER
- H08_CACHE_PREFETCH
- H09_BATCH_CORE
- H10_15_BROWSER_RAW_CDP
- H12_OFF_ON_DEEP
- H14_PERFORMANCE
- H_E1_TARGETED
- H_E3_WORKER
- H_E4_PROTECTED

All requirements from authority C remain mandatory, including E2/E3/E4/E5 adaptations, raw-CDP browser architecture, deep OFF->ON checks, Performance checks, lifecycle checks and complete failure aggregation.

Run the complete construction compiler across every helper and top-level runner. It must inspect all items and collect the complete defect set rather than stop at first defect.

Required construction readiness includes at minimum:

- every authority raw-Git identity PASS;
- repair/E1/E2 composite identities PASS;
- E1 part02 exact blob `10638ac5c70d07af7f68e51259113e8be63289f4`;
- every helper and runner `node --check` PASS;
- fixed ledger total exactly 164;
- block counts exactly `11,9,9,10,8,18,7,13,9,10,13,26,10,4,7`;
- every ledger id mapped to executable current-run evidence;
- zero duplicate/unmapped/missing ledger ids;
- no marker-only/historical-text-only behavioral evidence;
- no forbidden browser/worker APIs;
- no stale RERUN paths/packages/ids;
- candidate-drift guards around helper families;
- non-fail-fast child-helper aggregation implemented;
- packaging structurally unreachable until B01-B15 literal PASS.

If a validation-only helper/runner defect is found, repair it locally inside this same job, rerun construction audit, and continue until the complete unresolved defect set is zero.

Do not publish intermediate helper iterations. Do not ask the operator to rerun for fixable validation-only defects.

Only after complete Stage-1 PASS print:

`OZON_RESOLVED_V2_CONSTRUCTION_AUDIT_PASS`

If Stage 1 cannot be completed under the allowed validation-only scope, publish one final complete construction failure report and STOP without candidate execution. Return the full unresolved defect set, not a first-error result.

## 4. Stage 2 — exactly one consolidated candidate gate execution

Only after Stage-1 PASS, create exactly one fresh top-level runner:

`OZON_RESOLVED_V2_FULL_GATE_RUNNER.mjs`

Execute it exactly once.

The runner must implement authority C in full:

- Phase A exact frozen artifact + exact composer repair reconstruction and B01;
- Phase B exact accepted CFT/no-sandbox/raw-PAGE/direct-worker-CDP substrate;
- Phase C all current non-browser helper families;
- Phase D complete current browser/runtime helper;
- mechanical aggregation of all 164 B01-B15 assertions;
- Phase E package only if B01-B15 all literal PASS.

### Non-fail-fast requirement

Ordinary functional/harness/environment failures must not terminate the run immediately.

Run every independent safe helper and assertion that can still execute. Record dependent assertions as `BLOCKED_BY:<reason/id>`.

Examples:

- browser substrate FAIL must not prevent safe non-browser VM/static helpers;
- one helper nonzero exit must not prevent independent helpers;
- one functional block FAIL must not prevent independent later blocks;
- collect all safely available environment diagnostics in the same run.

Hard abort only for safety/integrity breaches enumerated by authority C, including unauthorized external network, immutable-source/CFT modification, candidate drift after freeze, or operator profile/credential exposure.

## 5. Explicit mandatory current-run gaps

The current execution must explicitly prove, not infer:

- B12 binding preserved across OFF->ON;
- credentials/settings outside Manual flag preserved;
- cache unchanged;
- quota state, last_provider_request_at, next_allowed_at, 60000/5000/65000 and seeded Retry-After state unchanged;
- cancellation/re-enable zero provider calls;
- cold-cache same-Seller request after OFF->ON before persisted due performs zero provider calls, due not shortened, one mocked call only after due;
- Manual toggle available for pending claimed Manual cancellation when Autorun not blocker;
- normal empty-composer one insertion;
- staged Send at most once;
- later ordinary user Send untouched;
- disabled Send/Stop/Unknown/Microphone never treated as Send;
- wrong-owner composer never used;
- no global current-conversation assumption;
- Performance host/auth preserved, zero Seller probe, no Seller quota/cache semantics;
- lifecycle/restart does not duplicate provider/insertion/Send;
- complete quota-countdown/ChatGPT/Alice/native-Copy/two-owner behavior;
- complete composer-wait behavior with exact banner `Очистите поле ввода, чтобы получить отчёт.`.

## 6. Effective browser contract

Use only:

- Node 24.12.0
- Puppeteer 25.4.0
- CFT 151.0.7922.47
- canonical inventory 308 / `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`
- fresh byte-identical CFT copy
- copied setup once, shell:false, exit 78
- exact 11 args from authority B, including validator-only `--no-sandbox`, no `--disable-gpu-sandbox`, no extras
- verify actual args before install
- installExtension + extensions using returned id
- raw Target.createTarget PAGE
- Runtime/Page/Fetch
- Fetch interception before supported-origin navigation
- zero real ChatGPT/Alice/Ozon/Performance network
- no browser.newPage
- dual-route worker discovery
- PAGE-session ServiceWorker startWorker once only when absent
- no triggerAction
- direct worker.client.send Runtime/Network first, raw same-worker CDP fallback
- no worker.evaluate/evaluateHandle
- post-worker browser liveness.

## 7. Ledger and package interlock

For B01-B15 report required/executed/passed/failed/blocked/missing.

Literal block PASS requires every required assertion `executed:true, pass:true` and failed=blocked=missing=0.

If any B01-B15 is not literal PASS:

- B16 = NOT_RUN
- create no ZIP
- emit `OZON_RESOLVED_V2_PACKAGING_FORBIDDEN_NOT_ALL_BLOCKS_PASS`
- publish the one final report.

Only B01-B15 all PASS may enter packaging.

Build a NEW ZIP from exactly the tested 17-file tree, fresh-extract, byte-verify every production file, rerun JS syntax/manifest/inventory checks and record new SHA-256.

Only B01-B16 all PASS may emit:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

## 8. One final report/result only

Create one report branch from the exact commit containing this V2 standalone prompt:

`validation/ozon-resolved-v2-pre-operator-full-gate-2026-08-19`

Publish exactly one report-only commit/file. Do not publish temporary helper construction iterations.

The report must include complete failure sets rather than first-error-only reporting.

After publication STOP and return exactly:

`OZON_PRE_OPERATOR_RESOLVED_V2_FULL_GATE_RESULT`

with at minimum:

```text
verdict: PASS|FAILED
classification: NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR|SAFETY_ABORT|MULTIPLE
construction_audit: PASS|FAIL
construction_unresolved_defects: <n>
authority_transport: RAW_GIT_OBJECTS|FAIL
authority_identity_failures: <n>
materializer_blob: 195862c990a06879835683224630a6b97ff56c84
materializer_sha256: d203b563d8a372bcf6804ba0a5cf19e7d1439a918783b1740f1c8ecc132e2b5d|FAIL
runner_sha256: <sha|NONE>
runner_execution_count: 0|1
candidate_reconstruction: PASS|FAIL|NOT_RUN
browser_substrate: PASS|FAIL|NOT_RUN
ledger_total_required: 164
ledger_executed: <n>
ledger_passed: <n>
ledger_failed: <n>
ledger_blocked: <n>
ledger_missing: <n>
block_01: PASS|FAIL|NOT_RUN
block_02: PASS|FAIL|NOT_RUN
block_03: PASS|FAIL|NOT_RUN
block_04: PASS|FAIL|NOT_RUN
block_05: PASS|FAIL|NOT_RUN
block_06: PASS|FAIL|NOT_RUN
block_07: PASS|FAIL|NOT_RUN
block_08: PASS|FAIL|NOT_RUN
block_09: PASS|FAIL|NOT_RUN
block_10: PASS|FAIL|NOT_RUN
block_11: PASS|FAIL|NOT_RUN
block_12: PASS|FAIL|NOT_RUN
block_13: PASS|FAIL|NOT_RUN
block_14: PASS|FAIL|NOT_RUN
block_15: PASS|FAIL|NOT_RUN
block_16: PASS|FAIL|NOT_RUN
failure_set_count: <n>
harness_defect_count: <n>
environment_defect_count: <n>
production_assertion_failure_count: <n>
blocked_assertion_count: <n>
real_ozon_requests: 0
real_performance_requests: 0
real_chatgpt_requests: 0
operator_browser_actions: 0
production_modifications: 0
candidate_drift: 0
source_cft_modifications: 0
packaging_interlock: PASS|FAIL|NOT_RUN
package_path: <path|NONE>
package_sha256: <sha|NONE>
fresh_extract_byte_identical: PASS|FAIL|NOT_RUN
umbrella_marker: PRESENT|ABSENT
report_branch: validation/ozon-resolved-v2-pre-operator-full-gate-2026-08-19
report_commit: <sha>
```

Even a synthetic PASS is not logged-in live acceptance. The complete v0.1.19 logged-in live suite remains a separate later operator stage.
