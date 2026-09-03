# NEW-13 Run1 — finance_decompensation_report

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Operation: `finance_decompensation_report`
Params: `date=2026-08`

## Result

- request_id: `2c794bbd-96fc-486c-ae22-04b36d5e98e7`
- HTTP: `404`
- provider code: `5`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key: `POST /v1/finance/decompensation`
- exact_request_preserved: `true`
- logical fingerprint: `9a67428a`
- physical fingerprint: `9a67428a`
- command_transformed: `false`
- report code: none

## Judgment

`COLLECTION_COMPLETE_PROVIDER_FAIL`.

The bridge executed exactly one provider request, did not transform the command, preserved the exact request, and did not retry after provider HTTP404. The active runtime schema requires `date` in month format, and the submitted `2026-08` satisfies that contract. This single provider 404/code5 does not establish a new bridge defect.

No downstream `report_info` / document read is possible because no report code or opaque document reference was returned.

This is another clean counterexample narrowing DEFECT-002.

Do not patch runtime. Continue the collect-all-defects sweep.
