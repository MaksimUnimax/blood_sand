# Patch B0 Full Read Core — independent retest after LF materializer repair

## Tested authority

- Branch: `feature/ozon-full-read-core-b0-2026-08-25`
- Exact tested HEAD before this result commit: `f4cc32ed2e190a3367290b35559870bb923b2419`
- Previous validation-only rejection: `e41d0853a21b59fbe235940e9c23192f3c3d15e9`
- A.5 LF repair commit: `e53fab9d239457dd91a3aac2941651f3482dbbbd`
- Accepted A.5 authority: popup `e77beb6eb5e23aebada2ded9a834e7095f14e74ee9f1e9b54503377a7d87b5e7`, worker `dd67b793d7c28595b5e795f918f702d4fd472c9f43f2bec467e56b85587d29b9`, 19-file tree `4b77ed8500e3caacefff43a82002dc6ef5bfd562511bf10ef57a5392069c22a0`.
- Transport-repair anchor `e806f0eb947844678a21f59f00e6ec416f1a8545` is an ancestor of the tested HEAD.
- Post-anchor changes are validation/handoff-only, including the LF-stable materializer repair; no production candidate source was edited by the tester.

## Mandatory materializer gate: FAIL

The exact B0 materializer was run into a completely fresh output directory. The LF repair succeeded through every inherited A.5 identity marker, including `PATCH_A5_POPUP_SHA256_PASS`, `PATCH_A5_SERVICE_WORKER_SHA256_PASS`, and `PATCH_A5_TREE_MANIFEST_SHA256_PASS`.

The B0 stage then stopped fail-closed on this exact changed-file identity check:

```text
RuntimeError: B0 identity mismatch manifest.json: 5ce0b3634ce8db8349054252ece5c6df2367843f7b705ac3a686cdc68d71cdf2 != f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1
```

The partial output contained 21 files but was not accepted: its tree SHA-256 was `ebf737451f9f78182c15745195d57901c60bc8ef9da9895e3cc569c4adcb6752`, not required B0 authority `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`.

Required B0 materializer markers:

- `PATCH_B0_A5_BASE_IDENTITY_PASS`: NOT_EMITTED
- `PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS`: NOT_EMITTED
- `PATCH_B0_PATCH_APPLY_PASS`: NOT_EMITTED
- `PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS`: NOT_EMITTED
- `PATCH_B0_CHANGED_FILE_IDENTITIES_PASS`: NOT_EMITTED
- `PATCH_B0_TREE_MANIFEST_SHA256_PASS`: NOT_EMITTED

## Tests not run

The mandatory first gate did not produce an exact B0 candidate. Therefore deterministic regression, `node --check`, every browser acceptance case, personal-data OFF/ON request execution, premium preservation, and metadata refresh were not run.

- Deterministic markers: NOT_RUN
- Browser cases: NOT_RUN
- OFF provider request count: NOT_RUN
- ON provider request count: NOT_RUN
- Automatic replay observed: NOT_RUN
- Metadata refresh: NOT_RUN
- Real Ozon Seller requests: `0`
- Real Performance requests: `0`
- Production code modified by tester: `0`
- Validation blocker: B0 changed-file identity mismatch for `manifest.json` before candidate acceptance.

Final decision: `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

