# NEW-04 Run3 — `report_file_get` policy block

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

Source workflow:
`report_discounted_create -> report_info -> report_file_get`

Source report code:
`REPORT_seller_discounted_2093109_1788406644_01a06557-c01b-7f31-9c51-b82d2a402ca7`

Source report type:
`seller_discounted`

Opaque ref:
`rpf_b58f09ca-4ca1-4ca5-a362-68d6da57b6d2`

Observed result:

- request id: `policy-111ff6bd-fd2e-4a71-aacf-e89bf4557f11`
- operation: `report_file_get`
- fingerprint: `1aa43c3f`
- provider host alias: `report_file`
- HTTP status: `0`
- elapsed: `0 ms`
- physical business requests: `0`
- external request executed: `false`
- entitlement status: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- result status: `personal_data_setting_required`
- bridge error code: `OPERATION_DISABLED_BY_USER`
- stage: `personal_data_policy`
- automatic retry: `false`.

Classification:
`DEFECT_001_REPRODUCTION_SAFE_SELLER_DISCOUNTED_REPORT_FILE_STATIC_PRIVACY_BLOCK`

Interpretation:

This is the fourth independent safe report class for which the generic `report_file_get` helper is blocked solely by the global personal-data setting before any file request executes. It expands confirmed DEFECT-001 scope to:

1. `seller_products`;
2. `seller_returns_v2`;
3. `seller_postings`;
4. `seller_discounted`.

No runtime patch is allowed during the current collection phase. NEW-04 standalone collection is complete enough to advance to NEW-05.

Raw evidence:
`live-runs/repaired-26/raw/NEW_04_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
