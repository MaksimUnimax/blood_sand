# NEW-09 Run3 — report_file_get POLICY_BLOCKED

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Source repaired alias: `report_realization_posting_create`
Source report type: `finance_realization_posting`
Opaque file ref: `rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95`

## Result

`report_file_get` was blocked locally before any external request:

- request id: `policy-c52040e3-2327-4a14-be83-f786a928b053`
- command fingerprint: `928bfa76`
- HTTP status: `0`
- physical business requests: `0`
- external request executed: `false`
- entitlement: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- error: `OPERATION_DISABLED_BY_USER`
- stage: `personal_data_policy`
- automatic retry: `false`

## Classification

This is **DEFECT-001 reproduction #9**.

The generic `report_file_get` helper is statically treated as personal-data-gated even though the upstream report workflow is an ordinary finance realization report. This extends confirmed DEFECT-001 scope to `finance_realization_posting`.

No runtime patch is allowed during collection. Advance to NEW-10 after authority/checkpoint persistence.

RAW structural evidence:
`live-runs/repaired-26/raw/NEW_09_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
