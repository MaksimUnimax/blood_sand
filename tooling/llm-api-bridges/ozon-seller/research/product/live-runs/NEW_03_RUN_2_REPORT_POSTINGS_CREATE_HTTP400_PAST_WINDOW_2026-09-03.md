# NEW-03 Run2 — report_postings_create HTTP 400 on fully past window

Date: 2026-09-03
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias: `report_postings_create`

## Command intent

Diagnostic second provider request after Run1 HTTP 400. The time window was changed so that both boundaries are entirely in the past:

- `processed_at_from=2026-09-01T00:00:00Z`
- `processed_at_to=2026-09-02T23:59:59Z`
- `delivery_schema=["FBO"]`

This is not an automatic retry; the business payload was changed to test the future-boundary hypothesis.

## Exact result

- request id: `279835dd-389b-4b1a-980c-03986d27d40b`
- operation: `report_postings_create`
- logical fingerprint: `34d187a7`
- physical fingerprint: `a2721547`
- `command_transformed=true`
- provider: Ozon Seller API
- external request executed: `true`
- physical business requests: `1`
- HTTP: `400`
- provider error code: `3`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement metadata: `exact_request_preserved=true`

## Interpretation

Run2 disproves the hypothesis that Run1 failed merely because its `processed_at_to` extended beyond the actual execution time. A fully past window still returns HTTP 400.

The current Bridge schema requires `filter.processed_at_from`, `filter.processed_at_to`, and `filter.delivery_schema`; it models `delivery_schema` as an array of unconstrained strings. The Bridge accepted the command and executed one provider request, so this was not a local schema rejection.

Planning metadata again reproduces DEFECT-002 scope: the command is reported transformed (`34d187a7 -> a2721547`) while entitlement metadata simultaneously states `exact_request_preserved=true`.

A public example of the same Ozon endpoint uses lowercase delivery-schema values (`fbs`). Therefore the next diagnostic request will change `delivery_schema` from `["FBO"]` to `["fbo"]` while retaining the same fully past time window. If that succeeds, the Bridge contract/template/guidance has a provider-value normalization/validation defect; if it still fails, continue diagnosis without patching.

## Classification

`HTTP400_REPRODUCED_FUTURE_BOUNDARY_HYPOTHESIS_REJECTED_LOWERCASE_DELIVERY_SCHEMA_DIAGNOSTIC_NEXT`

No runtime patch is allowed during the collection sweep.

RAW evidence:
`repaired-26/raw/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_RAW_2026-09-03.json`
