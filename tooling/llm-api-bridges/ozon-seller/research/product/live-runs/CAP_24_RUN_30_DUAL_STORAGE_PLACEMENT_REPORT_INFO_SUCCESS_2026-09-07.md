# CAP-24 Run 30 — dual storage/placement report readiness

Date: 2026-09-07
Status: `PASS__PRODUCT_AND_SUPPLY_PLACEMENT_REPORTS_READY`

Frozen period: `2026-08-01..2026-08-31`.
Target SKU: `1636048691`.

## Batch execution

Bridge: `ozon-llm-api-bridge v0.1.19`
Delivery mode: `sequential_batch_single_delivery`
Result count: `2`
Logical business result count: `2`
Physical business request count: `2`
Capability probe: not needed / not performed

No hidden retry, polling, pagination, fanout or chaining occurred.

## Product-level report_info

Request ID: `3d8063a6-9362-4aef-a3d4-41328e4f0631`
Operation: `report_info`
HTTP: `200`
External request executed: `true`
Exact request preserved: `true`
Command transformed: `false`
Report type: `seller_placement_by_products`
Report status: `success`
Report code: `REPORT_seller_placement_by_products_2093109_1788751309_01a079e2-e9bd-7f23-91fe-4d6519b47290`
Opaque file ref: `rpf_s_b22c9fef-ed06-4c62-b66a-98f7e4ef4bf1`

## Supply-level report_info

Request ID: `f93f379c-57a9-420b-ae5e-cdda17d90c9a`
Operation: `report_info`
HTTP: `200`
External request executed: `true`
Exact request preserved: `true`
Command transformed: `false`
Report type: `seller_placement_by_supplies`
Report status: `success`
Report code: `REPORT_seller_placement_by_supplies_2093109_1788751309_01a079e2-eb9f-75ad-9cc5-e873d377162a`
Opaque file ref: `rpf_s_2c2f72bd-8b07-4a19-8b7d-5239f0e5285e`

## Meaning

Both official August placement/storage reports are ready and materializable through the Bridge report-file path.

The next two reads are independent because both opaque refs are known upfront. They should be sent in one explicit two-command batch using `report_file_get`.

The key diagnostic is to compare, for both files:
- HTTP status;
- byte length;
- detected format;
- sheet names;
- parsed columns;
- row_count;
- rows.

This comparison will distinguish a product-report-specific shape issue from a broader XLSX worksheet-parser coverage problem if both files are nontrivial in size but parse to empty logical tables.

Checkpoint:
`CAP_24_RUN_30_PASS__NEXT_DUAL_REPORT_FILE_GET`