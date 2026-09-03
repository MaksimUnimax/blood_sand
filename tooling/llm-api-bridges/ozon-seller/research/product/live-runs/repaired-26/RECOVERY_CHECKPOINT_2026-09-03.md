# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Do not patch runtime until standalone + required batch sweep is exhausted. Every result must be persisted before the next command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

## Current global progress

- Fully final-closed: `0/26`
- Standalone aliases exercised: `2/26`
- Batch coverage: `0/26`
- Open defects/candidates: `2`

## DEFECT-001

Generic `report_file_get` static privacy block. Reproduced on:

1. NEW-01 `seller_products` report;
2. NEW-02 `seller_returns_v2` report.

Both: personal-data setting OFF, local POLICY_BLOCKED, physical requests 0, external request false. Do not patch yet.

## DEFECT-002

NEW-02 create metadata anomaly:
- logical fingerprint `687fa368`;
- physical fingerprint `d1fbfbfe`;
- `command_transformed=true`;
- `exact_request_preserved=true`.

NEW-02 `report_info` did not reproduce it. Do not patch yet.

## NEW-01 preserved state

- create PASS code: `REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`
- report_info PASS
- opaque ref: `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`
- file read blocked by DEFECT-001.

## NEW-02 preserved state

- create PASS request: `8b963833-eb57-4fe8-9b34-ff609ddf735c`
- code: `REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`
- report_info PASS request: `fe38e833-2029-4f41-8f57-49ad5a258499`
- opaque ref: `rpf_c5978670-1bbe-47f5-9838-e843614a2514`
- file read policy request: `policy-a9bcf2bf-18eb-46ca-a3fd-5b20b79438bf`
- file read blocked by DEFECT-001; physical requests `0`.

## Exact next command

Start NEW-03 with one explicit `report_postings_create` request. Persist RAW + parsed evidence + gate + this recovery checkpoint before the next step.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_01_02_EXERCISED_DEFECTS_001_002_OPEN_NEW_03_CREATE_NEXT_STD_10_FROZEN`
