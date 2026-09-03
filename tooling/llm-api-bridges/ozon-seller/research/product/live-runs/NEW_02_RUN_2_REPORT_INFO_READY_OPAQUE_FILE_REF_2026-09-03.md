# NEW-02 Run2 — report_info ready with opaque file ref

Date: 2026-09-03
Gate: repaired 26 Seller READ live gate
Alias under test: `report_returns_create_v2`
Status: `PASS_REPORT_INFO_FILE_REF_READY`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Execution evidence

- request id: `fe38e833-2029-4f41-8f57-49ad5a258499`
- operation: `report_info`
- HTTP: `200`
- physical business requests: `1`
- external request executed: `true`
- elapsed: `1333 ms`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `2d41fb57`
- physical fingerprint: `2d41fb57`
- command transformed: `false`

## Provider result

Report code:
`REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`

Provider status:
`success`

Report type:
`seller_returns_v2`

Provider file field:
`[REDACTED]`

Opaque Bridge file ref:
`rpf_c5978670-1bbe-47f5-9838-e843614a2514`

The provider URL is not exposed to the AI-visible result.

## Defect correlation

This step does not reproduce DEFECT-002: `report_info` has equal logical/physical fingerprints and `command_transformed=false`.

Therefore DEFECT-002 remains scoped to the preceding NEW-02 create/planner path until broader evidence says otherwise.

## Next collection step

Attempt one explicit `report_file_get` using the opaque ref above.

If the same static privacy block seen in NEW-01 occurs, persist it as a second reproduction of DEFECT-001 and then continue to NEW-03 without patching.

Checkpoint:
`NEW_02_CREATE_AND_REPORT_INFO_PASS_REPORT_FILE_GET_NEXT_COLLECT_ONLY`
