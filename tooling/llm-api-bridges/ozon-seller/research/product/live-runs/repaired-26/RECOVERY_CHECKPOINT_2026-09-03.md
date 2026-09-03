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

Static privacy block on generic `report_file_get`, reproduced on safe NEW-01 seller-products and NEW-02 seller-returns report files.

## DEFECT-002

Planning metadata inconsistency reproduced on NEW-02 and NEW-03 create paths: physical fingerprint differs / transformed true while exact_request_preserved remains true.

NEW-03 Run3: `0507ce87 -> 9f11d567`, transformed true, exact_request_preserved true, provider HTTP200.

## DEFECT-003

`report_postings_create` delivery schema case mismatch confirmed by live A/B:

- fully past range + uppercase `FBO` => HTTP400;
- same fully past range + lowercase `fbo` => HTTP200.

## NEW-03 current state

Run3 successful create:
- request `8e92df34-abdc-450f-a82b-dd55605bb7ac`
- report code `REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`
- HTTP200
- physical requests 1.

## Exact next command

NEW-03: one explicit `report_info` for:
`REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`

If ready, next separate command is `report_file_get`; record whether DEFECT-001 reproduces on seller-postings. Do not patch.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_03_LOWERCASE_FBO_CREATE_PASS_REPORT_INFO_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
