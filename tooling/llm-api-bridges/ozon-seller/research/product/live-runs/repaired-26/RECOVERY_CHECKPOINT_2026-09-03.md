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
- standalone collection complete/partial-fail: `4/26`
- batch coverage: `0/26`
- open numbered defects/candidates: `3`

## DEFECT-001

Static privacy block on generic `report_file_get`, reproduced on four safe report types:
1. `seller_products`;
2. `seller_returns_v2`;
3. `seller_postings`;
4. `seller_discounted`.

NEW-04 reproduction:
- request `policy-111ff6bd-fd2e-4a71-aacf-e89bf4557f11`
- ref `rpf_b58f09ca-4ca1-4ca5-a362-68d6da57b6d2`
- HTTP0
- physical requests 0
- external request false
- `POLICY_BLOCKED / personal_data_setting_off`.

## DEFECT-002

Planning metadata inconsistency reproduced on NEW-02 and NEW-03 create paths. NEW-04 is a clean counterexample:
- create `02e64eda == 02e64eda`, transformed false;
- report_info `d397b76a == d397b76a`, transformed false.

## DEFECT-003

`report_postings_create` delivery-schema case mismatch confirmed:
- uppercase `FBO` => HTTP400;
- lowercase `fbo` on same past range => HTTP200.

## NEW-04 preserved state

- create PASS request `51dfec0d-655b-4a77-9fba-ca4af1fb6f6e`
- report code `REPORT_seller_discounted_2093109_1788406644_01a06557-c01b-7f31-9c51-b82d2a402ca7`
- report_info PASS request `3f4eaf12-b7bf-4a3b-976d-d0439593ff83`
- report type `seller_discounted`
- opaque ref `rpf_b58f09ca-4ca1-4ca5-a362-68d6da57b6d2`
- file read blocked by DEFECT-001.

## Exact next action

NEW-05 requires a valid seller FBS warehouse ID. First run the minimum existing seller-warehouse-list READ as setup, persist it, then call `report_warehouse_stock` with one real returned warehouse ID. Setup read does not count toward repaired 26 coverage.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_04_COMPLETE_PARTIAL_FAIL_NEW_05_WAREHOUSE_ID_SETUP_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
