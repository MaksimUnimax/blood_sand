# NEW-03 Run1 — report_postings_create HTTP400

Date: 2026-09-03
Gate mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias: `report_postings_create`

## Request

Logical command fingerprint: `ec963df4`

Test payload:

```json
{"filter":{"processed_at_from":"2026-09-01T00:00:00Z","processed_at_to":"2026-09-03T23:59:59Z","delivery_schema":["FBO"]}}
```

## Live result

- request id: `ea2ca56c-ccb4-4b09-85b5-5f45a048529f`
- provider: Ozon Seller API
- external request executed: `true`
- physical business requests: `1`
- HTTP: `400`
- provider error code: `3`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement metadata: `exact_request_preserved=true`
- physical fingerprint: `6274fae0`
- `command_transformed=true`

## Classification

`NEW_03_PROVIDER_HTTP400_REQUIRES_SCHEMA_DIAGNOSIS`

Do not immediately classify the HTTP400 itself as a Bridge defect. First compare the exact test payload against the current registered/validated schema and Ozon contract. The test must distinguish:

1. invalid operator/test payload;
2. planner transformation producing an invalid physical request;
3. stale/incorrect registered schema;
4. provider/account-specific rejection.

Separately, this run reproduces the planning-metadata inconsistency candidate already tracked as `DEFECT-002`: physical fingerprint differs and `command_transformed=true` while entitlement metadata says `exact_request_preserved=true`.

No runtime patch is allowed during the collection sweep.

RAW evidence:
`live-runs/repaired-26/raw/NEW_03_RUN_1_REPORT_POSTINGS_CREATE_HTTP400_RAW_2026-09-03.json`
