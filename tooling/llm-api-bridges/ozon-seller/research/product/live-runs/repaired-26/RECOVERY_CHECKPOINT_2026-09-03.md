# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Do not patch runtime until standalone + required batch collection is exhausted. Persist every result before the next Ozon command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

## Progress

- final closed: `0/26`
- standalone aliases exercised: `14/26`
- collection-complete/partial/provider-fail: `14/26`
- batch coverage: `0/26`
- open numbered defects: `6`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 10 report classes.
- DEFECT-002: planning metadata inconsistency on NEW-02/03; multiple later paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09.
- DEFECT-005: `supply_order_list` template/validator accepts required `filter.states=[]`, provider rejects it; non-empty states control returns HTTP200.
- DEFECT-006: `fbs_act_list` request contract is underconstrained/provider-invalid. Both the filter-less registry template and the explicit 31-day RFC3339 period request returned provider HTTP400/code3. Missing filter alone is not the diagnosis.

## NEW-15 setup preserved state

Run1:
- command `fbs_act_list` with `limit=50`, no filter;
- request `8ee3ff42-c8aa-4b98-9412-c73af369440b`;
- HTTP400 / provider code `3`;
- physical requests `1`;
- logical business results `1`;
- external request `true`;
- automatic retry `false`;
- exact request preserved `true`;
- fingerprints `937e3a3f == 937e3a3f`;
- transformed `false`.

Run2:
- command `fbs_act_list` with `limit=50` and filter `2026-08-01T00:00:00Z .. 2026-08-31T23:59:59Z`;
- request `b886712a-3882-4050-ae0b-f930740cb7e4`;
- HTTP400 / provider code `3`;
- physical requests `1`;
- logical business results `1`;
- external request `true`;
- automatic retry `false`;
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`;
- exact request preserved `true`;
- fingerprints `e77fcc54 == e77fcc54`;
- transformed `false`.

Active runtime `normalizeFbsActListParams` permits filter omission and, when filter exists, constrains `date_from`/`date_to` only to strings, `integration_type` to a string, and `status` to a string array. Exact provider-side code3 condition remains under collection; no patch yet.

Evidence:
- Run1 RAW `live-runs/repaired-26/raw/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_RAW_2026-09-03.json`
- Run1 parsed `live-runs/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_2026-09-03.md`
- Run2 RAW `live-runs/repaired-26/raw/NEW_15_SETUP_RUN_2_FBS_ACT_LIST_FILTERED_PROVIDER_400_RAW_2026-09-03.json`
- Run2 parsed `live-runs/NEW_15_SETUP_RUN_2_FBS_ACT_LIST_FILTERED_PROVIDER_400_2026-09-03.md`

## Exact next action

Issue a controlled materially different narrow completed-period setup command:

`OZON_API_V1 {"operation":"fbs_act_list","params":{"filter":{"date_from":"2026-09-01T00:00:00Z","date_to":"2026-09-02T23:59:59Z"},"limit":50}}`

This tests whether the rejected 31-day interval is the provider constraint while keeping the request shape constant. Persist the result before any further Ozon command. If it returns real act ids, use only a provider-returned id for NEW-15 `posting_fbs_act_container_labels`. If it returns another 4xx/5xx/error, do not automatically repeat that same business request.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_15_SETUP_TWO_400S_DEFECT_006_REFINED_NARROW_PERIOD_AB_NEXT_DEFECTS_001_002_003_004_005_006_OPEN_STD_10_FROZEN`
