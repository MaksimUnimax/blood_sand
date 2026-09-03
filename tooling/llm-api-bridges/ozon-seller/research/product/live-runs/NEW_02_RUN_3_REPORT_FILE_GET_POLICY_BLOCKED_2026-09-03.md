# NEW-02 Run3 — report_file_get policy block

Date: 2026-09-03
Alias under test: `report_returns_create_v2`
Workflow step: `report_file_get`
Collection mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Input ref

`rpf_c5978670-1bbe-47f5-9838-e843614a2514`

This ref came from a successful live `report_info` for report code:

`REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`

## Result

- request id: `policy-a9bcf2bf-18eb-46ca-a3fd-5b20b79438bf`
- operation: `report_file_get`
- command fingerprint: `78950173`
- provider host alias: `report_file`
- physical business requests: `0`
- external request executed: `false`
- HTTP status: `0`
- entitlement status: `POLICY_BLOCKED`
- entitlement reason: `personal_data_setting_off`
- result status: `personal_data_setting_required`
- error code: `OPERATION_DISABLED_BY_USER`
- automatic retry: `false`
- stage: `personal_data_policy`

## Interpretation

This is **not** an Ozon provider failure. The Bridge blocked the file-read locally before network execution.

It reproduces the already-open `DEFECT-001` seen in NEW-01, now on a second independent safe report workflow (`seller_returns_v2`). Therefore DEFECT-001 scope is confirmed across at least:

1. `seller_products` report file;
2. `seller_returns_v2` report file.

No new defect id is created for this reproduction.

## Collection decision

Do not enable personal-data setting as a workaround for this safe report during defect collection. Do not patch yet. Preserve the partial workflow state and continue to the next independent NEW-ID so the complete defect surface can be collected first.

NEW-02 standalone collection state:

`PARTIAL_FAIL — create PASS + report_info PASS + report_file_get POLICY_BLOCKED (DEFECT-001 reproduced)`

RAW evidence:
`live-runs/repaired-26/raw/NEW_02_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
