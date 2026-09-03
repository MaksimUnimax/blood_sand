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
- standalone aliases exercised: `4/26`
- batch coverage: `0/26`
- open numbered defects/candidates: `3`

## DEFECT-001

Static privacy block on generic `report_file_get`, reproduced on three safe report types:
1. `seller_products`;
2. `seller_returns_v2`;
3. `seller_postings`.

NEW-04 `seller_discounted` file read is the next scope check.

## DEFECT-002

Planning metadata inconsistency reproduced on NEW-02 and NEW-03 create paths. NEW-04 create and report_info are clean counterexamples:
- create `02e64eda == 02e64eda`, transformed false;
- report_info `d397b76a == d397b76a`, transformed false.

Therefore DEFECT-002 is not universal.

## DEFECT-003

`report_postings_create` delivery-schema case mismatch confirmed:
- uppercase `FBO` => HTTP400;
- lowercase `fbo` on same past range => HTTP200.

## NEW-04 current state

Create PASS:
- request `51dfec0d-655b-4a77-9fba-ca4af1fb6f6e`
- code `REPORT_seller_discounted_2093109_1788406644_01a06557-c01b-7f31-9c51-b82d2a402ca7`
- HTTP200
- no transform anomaly.

Report-info PASS:
- request `3f4eaf12-b7bf-4a3b-976d-d0439593ff83`
- HTTP200
- status `success`
- report type `seller_discounted`
- signed file redacted
- opaque ref `rpf_b58f09ca-4ca1-4ca5-a362-68d6da57b6d2`
- fingerprint `d397b76a`
- transformed false.

RAW:
`live-runs/repaired-26/raw/NEW_04_RUN_2_REPORT_INFO_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_04_RUN_2_REPORT_INFO_READY_OPAQUE_FILE_REF_2026-09-03.md`

## Exact next command

NEW-04:
`OZON_API_V1 {"operation":"report_file_get","params":{"file_ref":"rpf_b58f09ca-4ca1-4ca5-a362-68d6da57b6d2","offset":0,"limit":50}}`

Persist whether DEFECT-001 reproduces on seller-discounted. Do not patch; after recording, advance to NEW-05.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_04_REPORT_INFO_PASS_FILE_GET_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
