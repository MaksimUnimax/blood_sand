# NEW-06 Run1 — report_placement_by_products_create

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Command under test

Independent NEW-06 chain. This command does **not** reuse or inspect the frozen STD-10 report code.

```json
{"operation":"report_placement_by_products_create","params":{"date_from":"2026-09-01","date_to":"2026-09-02"}}
```

## Result

PASS.

- request id: `5171ffdb-7762-4bb9-ae8a-1663f1932045`
- provider HTTP: `200`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact_request_preserved: `true`
- logical fingerprint: `85e4f38a`
- physical fingerprint: `85e4f38a`
- command_transformed: `false`
- report code: `REPORT_seller_placement_by_products_2093109_1788407770_01a06568-ee50-7d2e-bcca-9594563e3735`

## Defect assessment

No new defect.

This is a clean counterexample that further narrows DEFECT-002: this repaired create alias preserves identical logical/physical fingerprints and reports no transformation.

## Next step

Run one explicit `report_info` for the **new NEW-06 code only**. Do not touch the frozen STD-10 code.

Runtime patching remains forbidden until the full standalone + batch collection sweep is complete.
