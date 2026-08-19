# Ozon Bridge v0.1.19 — effective-authority evidence-ledger full gate RERUN22

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN22`

# RERUN22 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.
Repository: `MaksimUnimax/blood_sand`.
Codex is the independent validator. Production/candidate bytes are immutable.

This is ONE clean consolidated full-gate execution. Do not resume RERUN20 or RERUN21. Do not run a separate preflight, forensic, smoke run, intermediate validator, or intermediate operator result.

## Authorities — read completely before construction

1. Permanent gate:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
Git blob `28c82b263e6cbd01c744cbfc046241837f1d253e`.

2. Mandatory executable evidence manifest:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_EXECUTABLE_EVIDENCE_MANIFEST_2026-08-19.md`
commit `2164077863f4dc7d3ee8ec18620ace25e5053c40`, Git blob `3c0a935d02bb9d930088eb069313dbb01ef1520d`.

3. Authority materialization correction:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/AUTHORITY_MATERIALIZATION_TRANSPORT_CORRECTION_2026-08-19.md`
commit `3df0803855601c9008ad95b671069fe89e1a9613`.

4. E1 part02 pin correction:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/E1_TARGETED_PART02_BLOB_PIN_CORRECTION_2026-08-19.md`
commit `f4cd3490e417c1915639929fade4d6184a28a04f`.

5. Mandatory effective-identity schema correction:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/AUTHORITY_BUNDLE_EFFECTIVE_IDENTITY_SCHEMA_CORRECTION_2026-08-19.md`
commit `dda7c9a9c4e7c98960da5f3d58d20c12457d5a52`.

6. Full RERUN21 functional/coverage semantics:
`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_PRE_OPERATOR_FULL_CODEX_GATE_COMPOSER_WAIT_RERUN21_2026-08-19.md`
commit `cfaaf383372daeb1aab30a083bc35e0d3a3987ac`.

7. RERUN21 failed report, harness-error evidence only:
`614245b9f99789267efa398d64b3cdcba7bc1c85`.

8. Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`.

RERUN22 preserves every functional requirement, E1-E8 evidence requirement, assertion-ledger rule, browser/runtime assertion, zero-network rule, and packaging interlock from RERUN21/RERUN20/RERUN19. The ONLY new correction is authority-bundle effective-identity schema and fresh-run argument binding from `dda7c9a...`.

## Exact RERUN21 defect to remove

RERUN21 raw E1 part02 bytes were correct and independently recomputed to Git blob:
`10638ac5c70d07af7f68e51259113e8be63289f4`.

But the runner selected a stale legacy `expected_git_blob_sha` field containing the erroneous `...c70e...` value. The exact RERUN21 command also passed `D:\codex\Test\authority-bundle-rerun20`, not a fresh RERUN21 bundle.

RERUN22 MUST NOT contain any runtime precedence/override/fallback choice among multiple expected identity fields.

## Authority preparation — allowed before the ONE runner invocation

Create a FRESH isolated directory exactly dedicated to this run, for example:
`D:\codex\Test\authority-bundle-rerun22-<fresh-nonce>`.

Do not reuse any `authority-bundle-rerun20*` or `authority-bundle-rerun21*` directory.

Materialize all authority/helper bytes required by RERUN21 E1-E8 and the corrections above from live GitHub exact pinned commits/blobs.

Generate a NEW effective bundle manifest for RERUN22. For every materialized item it MUST contain exactly one executable identity field:

`effective_expected_git_blob_sha`

The top-level runner MUST consume ONLY that field for Git-blob verification. It MUST NOT use `expected_git_blob_sha`, `corrected_expected_git_blob_sha`, `override_expected_git_blob_sha`, or a fallback/precedence chain.

Legacy/source-declared values may be retained only as non-executable audit metadata.

For E1 part02 the effective item MUST be:

- effective_expected_git_blob_sha = `10638ac5c70d07af7f68e51259113e8be63289f4`
- byte length = `4234`
- SHA-256 = `8d44fc9bb0ac49d7341a11159ba20d07fcd7ffa0f2ab30c7a604636f27cfc570`

The erroneous `10638ac5c70e07af7f68e51259113e8be63289f4` MUST NOT appear in any executable/effective identity field.

Bundle manifest must also record:

- `run_id: RERUN22`
- absolute fresh bundle directory
- fresh run nonce/timestamp or equivalent run-specific marker
- each item repository/source commit/path or source blob
- each item byte length and SHA-256
- each item `effective_expected_git_blob_sha`.

