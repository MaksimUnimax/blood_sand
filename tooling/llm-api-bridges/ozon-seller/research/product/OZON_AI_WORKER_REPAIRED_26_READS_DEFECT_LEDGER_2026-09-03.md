# Ozon repaired 26 READs — live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Governing rule

Collect the entire standalone + multi-command batch defect set before patching. Runtime patching is forbidden during collection unless one defect makes all further testing technically impossible.

## DEFECT-001 — report_file_get statically gated as personal-data read

Classification:
`OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`

Status: `OPEN_COLLECTING_SCOPE`

Confirmed safe-report reproductions with personal-data setting OFF:

1. NEW-01 `seller_products`: local POLICY_BLOCKED, physical requests 0, external request false.
2. NEW-02 `seller_returns_v2`: local POLICY_BLOCKED, physical requests 0, external request false.

Continue establishing scope across remaining reports/documents. Do not patch yet.

## DEFECT-002 — transformed create metadata inconsistent with exact_request_preserved

Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`

Confirmed on:

- NEW-02 Run1 `report_returns_create_v2`: `687fa368 -> d1fbfbfe`, transformed true, exact_request_preserved true, HTTP200.
- NEW-03 Run1 `report_postings_create`: `ec963df4 -> 6274fae0`, transformed true, exact_request_preserved true, HTTP400.
- NEW-03 Run2 `report_postings_create`: `34d187a7 -> a2721547`, transformed true, exact_request_preserved true, HTTP400.
- NEW-03 Run3 `report_postings_create`: `0507ce87 -> 9f11d567`, transformed true, exact_request_preserved true, HTTP200.

This is no longer a single-call candidate; it is a repeated planning/metadata inconsistency. Continue scope collection through remaining create aliases and batch tests. Do not patch yet.

## DEFECT-003 — report_postings_create delivery_schema case contract/guidance mismatch

Classification:
`REPORT_POSTINGS_DELIVERY_SCHEMA_CASE_NOT_CONSTRAINED_OR_NORMALIZED`

Status: `OPEN_CONFIRMED`

### Differential live evidence

NEW-03 Run2 used a fully past interval and:

`delivery_schema=["FBO"]`

Result:
- provider HTTP400
- physical requests 1
- external request true.

NEW-03 Run3 used the same fully past interval and changed only the semantic delivery-schema value to:

`delivery_schema=["fbo"]`

Result:
- request `8e92df34-abdc-450f-a82b-dd55605bb7ac`
- provider HTTP200
- physical requests 1
- external request true
- returned report code `REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`.

The current repaired Bridge schema accepts `delivery_schema` as an unconstrained array of strings, and the runtime/template/guidance does not prevent the provider-invalid uppercase representation. Live A/B evidence proves lowercase `fbo` succeeds where uppercase `FBO` fails with otherwise equivalent completed-period payload.

Evidence:
- Run2 RAW: `live-runs/repaired-26/raw/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_RAW_2026-09-03.json`
- Run2 parsed: `live-runs/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_2026-09-03.md`
- Run3 RAW: `live-runs/repaired-26/raw/NEW_03_RUN_3_REPORT_POSTINGS_CREATE_LOWERCASE_FBO_PASS_RAW_2026-09-03.json`
- Run3 parsed: `live-runs/NEW_03_RUN_3_REPORT_POSTINGS_CREATE_LOWERCASE_FBO_PASS_2026-09-03.md`

Do not patch yet.
