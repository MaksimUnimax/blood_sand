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
- open numbered defects: `4`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 10 report classes through NEW-11.
- DEFECT-002: planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09/11/12/13 and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09. NEW-11 did not reproduce it.

## NEW-13 preserved state

Run1 `finance_decompensation_report` with `date=2026-08`:
- request `2c794bbd-96fc-486c-ae22-04b36d5e98e7`
- HTTP404 / provider code `5`
- physical requests `1`
- logical business results `1`
- external request `true`
- automatic retry `false`
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key `POST /v1/finance/decompensation`
- exact request preserved `true`
- fingerprints `9a67428a == 9a67428a`
- transformed `false`
- no report code returned.

Classification:
`COLLECTION_COMPLETE_PROVIDER_FAIL`

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_13_RUN_1_FINANCE_DECOMPENSATION_REPORT_PROVIDER_404_RAW_2026-09-03.json`
- parsed `live-runs/NEW_13_RUN_1_FINANCE_DECOMPENSATION_REPORT_PROVIDER_404_2026-09-03.md`

## NEW-14 setup contract

`cargoes_label_create` requires real integer `supply_id`.

Verified registry setup READ:
- alias `supply_order_list`
- `POST /v3/supply-order/list`
- effect `READ`
- `safety_class: READ_SAFE`
- template params: `filter.states=[]`, `limit=100`, `sort_by=ORDER_CREATION`, `sort_dir=DESC`.

If the setup returns only order ids, next use explicit `supply_order_get` / `supply_order_details` for a returned real order id to resolve an actual `supply_id`. Never invent IDs.

## Exact next command

`OZON_API_V1 {"operation":"supply_order_list","params":{"filter":{"states":[]},"limit":100,"sort_by":"ORDER_CREATION","sort_dir":"DESC"}}`

Persist its result before any further Ozon command.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_13_COMPLETE_NEW_14_SUPPLY_ORDER_LIST_SETUP_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
