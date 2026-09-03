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

## Progress

- final closed: `0/26`
- standalone aliases exercised: `14/26`
- collection-complete/partial/provider-fail: `14/26`
- batch coverage: `0/26`
- open numbered defects: `5`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 10 report classes.
- DEFECT-002: planning metadata inconsistency on NEW-02/03; later paths including NEW-14 are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09.
- DEFECT-005: `supply_order_list` template/validator accepts required `filter.states=[]`, provider rejects it; non-empty states control returns HTTP200.

## NEW-14 preserved state

Setup:
- real order id `125820894`
- real provider-returned integer supply id `2000064871008`.

Standalone `cargoes_label_create`:
- request `b09f1156-6ada-42b7-9cef-8cface858ec1`
- HTTP429 / provider code `8`
- Retry-After `1`
- physical requests `1`
- logical business results `1`
- external request `true`
- automatic retry `false`
- exact request preserved `true`
- fingerprints `151c4db3 == 151c4db3`
- transformed `false`.

Classification:
`COLLECTION_COMPLETE_PROVIDER_RATE_LIMIT_FAIL`

No new bridge defect. Per run rules do not automatically repeat the same business request after 429. No provider operation/status/document reference was returned, therefore no downstream NEW-14 status/document read can follow from this attempt.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_14_RUN_1_CARGOES_LABEL_CREATE_PROVIDER_429_RAW_2026-09-03.json`
- parsed `live-runs/NEW_14_RUN_1_CARGOES_LABEL_CREATE_PROVIDER_429_2026-09-03.md`

## NEW-15 setup contract

`posting_fbs_act_container_labels` requires a real integer `id` and is a personal-data-gated READ. Obtain a real act id first using safe provider read:
- `fbs_act_list`
- `POST /v2/posting/fbs/act/list`
- `READ_SAFE`
- runtime template `{"operation":"fbs_act_list","params":{"limit":50}}`.

## Exact next action

Issue exactly:

`OZON_API_V1 {"operation":"fbs_act_list","params":{"limit":50}}`

Persist its result before any further Ozon command. Use only a provider-returned act id for NEW-15; never invent one.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_14_PROVIDER_429_COMPLETE_NEW_15_FBS_ACT_LIST_SETUP_NEXT_DEFECTS_001_002_003_004_005_OPEN_STD_10_FROZEN`
