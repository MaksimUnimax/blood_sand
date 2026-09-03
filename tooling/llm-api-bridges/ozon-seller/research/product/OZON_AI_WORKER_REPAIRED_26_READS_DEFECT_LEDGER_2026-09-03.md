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

Confirmed on repaired create aliases:

### NEW-02 Run1 — report_returns_create_v2

- logical fingerprint `687fa368`;
- physical fingerprint `d1fbfbfe`;
- `command_transformed=true`;
- entitlement metadata `exact_request_preserved=true`;
- provider HTTP 200.

### NEW-03 Run1 — report_postings_create

- logical fingerprint `ec963df4`;
- physical fingerprint `6274fae0`;
- `command_transformed=true`;
- entitlement metadata `exact_request_preserved=true`;
- provider HTTP 400.

### NEW-03 Run2 — report_postings_create, wholly past window

- logical fingerprint `34d187a7`;
- physical fingerprint `a2721547`;
- `command_transformed=true`;
- entitlement metadata `exact_request_preserved=true`;
- provider HTTP 400.

The metadata inconsistency therefore reproduces independently across NEW-02 and two distinct NEW-03 payloads. Do not patch until batch and remaining create aliases establish full scope.

## NEW-03 provider HTTP400 investigation — not yet numbered as a Bridge defect

NEW-03 Run1 returned HTTP400 with a future end boundary. Run2 changed the business payload to a fully past range (`2026-09-01T00:00:00Z` through `2026-09-02T23:59:59Z`) and still returned HTTP400, so the future-boundary hypothesis is rejected.

The exact runtime schema accepts:

- required `filter.processed_at_from` as date-time;
- required `filter.processed_at_to` as date-time;
- required `filter.delivery_schema` as an array of strings.

Bridge validation accepted both requests and each reached Ozon exactly once. Public examples for `/v1/report/postings/create` use lowercase delivery-schema values such as `fbs`, while the tested payload used uppercase `FBO`. The next diagnostic changes only this semantic value to lowercase `fbo` with the same fully past range.

If lowercase succeeds, promote a new Bridge contract/template/guidance defect: the runtime schema/template permits or suggests a provider-invalid uppercase delivery-schema value. If lowercase still fails, continue diagnosis without patching.

Evidence:

- Run1 RAW: `live-runs/repaired-26/raw/NEW_03_RUN_1_REPORT_POSTINGS_CREATE_HTTP400_RAW_2026-09-03.json`
- Run1 parsed: `live-runs/NEW_03_RUN_1_REPORT_POSTINGS_CREATE_HTTP400_2026-09-03.md`
- Run2 RAW: `live-runs/repaired-26/raw/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_RAW_2026-09-03.json`
- Run2 parsed: `live-runs/NEW_03_RUN_2_REPORT_POSTINGS_CREATE_HTTP400_PAST_WINDOW_2026-09-03.md`

No runtime patch until collection sweep completes.
