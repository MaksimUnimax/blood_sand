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
- open numbered defects/candidates: `2`

## DEFECT-001

Static privacy block on generic `report_file_get`, reproduced on safe NEW-01 seller-products and NEW-02 seller-returns report files.

## DEFECT-002

Create planning metadata inconsistency:

- NEW-02 `687fa368 -> d1fbfbfe`, transformed true, exact_request_preserved true, provider 200.
- NEW-03 Run1 `ec963df4 -> 6274fae0`, transformed true, exact_request_preserved true, provider 400.
- NEW-03 Run2 `34d187a7 -> a2721547`, transformed true, exact_request_preserved true, provider 400.

## NEW-03 provider rejection investigation

Run1:
- request `ea2ca56c-ccb4-4b09-85b5-5f45a048529f`
- HTTP 400
- payload included a future end timestamp.

Run2:
- request `279835dd-389b-4b1a-980c-03986d27d40b`
- HTTP 400
- fully past interval `2026-09-01T00:00:00Z..2026-09-02T23:59:59Z`
- delivery schema `FBO` uppercase
- physical requests 1
- external request true.

Therefore future-time hypothesis is rejected. Runtime schema accepts delivery_schema as an unconstrained string array. Public endpoint examples use lowercase values such as `fbs`.

## Exact next command

NEW-03 Run3: same fully past interval, change only semantic delivery schema to lowercase `fbo`.

`OZON_API_V1 {"operation":"report_postings_create","params":{"filter":{"processed_at_from":"2026-09-01T00:00:00Z","processed_at_to":"2026-09-02T23:59:59Z","delivery_schema":["fbo"]}}}`

If 200: promote separate Bridge contract/template/guidance defect and continue report_info/file chain. If 400: persist and continue diagnosis. Do not patch.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_03_RUN2_400_LOWERCASE_DELIVERY_SCHEMA_NEXT_DEFECTS_001_002_OPEN_STD_10_FROZEN`
