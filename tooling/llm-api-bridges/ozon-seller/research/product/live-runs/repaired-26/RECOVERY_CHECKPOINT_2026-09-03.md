# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Do not patch runtime until standalone + required batch collection is exhausted. Persist every result before the next Ozon command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

That code belongs only to the frozen forensic workflow. NEW-06 used its own independent report code and opaque ref.

## Progress

- final closed: `0/26`
- standalone aliases exercised: `6/26`
- collection-complete/partial-fail: `6/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`, `seller_placement_by_products`.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06 create and tested `report_info` calls are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-06 preserved state

Independent create PASS:
- request `5171ffdb-7762-4bb9-ae8a-1663f1932045`
- code `REPORT_seller_placement_by_products_2093109_1788407770_01a06568-ee50-7d2e-bcca-9594563e3735`
- HTTP200, physical1
- fingerprints `85e4f38a == 85e4f38a`
- transformed false.

Report-info PASS:
- request `e78e1813-43de-41d9-ac9a-32d00c5fcc5c`
- report type `seller_placement_by_products`
- opaque ref `rpf_ec4858fd-8af3-4da5-a7c3-ddd4ec1753b9`
- fingerprints `c5855b10 == c5855b10`
- transformed false.

File-read block:
- request `policy-52e5b3e8-47ac-4db0-87e0-a460dc070271`
- fingerprint `f96ec644`
- HTTP0, physical0, external false
- `POLICY_BLOCKED / personal_data_setting_off`
- DEFECT-001 reproduction #6.

NEW-06 is `COLLECTION_COMPLETE_PARTIAL_FAIL`. Frozen STD-10 remained untouched.

## Exact next action

Start NEW-07 `report_placement_by_supplies_create` with a fresh standalone payload satisfying the exact runtime contract. Persist RAW/result before continuing its report-info/file chain. Do not patch.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_06_COMPLETE_PARTIAL_FAIL_NEW_07_CREATE_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
