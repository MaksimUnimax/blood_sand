# Ozon Seller Step 7 — independent reverification

**Status:** `PASS`

## Provenance

- Candidate branch: `repair/ozon-step7-245-read-final-candidate-v3-2026-08-31`
- Candidate commit: `b567b7fc481b2baff964ce96b9a9a334d841ae30`
- GitHub Actions run: `33384683868`
- Canonical branch: `repair/ozon-v2-b1-stocks-warehouse-2026-08-29`
- Canonical commit: `8ee16f38bf2ec60e4b2e42192c2f41d87021b214`
- Canonical modified during validation: `false`

## Independent procedure

1. Downloaded all four artifacts from run `33384683868` and verified each local archive digest against GitHub artifact metadata.
2. Extracted every archive with path-traversal and symlink rejection.
3. Recalculated the complete Linux and Windows manifests: `34` files on each side, identical paths, sizes and SHA-256 values.
4. Restored the full Step 7 gate from the committed multipart source carrier and ran it independently on a clean Linux checkout of candidate commit `b567b7fc481b2baff964ce96b9a9a334d841ae30`.
5. Compared the independent fresh output with the CI Linux artifact: all `34` files are byte-identical.
6. Recalculated the production candidate tree identity and compared candidate, bundle and package bytes with the repository-frozen copies.
7. Compared the generated registry and runtime contract with their frozen copies after normalizing only the run-provenance field `source_commit`; all operational fields remained fail-closed and identical.
8. Ran `node --check` over every JavaScript file in the frozen candidate plus the generated bundle.
9. Recalculated the cross-platform proof manifest from extracted bytes.
10. Re-ran the repository-freeze verifier and reproduced the CI repository-freeze proof byte-for-byte.

## Accepted coverage

| Surface | Result |
|---|---:|
| Seller terminal matrix | `463/463` |
| Production Seller reads | `245` |
| Previously accepted reads | `219` |
| New Step 7 reads | `26` |
| New safe-projection reads | `13` |
| New Personal Data guarded reads | `13` |
| Performance reads retained in regression | `21` |
| Terminal unknown / pending / unresolved | `0 / 0 / 0` |

## Runtime and privacy

- Runtime operations: `26`
- Physical business requests: `26`
- One operation → one physical request: `PASS`
- Denied Personal Data path physical requests: `0`
- Explicit authorized resubmissions: `13`
- Replayed commands after setting transition: `0`
- Delayed replayed commands: `0`

## Frozen identities

- Candidate tree SHA-256: `f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974`
- Bundle SHA-256: `b961f7b0b7c080dfa13df197acdfd4e38b69dc3e6ff5141d696828274a242947`
- Registry SHA-256: `d4aebbee67e67c6bac2ad74d50795b7858175150fbddf4b419c3dca63704583c`
- Runtime contract SHA-256: `350a47001ecd81d5d8f3fbb236ee6ac765a99b57d69777ca35b139a6d6a4f0e6`
- Candidate package SHA-256: `f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574`
- Candidate package bytes: `1,146,084`

## Reverification markers

`STEP7_CLEAN_LINUX_FULL_GATE_PASS`  
`STEP7_CLEAN_WINDOWS_FULL_GATE_PASS`  
`STEP7_CLEAN_LINUX_WINDOWS_BYTE_IDENTICAL_PASS`  
`STEP7_CLEAN_FULL_CROSS_PLATFORM_PASS`  
`STEP7_CLEAN_REGISTRY_PROVENANCE_NORMALIZED_PASS`  
`STEP7_CLEAN_CONTRACT_PROVENANCE_NORMALIZED_PASS`  
`STEP7_CLEAN_FRESH_GATE_REPOSITORY_FREEZE_MATCH_PASS`  
`STEP7_CLEAN_REPOSITORY_CANDIDATE_NODE_CHECK_PASS`  
`STEP7_CLEAN_REPOSITORY_FREEZE_PASS`
