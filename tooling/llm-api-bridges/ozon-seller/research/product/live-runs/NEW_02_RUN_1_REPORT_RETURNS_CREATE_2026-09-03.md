# NEW-02 Run1 — report_returns_create_v2

Date: 2026-09-03
Gate: repaired 26 Seller READ live gate
Mode: `COLLECT_ALL_DEFECTS_FIRST`
Alias: `report_returns_create_v2`
Status: `CREATE_PROVIDER_PASS_REPORT_INFO_NEXT`

## Request

Standalone command:

`report_returns_create_v2`

Requested filter:

- `date_from = 2026-09-01T00:00:00Z`
- `date_to = 2026-09-03T23:59:59Z`
- `status = DisputeOpened`
- `delivery_schema = ALL`

## Live result

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- request id: `8b963833-eb57-4fe8-9b34-ff609ddf735c`
- HTTP: `200`
- elapsed: `1386 ms`
- provider: `ozon / seller_api`
- external request executed: `true`
- physical business requests: `1`
- logical business results: `1`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- exact_request_preserved: `true`

Returned report code:

`REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`

Provider/business classification: **PASS** for the create step.

## Defect candidate recorded, not patched

Planning metadata is internally inconsistent and must be investigated after the complete test sweep:

- logical command fingerprint: `687fa368`
- physical command fingerprint: `d1fbfbfe`
- `command_transformed = true`
- entitlement metadata simultaneously says `exact_request_preserved = true`.

This is recorded as a planner/metadata defect candidate. During `COLLECT_ALL_DEFECTS_FIRST`, no code change is allowed yet.

## Next step for NEW-02 standalone

Use one explicit `report_info` for the NEW-02 report code. If ready, later use the returned opaque file ref with `report_file_get`. A create acknowledgement alone is not full standalone PASS.

## Raw evidence

`live-runs/repaired-26/raw/NEW_02_RUN_1_REPORT_RETURNS_CREATE_RAW_2026-09-03.json`
