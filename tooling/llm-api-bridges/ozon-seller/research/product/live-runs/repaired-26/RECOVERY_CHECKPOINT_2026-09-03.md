# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `PAUSED_BY_OPERATOR`
Branch: `research/ozon-product-demand-2026-09-02`

## Global state

- Product-demand/STD-10 gate: FROZEN.
- Repaired 26-command live gate: PAUSED.
- Fully final-closed repaired aliases: `0/26`.
- Final acceptance now requires both standalone and multi-command batch coverage for every repaired alias.
- Every subsequent test/result must be persisted as RAW + parsed evidence + gate update + recovery checkpoint before advancing.

## Frozen STD-10 state

Do not touch until all 26 repaired commands are completely live-tested.

Frozen forensic report code:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

STD-10 resume action after the 26-command gate closes:
`report_info` for the frozen forensic code above.

## NEW-01 standalone state

Alias:
`report_products_create`

### Run1 create — PASS

Request id:
`d1834261-fbc4-498a-ba2e-6873a6ead564`

Report code:
`REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`

RAW:
`live-runs/repaired-26/raw/NEW_01_RUN_1_REPORT_PRODUCTS_CREATE_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_01_RUN_1_REPORT_PRODUCTS_CREATE_2026-09-03.md`

### Run2 report_info — PASS

Request id:
`067c8a20-6d5f-46bf-a156-b33f3f9952fd`

Provider report status:
`success`

Provider `file` field:
`[REDACTED]`

Opaque Bridge file ref:
`rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`

RAW:
`live-runs/repaired-26/raw/NEW_01_RUN_2_REPORT_INFO_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_01_RUN_2_REPORT_INFO_READY_OPAQUE_FILE_REF_2026-09-03.md`

## Exact resume point

When explicitly told to continue, do not recreate the NEW-01 report and do not repeat report_info unless the opaque ref has expired.

Next standalone NEW-01 action:
`report_file_get` using `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`.

After standalone NEW-01 reaches usable structured rows, NEW-01 still requires multi-command batch participation before final PASS.

## Batch acceptance requirement

Each of NEW-01..NEW-26 must appear successfully in at least one real batch with 2+ independent logical commands. Persist result_count, logical/physical counts, result ordering, per-result request IDs/fingerprints, params isolation, transform metadata, coalescing behavior and controlled partial-failure behavior.

Checkpoint marker:
`PAUSED_NEW_01_RUN2_REPORT_INFO_SUCCESS_OPAQUE_REF_PRESERVED_FILE_GET_NEXT_BATCH_REQUIRED`
