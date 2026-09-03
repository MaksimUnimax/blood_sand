# Ozon repaired 26 READs — live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Governing rule

During this phase, discovered defects are persisted but **not patched immediately**. Continue the complete standalone + multi-command batch test inventory and collect all independent failures first. After the full test sweep is exhausted, patch the complete defect set, rebuild, and rerun affected tests.

The only exception is a failure that makes further testing technically impossible across the remaining gate.

## DEFECT-001 — report_file_get statically gated as personal-data read

Classification:
`OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`

Status: `OPEN_COLLECTING_SCOPE`

### Discovery — NEW-01 Run3

Source workflow:
`report_products_create -> report_info -> report_file_get`

Observed on safe `seller_products` report:

- opaque ref `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`;
- personal-data setting OFF;
- local `POLICY_BLOCKED`;
- physical business requests `0`;
- external request executed `false`;
- `OPERATION_DISABLED_BY_USER`;
- reason `personal_data_setting_off`.

Evidence:
- `live-runs/NEW_01_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

### Reproduction — NEW-02 Run3

Source workflow:
`report_returns_create_v2 -> report_info -> report_file_get`

Observed on independent safe `seller_returns_v2` report:

- opaque ref `rpf_c5978670-1bbe-47f5-9838-e843614a2514`;
- request id `policy-a9bcf2bf-18eb-46ca-a3fd-5b20b79438bf`;
- local `POLICY_BLOCKED`;
- physical business requests `0`;
- external request executed `false`;
- HTTP `0`;
- error `OPERATION_DISABLED_BY_USER`;
- reason `personal_data_setting_off`.

Evidence:
- raw: `live-runs/repaired-26/raw/NEW_02_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
- parsed: `live-runs/NEW_02_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

Confirmed affected safe report types so far:
1. `seller_products`;
2. `seller_returns_v2`.

Do not patch yet. Continue testing remaining report/document classes to establish complete scope, including cases that legitimately require the personal-data gate.

## DEFECT-002 — planning metadata inconsistency on transformed NEW-02 create

Status: `OPEN_CANDIDATE_COLLECTING_SCOPE`

Discovered: NEW-02 Run1 `report_returns_create_v2`.

Observed:

- logical command fingerprint `687fa368`;
- physical command fingerprint `d1fbfbfe`;
- `command_transformed=true`;
- entitlement metadata simultaneously reports `exact_request_preserved=true`;
- Ozon provider request succeeded HTTP 200 and returned report code.

NEW-02 Run2 `report_info` did **not** reproduce the anomaly:

- logical fingerprint `2d41fb57`;
- physical fingerprint `2d41fb57`;
- `command_transformed=false`.

Interpretation:

The anomaly is currently scoped to NEW-02 create/planner handling. Determine whether the transformation is legitimate normalization with misleading `exact_request_preserved`, or an actual request-shape mutation that should be surfaced differently. Batch tests must also verify transform metadata consistency.

Do not patch until collection sweep completes.
