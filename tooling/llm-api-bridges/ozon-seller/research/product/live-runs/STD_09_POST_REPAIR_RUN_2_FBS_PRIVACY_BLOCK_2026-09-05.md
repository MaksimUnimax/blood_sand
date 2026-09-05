# STD-09 post-repair Run 2 — FBS privacy-policy block

Date: 2026-09-05
Business question: `Продажи за вчера по складам.`
Target business date: `2026-09-04`.

## Intended command

`fbs_posting_list` for `2026-09-04T00:00:00Z..2026-09-04T23:59:59Z`, `limit=100`, with only warehouse/business analytics requested:
- `analytics_data=true`
- `barcodes=false`
- `financial_data=false`
- `legal_info=false`

## Bridge result

- request_id: `policy-0663aa54-0eaf-4118-ae58-e5db7f6ed183`
- operation: `fbs_posting_list`
- logical fingerprint: `2f1e7470`
- HTTP/provider status: `0`
- `external_request_executed=false`
- `physical_business_request_count=0`
- planner status: `pending`
- entitlement: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- error code: `OPERATION_DISABLED_BY_USER`
- stage: `personal_data_policy`
- automatic retry: `false`
- required operator action: `enable_personal_data_setting_and_submit_new_command`

## Classification

`STD_09_RUN_2_BLOCKED_EXPECTED_LOCAL_PRIVACY_GATE_ZERO_PROVIDER_REQUESTS`

This is not an Ozon/provider failure and not an entitlement failure. The Bridge correctly blocked the operation locally because the operator personal-data setting is off. No provider business request was executed.

Under `NO_SKIP_ON_FAILURE`, STD-09 remains active. Do not advance to STD-10. After the operator explicitly enables `Показывать личные данные`, submit a new explicit `fbs_posting_list` command. No automatic retry.
