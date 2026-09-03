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
4. NEW-04 `seller_discounted`;
5. NEW-05 `seller_stocks`;
6. NEW-06 `seller_placement_by_products`;
7. NEW-07 `seller_placement_by_supplies`;
8. NEW-08 `marked_products_sales`.

All eight file reads were locally `POLICY_BLOCKED / personal_data_setting_off`, physical requests `0`, external request `false`.

NEW-08 reproduction:
- source code `REPORT_marked_products_sales_2093109_1788408823_01a06578-fdec-762d-869c-fe3b626796cc`;
- opaque ref `rpf_e414b482-5e63-4211-99aa-be3ed53ff09b`;
- request `policy-7fb3e562-2c99-43a9-a203-edae0701f579`;
- fingerprint `c35d1869`;
- HTTP `0`;
- physical requests `0`;
- external request `false`;
- entitlement `POLICY_BLOCKED / personal_data_setting_off`;
- error `OPERATION_DISABLED_BY_USER`;
- stage `personal_data_policy`;
- automatic retry `false`.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_08_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_08_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

This eighth safe report class further confirms generic helper-policy behavior rather than report-type-specific sensitivity.

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
- NEW-06 `report_placement_by_products_create`: `85e4f38a == 85e4f38a`, transformed false, HTTP200.
- NEW-07 `report_placement_by_supplies_create`: `2a4cb92d == 2a4cb92d`, transformed false, HTTP200.
- NEW-08 `report_marked_products_sales_create`: `0630aa10 == 0630aa10`, transformed false, HTTP200.
- NEW-09 `report_realization_posting_create`: `50a8fdbc == 50a8fdbc`, transformed false, HTTP200.
- tested `report_info` steps so far also preserve identical fingerprints.

NEW-09 is another clean repaired create-path counterexample, so DEFECT-002 remains specific to particular planner/normalization paths rather than repaired create aliases generally.

NEW-09 evidence:
- RAW `live-runs/repaired-26/raw/NEW_09_RUN_1_REPORT_REALIZATION_POSTING_CREATE_RAW_2026-09-03.json`
- parsed `live-runs/NEW_09_RUN_1_REPORT_REALIZATION_POSTING_CREATE_2026-09-03.md`

Continue scope collection through remaining repaired create paths and later batch tests.

## DEFECT-003 — report_postings_create delivery_schema case mismatch

Classification: `REPORT_POSTINGS_DELIVERY_SCHEMA_CASE_NOT_CONSTRAINED_OR_NORMALIZED`
Status: `OPEN_CONFIRMED`

Live A/B on the same fully past interval:
- `delivery_schema=["FBO"]` => HTTP400;
- `delivery_schema=["fbo"]` => HTTP200.

Bridge accepts an unconstrained string array and does not prevent or safely normalize the provider-invalid uppercase value.

## Patch prohibition

Do not patch DEFECT-001..003 until the standalone + multi-command batch collection sweep is complete.
