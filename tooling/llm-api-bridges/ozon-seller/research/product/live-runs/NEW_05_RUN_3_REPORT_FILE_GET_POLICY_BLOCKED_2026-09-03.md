# NEW-05 Run3 — seller_stocks report_file_get policy block

Date: 2026-09-03
Gate: repaired 26 Seller READ live collection
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Operation under test: `report_file_get`
Source repaired workflow: `report_warehouse_stock -> report_info -> report_file_get`
Source report type: `seller_stocks`
Source report code: `REPORT_seller_stocks_2093109_1788407283_01a06561-80f3-78d2-9c6a-3c829871385f`
Opaque file ref: `rpf_304de093-ae1b-46f3-8be0-2a16793361b9`

## Exact result

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- request id: `policy-af96433d-9756-4b57-82da-6a058e782aec`
- command fingerprint: `b2613b49`
- provider: `ozon`
- host alias: `report_file`
- HTTP method: `GET`
- path alias: `report_file_get`
- HTTP status: `0`
- elapsed: `0 ms`
- query planner status: `pending`
- logical business result count: `0`
- physical business request count: `0`
- external request executed: `false`
- entitlement status: `POLICY_BLOCKED`
- entitlement reason: `personal_data_setting_off`
- result status: `personal_data_setting_required`
- error code: `OPERATION_DISABLED_BY_USER`
- error stage: `personal_data_policy`
- automatic retry: `false`

## Classification

`DEFECT_001_REPRODUCTION_SAFE_SELLER_STOCKS_REPORT_FILE_BLOCKED`

This is not a provider failure. The Bridge blocked the local opaque report-file helper before any file request was executed.

The same static policy behavior is now live-confirmed on five independent report types classified as safe upstream reads:

1. `seller_products`
2. `seller_returns_v2`
3. `seller_postings`
4. `seller_discounted`
5. `seller_stocks`

Therefore DEFECT-001 scope is broader than one report endpoint and is strongly consistent with a generic `report_file_get` policy problem. Do not patch during the current collection phase.

## NEW-05 collection conclusion

NEW-05 provider-facing steps succeeded:

- real FBS warehouse setup: PASS
- `report_warehouse_stock`: PASS / HTTP200
- `report_info`: PASS / status success / opaque ref produced
- `report_file_get`: local policy block / DEFECT-001 reproduction

NEW-05 is `COLLECTION_COMPLETE_PARTIAL_FAIL` until the later repair/rerun phase.

RAW evidence:
`repaired-26/raw/NEW_05_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
