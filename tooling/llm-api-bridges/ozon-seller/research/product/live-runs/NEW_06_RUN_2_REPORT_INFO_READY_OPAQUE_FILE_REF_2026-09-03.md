# NEW-06 Run2 — report_info PASS

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Gate: repaired 26 READs, collection-first phase

## Operation

`report_info`

Independent NEW-06 report code:
`REPORT_seller_placement_by_products_2093109_1788407770_01a06568-ee50-7d2e-bcca-9594563e3735`

This is **not** the frozen STD-10 forensic report code.

## Result

PASS.

- request id: `e78e1813-43de-41d9-ac9a-32d00c5fcc5c`
- provider: `seller_api`
- HTTP: `200`
- elapsed: `1367 ms`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- capability probe: not needed
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact_request_preserved: `true`
- logical fingerprint: `c5855b10`
- physical fingerprint: `c5855b10`
- command_transformed: `false`
- report status: `success`
- report type: `seller_placement_by_products`
- provider file field: `[REDACTED]`
- opaque report file ref: `rpf_ec4858fd-8af3-4da5-a7c3-ddd4ec1753b9`
- created_at: `2026-09-03T03:56:10.706976Z`
- expires_at: `2026-09-03T06:56:10.706976Z`

## Defect assessment

No new defect discovered in this step.

This `report_info` call does **not** reproduce DEFECT-002: logical and physical fingerprints are identical and `command_transformed=false`.

The next NEW-06 step is a separate explicit `report_file_get` using only the opaque NEW-06 ref above, to test whether existing DEFECT-001 extends to `seller_placement_by_products`.

Runtime patching remains forbidden until the complete standalone + batch collection sweep is exhausted.

## RAW evidence

`live-runs/repaired-26/raw/NEW_06_RUN_2_REPORT_INFO_RAW_2026-09-03.json`
