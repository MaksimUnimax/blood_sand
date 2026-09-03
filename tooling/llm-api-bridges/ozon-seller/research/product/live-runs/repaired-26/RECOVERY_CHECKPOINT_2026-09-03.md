# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_FIRST`
Branch: `research/ozon-product-demand-2026-09-02`

## Rules

- Test everything first; patch only after the complete standalone + batch sweep.
- Persist every RAW result and parsed evidence before advancing.
- STD-10 remains frozen.
- Fully closed: `0/26`.
- Standalone NEW-IDs exercised: `2/26`.
- Batch coverage: `0/26`.

## Open defects

- `DEFECT-001`: NEW-01 `report_file_get` blocked by personal-data policy for a safe seller-products report. Unpatched.
- `DEFECT-002`: NEW-02 returned `command_transformed=true` with differing logical/physical fingerprints while also reporting `exact_request_preserved=true`. Unpatched candidate.

Defect authority:
`research/product/OZON_AI_WORKER_REPAIRED_26_READS_LIVE_DEFECT_LEDGER_2026-09-03.md`

## NEW-01

Standalone partial: create PASS, report_info PASS, file read policy-blocked. Batch pending.

## NEW-02

Create PASS.

Request id:
`8b963833-eb57-4fe8-9b34-ff609ddf735c`

Report code:
`REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`

RAW:
`live-runs/repaired-26/raw/NEW_02_RUN_1_REPORT_RETURNS_CREATE_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_02_RUN_1_REPORT_RETURNS_CREATE_2026-09-03.md`

## Exact resume point

Next command is one explicit `report_info` for the NEW-02 report code above.

Checkpoint:
`COLLECT_ALL_DEFECTS_NEW_02_CREATE_PASS_REPORT_INFO_NEXT_STD_10_FROZEN`
