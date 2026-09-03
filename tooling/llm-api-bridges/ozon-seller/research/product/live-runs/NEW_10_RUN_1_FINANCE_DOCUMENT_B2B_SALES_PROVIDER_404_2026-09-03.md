# NEW-10 Run1 — finance_document_b2b_sales — provider 404

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Submitted command

```json
{"operation":"finance_document_b2b_sales","params":{"date":"2026-08"}}
```

## Result

- request_id: `7182d4dc-f32a-4c33-834f-d8922775cecb`
- HTTP: `404`
- provider error code: `5`
- external request executed: `true`
- physical business requests: `1`
- logical business results: `1`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key: `POST /v1/finance/document-b2b-sales`
- rule source: `reviewed-openapi-463-2026-08-19`
- exact_request_preserved: `true`
- logical fingerprint: `04d982c1`
- physical fingerprint: `04d982c1`
- command_transformed: `false`
- elapsed: `1525 ms`

## Classification

`COLLECTION_COMPLETE_PROVIDER_FAIL`

The bridge issued exactly one business request and did not retry the provider 404. Planning metadata is clean: logical and physical fingerprints are identical and `command_transformed=false`, so this run does not reproduce DEFECT-002. It is also not DEFECT-001 because the request reached Ozon.

Current API evidence still lists `POST /v1/finance/document-b2b-sales`, with `date` in `YYYY-MM` format; Ozon's 2026-02-12 Seller API update explicitly marks `date` required for this method. Therefore this single `404 / code 5` is recorded as a provider/data-availability outcome, not a new numbered bridge defect.

No automatic repeat is permitted after provider 4xx. Because no report code was returned, `report_info` / `report_file_get` cannot be performed for this NEW-10 run. Advance to NEW-11 while preserving the failure for later post-patch/retest planning if broader finance evidence changes the diagnosis.

## Evidence

RAW:
`live-runs/repaired-26/raw/NEW_10_RUN_1_FINANCE_DOCUMENT_B2B_SALES_PROVIDER_404_RAW_2026-09-03.json`

## Workflow constraints

- No runtime patching during collection.
- DEFECT-001..004 remain open.
- STD-10 remains frozen and untouched.
