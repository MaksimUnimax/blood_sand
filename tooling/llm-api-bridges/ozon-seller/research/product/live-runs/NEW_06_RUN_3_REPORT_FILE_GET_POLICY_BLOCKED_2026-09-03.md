# NEW-06 Run3 — report_file_get policy block

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Source chain

NEW-06 independent report chain only. Frozen STD-10 was not touched.

- create alias: `report_placement_by_products_create`
- independent report code: `REPORT_seller_placement_by_products_2093109_1788407770_01a06568-ee50-7d2e-bcca-9594563e3735`
- report type from Run2: `seller_placement_by_products`
- opaque report file ref: `rpf_ec4858fd-8af3-4da5-a7c3-ddd4ec1753b9`

## Run3 result

Operation: `report_file_get`

- request id: `policy-52e5b3e8-47ac-4db0-87e0-a460dc070271`
- command fingerprint: `f96ec644`
- batch result_count: `1`
- logical_business_result_count: `0`
- physical_business_request_count: `0`
- external_request_executed: `false`
- HTTP status: `0`
- elapsed: `0 ms`
- entitlement status: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- bridge error code: `OPERATION_DISABLED_BY_USER`
- error stage: `personal_data_policy`
- automatic retry: `false`

## Judgment

`PARTIAL_FAIL — DEFECT-001 REPRODUCTION #6`

The generic `report_file_get` helper blocks this safe `seller_placement_by_products` report before any provider/file request is executed. This is the sixth independently confirmed safe report class affected by DEFECT-001.

Confirmed DEFECT-001 safe-report scope now includes:

1. `seller_products`
2. `seller_returns_v2`
3. `seller_postings`
4. `seller_discounted`
5. `seller_stocks`
6. `seller_placement_by_products`

No new numbered defect is introduced by this run. Runtime patching remains forbidden until the full standalone + multi-command batch collection sweep is complete.

## NEW-06 collection state

`COLLECTION_COMPLETE_PARTIAL_FAIL`

- independent create: PASS
- report_info: PASS
- report_file_get: blocked by existing DEFECT-001
- frozen STD-10: untouched

RAW evidence:
`live-runs/repaired-26/raw/NEW_06_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
