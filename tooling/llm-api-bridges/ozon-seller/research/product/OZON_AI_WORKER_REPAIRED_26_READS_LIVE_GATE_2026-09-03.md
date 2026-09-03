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

A discovered defect does not stop unrelated test collection unless further testing is technically impossible. Runtime patching is forbidden during this collection phase.

## Mandatory persistence

Every live step must be stored before the next command as:
- RAW bridge result;
- parsed evidence;
- this gate state;
- recovery checkpoint;
- defect ledger entry when applicable.

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## Final acceptance dimensions

Every repaired alias must eventually pass:

### Standalone

- report: create -> report_info -> report_file_get -> usable rows;
- direct/async document: provider operation -> retrieval/status when needed -> opaque ref -> readable document;
- immediate validation: usable provider JSON;
- sensitive READ: privacy-gate behavior + real provider read where permitted.

### Multi-command batch

Each repaired alias must participate in a real batch with 2+ independent commands. Verify result_count, logical/physical request counts, ordering, request ids, fingerprints, params/result isolation, transform metadata, coalescing behavior and controlled partial-failure behavior.

## Frozen STD-10

Do not touch forensic code:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-6ac5e04697cb`

NEW-06 must use a separate generic report chain.

## Inventory

| # | ID | Alias | Standalone collection | Batch |
|---:|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | PARTIAL_FAIL — create PASS, report_info PASS, file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 2 | NEW-02 | `report_returns_create_v2` | IN_PROGRESS — create PASS, report_info PASS, file read NEXT; create metadata = DEFECT-002 candidate | PENDING |
| 3 | NEW-03 | `report_postings_create` | PENDING | PENDING |
| 4 | NEW-04 | `report_discounted_create` | PENDING | PENDING |
| 5 | NEW-05 | `report_warehouse_stock` | PENDING | PENDING |
| 6 | NEW-06 | `report_placement_by_products_create` | PARTIAL_EXTERNAL_EVIDENCE — frozen STD-10 create exists but cannot be reused | PENDING |
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

## Collected defects

### DEFECT-001 — report_file_get static privacy block

NEW-01 safe seller-products report reached report_info successfully, but report_file_get was locally blocked with personal_data_setting_off before any external file request. Scope must be established across remaining report/document workflows before patching.

### DEFECT-002 candidate — NEW-02 create planning metadata inconsistency

NEW-02 create:
- logical fingerprint `687fa368`;
- physical fingerprint `d1fbfbfe`;
- `command_transformed=true`;
- entitlement metadata simultaneously says `exact_request_preserved=true`.

Do not patch until sweep complete.

## NEW-02 evidence

### Run1 create — PASS

- request `8b963833-eb57-4fe8-9b34-ff609ddf735c`
- HTTP 200
- physical requests 1
- code `REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`
- DEFECT-002 candidate observed in planning metadata.

RAW:
`live-runs/repaired-26/raw/NEW_02_RUN_1_REPORT_RETURNS_CREATE_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_02_RUN_1_REPORT_RETURNS_CREATE_2026-09-03.md`

### Run2 report_info — PASS

- request `fe38e833-2029-4f41-8f57-49ad5a258499`
- HTTP 200
- status `success`
- report type `seller_returns_v2`
- provider file field `[REDACTED]`
- opaque ref `rpf_c5978670-1bbe-47f5-9838-e843614a2514`
- logical fingerprint `2d41fb57`
- physical fingerprint `2d41fb57`
- `command_transformed=false`.

This step does not reproduce DEFECT-002; the anomaly remains scoped to NEW-02 create/planner behavior so far.

RAW:
`live-runs/repaired-26/raw/NEW_02_RUN_2_REPORT_INFO_RAW_2026-09-03.md`

Parsed:
`live-runs/NEW_02_RUN_2_REPORT_INFO_READY_OPAQUE_FILE_REF_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone NEW-IDs exercised: `2/26`.
- Open defects/candidates: `2`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

NEW-02: explicit `report_file_get` for:
`rpf_c5978670-1bbe-47f5-9838-e843614a2514`

If DEFECT-001 reproduces, persist it as another reproduction and continue to NEW-03 without patching.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_2_OF_26_EXERCISED_NEW_02_REPORT_INFO_PASS_FILE_GET_NEXT_DEFECTS_001_002_OPEN_STD_10_FROZEN`
