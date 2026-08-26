# Patch B1 — Assortment Master candidate manifest

- Base: accepted B0 tree `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- Patch: `PATCH_B1_ASSORTMENT_MASTER_2026-08-26.patch`
- Patch SHA-256: `b5d5cec8a4c72b74374c41704b219dadfaf98001d0e2f3ca8734311fe1e08a41`
- Candidate production file count: `21`
- Candidate tree SHA-256: `2a0ec020c5ab02dc771ea909cf70f9b0e7981a992c7b458da80761cf9feac740`

Changed production SHA-256:

- `shared/ozon_operation_registry.js` — `286f7746a3c45601dd973cba51d604778ae34d6911c323e818e5756eff7f0853`
- `shared/ozon_contract.js` — `c633b190a4353501c7b683a8bbbdb799a8b5ae78520a6187fbb874449b64b1b1`
- `shared/ozon_entitlements.js` — `ede46ce2112d8c07c70855e37dbac2ac82c7fa9746d5c2cf3e4f8c1d75022764`

Protected B0 runtime identities are checked by the B1 materializer and regression. Autorun/Work-session/service-worker lifecycle behavior is outside this patch.
