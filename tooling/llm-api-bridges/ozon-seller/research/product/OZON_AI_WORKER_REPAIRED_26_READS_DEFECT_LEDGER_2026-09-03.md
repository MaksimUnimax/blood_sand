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
9. NEW-09 `finance_realization_posting`;
10. NEW-11 `mutual_settlement`.

All ten file reads were locally `POLICY_BLOCKED / personal_data_setting_off`, physical requests `0`, external request `false`.

Latest NEW-11 reproduction:
- opaque ref `rpf_18eb749e-08df-4b99-8107-f4dcbf0a2529`;
- request `policy-58d43bb1-6126-4e4c-9178-7609dc7e858d`;
- fingerprint `36df3b67`;
- HTTP `0`;
- physical requests `0`;
- external request `false`;
- entitlement `POLICY_BLOCKED / personal_data_setting_off`;
- error `OPERATION_DISABLED_BY_USER`;
- automatic retry `false`;
- stage `personal_data_policy`.

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
- NEW-12 `finance_compensation_report`: `0fb59a8f == 0fb59a8f`, transformed false, exact_request_preserved true, provider HTTP404/code5.
- NEW-13 `finance_decompensation_report`: `9a67428a == 9a67428a`, transformed false, exact_request_preserved true, provider HTTP404/code5.
- NEW-14 `cargoes_label_create`: `151c4db3 == 151c4db3`, transformed false, exact_request_preserved true, provider HTTP429/code8.
- NEW-15 setup Run1 `fbs_act_list`: `937e3a3f == 937e3a3f`, transformed false, exact_request_preserved true, provider HTTP400/code3.
- NEW-15 setup Run2 `fbs_act_list`: `e77fcc54 == e77fcc54`, transformed false, exact_request_preserved true, provider HTTP400/code3.
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

## DEFECT-005 — supply_order_list empty states template is provider-invalid

Classification: `SUPPLY_ORDER_LIST_EMPTY_STATES_TEMPLATE_PROVIDER_INVALID`
Status: `OPEN_CONFIRMED`

NEW-14 setup A/B:
- active runtime template with `filter.states=[]` => HTTP400/code3;
- same endpoint with explicit non-empty runtime-valid states => HTTP200 and 100 real order IDs.

Active runtime `normalizeSupplyOrderListParams` requires `filter.states` and validates it with `validateEnumArray`. `validateEnumArray` accepts an empty array because it only iterates and validates present elements. The operation registry simultaneously advertises the empty-array template. The successful non-empty A/B control confirms the endpoint is usable and isolates the defect to the bridge template/validation contract for empty `states`.

Evidence:
- failing RAW `live-runs/repaired-26/raw/NEW_14_SETUP_RUN_1_SUPPLY_ORDER_LIST_EMPTY_STATES_PROVIDER_400_RAW_2026-09-03.json`
- failing parsed `live-runs/NEW_14_SETUP_RUN_1_SUPPLY_ORDER_LIST_EMPTY_STATES_PROVIDER_400_2026-09-03.md`
- passing RAW `live-runs/repaired-26/raw/NEW_14_SETUP_RUN_2_SUPPLY_ORDER_LIST_NONEMPTY_STATES_PASS_RAW_2026-09-03.json`
- passing parsed `live-runs/NEW_14_SETUP_RUN_2_SUPPLY_ORDER_LIST_NONEMPTY_STATES_PASS_2026-09-03.md`

## DEFECT-006 — fbs_act_list request contract permits provider-invalid forms

Classification: `FBS_ACT_LIST_REQUEST_CONTRACT_UNDERCONSTRAINED_PROVIDER_INVALID`
Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`

NEW-15 setup Run1 used the exact active registry template:
`{"operation":"fbs_act_list","params":{"limit":50}}`

Observed:
- request `8ee3ff42-c8aa-4b98-9412-c73af369440b`;
- HTTP400 / provider code `3`;
- physical1, logical1, external true;
- automatic retry false;
- exact request preserved true;
- fingerprints `937e3a3f == 937e3a3f`;
- transformed false.

NEW-15 setup Run2 used an explicit RFC3339 completed-month filter:
`{"operation":"fbs_act_list","params":{"filter":{"date_from":"2026-08-01T00:00:00Z","date_to":"2026-08-31T23:59:59Z"},"limit":50}}`

Observed:
- request `b886712a-3882-4050-ae0b-f930740cb7e4`;
- HTTP400 / provider code `3`;
- physical1, logical1, external true;
- automatic retry false;
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`;
- exact request preserved true;
- fingerprints `e77fcc54 == e77fcc54`;
- transformed false.

Run2 disproves the narrower hypothesis that filter omission alone explains Run1. Active runtime `normalizeFbsActListParams` requires only `limit`; `filter` is optional, and when present it only checks that `date_from`/`date_to` are strings while `integration_type` is an unconstrained string and `status` is an unconstrained string array. It does not encode provider temporal constraints or provider enums.

The confirmed bridge defect is therefore broader: the active advertised/validated request contract permits provider-invalid forms. The exact provider-side constraint causing code3 remains under collection. No runtime patch is allowed yet.

Next controlled A/B is a narrow fully completed two-day interval using the same request shape. This is materially different from the rejected 31-day interval and tests whether the provider rejection is period-related without automatically retrying the same business request.

Evidence:
- Run1 RAW `live-runs/repaired-26/raw/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_RAW_2026-09-03.json`
- Run1 parsed `live-runs/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_2026-09-03.md`
- Run2 RAW `live-runs/repaired-26/raw/NEW_15_SETUP_RUN_2_FBS_ACT_LIST_FILTERED_PROVIDER_400_RAW_2026-09-03.json`
- Run2 parsed `live-runs/NEW_15_SETUP_RUN_2_FBS_ACT_LIST_FILTERED_PROVIDER_400_2026-09-03.md`

## NEW-12 provider outcome

`finance_compensation_report` with `date=2026-08`: HTTP404/code5, exactly one external request, no automatic retry, no report code. Recorded as `COLLECTION_COMPLETE_PROVIDER_FAIL`, not a new numbered defect.

## NEW-13 provider outcome

`finance_decompensation_report` with `date=2026-08`: HTTP404/code5, exactly one external request, no automatic retry, no report code. Recorded as `COLLECTION_COMPLETE_PROVIDER_FAIL`, not a new numbered defect.

## NEW-14 provider outcome

Standalone `cargoes_label_create` used real provider-returned `supply_id=2000064871008` and returned provider HTTP429/code8 with `Retry-After: 1`.

Observed:
- request `b09f1156-6ada-42b7-9cef-8cface858ec1`;
- physical1, logical1, external true;
- automatic retry false;
- exact request preserved true;
- fingerprints `151c4db3 == 151c4db3`;
- transformed false.

Classification: `COLLECTION_COMPLETE_PROVIDER_RATE_LIMIT_FAIL`.

No new bridge defect is established. The bridge correctly did not automatically retry. Per collection rules the same business request is not automatically repeated after HTTP429. No operation/status/document reference was returned, so the asynchronous label chain cannot continue from this attempt.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_14_RUN_1_CARGOES_LABEL_CREATE_PROVIDER_429_RAW_2026-09-03.json`
- parsed `live-runs/NEW_14_RUN_1_CARGOES_LABEL_CREATE_PROVIDER_429_2026-09-03.md`

## Patch prohibition

Do not patch DEFECT-001..006 until the standalone + multi-command batch collection sweep is complete.
