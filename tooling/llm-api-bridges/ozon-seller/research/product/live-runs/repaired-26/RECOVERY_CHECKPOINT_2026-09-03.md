# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

No runtime patch until standalone + batch collection sweep is exhausted. Persist every result before the next Ozon command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

## Progress

- final closed: `0/26`
- standalone aliases exercised: `3/26`
- batch coverage: `0/26`
- open defects/candidates: `2`

## DEFECT-001

Static privacy block on generic `report_file_get`, reproduced on safe NEW-01 seller-products and NEW-02 seller-returns report files.

## DEFECT-002

Create planning metadata inconsistency now reproduced on NEW-02 and NEW-03:

- NEW-02 `687fa368 -> d1fbfbfe`, transformed true, exact_request_preserved true, provider 200.
- NEW-03 `ec963df4 -> 6274fae0`, transformed true, exact_request_preserved true, provider 400.

## NEW-03 Run1

`report_postings_create`

- request `ea2ca56c-ccb4-4b09-85b5-5f45a048529f`
- HTTP 400
- physical requests 1
- external request true
- provider error code 3
- no automatic retry
- runtime schema accepts delivery_schema as string array and both processed timestamps as date-time.

Run1 used `processed_at_to=2026-09-03T23:59:59Z`, later than actual execution time. Provider 400 remains under diagnosis, not yet a separate defect.

## Exact next command

NEW-03 Run2: new diagnostic request with fully past range 2026-09-01 through 2026-09-02, same FBO delivery schema. Do not repeat Run1 payload automatically.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_03_RUN1_HTTP400_SCHEMA_VALID_PAST_WINDOW_DIAGNOSTIC_NEXT_DEFECTS_001_002_OPEN_STD_10_FROZEN`
