# Ozon full-gate authority materialization transport correction

Date: 2026-08-19
Status: `MANDATORY_VALIDATION_TRANSPORT_CORRECTION`
Scope: validation-only. Production/candidate bytes and permanent gate semantics are unchanged.

## Trigger

RERUN19 report commit `af2b669d642cd8644f779091e6c851c2256a4758` failed in Phase 0 before gate enumeration because the runner executed:

`git -c safe.directory=* show 2164077863f4dc7d3ee8ec18620ace25e5053c40:tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_EXECUTABLE_EVIDENCE_MANIFEST_2026-08-19.md`

and the local checkout did not contain that validation commit/object.

Live GitHub independently proves:

- manifest commit `2164077863f4dc7d3ee8ec18620ace25e5053c40` exists;
- exact path `tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_EXECUTABLE_EVIDENCE_MANIFEST_2026-08-19.md` exists at that commit;
- exact Git blob SHA is `3c0a935d02bb9d930088eb069313dbb01ef1520d`;
- permanent gate exact Git blob remains `28c82b263e6cbd01c744cbfc046241837f1d253e`.

The RERUN19 failure is therefore authority-byte transport failure, not missing authority and not production behavior failure.

## Correction

A consolidated full-gate runner MUST NOT require that validation-only authority commits/blobs already exist in the local Git object database.

Before the single top-level runner invocation, Codex may perform **authority preparation only**:

1. Read the required authority file/blob from live GitHub at its exact pinned commit/path or exact blob SHA.
2. Write those bytes into a fresh isolated validation-only `authority-bundle/` directory.
3. Record `authority-bundle.json` containing for every materialized item:
   - repository;
   - source commit/path when applicable;
   - expected Git blob SHA;
   - local materialized filename;
   - byte length;
   - SHA-256 of the materialized bytes.
4. Do not execute any candidate, harness, browser, provider, package, functional assertion, or test during authority preparation.
5. Do not modify the repository checkout, production tree, candidate tree, CFT source, credentials, dependencies, or operator profile.

Authority preparation is analogous to reading the required live governance before constructing the validator; it is not an additional validation run.

## Runner-side identity verification

The one consolidated runner MUST independently verify every materialized authority item before using it.

For a file with bytes `B`, independently compute the canonical Git blob object id from:

`SHA1("blob " + byteLength(B) + "\0" + B)`

and require exact equality with the pinned expected Git blob SHA. Also recompute SHA-256 and byte length and compare with `authority-bundle.json`.

Any mismatch is `HARNESS_ERROR`; no functional execution and no packaging.

For the two mandatory textual authorities, require at minimum:

- permanent gate blob `28c82b263e6cbd01c744cbfc046241837f1d253e`;
- executable evidence manifest blob `3c0a935d02bb9d930088eb069313dbb01ef1520d` from commit `2164077863f4dc7d3ee8ec18620ace25e5053c40`.

The same transport rule applies to exact validation-only harness blobs named by the evidence manifest when a blob is not present in the local object database, including E1/E2/E3/E4 authorities. Materialization must preserve exact bytes; semantic adaptation remains allowed only where the evidence manifest already explicitly authorizes deterministic current hash/path/fixture adaptation, and the adapted source must still be separately hashed/diffed by the runner.

## Forbidden behavior

The final runner MUST NOT:

- fail merely because `git show <validation-commit>:<path>` or `git cat-file <validation-blob>` cannot resolve a GitHub-valid authority that was not fetched into the local object database;
- silently substitute a branch-tip file for a pinned blob;
- accept live GitHub text without runner-side blob identity verification;
- copy historical PASS results into the current assertion ledger;
- weaken, remove, or bypass any RERUN19 evidence-ledger requirement;
- treat authority preparation as Phase A/B/C/D/E execution;
- perform packaging before literal PASS of blocks 01-15.

## RERUN20 relationship to RERUN19

RERUN20 is a clean new consolidated execution. It must preserve the complete RERUN19 gate, evidence ledger, E1-E8 coverage, browser/runtime matrix, and packaging interlock unchanged.

The only semantic delta from the RERUN19 plan is authority transport:

- RERUN19 local-object-only authority reads are superseded by this verified authority-bundle mechanism;
- all validation requirements and PASS criteria remain unchanged.

RERUN19 itself remains failed and cannot be resumed or counted as current evidence.