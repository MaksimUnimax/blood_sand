# NEW-03 Run5 — seller_postings report_file_get policy block

Date: 2026-09-03
Gate: repaired 26 Seller READ live gate
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias under test: `report_postings_create`
File retrieval helper: `report_file_get`

## Prior successful chain

NEW-03 Run3 created a seller-postings report successfully with lowercase `delivery_schema:["fbo"]` and returned:

`REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`

NEW-03 Run4 `report_info` returned `status=success`, report type `seller_postings`, redacted provider file field and opaque ref:

`rpf_4619d324-8228-4c8e-b8be-c4c1ea05b92c`

## Run5 result

Explicit `report_file_get` was submitted for that opaque ref.

Observed:

- request id: `policy-5e9052c9-6106-4f28-846c-e1717fd88c1f`;
- command fingerprint: `c314bcd6`;
- provider/host alias: `report_file`;
- HTTP: `0`;
- elapsed: `0 ms`;
- query planner status: `pending`;
- logical business results: `0`;
- physical business requests: `0`;
- external request executed: `false`;
- entitlement: `POLICY_BLOCKED`;
- reason: `personal_data_setting_off`;
- error: `OPERATION_DISABLED_BY_USER`;
- stage: `personal_data_policy`;
- automatic retry: `false`.

## Classification

`DEFECT_001_REPRODUCED_ON_SELLER_POSTINGS_REPORT_FILE`

This is the third independent safe report type on which the generic report-file helper is locally blocked while the Personal Data setting is OFF:

1. `seller_products`;
2. `seller_returns_v2`;
3. `seller_postings`.

No provider/file request occurred, so this is Bridge policy behavior, not an Ozon provider rejection.

## Collection-phase action

Do not patch now. NEW-03 standalone collection has exercised the create/report-info/file-read path to the current runtime boundary and may advance to NEW-04 while DEFECT-001 remains open for later consolidated repair.

RAW evidence:
`repaired-26/raw/NEW_03_RUN_5_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
