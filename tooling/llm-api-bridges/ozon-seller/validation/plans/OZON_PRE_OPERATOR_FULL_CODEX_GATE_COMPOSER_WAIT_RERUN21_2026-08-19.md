# Ozon Bridge v0.1.19 — corrected-authority evidence-ledger full gate RERUN21

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN21`

# RERUN21 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.
Repository: `MaksimUnimax/blood_sand`.
Codex is the independent validator. Production/candidate bytes are immutable.

This is ONE clean consolidated full-gate execution. Do not resume RERUN20. Do not run a separate preflight, forensic, smoke run, intermediate validator, or intermediate operator result.

## Authorities — read completely before construction

1. Permanent gate:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
exact Git blob `28c82b263e6cbd01c744cbfc046241837f1d253e`.

2. Mandatory executable evidence manifest:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_EXECUTABLE_EVIDENCE_MANIFEST_2026-08-19.md`
commit `2164077863f4dc7d3ee8ec18620ace25e5053c40`, Git blob `3c0a935d02bb9d930088eb069313dbb01ef1520d`.

3. Mandatory authority materialization transport correction:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/AUTHORITY_MATERIALIZATION_TRANSPORT_CORRECTION_2026-08-19.md`
commit `3df0803855601c9008ad95b671069fe89e1a9613`.

4. Mandatory E1 part-02 blob-pin correction:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/E1_TARGETED_PART02_BLOB_PIN_CORRECTION_2026-08-19.md`
commit `f4cd3490e417c1915639929fade4d6184a28a04f`, Git blob `daa79a0c6355bdaef5de613711fd46eb27766a58`.

5. RERUN20 full semantics/coverage plan:
`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_PRE_OPERATOR_FULL_CODEX_GATE_COMPOSER_WAIT_RERUN20_2026-08-19.md`
commit `b2625e45916b480ee673cf7efbf911f8e34c38fd`.

6. RERUN19 full evidence-ledger semantics/coverage plan referenced by RERUN20:
`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_PRE_OPERATOR_FULL_CODEX_GATE_COMPOSER_WAIT_RERUN19_2026-08-19.md`
commit `494bbbf2d429877a868380581f2627e6a430eed8`, Git blob `457e843b0050f108837560e1e2d41d47bbbddf51`.

7. Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`.

8. RERUN20 failed report, harness-error evidence only:
`8b51076b2d7a0e67deb5baead7c692cfd8fe9702`.

RERUN21 preserves EVERY functional requirement, E1-E8 evidence requirement, assertion-ledger rule, browser/runtime assertion, zero-network rule, and packaging interlock from RERUN19/RERUN20. The ONLY semantic correction is the E1 `02.mjs.part` Git-blob metadata override specified by `f4cd3490...`.

## Exact RERUN20 failure to remove

RERUN20 correctly materialized E1 `02.mjs.part` as 4234 bytes and independently recomputed Git blob:
`10638ac5c70d07af7f68e51259113e8be63289f4`.

The old evidence manifest contains the one-character typo:
`10638ac5c70e07af7f68e51259113e8be63289f4`.

Live gate-checkpoint metadata proves the correct part set:
- 00: `ced9b470a6d4dd143303144b3db76888924358c2`, 7975 bytes
- 01: `401fbe78bbe921affa3adb6f1ddf0cf973a899e2`, 7907 bytes
- 02: `10638ac5c70d07af7f68e51259113e8be63289f4`, 4234 bytes
- 03: `42a8e9ee07138eadf62cad80fa584fa532cfc65f`, 1826 bytes

Concatenated E1 remains exactly 21942 bytes, SHA-256:
`ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.

Do not change E1 bytes or assertions. Override ONLY the erroneous expected Git-blob metadata for part 02.

## Authority preparation — allowed before the ONE runner invocation

Prepare a fresh isolated `authority-bundle-rerun21/` using live GitHub exact bytes. Do not require validation-only commits/blobs to exist in the local Git object database.

Materialize every authority/helper blob required by RERUN20/RERUN19/E1-E8 plus the pin-correction document itself. For every item record repository, pinned commit/path or blob, expected Git blob, byte length, SHA-256.

For E1 part 02 use ONLY corrected expected Git blob:
`10638ac5c70d07af7f68e51259113e8be63289f4`.

The top-level runner must independently recompute for EVERY materialized item:
`SHA1("blob " + byteLength + "\0" + rawBytes)`
and require exact expected Git blob equality before using the item.

Then independently reconstruct E1 in exact 00+01+02+03 order and require 21942 bytes plus SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.

If any authority identity fails, report exact item/expected/computed/bytes/SHA-256 and stop as HARNESS_ERROR. Do not launch functional validation.

## Exact top-level executable

Create and execute exactly once:
`RERUN21_EVIDENCE_LEDGER_FULL_GATE_RUNNER.mjs`

Do not execute/import any prior RERUN top-level runner.

## Phase 0

Carry forward RERUN20/RERUN19 Phase-0 requirements unchanged, plus:

