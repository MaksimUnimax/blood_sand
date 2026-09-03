# NEW-08 Run3 — report_file_get POLICY_BLOCKED

Date: 2026-09-03
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Source chain:
- repaired alias: `report_marked_products_sales_create`
- report type from Run2: `marked_products_sales`
- opaque report ref: `rpf_e414b482-5e63-4211-99aa-be3ed53ff09b`

Observed result:
- operation: `report_file_get`
- request id: `policy-7fb3e562-2c99-43a9-a203-edae0701f579`
- command fingerprint: `c35d1869`
- HTTP status: `0`
- elapsed: `0 ms`
- logical business result count: `0`
- physical business request count: `0`
- external request executed: `false`
- entitlement: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- bridge error: `OPERATION_DISABLED_BY_USER`
- stage: `personal_data_policy`
- automatic retry: `false`

Assessment:
- This is not a new defect.
- It is DEFECT-001 reproduction #8, now covering safe report class `marked_products_sales` in addition to the seven previously confirmed safe report classes.
- The generic `report_file_get` helper is blocked before external execution solely by its static personal-data policy despite the source being a normal generated business report.
- NEW-08 standalone collection is complete enough to advance, but remains partial-fail until DEFECT-001 is patched after the full collection sweep.

Patch status: **FORBIDDEN DURING COLLECTION**.
