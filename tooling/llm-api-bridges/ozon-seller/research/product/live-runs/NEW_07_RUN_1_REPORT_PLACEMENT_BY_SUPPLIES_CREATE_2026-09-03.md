# NEW-07 Run1 — report_placement_by_supplies_create

Date: 2026-09-03
Gate: repaired 26 Seller READ aliases
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Command

`report_placement_by_supplies_create`

Params:
- `date_from`: `2026-09-01`
- `date_to`: `2026-09-02`

The interval is completed and is within the runtime maximum placement-report window.

## Result

PASS.

- request id: `5c5d7784-4989-4ed1-9724-70d3aa3adb5e`
- HTTP: `200`
- elapsed: `1404 ms`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact_request_preserved: `true`
- logical fingerprint: `2a4cb92d`
- physical fingerprint: `2a4cb92d`
- command_transformed: `false`
- report code: `REPORT_seller_placement_by_supplies_2093109_1788408279_01a06570-b345-7114-9532-c1476a0c61e2`

## Defect assessment

No new defect discovered.

This is another clean counterexample for DEFECT-002: the repaired create alias preserves the same logical and physical fingerprint and reports `command_transformed=false` consistently with `exact_request_preserved=true`.

Current clean repaired create counterexamples include NEW-04, NEW-05, NEW-06 and NEW-07; DEFECT-002 remains scoped to specific create/planner normalization paths observed on NEW-02 and NEW-03.

## Next step

Persist this result in live-gate/recovery authority, then call one explicit `report_info` for the NEW-07 report code. If ready, later use the resulting opaque `report_file_ref` in a separate `report_file_get` to scope DEFECT-001.

No runtime patch during collection.
