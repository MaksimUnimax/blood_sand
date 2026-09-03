# NEW-11 Run2 — report_info

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Alias under test: `finance_mutual_settlement_report`
Follow-up operation: `report_info`

## Result

PASS.

- request_id: `f56ad0ed-8795-4c66-8dd9-1da54eb3602c`
- HTTP: `200`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- exact request preserved: `true`
- logical fingerprint: `e19249be`
- physical fingerprint: `e19249be`
- command transformed: `false`
- report status: `success`
- report type: `mutual_settlement`
- provider file field: `[REDACTED]`
- opaque report file ref: `rpf_18eb749e-08df-4b99-8107-f4dcbf0a2529`
- additional_data: empty array

## Defect judgment

No new defect.

DEFECT-002 scope narrows further: this `report_info` path is another clean counterexample with identical logical/physical fingerprints and `command_transformed=false`.

DEFECT-004 is not reproduced here because `additional_data` is empty; this does not close DEFECT-004, which remains confirmed on NEW-09 finance realization.

Next standalone step for NEW-11 is explicit `report_file_get` on the opaque ref to test whether DEFECT-001 also applies to `mutual_settlement` while the personal-data setting remains OFF.

Do not patch runtime during collection.
