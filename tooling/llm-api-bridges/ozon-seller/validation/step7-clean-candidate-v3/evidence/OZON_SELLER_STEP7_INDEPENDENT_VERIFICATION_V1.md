# Ozon Seller Step 7 — independent verification v1

**Status:** `PASS`

- Source commit: `b567b7fc481b2baff964ce96b9a9a334d841ae30`
- GitHub Actions run: `33384683868`
- Canonical modified during verification: `false`
- Linux/Windows extracted files: `34 / 34`, byte-identical
- Candidate files: `21`
- Candidate tree SHA-256: `f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974`
- Candidate Git tree SHA-1: `fe4c88b243ee31f2bc5b30d98ee4884614e1c669`
- Shared Git tree SHA-1: `56159227d876713b05c9545cf1d7289f68af35ef`
- Candidate Git blob identities: `21 / 21 PASS`
- Candidate package bytes: `1146084`
- Candidate package SHA-256: `f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574`
- Package contents equal candidate: `21 / 21 PASS`
- Seller authority rows: `463`
- Production Seller reads: `245` (`219 + 26`)
- Runtime operations / physical requests: `26 / 26`
- Personal Data denied requests: `0`
- Personal Data authorized explicit requests: `13`
- Terminal unknown / pending / unresolved: `0 / 0 / 0`
- Repository freeze: `PASS`

## Independently recalculated identities

```text
candidate_tree_sha256  f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974
candidate_git_tree     fe4c88b243ee31f2bc5b30d98ee4884614e1c669
shared_git_tree        56159227d876713b05c9545cf1d7289f68af35ef
package_sha256         f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574
package_git_blob       826caa4558c67b6b3c35d47f5c0359043eac73c8
bundle_git_blob        6d5e129f31b40c3ce7e9e7cb7409a03c3fa3c718
```

## Markers

```text
STEP7_INDEPENDENT_ARTIFACT_DIGESTS_PASS
STEP7_INDEPENDENT_LINUX_WINDOWS_BYTE_IDENTITY_PASS
STEP7_INDEPENDENT_CROSS_PROOF_RECALCULATION_PASS
STEP7_INDEPENDENT_CANDIDATE_TREE_SHA256_PASS
STEP7_INDEPENDENT_GITHUB_BLOB_IDENTITY_PASS
STEP7_INDEPENDENT_GITHUB_TREE_IDENTITY_PASS
STEP7_INDEPENDENT_PACKAGE_CONTENT_IDENTITY_PASS
STEP7_INDEPENDENT_SEMANTIC_PROOFS_PASS
STEP7_INDEPENDENT_REPOSITORY_FREEZE_PROOF_PASS
OZON_SELLER_STEP7_INDEPENDENT_VERIFICATION_PASS
```

## Verification basis

- GitHub Actions artifact metadata: workflow run `33384683868`.
- Repository identity: Git tree and blob metadata at commit `b567b7fc481b2baff964ce96b9a9a334d841ae30`.
- All payload hashes, Git object IDs, archive contents and proof invariants were recalculated independently.
