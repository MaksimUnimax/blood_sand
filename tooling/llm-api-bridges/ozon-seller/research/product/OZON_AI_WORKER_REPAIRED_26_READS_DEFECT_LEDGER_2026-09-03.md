# Ozon repaired 26 READs — live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Governing rule

Collect the entire standalone + multi-command batch defect set before patching. Runtime patching is forbidden during collection unless a defect makes all further testing technically impossible.

## DEFECT-001 — static personal-data gate on generic report_file_get

Classification: `OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`
Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`

Confirmed safe-report reproductions with personal-data setting OFF:
1. NEW-01 `seller_products`;
2. NEW-02 `seller_returns_v2`;
3. NEW-03 `seller_postings`;
4. NEW-04 `seller_discounted`.

All four file reads were locally `POLICY_BLOCKED / personal_data_setting_off`, physical requests `0`, external request `false`.

## DEFECT-002 — transformed create metadata inconsistent with exact_request_preserved

Classification: `TRANSFORMED_COMMAND_METADATA_CONTRADICTS_EXACT_REQUEST_PRESERVED`
Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`

Confirmed transformed create paths:
- NEW-02 `report_returns_create_v2`: `687fa368 -> d1fbfbfe`, transformed true, exact_request_preserved true, HTTP200.
- NEW-03 `report_postings_create` Run1: `ec963df4 -> 6274fae0`, transformed true, exact_request_preserved true, HTTP400.
- NEW-03 Run2: `34d187a7 -> a2721547`, transformed true, exact_request_preserved true, HTTP400.
- NEW-03 Run3: `0507ce87 -> 9f11d567`, transformed true, exact_request_preserved true, HTTP200.

Clean counterexamples narrow the scope:
- NEW-04 `report_discounted_create`: `02e64eda == 02e64eda`, transformed false, HTTP200.
- NEW-05 `report_warehouse_stock`: `f8e4cdac == f8e4cdac`, transformed false, HTTP200.
- `report_info` steps tested so far also preserve identical fingerprints.

Therefore DEFECT-002 is not universal; continue scope collection through remaining repaired create paths and later batch tests.

## DEFECT-003 — report_postings_create delivery_schema case mismatch

Classification: `REPORT_POSTINGS_DELIVERY_SCHEMA_CASE_NOT_CONSTRAINED_OR_NORMALIZED`
Status: `OPEN_CONFIRMED`

Live A/B on the same fully past interval:
- `delivery_schema=["FBO"]` => HTTP400;
- `delivery_schema=["fbo"]` => HTTP200.

Bridge accepts an unconstrained string array and does not prevent or safely normalize the provider-invalid uppercase value.

## Patch prohibition

Do not patch DEFECT-001..003 until the standalone + multi-command batch collection sweep is complete.
