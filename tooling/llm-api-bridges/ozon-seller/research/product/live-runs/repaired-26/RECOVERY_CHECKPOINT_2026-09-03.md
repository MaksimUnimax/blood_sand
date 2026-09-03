# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

No runtime patch until standalone + required batch collection sweep is exhausted. Persist every result before the next Ozon command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

## Progress

- final closed: `0/26`
- standalone repaired aliases exercised: `4/26`
- standalone collection complete/partial-fail: `4/26`
- NEW-05 setup: PASS
- batch coverage: `0/26`
- open numbered defects/candidates: `3`

## Open defects

### DEFECT-001
Static privacy block on generic `report_file_get`, reproduced on safe `seller_products`, `seller_returns_v2`, `seller_postings`, and `seller_discounted` report files.

### DEFECT-002
Create planning metadata inconsistency on NEW-02 and NEW-03: different physical fingerprint / transformed true while `exact_request_preserved=true`. NEW-04 and NEW-05 setup are clean counterexamples.

### DEFECT-003
`report_postings_create` delivery-schema case mismatch: uppercase `FBO` => HTTP400; lowercase `fbo` on same past range => HTTP200.

## NEW-05 setup state

Existing setup READ:
`seller_warehouse_list`

- request `657a1c3c-a0d3-4160-9f2a-64f8ec681672`
- HTTP200
- physical requests 1
- external request true
- fingerprint `11b894f6`
- transformed false
- returned real seller warehouse ID `1020001773680000`
- name `Златоуст Чёт`
- warehouse_type `fbs`
- status `created`
- has_next `false`
- phone/courier phones redacted.

RAW:
`live-runs/repaired-26/raw/NEW_05_SETUP_RUN_1_SELLER_WAREHOUSE_LIST_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_05_SETUP_RUN_1_SELLER_WAREHOUSE_LIST_2026-09-03.md`

## Exact next command

NEW-05 repaired alias:
`OZON_API_V1 {"operation":"report_warehouse_stock","params":{"warehouseId":["1020001773680000"]}}`

After the result, persist RAW + parsed + gate + this checkpoint. If create succeeds, continue explicit report_info/file chain. Do not patch runtime during collection.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_05_SETUP_PASS_WAREHOUSE_STOCK_CREATE_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
