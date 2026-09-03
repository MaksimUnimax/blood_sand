# Ozon AI Worker — repaired 26 Seller READ live gate

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Primary rule: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Persistent evidence rule: `EVERY_TEST_AND_RESULT_TO_GITHUB_BEFORE_NEXT_COMMAND`

## Phase order

1. Exhaust standalone tests for NEW-01..NEW-26.
2. Exhaust required multi-command batch tests.
3. Persist all failures/blocks/metadata anomalies.
4. Only then patch the complete defect set.
5. Rebuild/certify and rerun affected cases.
6. Resume frozen STD-10 only after the 26-command gate closes.

Runtime patching is forbidden during collection.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

## Inventory

| # | ID | Alias | Standalone collection | Batch |
|---:|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | PARTIAL_FAIL — create PASS, report_info PASS, file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 2 | NEW-02 | `report_returns_create_v2` | PARTIAL_FAIL — create PASS, report_info PASS, file read POLICY_BLOCKED = DEFECT-001; create metadata = DEFECT-002 | PENDING |
| 3 | NEW-03 | `report_postings_create` | IN_PROGRESS — Run1 HTTP400, Run2 wholly-past HTTP400; lowercase `delivery_schema` diagnostic NEXT; transform metadata = DEFECT-002 | PENDING |
| 4 | NEW-04 | `report_discounted_create` | PENDING | PENDING |
| 5 | NEW-05 | `report_warehouse_stock` | PENDING | PENDING |
| 6 | NEW-06 | `report_placement_by_products_create` | PARTIAL_EXTERNAL_EVIDENCE — frozen STD-10 create cannot be reused | PENDING |
| 7 | NEW-07 | `report_placement_by_supplies_create` | PENDING | PENDING |
| 8 | NEW-08 | `report_marked_products_sales_create` | PENDING | PENDING |
| 9 | NEW-09 | `report_realization_posting_create` | PENDING | PENDING |
| 10 | NEW-10 | `finance_document_b2b_sales` | PENDING | PENDING |
| 11 | NEW-11 | `finance_mutual_settlement_report` | PENDING | PENDING |
| 12 | NEW-12 | `finance_compensation_report` | PENDING | PENDING |
| 13 | NEW-13 | `finance_decompensation_report` | PENDING | PENDING |
| 14 | NEW-14 | `cargoes_label_create` | PENDING | PENDING |
| 15 | NEW-15 | `posting_fbs_act_container_labels` | PENDING | PENDING |
| 16 | NEW-16 | `posting_fbs_package_label` | PENDING | PENDING |
| 17 | NEW-17 | `posting_fbs_package_label_create` | PENDING | PENDING |
| 18 | NEW-18 | `cargoes_transport_label_by_order_create` | PENDING | PENDING |
| 19 | NEW-19 | `cargoes_transport_label_create` | PENDING | PENDING |
| 20 | NEW-20 | `fbp_act_from_create` | PENDING | PENDING |
| 21 | NEW-21 | `fbp_act_to_create` | PENDING | PENDING |
| 22 | NEW-22 | `fbp_label_create` | PENDING | PENDING |
| 23 | NEW-23 | `fbp_draft_direct_product_validate` | PENDING | PENDING |
| 24 | NEW-24 | `fbp_draft_dropoff_product_validate` | PENDING | PENDING |
| 25 | NEW-25 | `fbp_draft_pickup_product_validate` | PENDING | PENDING |
| 26 | NEW-26 | `chat_history_v3` | PENDING | PENDING |

## Defects collected

### DEFECT-001

Generic safe report-file reads are statically privacy-blocked. Confirmed on NEW-01 and NEW-02.

### DEFECT-002

Transformed create metadata is inconsistent with `exact_request_preserved=true`.

Confirmed on:
- NEW-02 create: `687fa368 -> d1fbfbfe`, transformed true, provider 200;
- NEW-03 Run1: `ec963df4 -> 6274fae0`, transformed true, provider 400;
- NEW-03 Run2: `34d187a7 -> a2721547`, transformed true, provider 400.

## NEW-03 evidence

### Run1

- request `ea2ca56c-ccb4-4b09-85b5-5f45a048529f`
- HTTP 400
- tested end timestamp still in future at execution time.

### Run2

- request `279835dd-389b-4b1a-980c-03986d27d40b`
- HTTP 400
- fully past interval `2026-09-01T00:00:00Z..2026-09-02T23:59:59Z`
- physical requests `1`
- external request `true`
- provider error code `3`
- logical fingerprint `34d187a7`
- physical fingerprint `a2721547`
- transformed `true`
- entitlement still says `exact_request_preserved=true`.

Run2 rejects the future-time hypothesis. The exact Bridge schema accepts `delivery_schema` as an unconstrained string array. Public examples of the provider endpoint use lowercase values such as `fbs`; the next diagnostic changes the tested value from uppercase `FBO` to lowercase `fbo` while keeping the same wholly past interval.

RAW Run2:
`live-runs/repaired-26/raw/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_RAW_2026-09-03.json`

Parsed Run2:
`live-runs/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone NEW-IDs exercised: `3/26`.
- Open numbered defects/candidates: `2`.
- NEW-03 provider rejection: under diagnosis, not yet separately numbered.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

NEW-03 Run3: submit a new `report_postings_create` with the same fully past interval and `delivery_schema:["fbo"]`. This is a distinct diagnostic payload, not an automatic retry. If it succeeds, promote the uppercase/provider-value acceptance issue to a separate Bridge contract/template defect and continue report_info/file collection. If it fails, persist it and continue provider-contract diagnosis without patching.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_03_RUN2_400_LOWERCASE_DELIVERY_SCHEMA_DIAGNOSTIC_NEXT_DEFECTS_001_002_OPEN_STD_10_FROZEN`
