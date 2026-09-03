# NEW-03 Run3 — report_postings_create lowercase FBO PASS

Date: 2026-09-03
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Operation: `report_postings_create`

Diagnostic purpose: isolate whether the stable HTTP400 from NEW-03 Runs1-2 was caused by the case of `filter.delivery_schema`.

Logical request used a fully past time window and:

`delivery_schema=["fbo"]`

## Result

- request id: `8e92df34-abdc-450f-a82b-dd55605bb7ac`
- HTTP: `200`
- elapsed: `1444 ms`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact_request_preserved: `true`
- logical fingerprint: `0507ce87`
- physical fingerprint: `9f11d567`
- command_transformed: `true`
- report code: `REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`

## Differential diagnosis

NEW-03 Run2 used the same wholly past interval with `delivery_schema=["FBO"]` and received provider HTTP400. Run3 changed only the delivery-schema case to lowercase and received HTTP200.

Therefore the provider rejection is now classified as a Bridge contract/guidance defect rather than an invalid date-window test:

`DEFECT-003_REPORT_POSTINGS_DELIVERY_SCHEMA_CASE_NOT_CONSTRAINED_OR_NORMALIZED`

The repaired runtime schema currently accepts arbitrary strings for `delivery_schema` and the registry/template can lead to uppercase values, while the live provider requires the accepted lowercase representation for this request path.

This run also reproduces DEFECT-002:

- logical fingerprint `0507ce87`
- physical fingerprint `9f11d567`
- `command_transformed=true`
- entitlement simultaneously reports `exact_request_preserved=true`.

No runtime patch is permitted during the collection phase.

## Next workflow step

Use one explicit `report_info` for the returned report code. If ready, later attempt `report_file_get` and record whether DEFECT-001 reproduces on `seller_postings`.

RAW:
`live-runs/repaired-26/raw/NEW_03_RUN_3_REPORT_POSTINGS_CREATE_LOWERCASE_FBO_PASS_RAW_2026-09-03.json`
