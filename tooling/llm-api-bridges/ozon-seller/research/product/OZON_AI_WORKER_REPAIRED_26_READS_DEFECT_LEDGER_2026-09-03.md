# Ozon repaired 26 READs — live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_BEFORE_PATCHING`

## Governing rule

During this phase, discovered defects are persisted but **not patched immediately**. Continue the complete standalone + multi-command batch inventory first. Patch only after the test sweep is exhausted, unless one defect makes further testing technically impossible.

## DEFECT-001 — report_file_get statically gated as personal-data read

Classification:
`OVERBROAD_STATIC_PERSONAL_DATA_POLICY_ON_GENERIC_REPORT_FILE_HELPER`

Status: `OPEN_COLLECTING_SCOPE`

Confirmed reproductions with personal-data setting OFF:

1. NEW-01 `seller_products`: local `POLICY_BLOCKED`, physical requests `0`, external request `false`.
2. NEW-02 `seller_returns_v2`: local `POLICY_BLOCKED`, physical requests `0`, external request `false`.

Do not patch yet. Continue determining scope across remaining report/document classes.

## DEFECT-002 — transformed create metadata inconsistent with exact_request_preserved

Status: `OPEN_CANDIDATE_COLLECTING_SCOPE`

### NEW-02 Run1

`report_returns_create_v2`:

- logical fingerprint `687fa368`;
- physical fingerprint `d1fbfbfe`;
- `command_transformed=true`;
- entitlement metadata `exact_request_preserved=true`;
- provider HTTP 200.

### NEW-03 Run1 reproduction

`report_postings_create`:

- logical fingerprint `ec963df4`;
- physical fingerprint `6274fae0`;
- `command_transformed=true`;
- entitlement metadata `exact_request_preserved=true`;
- provider HTTP 400.

This expands the anomaly from NEW-02 to at least two repaired create aliases. The NEW-03 HTTP400 itself is **not yet a separate Bridge defect**: the logical payload passed the exact runtime schema, but the test used `processed_at_to=2026-09-03T23:59:59Z`, which was still in the future at execution time. A new diagnostic request with a wholly past window is required before classifying the provider rejection.

Runtime contract confirms `report_postings_create.filter.delivery_schema` is an array of strings and both processed timestamps are `date-time`, so the logical payload shape was accepted by Bridge validation.

Evidence:

- RAW: `live-runs/repaired-26/raw/NEW_03_RUN_1_REPORT_POSTINGS_CREATE_HTTP400_RAW_2026-09-03.json`
- parsed: `live-runs/NEW_03_RUN_1_REPORT_POSTINGS_CREATE_HTTP400_2026-09-03.md`

Do not patch until collection sweep completes.
