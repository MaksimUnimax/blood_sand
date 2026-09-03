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

## DEFECT-002

Planning metadata inconsistency reproduced on NEW-02 and NEW-03 create paths: physical fingerprint differs / transformed true while exact_request_preserved remains true.

NEW-04 Run1 is a clean counterexample:
- logical fingerprint `02e64eda`
- physical fingerprint `02e64eda`
- transformed false
- exact_request_preserved true
- provider HTTP200.

Therefore DEFECT-002 is not universal to all repaired create aliases.

## DEFECT-003

`report_postings_create` delivery-schema case mismatch confirmed by live A/B:
- uppercase `FBO` => HTTP400;
- lowercase `fbo` on same past range => HTTP200.

## NEW-04 current state

`report_discounted_create` Run1 PASS:
- request `51dfec0d-655b-4a77-9fba-ca4af1fb6f6e`
- HTTP200
- physical requests `1`
- external request true
- report code `REPORT_seller_discounted_2093109_1788406644_01a06557-c01b-7f31-9c51-b82d2a402ca7`
- no transform anomaly.

RAW:
`live-runs/repaired-26/raw/NEW_04_RUN_1_REPORT_DISCOUNTED_CREATE_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_04_RUN_1_REPORT_DISCOUNTED_CREATE_2026-09-03.md`

## Exact next command

NEW-04:
`OZON_API_V1 {"operation":"report_info","params":{"code":"REPORT_seller_discounted_2093109_1788406644_01a06557-c01b-7f31-9c51-b82d2a402ca7"}}`

If ready, next separate step is `report_file_get` to scope DEFECT-001. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_04_CREATE_PASS_REPORT_INFO_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
