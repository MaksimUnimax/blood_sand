# Ozon repaired 26 READs — collect-all-defects recovery checkpoint

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Non-negotiable workflow

1. Complete the full standalone test sweep NEW-01..NEW-26 on the current unpatched browser runtime.
2. Complete multi-command batch coverage for every repaired alias.
3. Persist every RAW result, parsed evidence, gate update and defect before the next command.
4. Do not patch any collected defect until the sweep is exhausted, unless the defect makes all remaining testing technically impossible.
5. After collection, patch the complete defect set, rebuild/certify, and rerun affected tests.
6. STD-10 remains frozen throughout this gate.

## Current runtime state

No fix for DEFECT-001 is committed. Any locally/orphan-prepared patch content is non-authoritative and must not be treated as runtime state.

## NEW-01 collected evidence

Run1 `report_products_create`: PASS.

- request id: `d1834261-fbc4-498a-ba2e-6873a6ead564`
- report code: `REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`

Run2 `report_info`: PASS.

- request id: `067c8a20-6d5f-46bf-a156-b33f3f9952fd`
- status: `success`
- opaque ref: `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`

Run3 `report_file_get`: local policy FAIL.

- request id: `policy-558df595-6ff0-4eb6-b5f6-03eb658ebe6c`
- physical provider requests: `0`
- external request executed: `false`
- error: `OPERATION_DISABLED_BY_USER`
- reason: `personal_data_setting_off`

Open defect:
`DEFECT-001 — OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`

Defect ledger:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## Frozen STD-10 state

Do not use:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

STD-10 resume remains `report_info` for that code only after the repaired 26 gate is completely finished.

## Exact next test

NEW-02 standalone starts with one real report-create request:

`report_returns_create_v2`

Use a recent bounded window and a valid explicit return status. Do not batch this first create step with another unrelated request; batch coverage is tracked separately.

Checkpoint:
`COLLECT_ALL_DEFECTS_NEW_01_EXERCISED_DEFECT_001_OPEN_NEW_02_CREATE_NEXT`
