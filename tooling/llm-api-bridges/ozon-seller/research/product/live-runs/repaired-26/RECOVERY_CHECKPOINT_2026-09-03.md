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

Static privacy block on generic `report_file_get`, now reproduced on three safe report types:
1. `seller_products`;
2. `seller_returns_v2`;
3. `seller_postings`.

NEW-03 file-read reproduction:
- request `policy-5e9052c9-6106-4f28-846c-e1717fd88c1f`
- ref `rpf_4619d324-8228-4c8e-b8be-c4c1ea05b92c`
- HTTP0
- physical requests 0
- external request false
- `POLICY_BLOCKED / personal_data_setting_off`.

## DEFECT-002

Create planning metadata inconsistency reproduced on NEW-02 and NEW-03 create paths. Physical fingerprint differs / transformed true while exact_request_preserved remains true.

## DEFECT-003

`report_postings_create` delivery-schema case mismatch confirmed by live A/B:
- uppercase `FBO` => HTTP400;
- lowercase `fbo` on same past range => HTTP200.

## NEW-03 preserved state

- successful create request `8e92df34-abdc-450f-a82b-dd55605bb7ac`
- report code `REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`
- report_info PASS request `72342313-8c33-4e39-a047-56c01716cf28`
- report type `seller_postings`
- opaque ref `rpf_4619d324-8228-4c8e-b8be-c4c1ea05b92c`
- file read blocked by DEFECT-001.

## Exact next command

Start NEW-04:
`OZON_API_V1 {"operation":"report_discounted_create","params":{}}`

Persist RAW + parsed evidence + gate + checkpoint before any following command. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_03_COMPLETE_PARTIAL_FAIL_NEW_04_CREATE_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