## Exact top-level executable and command binding

Create and execute exactly once:
`RERUN22_EVIDENCE_LEDGER_FULL_GATE_RUNNER.mjs`

The runner invocation MUST receive the freshly created RERUN22 bundle directory as its bundle argument. Before any authority verification, the runner MUST assert:

- expected run id is `RERUN22`;
- bundle manifest run id is `RERUN22`;
- absolute bundle path supplied to runner equals the path recorded inside the bundle manifest;
- supplied bundle path does not contain `rerun20` or `rerun21`;
- no prior-run authority directory is being reused.

Record the exact command in the final report.

## Phase 0 — authority identity then full ledger completeness

Before ledger seed or functional execution:

1. Parse the fresh effective bundle manifest.
2. Require one and only one `effective_expected_git_blob_sha` per materialized item.
3. Independently recompute `SHA1("blob " + byteLength + "\0" + rawBytes)` for EVERY materialized item.
4. Compare ONLY to that item's `effective_expected_git_blob_sha`.
5. For E1 part02 explicitly record:
   - effective expected blob;
   - computed blob;
   - byte length;
   - SHA-256;
   and require exact corrected values.
6. Reconstruct E1 in exact 00+01+02+03 order and require:
   - bytes `21942`;
   - SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.
7. Only after authority identity PASS, perform the full RERUN21 Phase-0 gate unchanged:
   - static/control-flow PASS;
   - implementation completeness PASS;
   - mutable discovery self-test PASS;
   - mechanically enumerate every permanent-gate bullet B01-B15;
   - `seeded_ledger_entries > 0`;
   - every B01-B15 `required_count > 0`;
   - zero duplicate/unmapped/missing permanent-gate bullets;
   - complete E1-E8 executable evidence coverage;
   - packaging unreachable before literal PASS of all blocks 01-15.

Print exactly:
`RERUN22_AUTHORITY_BUNDLE_IDENTITY_PASS`
then
`RERUN22_PHASE0_LEDGER_AND_IMPLEMENTATION_COMPLETENESS_PASS`
only after the corresponding checks PASS.

If Phase0 fails, publish exact item/field/path/expected/computed evidence and STOP as HARNESS_ERROR. Do not launch functional validation or package.

## Phases A-E — FULL unchanged gate

After Phase0 PASS execute the complete RERUN21/RERUN20/RERUN19 semantics in the SAME top-level execution without reduction:

- Phase A: exact candidate reconstruction/integrity; block 01 ledger.
- Phase B: accepted CFT/raw-PAGE/direct-worker-CDP substrate.
- Phase C: complete current-candidate E1/E3/E4/E5/E6/E7/E8 non-browser evidence for blocks 02-14.
- Phase D: complete E2 port plus full browser/runtime matrix and remaining browser-backed ledger for blocks 09-15.
- Mechanically derive block PASS only from current-run assertion ledger entries.
- Historical PASS text is architecture/coverage authority only, never current PASS evidence.

No targeted-only Phase C. No reduced Runtime-smoke Phase D.

## Packaging interlock

If ANY block 01-15 is not literal PASS:

- block16 = `NOT_RUN`;
- create no ZIP;
- print `RERUN22_PACKAGING_FORBIDDEN_NOT_ALL_BLOCKS_PASS`;
- publish the single final report and STOP.

Only if every block 01-15 is literal PASS may the hard packaging interlock execute.
Then package exactly the same tested 17-file tree, fresh-extract, byte-verify all files, rerun production JS syntax/manifest checks, and set block16 PASS only after all packaging checks PASS.

Emit `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every block 01-16 is literal PASS.

## Safety invariants

- production modifications: 0
- candidate modifications: 0
- source CFT modifications: 0
- dependency updates: 0
- operator Chrome/profile: forbidden
- real Ozon requests: 0
- real Performance requests: 0
- real ChatGPT requests: 0
- operator browser actions: 0

## Single final result

Publish exactly one final RERUN22 report and return exactly one result schema:

`OZON_PRE_OPERATOR_FULL_GATE_RERUN22_RESULT`

Include at minimum:

- verdict/classification;
- runner SHA-256;
- exact command and bundle absolute path;
- bundle run id and freshness check;
- authority bundle identity;
- E1 corrected part02 identity;
- E1 concatenated identity;
- Phase0 status and seeded ledger count;
- blocks 01-16;
- packaging interlock;
- zero-network/operator counters;
- package path/SHA/fresh-extract result only if packaging was valid;
- umbrella marker status.

STOP after the single final report/result.