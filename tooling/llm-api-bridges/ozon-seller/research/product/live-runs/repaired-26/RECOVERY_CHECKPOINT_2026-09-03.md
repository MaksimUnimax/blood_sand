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
- DEFECT-006: `fbs_act_list` runtime template omits filter and is provider-invalid; exact `{limit:50}` request returned HTTP400/code3.

## NEW-15 setup preserved state

Run1 exact active registry template:
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

Runtime `normalizeFbsActListParams` permits filter omission. When filter is supplied it requires `date_from` and `date_to`. Registry advertises the filter-less template. This mismatch is DEFECT-006; no patch yet.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_RAW_2026-09-03.json`
- parsed `live-runs/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_2026-09-03.md`

## Exact next action

Issue materially different setup command with explicit completed-period filter:

`OZON_API_V1 {"operation":"fbs_act_list","params":{"filter":{"date_from":"2026-08-01T00:00:00Z","date_to":"2026-08-31T23:59:59Z"},"limit":50}}`

Persist the result before any further Ozon command. If it returns real act ids, use only a provider-returned id for NEW-15 `posting_fbs_act_container_labels`. If provider returns another 4xx/5xx/error, do not automatically repeat that same request.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_15_SETUP_TEMPLATE_400_DEFECT_006_PERIOD_FILTER_AB_NEXT_DEFECTS_001_002_003_004_005_006_OPEN_STD_10_FROZEN`
