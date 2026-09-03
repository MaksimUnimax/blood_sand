# Ozon repaired 26 READs — live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Governing rule

During this phase, discovered defects are persisted but **not patched immediately**. Continue the complete standalone + multi-command batch test inventory and collect all independent failures first. After the full test sweep is exhausted, patch the complete defect set, rebuild, and rerun the affected tests.

The only exception is a failure that makes further testing technically impossible across the remaining gate; otherwise continue collecting evidence.

No uncommitted/orphan Git blob is production state. Runtime is considered changed only after an explicit branch commit and certified browser package.

## DEFECT-001 — report_file_get statically gated as personal-data read

Discovered: NEW-01 Run3.

Observed:

- source workflow: `report_products_create` -> `report_info` -> `report_file_get`;
- source report type: `seller_products`;
- `report_info` returned `status=success` and opaque ref `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`;
- personal-data setting: OFF;
- `report_file_get` was blocked locally;
- physical business requests: `0`;
- external request executed: `false`;
- error: `OPERATION_DISABLED_BY_USER`;
- policy reason: `personal_data_setting_off`.

Classification:

`OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`

Impact hypothesis to verify across remaining tests:

- safe report files may all be blocked while privacy setting is OFF;
- sensitive document refs may correctly require the gate;
- report/file privacy likely needs source-ref provenance rather than one static helper policy.

Do **not** patch yet. Continue the full gate and determine all affected report/document classes first.

Evidence:

- raw: `live-runs/raw/NEW_01_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.txt`
- parsed: `live-runs/NEW_01_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

Status: `OPEN_COLLECTING_SCOPE`
