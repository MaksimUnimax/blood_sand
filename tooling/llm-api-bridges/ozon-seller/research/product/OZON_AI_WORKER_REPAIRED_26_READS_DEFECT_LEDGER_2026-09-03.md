# Ozon repaired 26 READs — live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Governing rule

Collect the entire standalone + multi-command batch defect set before patching. Runtime patching is forbidden during collection unless a defect makes all further testing technically impossible.

## DEFECT-001 — static personal-data gate on generic report_file_get

Classification: `OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`
Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`

Confirmed reproductions with personal-data setting OFF:
1. NEW-01 `seller_products`;
2. NEW-02 `seller_returns_v2`;
3. NEW-03 `seller_postings`;
4. NEW-04 `seller_discounted`;
5. NEW-05 `seller_stocks`;
6. NEW-06 `seller_placement_by_products`;
7. NEW-07 `seller_placement_by_supplies`;
8. NEW-08 `marked_products_sales`;
9. NEW-09 `finance_realization_posting`.

All nine file reads were locally `POLICY_BLOCKED / personal_data_setting_off`, physical requests `0`, external request `false`.

NEW-09 reproduction:
- opaque ref `rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95`;
- request `policy-c52040e3-2327-4a14-be83-f786a928b053`;
- fingerprint `928bfa76`;
- HTTP `0`;
- physical requests `0`;
- external request `false`;
- entitlement `POLICY_BLOCKED / personal_data_setting_off`;
- error `OPERATION_DISABLED_BY_USER`;
- stage `personal_data_policy`.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_09_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_09_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

NEW-11 `mutual_settlement` has now reached a successful `report_info` with opaque ref `rpf_18eb749e-08df-4b99-8107-f4dcbf0a2529`; explicit `report_file_get` is next to determine whether DEFECT-001 scope extends to a tenth report class.

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
- NEW-09 `report_info`: `604b53c9 == 604b53c9`, transformed false, HTTP200.
- NEW-11 `finance_mutual_settlement_report`: `29860803 == 29860803`, transformed false, HTTP200.
- NEW-11 `report_info`: `e19249be == e19249be`, transformed false, HTTP200.
- other tested `report_info` steps also preserve identical fingerprints.

Therefore DEFECT-002 is not universal; continue scope collection through remaining repaired paths and later batch tests.

## DEFECT-003 — report_postings_create delivery_schema case mismatch

Classification: `REPORT_POSTINGS_DELIVERY_SCHEMA_CASE_NOT_CONSTRAINED_OR_NORMALIZED`
Status: `OPEN_CONFIRMED`

Live A/B on the same fully past interval:
- `delivery_schema=["FBO"]` => HTTP400;
- `delivery_schema=["fbo"]` => HTTP200.

Bridge accepts an unconstrained string array and does not prevent or safely normalize the provider-invalid uppercase value.

## DEFECT-004 — report_info additional_data key/value privacy-redaction bypass

Classification: `REPORT_INFO_ADDITIONAL_DATA_KEY_VALUE_PRIVACY_REDACTION_BYPASS`
Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`
Severity: privacy / personal-data disclosure

NEW-09 Run2 `report_info` for `finance_realization_posting` returned HTTP200 while the operator's personal-data setting was OFF and exposed identifying receiver metadata inside `result.additional_data`.

The leaked values are intentionally **not** copied into repository evidence. Persisted evidence masks every `additional_data.value` while retaining structural field names needed to prove and reproduce the bypass.

Observed sensitive semantic keys included receiver identity/tax fields such as `ReceiverName`, `ReceiverInn`, `ReceiverKpp`.

Current Bridge result sanitization checks actual JSON property names/paths. `additional_data` stores the semantic name in a field named `key` and corresponding data in sibling `value`; therefore `{key: <sensitive semantic>, value: <personal data>}` bypasses a redactor that only evaluates literal property names `key` and `value`.

NEW-11 Run2 `report_info` returned `additional_data: []`, so DEFECT-004 was not reproduced on `mutual_settlement`. This is only a scope counterexample and does not close the confirmed NEW-09 privacy defect.

Evidence:
- privacy-safe RAW `live-runs/repaired-26/raw/NEW_09_RUN_2_REPORT_INFO_PRIVACY_LEAK_SANITIZED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_09_RUN_2_REPORT_INFO_PRIVACY_LEAK_2026-09-03.md`
- NEW-11 clean RAW `live-runs/repaired-26/raw/NEW_11_RUN_2_REPORT_INFO_RAW_2026-09-03.json`
- NEW-11 clean parsed `live-runs/NEW_11_RUN_2_REPORT_INFO_2026-09-03.md`

Do not patch yet. Continue scope collection through finance/document outputs.

## Patch prohibition

Do not patch DEFECT-001..004 until the standalone + multi-command batch collection sweep is complete.
