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
- standalone aliases exercised: `3/26`
- batch coverage: `0/26`
- open numbered defects/candidates: `3`

## DEFECT-001

Static privacy block on generic `report_file_get`, reproduced on safe NEW-01 seller-products and NEW-02 seller-returns report files. NEW-03 seller-postings file read is next scope check.

## DEFECT-002

Planning metadata inconsistency reproduced on NEW-02 and NEW-03 create paths. NEW-03 Run4 `report_info` did not reproduce it (`9e13284f == 9e13284f`, transformed false).

## DEFECT-003

`report_postings_create` delivery schema case mismatch confirmed:
- uppercase `FBO` => HTTP400;
- lowercase `fbo` on same past range => HTTP200.

## NEW-03 current state

Successful create:
- request `8e92df34-abdc-450f-a82b-dd55605bb7ac`
- code `REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`

Report-info PASS:
- request `72342313-8c33-4e39-a047-56c01716cf28`
- HTTP200
- status `success`
- report type `seller_postings`
- signed file redacted
- opaque ref `rpf_4619d324-8228-4c8e-b8be-c4c1ea05b92c`
- fingerprint `9e13284f`
- transformed false.

## Exact next command

NEW-03:
`OZON_API_V1 {"operation":"report_file_get","params":{"file_ref":"rpf_4619d324-8228-4c8e-b8be-c4c1ea05b92c","offset":0,"limit":50}}`

Persist whether DEFECT-001 reproduces on seller-postings. Do not patch; after recording, advance to NEW-04.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_03_REPORT_INFO_PASS_FILE_GET_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
