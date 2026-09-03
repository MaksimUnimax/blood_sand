# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Do not patch runtime until standalone + required batch sweep is exhausted. Every result must be persisted before the next command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-6ac5e04697cb`

## Current global progress

- Fully final-closed: `0/26`
- Standalone aliases exercised: `2/26`
- Batch coverage: `0/26`
- Open defects/candidates: `2`

## DEFECT-001

NEW-01 safe seller-products report file read was locally `POLICY_BLOCKED / personal_data_setting_off` with physical requests `0`. Generic report-file helper appears overbroadly privacy-gated. Do not patch yet.

## DEFECT-002 candidate

NEW-02 create had logical fingerprint `687fa368`, physical fingerprint `d1fbfbfe`, `command_transformed=true`, while entitlement metadata says `exact_request_preserved=true`. NEW-02 report_info did not reproduce this anomaly.

## NEW-02 state

Create PASS:
- request `8b963833-eb57-4fe8-9b34-ff609ddf735c`
- code `REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`

Report-info PASS:
- request `fe38e833-2029-4f41-8f57-49ad5a258499`
- status `success`
- opaque ref `rpf_c5978670-1bbe-47f5-9838-e843614a2514`
- report type `seller_returns_v2`
- logical/physical fingerprint `2d41fb57`
- transformed `false`

## Exact next command

`report_file_get` for:
`rpf_c5978670-1bbe-47f5-9838-e843614a2514`

If privacy block reproduces, persist it as another DEFECT-001 reproduction and then advance to NEW-03 without patching.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_02_REPORT_INFO_PASS_FILE_GET_NEXT_DEFECTS_001_002_OPEN_STD_10_FROZEN`
