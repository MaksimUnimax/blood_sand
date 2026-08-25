# Patch B0 Full Read Core — independent tester result

## Tested authority

- Branch: `feature/ozon-full-read-core-b0-2026-08-25`
- Exact tested HEAD before this result commit: `cb6ef0e3cbc4affb76832c4c2d78555c434c20f3`
- Accepted production baseline authority: `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`
- Required transport-repair anchor: `e806f0eb947844678a21f59f00e6ec416f1a8545`
- Lineage: PASS — tested HEAD descends from the transport-repair anchor.
- Commits after the anchor: `f830ff65fca1f0ba74b9d5c1004126e1c55e315c` and `cb6ef0e3cbc4affb76832c4c2d78555c434c20f3`; their changed paths are validation/handoff-only.

## Mandatory materializer gate: FAIL

The exact B0 materializer was invoked against a fresh output directory. It did not reach any B0 PASS marker because its inherited A.5 materializer stopped fail-closed with this exact error:

```text
RuntimeError: Patch A.5 popup.js identity mismatch: b051187f786abb30d0dcb1a7eec3bbb3b7a4f258e91055d26129586e3a200c4e
```

The B0 materializer consequently exited with:

```text
subprocess.CalledProcessError: ... materialize_patch_a5_work_resume_provider_status_candidate.py ... returned non-zero exit status 1
```

The partial output was not accepted as a B0 candidate: it contained 19 files and partial tree SHA-256 `c92c7d9d7430ccea5cbfd6b48a6de1c761a3ee42beebb5795c4718c16d1559c1`, not the required 21-file B0 tree with SHA-256 `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`.

Required B0 materializer markers:

- `PATCH_B0_A5_BASE_IDENTITY_PASS`: NOT_EMITTED
- `PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS`: NOT_EMITTED
- `PATCH_B0_PATCH_APPLY_PASS`: NOT_EMITTED
- `PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS`: NOT_EMITTED
- `PATCH_B0_CHANGED_FILE_IDENTITIES_PASS`: NOT_EMITTED
- `PATCH_B0_TREE_MANIFEST_SHA256_PASS`: NOT_EMITTED

## Tests not run

Per the mandatory first gate, deterministic regression, `node --check`, browser acceptance, personal-data OFF/ON cases, premium preservation, and metadata update were not run. No candidate identity satisfying the required B0 materialization authority existed.

- Deterministic markers: NOT_RUN
- Browser cases: NOT_RUN
- Real Ozon Seller requests: `0`
- Real Performance requests: `0`
- Production code modified by tester: `0`
- Validation blocker: materialization/transport-chain identity failure before candidate creation.

Final decision: `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

