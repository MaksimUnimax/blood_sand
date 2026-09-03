# NEW-07 Run3 — report_file_get POLICY_BLOCKED

Date: 2026-09-03
Gate mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias under test: `report_placement_by_supplies_create`
Report type: `seller_placement_by_supplies`

## Source chain

- NEW-07 create request: `5c5d7784-4989-4ed1-9724-70d3aa3adb5e`
- report code: `REPORT_seller_placement_by_supplies_2093109_1788408279_01a06570-b345-7114-9532-c1476a0c61e2`
- report_info request: `c8c54b96-4560-4194-bf70-c85ac449689c`
- opaque report file ref: `rpf_49f4be70-84e2-40b7-8224-6a58e409cf29`

## Run3 result

Operation: `report_file_get`

- request id: `policy-a67134cb-346f-433b-881b-9f89e4410899`
- command fingerprint: `baf1c4f3`
- HTTP status: `0`
- elapsed: `0 ms`
- logical business results: `0`
- physical business requests: `0`
- external request executed: `false`
- entitlement: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- result status: `personal_data_setting_required`
- error code: `OPERATION_DISABLED_BY_USER`
- error source: `bridge`
- stage: `personal_data_policy`
- automatic retry: `false`

## Verdict

`DEFECT-001 REPRODUCED`.

The generic `report_file_get` helper is again blocked by its static personal-data policy even though the source is a normal generated placement-by-supplies seller report. This is the seventh independently observed safe report class affected by the same defect:

1. `seller_products`
2. `seller_returns_v2`
3. `seller_postings`
4. `seller_discounted`
5. `seller_stocks`
6. `seller_placement_by_products`
7. `seller_placement_by_supplies`

No provider/file request was executed, so structured report rows cannot be read in the current runtime while the operator personal-data setting is OFF.

This is not a new defect number; it expands the confirmed scope of DEFECT-001.

## Collection rule

Do not patch now. NEW-07 is complete enough for the defect-collection phase and testing advances to NEW-08. Runtime repair occurs only after the complete standalone + batch sweep is exhausted.

RAW:
`live-runs/repaired-26/raw/NEW_07_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
