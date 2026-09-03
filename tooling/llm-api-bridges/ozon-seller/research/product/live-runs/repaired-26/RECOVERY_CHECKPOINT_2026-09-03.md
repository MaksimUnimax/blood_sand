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

That code belongs only to the frozen forensic workflow.

## Progress

- final closed: `0/26`
- standalone aliases exercised: `13/26`
- collection-complete/partial/provider-fail: `13/26`
- batch coverage: `0/26`
- open numbered defects: `5`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 10 report classes through NEW-11.
- DEFECT-002: planning metadata inconsistency on NEW-02/03; multiple later create/report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09.
- DEFECT-005: `supply_order_list` active template/validator accepts required `filter.states=[]`, but provider rejects the exact template with HTTP400/code3.

## NEW-14 setup preserved state

Run1 exact runtime-template setup:
`{"operation":"supply_order_list","params":{"filter":{"states":[]},"limit":100,"sort_by":"ORDER_CREATION","sort_dir":"DESC"}}`

Observed:
- request `deba7764-b75b-4fbd-ada0-7e163844d109`
- HTTP400 / provider code `3`
- physical requests `1`
- logical business results `1`
- external request `true`
- automatic retry `false`
- exact request preserved `true`
- fingerprints `d0967438 == d0967438`
- transformed `false`.

Runtime findings:
- `normalizeSupplyOrderListParams` requires `filter.states`.
- it delegates to `validateEnumArray`.
- `validateEnumArray` permits empty arrays because it only validates present elements.
- active registry template explicitly uses `states: []`.

Classification:
`DEFECT-005 — SUPPLY_ORDER_LIST_EMPTY_STATES_TEMPLATE_PROVIDER_INVALID`

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_14_SETUP_RUN_1_SUPPLY_ORDER_LIST_EMPTY_STATES_PROVIDER_400_RAW_2026-09-03.json`
- parsed `live-runs/NEW_14_SETUP_RUN_1_SUPPLY_ORDER_LIST_EMPTY_STATES_PROVIDER_400_2026-09-03.md`

## Exact next action

Issue a materially different `supply_order_list` setup command with a non-empty explicit array containing all allowed runtime states:
- DATA_FILLING
- READY_TO_SUPPLY
- ACCEPTED_AT_SUPPLY_WAREHOUSE
- IN_TRANSIT
- ACCEPTANCE_AT_STORAGE_WAREHOUSE
- REPORTS_CONFIRMATION_AWAITING
- REPORT_REJECTED
- COMPLETED
- REJECTED_AT_SUPPLY_WAREHOUSE
- CANCELLED
- OVERDUE

Keep `limit=100`, `sort_by=ORDER_CREATION`, `sort_dir=DESC`.

Persist its result before any further Ozon command. If it returns real order ids, use explicit safe reads to resolve a real supply id. Never invent IDs.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_14_SETUP_DEFECT_005_NONEMPTY_ALL_STATES_NEXT_DEFECTS_001_002_003_004_005_OPEN_STD_10_FROZEN`
