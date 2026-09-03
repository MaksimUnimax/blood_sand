# NEW-11 Run3 — report_file_get policy block

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Alias: `finance_mutual_settlement_report`
Report type: `mutual_settlement`

## Command context

Explicit `report_file_get` was issued for the opaque NEW-11 report reference while the operator personal-data setting remained OFF.

Opaque ref:
`rpf_18eb749e-08df-4b99-8107-f4dcbf0a2529`

## Observed result

- request id: `policy-58d43bb1-6126-4e4c-9178-7609dc7e858d`
- operation: `report_file_get`
- command fingerprint: `36df3b67`
- HTTP status: `0`
- elapsed: `0 ms`
- logical business results: `0`
- physical business requests: `0`
- external request executed: `false`
- entitlement: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- result status: `personal_data_setting_required`
- error code: `OPERATION_DISABLED_BY_USER`
- automatic retry: `false`
- stage: `personal_data_policy`

## Judgment

`COLLECTION_COMPLETE_PARTIAL_FAIL — DEFECT-001 REPRODUCTION #10`

The generic `report_file_get` helper is now confirmed to be statically blocked with personal-data setting OFF for a tenth report class: `mutual_settlement`.

This is a scope extension of existing DEFECT-001, not a new defect. Runtime patching remains forbidden until the full standalone + required batch collection sweep is exhausted.

NEW-11 standalone collection is complete enough to advance to NEW-12.
