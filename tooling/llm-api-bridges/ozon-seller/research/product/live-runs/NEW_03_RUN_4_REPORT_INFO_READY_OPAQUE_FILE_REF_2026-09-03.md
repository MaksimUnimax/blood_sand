# NEW-03 Run4 — report_info ready with opaque file ref

Date: 2026-09-03
Gate: repaired 26 Seller READ live gate
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias under test: `report_postings_create`
Follow-up operation: `report_info`

## Result

Classification: `PASS_REPORT_INFO_READY_OPAQUE_FILE_REF`

- request id: `72342313-8c33-4e39-a047-56c01716cf28`
- HTTP: `200`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `9e13284f`
- physical fingerprint: `9e13284f`
- command transformed: `false`
- report status: `success`
- report type: `seller_postings`
- provider signed file field: `[REDACTED]`
- opaque Bridge ref: `rpf_4619d324-8228-4c8e-b8be-c4c1ea05b92c`
- created at: `2026-09-03T03:29:51.387332Z`
- expires at: `2026-09-10T03:29:51.387332Z`

## Interpretation

The corrected lowercase NEW-03 report workflow reached a ready provider report. `report_info` itself does not reproduce DEFECT-002: logical and physical fingerprints are identical and no transform is reported.

The provider file URL remains redacted from the AI-visible result and is represented by an opaque `rpf_*` ref as designed.

Standalone NEW-03 remains incomplete until `report_file_get` is attempted and a usable file result is observed or the existing DEFECT-001 is reproduced.

RAW evidence:
`live-runs/repaired-26/raw/NEW_03_RUN_4_REPORT_INFO_RAW_2026-09-03.json`
