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
- DEFECT-002: planning metadata inconsistency on NEW-02/03; multiple later paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09.
- DEFECT-005: `supply_order_list` active template/validator accepts required `filter.states=[]`, provider rejects it HTTP400/code3; explicit non-empty states control returns HTTP200.

## NEW-14 setup preserved state

Run1 exact registry-template setup:
- `states=[]`
- request `deba7764-b75b-4fbd-ada0-7e163844d109`
- HTTP400/code3
- physical1, logical1, external true
- exact request preserved true
- `d0967438 == d0967438`
- transformed false.

Run2 materially different non-empty states setup:
- request `3e5b9659-7664-4749-a34f-ad9a9af9ad42`
- HTTP200
- physical1, logical1, external true
- exact request preserved true
- fingerprints `bc9210cd == bc9210cd`
- transformed false
- returned 100 real order IDs
- first order id `125820894`.

Run3 explicit `supply_order_get` using that real order id:
- request `0d3a6203-fc53-4707-b72b-329ce10ce928`
- HTTP200
- physical1, logical1, external true
- exact request preserved true
- fingerprints `f41eda95 == f41eda95`
- transformed false
- order id `125820894`
- order state `DATA_FILLING`
- real provider-returned integer supply id `2000064871008`
- supply state `DATA_FILLING`
- address redacted correctly.

Evidence Run3:
- RAW `live-runs/repaired-26/raw/NEW_14_SETUP_RUN_3_SUPPLY_ORDER_GET_REAL_SUPPLY_ID_RAW_2026-09-03.json`
- parsed `live-runs/NEW_14_SETUP_RUN_3_SUPPLY_ORDER_GET_REAL_SUPPLY_ID_2026-09-03.md`

## Exact next action

Run standalone NEW-14 with this exact real supply id only:

`OZON_API_V1 {"operation":"cargoes_label_create","params":{"supply_id":2000064871008}}`

Persist its result before any downstream status/document read or before advancing to NEW-15. Do not invent identifiers. Provider rejection due to business state, if any, is evidence and must not trigger an automatic retry.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_14_SETUP_COMPLETE_REAL_SUPPLY_2000064871008_CARGOES_LABEL_CREATE_NEXT_DEFECTS_001_002_003_004_005_OPEN_STD_10_FROZEN`
