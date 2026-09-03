# NEW-01 Run3 — report_file_get policy block

Date: 2026-09-03
Status: `FAIL_LOCAL_POLICY_DEFECT_FIX_REQUIRED`
Rule: `NO_SKIP_ON_FAILURE`

NEW-01 had already completed live `report_products_create` and live `report_info`. The report was ready and Bridge returned opaque ref:

`rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`

Run3 attempted `report_file_get` with the personal-data setting OFF.

Execution evidence:

- request id: `policy-558df595-6ff0-4eb6-b5f6-03eb658ebe6c`
- command fingerprint: `db479ba6`
- physical_business_request_count: `0`
- external_request_executed: `false`
- HTTP: `0`
- entitlement status: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- error code: `OPERATION_DISABLED_BY_USER`
- stage: `personal_data_policy`
- automatic_retry: `false`.

Full raw result:
`live-runs/raw/NEW_01_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.txt`

Classification:
`FAIL_LOCAL_POLICY_DEFECT_REPORT_FILE_GET_STATIC_PERSONAL_DATA_GATE`

This is a Bridge-local failure, not an Ozon provider failure.

The source report is `seller_products`, created by a `safe_projection` READ. Current runtime marks generic `report_file_get` statically as personal-data gated, so even safe report files are blocked.

Required correction: privacy must follow the concrete opaque ref provenance. Safe report refs must work with personal-data setting OFF; refs originating from personal-data-gated documents must remain gated. Report codes should preserve their source privacy through `report_info`. Unknown refs must still fail before network execution.

Gate consequence:

- NEW-01 remains blocked on fix;
- NEW-02 must not start;
- do not repeat Run3 until repaired browser package is built and installed.

Checkpoint:
`REPAIRED_26_READS_LIVE_GATE_NEW_01_RUN3_POLICY_DEFECT_FIX_BEFORE_RETRY`
