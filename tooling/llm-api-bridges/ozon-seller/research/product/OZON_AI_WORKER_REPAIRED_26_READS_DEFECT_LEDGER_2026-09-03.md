# Ozon repaired 26 READs — live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Governing rule

Collect the entire standalone + multi-command batch defect set before patching. Runtime patching is forbidden during collection unless one defect makes all further testing technically impossible.

## DEFECT-001 — report_file_get statically gated as personal-data read

Classification:
`OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`

Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`

Confirmed safe-report reproductions with personal-data setting OFF:

1. NEW-01 `seller_products`: local `POLICY_BLOCKED`, physical requests `0`, external request `false`.
2. NEW-02 `seller_returns_v2`: local `POLICY_BLOCKED`, physical requests `0`, external request `false`.
3. NEW-03 `seller_postings`: local `POLICY_BLOCKED`, physical requests `0`, external request `false`.
4. NEW-04 `seller_discounted`: local `POLICY_BLOCKED`, physical requests `0`, external request `false`.

NEW-04 reproduction details:

- source report code `REPORT_seller_discounted_2093109_1788406644_01a06557-c01b-7f31-9c51-b82d2a402ca7`;
- opaque ref `rpf_b58f09ca-4ca1-4ca5-a362-68d6da57b6d2`;
- policy request `policy-111ff6bd-fd2e-4a71-aacf-e89bf4557f11`;
- fingerprint `1aa43c3f`;
- HTTP `0`;
- elapsed `0 ms`;
- entitlement `POLICY_BLOCKED`;
- reason `personal_data_setting_off`;
- error `OPERATION_DISABLED_BY_USER`;
- stage `personal_data_policy`;
- automatic retry `false`.

Four independent safe report classes now confirm generic helper-policy behavior rather than a report-specific anomaly. Continue scope collection across remaining report/document classes; do not patch yet.

Evidence:
- NEW-01 parsed: `live-runs/NEW_01_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`
- NEW-02 parsed: `live-runs/NEW_02_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`
- NEW-03 parsed: `live-runs/NEW_03_RUN_5_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`
- NEW-04 RAW: `live-runs/repaired-26/raw/NEW_04_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
- NEW-04 parsed: `live-runs/NEW_04_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## DEFECT-002 — transformed create metadata inconsistent with exact_request_preserved

Status: `OPEN_CONFIRMED_COLLECTING_SCOPE`

Confirmed on:

- NEW-02 Run1 `report_returns_create_v2`: `687fa368 -> d1fbfbfe`, transformed true, exact_request_preserved true, HTTP200.
- NEW-03 Run1 `report_postings_create`: `ec963df4 -> 6274fae0`, transformed true, exact_request_preserved true, HTTP400.
- NEW-03 Run2 `report_postings_create`: `34d187a7 -> a2721547`, transformed true, exact_request_preserved true, HTTP400.
- NEW-03 Run3 `report_postings_create`: `0507ce87 -> 9f11d567`, transformed true, exact_request_preserved true, HTTP200.

Clean counterexamples:

- NEW-03 Run4 `report_info`: `9e13284f == 9e13284f`, transformed false.
- NEW-04 Run1 `report_discounted_create`: `02e64eda == 02e64eda`, transformed false.
- NEW-04 Run2 `report_info`: `d397b76a == d397b76a`, transformed false.

Therefore DEFECT-002 is not universal to every repaired create alias and must be scoped to particular planner/normalization paths. Continue scope collection through remaining repaired aliases and batch tests. Do not patch yet.

## DEFECT-003 — report_postings_create delivery_schema case contract/guidance mismatch

Classification:
`REPORT_POSTINGS_DELIVERY_SCHEMA_CASE_NOT_CONSTRAINED_OR_NORMALIZED`

Status: `OPEN_CONFIRMED`

Live A/B evidence on the same fully past range:

- `delivery_schema=["FBO"]` => provider HTTP400;
- `delivery_schema=["fbo"]` => provider HTTP200 and report code `REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`.

The current repaired Bridge schema accepts `delivery_schema` as an unconstrained array of strings and does not prevent/safely normalize the provider-invalid uppercase representation.

Evidence:
- Run2 RAW: `live-runs/repaired-26/raw/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_RAW_2026-09-03.json`
- Run2 parsed: `live-runs/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_2026-09-03.md`
- Run3 RAW: `live-runs/repaired-26/raw/NEW_03_RUN_3_REPORT_POSTINGS_CREATE_LOWERCASE_FBO_PASS_RAW_2026-09-03.json`
- Run3 parsed: `live-runs/NEW_03_RUN_3_REPORT_POSTINGS_CREATE_LOWERCASE_FBO_PASS_2026-09-03.md`

Do not patch any defect until collection sweep completes.
