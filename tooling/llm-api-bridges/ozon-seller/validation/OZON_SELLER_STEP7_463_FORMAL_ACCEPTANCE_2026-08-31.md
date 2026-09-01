# Ozon Seller Step 7 — formal acceptance

`SELLER_STEP7_463_EXHAUSTIVE_TERMINAL_MATRIX_PASS`  
`STEP7_READ_RUNTIME_26_PASS`  
`STEP7_PRIVACY_DENIAL_13_PASS`  
`STEP7_PRIVACY_AUTHORIZED_13_PASS`  
`STEP7_SELLER_REGRESSION_219_PASS`  
`STEP7_PERFORMANCE_REGRESSION_21_PASS`  
`STEP7_LINUX_WINDOWS_BYTE_IDENTICAL_PASS`  
`STEP7_CLEAN_REPOSITORY_FREEZE_PASS`  
`OZON_SELLER_STEP7_FORMALLY_ACCEPTED`

Seller authority is terminal for all `463/463` operations. The production Seller read surface is `245` operations: `219` previously accepted reads plus `26` Step 7 reads. The new reads are split into `13` safe-projection operations and `13` operations guarded by the existing Personal Data authorization mechanism.

GitHub Actions run `33384683868` independently passed Linux, Windows, cross-platform byte-identity and repository-freeze jobs on candidate commit `b567b7fc481b2baff964ce96b9a9a334d841ae30`. A separate local reverification downloaded all four run artifacts, matched their GitHub digests, reconstructed and reran the full Linux gate, recalculated the complete `34`-file output manifest, reproduced the cross-platform proof and reproduced the repository-freeze proof byte-for-byte.

Frozen production identities:

- Candidate tree SHA-256: `f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974`
- Candidate package SHA-256: `f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574`
- Candidate package bytes: `1,146,084`

Canonical was not modified. The accepted canonical ancestor remains branch `repair/ozon-v2-b1-stocks-warehouse-2026-08-29` at commit `8ee16f38bf2ec60e4b2e42192c2f41d87021b214`.

Detailed machine-readable and narrative evidence is stored under:

`tooling/llm-api-bridges/ozon-seller/validation/step7-clean-candidate-v3/evidence/`

The next roadmap stage is `STEP8_PERFORMANCE_48_TERMINAL_ACCEPTANCE`.
