# Ozon full-gate authority-bundle effective identity schema correction

Date: 2026-08-19
Status: `MANDATORY_AUTHORITY_BUNDLE_SCHEMA_CORRECTION`
Scope: validation-only. Production/candidate bytes and permanent-gate semantics are unchanged.

## Trigger

RERUN21 report commit `614245b9f99789267efa398d64b3cdcba7bc1c85` proves that the raw materialized E1 part `02.mjs.part` was correct:

- bytes: `4234`
- SHA-256: `8d44fc9bb0ac49d7341a11159ba20d07fcd7ffa0f2ab30c7a604636f27cfc570`
- canonical Git blob recomputed from raw bytes: `10638ac5c70d07af7f68e51259113e8be63289f4`

but the RERUN21 runner selected stale legacy metadata `10638ac5c70e07af7f68e51259113e8be63289f4` instead of the mandatory corrected identity. The same report also shows that the top-level command received `D:\codex\Test\authority-bundle-rerun20`, violating the RERUN21 requirement for a fresh isolated RERUN21 authority bundle.

This is a validation harness/schema/argument defect. It is not a production failure and carries no functional PASS.

## Mandatory correction

There MUST be no runtime precedence/override choice between multiple expected Git-blob fields.

For every materialized authority item, the freshly generated bundle manifest used by the next runner MUST contain exactly one identity field consumed by verification:

`effective_expected_git_blob_sha`

The runner MUST verify only this field. It MUST NOT read `expected_git_blob_sha`, `corrected_expected_git_blob_sha`, `override_expected_git_blob_sha`, or any fallback/precedence chain for identity decisions.

Legacy/source metadata may be recorded under clearly non-executable audit fields such as `source_declared_git_blob_sha`, but those fields MUST NOT participate in verification.

For E1 `02.mjs.part`, the effective item MUST be exactly:

- item id/name: `e1-02.mjs.part`
- effective_expected_git_blob_sha: `10638ac5c70d07af7f68e51259113e8be63289f4`
- byte length: `4234`
- SHA-256: `8d44fc9bb0ac49d7341a11159ba20d07fcd7ffa0f2ab30c7a604636f27cfc570`

The erroneous `10638ac5c70e07af7f68e51259113e8be63289f4` may appear only in audit/history/correction prose. It MUST NOT appear in any executable/effective expected identity field.

## Fresh-bundle invariant

Each run MUST create a fresh run-specific authority directory and pass that exact directory to its top-level runner. Reusing a prior RERUN authority directory is forbidden.

The runner MUST record and verify:

- its expected run id;
- bundle run id;
- absolute bundle directory;
- bundle creation timestamp/run nonce or equivalent fresh-run marker;
- no prior-run bundle path was supplied.

A mismatch is `HARNESS_ERROR` before functional execution.

## Verification order

Before ledger seeding:

1. Parse the fresh bundle manifest.
2. Require one and only one `effective_expected_git_blob_sha` per item.
3. Independently recompute `SHA1("blob " + byteLength + "\0" + rawBytes)` for every item.
4. Compare only against `effective_expected_git_blob_sha`.
5. For E1 part02 explicitly print/record the effective expected and computed blob and require both equal `10638ac5c70d07af7f68e51259113e8be63289f4`.
6. Reconstruct E1 00+01+02+03 and require `21942` bytes and SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.
7. Only then seed the permanent-gate assertion ledger and continue the one consolidated full run.

No production, candidate, dependency, CFT, permanent-gate requirement, E1 bytes/assertions, E2-E8 semantics, browser contract, or packaging rule changes.