- authority bundle identity for ALL materialized items must PASS;
- corrected E1 concatenation identity must PASS;
- `seeded_ledger_entries > 0`;
- every B01-B15 must have `required_count > 0`;
- zero duplicate, unmapped, or missing permanent-gate bullets;
- E1-E8 executable evidence providers are present and complete;
- Phase-C/D helpers cannot be reduced source scans/marker-only stubs;
- packaging function is unreachable until literal PASS of every block 01-15.

Print `RERUN21_AUTHORITY_BUNDLE_IDENTITY_PASS` and `RERUN21_PHASE0_LEDGER_AND_IMPLEMENTATION_COMPLETENESS_PASS` only after all Phase-0 conditions pass.

## Phases A-E

Execute the FULL RERUN20/RERUN19 A -> B -> C -> D -> E semantics without reduction:

- Phase A: exact candidate reconstruction/integrity and block 01 ledger;
- Phase B: accepted CFT/raw-PAGE/direct-worker-CDP browser substrate;
- Phase C: complete current-candidate E1/E3/E4/E5/E6/E7/E8 evidence for non-browser portions of blocks 02-14;
- Phase D: complete E2 port plus full browser/runtime matrix and all remaining browser-backed ledger entries for blocks 09-15;
- mechanically derive block PASS only from assertion ledger entries;
- historical PASS text is architecture/coverage authority only, never current PASS evidence.

Do not substitute a targeted-only Phase C or Runtime smoke Phase D.

## Packaging interlock

Initialize block16 `NOT_RUN`.

If ANY block 01-15 is not literal `PASS` after complete execution:
- print `RERUN21_PACKAGING_FORBIDDEN_NOT_ALL_BLOCKS_PASS`;
- keep block16 `NOT_RUN`;
- create no ZIP;
- publish the one final report and STOP.

Only if every block 01-15 is literal PASS execute the hard runtime interlock and then:
- ZIP exactly the tested 17-file production tree;
- exclude validation/tests/development/reports/credentials;
- fresh-extract to a new directory;
- byte-verify every file;
- require exact worker/content hashes;
- rerun production JS syntax and manifest parse;
- set block16 PASS only after all packaging checks PASS.

Emit exactly `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every block 01-16 is literal PASS.

## Safety

- production modifications: 0
- candidate modifications: 0
- source CFT modifications: 0
- dependency updates: 0
- operator Chrome/profile: forbidden
- real Ozon requests: 0
- real Performance requests: 0
- real ChatGPT requests: 0
- operator browser actions: 0

## One final publication only

Report branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun21-2026-08-19`

Report path:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN21_2026-08-19.md`

The report must include:
- runner SHA-256;
- authority-bundle item ledger with expected/computed Git blobs;
- corrected E1 concatenation bytes/SHA;
- Phase0 seeded/required/duplicate/unmapped/missing counts;
- full B01-B15 assertion ledger and per-block required/executed/passed/failed/missing counts if Phase0 passes;
- exact E1-E8 helper source hashes/commands/transport and observed markers/evidence;
- browser substrate details;
- zero-network/operator counters;
- packaging interlock result;
- package path/SHA/fresh-extract identity only if packaging is authorized;
- umbrella marker only if all 01-16 PASS.

After publishing exactly one final report, STOP and return exactly this schema:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN21_RESULT

verdict: <OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|RERUN21_FAILED>
classification: <NONE|PRODUCTION_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR>
runner_sha256: <sha256>
authority_bundle_identity: <PASS|FAIL>
e1_corrected_part02_blob_identity: <PASS|FAIL>
e1_concatenated_identity: <PASS|FAIL>
phase0_ledger_and_implementation_completeness: <PASS|FAIL>
seeded_ledger_entries: <integer>
assertion_ledger_missing_count: <integer>
phase_a: <PASS|FAIL|NOT_RUN>
phase_b: <PASS|FAIL|NOT_RUN>
block_01: <PASS|FAIL|NOT_PROVEN>
block_02: <PASS|FAIL|NOT_PROVEN>
block_03: <PASS|FAIL|NOT_PROVEN>
block_04: <PASS|FAIL|NOT_PROVEN>
block_05: <PASS|FAIL|NOT_PROVEN>
block_06: <PASS|FAIL|NOT_PROVEN>
block_07: <PASS|FAIL|NOT_PROVEN>
block_08: <PASS|FAIL|NOT_PROVEN>
block_09: <PASS|FAIL|NOT_PROVEN>
block_10: <PASS|FAIL|NOT_PROVEN>
block_11: <PASS|FAIL|NOT_PROVEN>
block_12: <PASS|FAIL|NOT_PROVEN>
block_13: <PASS|FAIL|NOT_PROVEN>
block_14: <PASS|FAIL|NOT_PROVEN>
block_15: <PASS|FAIL|NOT_PROVEN>
block_16: <PASS|FAIL|NOT_RUN>
packaging_interlock: <PASS|FAIL|NOT_RUN>
real_ozon_requests: 0
real_performance_requests: 0
real_chatgpt_requests: 0
operator_browser_actions: 0
package_path: <path|NONE>
package_sha256: <sha256|NONE>
fresh_extract_byte_identical: <PASS|FAIL|NOT_RUN>
umbrella_marker: <OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT>
report_branch: validation/ozon-pre-operator-full-gate-composer-wait-rerun21-2026-08-19
report_commit: <sha>
```