# Ozon direct-binary FBS fixture discovery — 2026-09-09

## Verdict

**BLOCKED — NO LIVE FBS ACT FIXTURE**

The read-only `fbs_act_list` discovery call completed successfully against Ozon but returned an empty result. Therefore no real FBS act identifier exists in the tested period that can legally be used to exercise `posting_fbs_act_get_barcode` (direct PNG) or `posting_fbs_act_get_pdf` (direct PDF).

## Tested build authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective tested production source: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Bridge: `ozon-llm-api-bridge v0.1.19`

## Exact command

```text
OZON_API_V1
{"operation":"fbs_act_list","params":{"limit":50,"filter":{"date_from":"2026-01-01","date_to":"2026-09-09"}}}
```

## Exact observed result

- request_id: `be601cc0-e6d1-4a79-82d1-bb7858342bdf`
- operation: `fbs_act_list`
- command fingerprint: `053126ee`
- logical business result count: `1`
- physical business request count: `1`
- external_request_executed: `true`
- capability_probe_executed: `false`
- HTTP status: `200`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact_request_preserved: `false`
- logical command fingerprint: `053126ee`
- physical command fingerprint: `bc804974`
- command_transformed: `true`
- provider result: `[]`

## Boundary classification

This call proves the discovery route itself is operational and reached Ozon exactly once. It also records a command-envelope transformation for this operation (`053126ee` -> `bc804974`). The empty provider result means there is no real FBS act ID in the tested period.

Therefore:

- `posting_fbs_act_get_barcode`: **BLOCKED / NOT EXECUTED — NO LIVE ACT ID**;
- `posting_fbs_act_get_pdf`: **BLOCKED / NOT EXECUTED — NO LIVE ACT ID**;
- no synthetic act ID is permitted;
- this is not a file-delivery failure.

## Next legal step

Inspect the operation registry for any other direct `image/png` or `application/pdf` route whose prerequisite can be satisfied from genuine current account data. If none exists, direct PNG/PDF remain prerequisite-blocked while their deterministic regression coverage remains PASS.