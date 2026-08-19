# Ozon Bridge v0.1.19 — authority-materialized evidence-ledger full gate RERUN20

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN20`

# RERUN20 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.
Repository: `MaksimUnimax/blood_sand`.
Codex is the independent validator. Production/candidate are immutable.

This is ONE clean consolidated full-gate execution. Do not resume RERUN19. Do not run a preflight, forensic run, smoke run, intermediate validator, or intermediate operator result.

## Read completely before constructing anything

1. Permanent gate:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
exact Git blob `28c82b263e6cbd01c744cbfc046241837f1d253e`.

2. Mandatory executable evidence manifest:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_EXECUTABLE_EVIDENCE_MANIFEST_2026-08-19.md`
commit `2164077863f4dc7d3ee8ec18620ace25e5053c40`
exact Git blob `3c0a935d02bb9d930088eb069313dbb01ef1520d`.

3. Full RERUN19 validation semantics/coverage plan:
`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_PRE_OPERATOR_FULL_CODEX_GATE_COMPOSER_WAIT_RERUN19_2026-08-19.md`
commit `494bbbf2d429877a868380581f2627e6a430eed8`
Git blob `457e843b0050f108837560e1e2d41d47bbbddf51`.

4. Mandatory authority transport correction:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/AUTHORITY_MATERIALIZATION_TRANSPORT_CORRECTION_2026-08-19.md`
commit `3df0803855601c9008ad95b671069fe89e1a9613`.

5. RERUN19 failed report, architecture evidence only:
`af2b669d642cd8644f779091e6c851c2256a4758`.

RERUN20 preserves every functional requirement, E1-E8 evidence requirement, browser/runtime assertion, block PASS rule, network-zero rule, and packaging interlock from RERUN19. The ONLY validation-semantic correction is authority-byte transport as specified in `3df080...`, plus the zero-ledger sanity guard below.

## RERUN19 exact failure to remove

RERUN19 failed before gate enumeration because the runner assumed the local checkout already contained validation commit `216407...` and executed `git show <commit>:<path>`. Live GitHub proves that commit/path/blob exists; the local Git object database simply did not contain it.

RERUN20 MUST NOT require validation-only authority commits/blobs to be locally fetched.

## Authority preparation — allowed before the ONE runner invocation

This step is byte preparation only, not validation execution.

Create a fresh isolated directory:
`authority-bundle-rerun20/`

Using live GitHub, materialize exact bytes for every pinned validation-only authority needed by the consolidated runner when that authority is not guaranteed to exist in the local Git object database.

Mandatory bundle entries include at least:

- permanent gate blob `28c82b263e6cbd01c744cbfc046241837f1d253e`;
- executable evidence manifest blob `3c0a935d02bb9d930088eb069313dbb01ef1520d`;
- E1 blobs:
  - `ced9b470a6d4dd143303144b3db76888924358c2`
  - `401fbe78bbe921affa3adb6f1ddf0cf973a899e2`
  - `10638ac5c70e07af7f68e51259113e8be63289f4`
  - `42a8e9ee07138eadf62cad80fa584fa532cfc65f`
- E2 blobs:
  - `b056c2d2b0a6189d310b99944bf14501cc15a6d7`
  - `18fc993168945659ae22150dcad23d60677a4638`
- E3 historical executable blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`;
- E4 historical executable blob `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`;
- any additional exact validation-only blob explicitly required by the RERUN19 plan/evidence manifest and not present locally.

Create `authority-bundle.json` with repository/source commit+path where applicable, expected Git blob SHA, local filename, byte length, and SHA-256 for each item.

During authority preparation:
- do NOT execute candidate code or harnesses;
- do NOT launch Chrome;
- do NOT perform provider/ChatGPT/Performance requests;
- do NOT package;
- do NOT modify checkout/production/candidate/CFT source/dependencies/credentials/operator profile.

## Exact top-level executable

Create fresh:
`RERUN20_EVIDENCE_LEDGER_FULL_GATE_RUNNER.mjs`

Execute it exactly once as the single consolidated full-gate process.
Do not import or execute RERUN18/RERUN19 top-level runners.

Pass the repository root and authority-bundle directory explicitly as arguments.

## Phase 0 — mandatory authority identity + complete ledger + implementation completeness

Before Phase A or any functional execution, the runner MUST:

1. pass `node --check` and record runner SHA-256;
2. independently read `authority-bundle.json` and every bundle file;
3. for every bundle item independently compute canonical Git blob SHA as:
   `SHA1("blob " + byteLength(bytes) + "\0" + bytes)`;
4. require exact match to the pinned expected Git blob for every item;
5. independently recompute byte length and SHA-256 and require exact match to bundle metadata;
6. print `RERUN20_AUTHORITY_BUNDLE_IDENTITY_PASS` only after all mandatory authority identities PASS;
7. consume the permanent gate and evidence manifest from the verified materialized bytes, NOT via an unconditional local `git show`/`git cat-file` dependency;
8. preserve all RERUN19 static control-flow, A->B->C->D->E, raw-PAGE/direct-worker, forbidden API, mutable-discovery, helper implementation-completeness, E1-E8 and packaging reachability checks;
9. mechanically enumerate every applicable permanent-gate bullet under blocks 01-15;
10. seed exactly one ledger entry for each applicable bullet;
11. require `seeded_ledger_entries > 0`;
12. require every block B01 through B15 has `required_count > 0`;
13. only then calculate `assertion_ledger_missing_count`; a zero value with zero seeded entries is forbidden and is HARNESS_ERROR;
14. require zero duplicate/unmapped permanent-gate bullets and zero missing ledger entries;
15. require executable evidence providers E1-E8 exactly as in RERUN19/evidence manifest;
16. require block status be derived only from its ledger entries;
17. require packaging code unreachable until blocks 01-15 are literal PASS.

Print exactly:
`RERUN20_PHASE0_LEDGER_AND_IMPLEMENTATION_COMPLETENESS_PASS`
only when ALL Phase-0 requirements above PASS.

If Phase 0 fails: classify HARNESS_ERROR, Phase A/B NOT_RUN, blocks 01-15 NOT_PROVEN, block16 NOT_RUN, no ZIP, publish the single final report and STOP.

## Phases A-E

After Phase0 PASS, execute **all Phases A, B, C, D and E exactly according to the full RERUN19 plan `494bbbf...`**, with these substitutions only:

- runner name is `RERUN20_EVIDENCE_LEDGER_FULL_GATE_RUNNER.mjs`;
- all validation-only authority reads use the verified authority bundle when local Git objects are absent;
- phase/result markers use `RERUN20_` instead of `RERUN19_` where they are top-level orchestration markers;
- no RERUN19 execution evidence is carried forward;
- RERUN18/RERUN19 ZIPs are invalid and may not be reused.

Everything else is unchanged and mandatory, including:

- exact candidate reconstruction and hashes;
- protected 15 byte-identical;
- exact CFT reconciliation/environment;
- raw PAGE + deterministic ServiceWorker activation + direct worker CDP/raw fallback;
- full E1-E8 current execution;
- full strict-command/security/entitlement/planner/quota/verifier/cache/common-batch/delivery/UI/Performance matrix;
- complete pinned composer-wait browser assertions;
- complete block-15 browser/runtime matrix;
- assertion-ledger evidence for every applicable permanent-gate bullet;
- zero real Ozon, Performance and ChatGPT requests;
- zero operator actions.

No phase-marker alone may pass a block.
Historical PASS text never counts as current execution evidence.

## Packaging interlock

After all functional/browser execution, mechanically aggregate B01-B15.

If ANY block 01-15 is not literal PASS:
- print `RERUN20_PACKAGING_FORBIDDEN_NOT_ALL_BLOCKS_PASS`;
- block16=`NOT_RUN`;
- no ZIP creation;
- publish one final report and STOP.

Only if all B01-B15 are literal PASS, execute the exact runtime packaging interlock from the evidence manifest before any package operation.

Then package only the same tested 17-file tree, create a NEW ZIP, fresh-extract to a NEW directory, verify all 17 files byte-for-byte, exact worker/content hashes, JS syntax, manifest parse and zero drift. Only then block16=PASS.

Only if blocks 01-16 are all literal PASS emit exactly:
`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`.

## Final report

Publish exactly one final RERUN20 report on a validation-only branch. Include:

- runner SHA-256;
- authority bundle inventory with expected/recomputed Git blob SHA and SHA-256;
- Phase0 authority/ledger/implementation result;
- seeded ledger total and B01-B15 required/executed/passed/failed/missing counts;
- every helper/port/adapted harness SHA and authorized diff;
- every required E1-E8 marker/equivalent mapping actually executed in this run;
- Phase A/B/C/D/E statuses;
- block01..block16 statuses;
- packaging interlock result;
- zero network/operator counters;
- package path/SHA/fresh-extract identity only if packaging legally ran;
- umbrella marker only if all 01-16 PASS.

Then STOP and return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN20_RESULT

verdict: <RERUN20_PASSED|RERUN20_FAILED>
classification: <NONE|HARNESS_ERROR|ENVIRONMENT_ERROR|PRODUCTION_BEHAVIOR_FAILURE|...>
runner_sha256: <sha256>
authority_bundle_identity: <PASS|FAIL>
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
real_ozon_requests: <integer>
real_performance_requests: <integer>
real_chatgpt_requests: <integer>
operator_browser_actions: <integer>
package_path: <path|NONE>
package_sha256: <sha256|NONE>
fresh_extract_byte_identical: <PASS|FAIL|NOT_RUN>
umbrella_marker: <OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT>
report_branch: <branch>
report_commit: <sha>
```
