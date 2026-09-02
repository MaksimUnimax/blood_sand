# STD-09 Run 2 — FBS privacy policy block

Date: 2026-09-02
Question: `Дай продажи за вчера по складам от большего к меньшему.`

## Intended command

`fbs_posting_list` for 2026-09-01 with minimal optional data:
- `analytics_data=true`
- `barcodes=false`
- `financial_data=false`
- `legal_info=false`

The business purpose is warehouse-attributed FBS sales aggregation. No customer PII is needed for the answer.

## Bridge result

- request_id: `policy-aa1a1038-9138-4ad9-9388-0a568e9c3ad8`
- operation: `fbs_posting_list`
- logical fingerprint: `49af1b2b`
- HTTP/provider status: `0` (no provider call)
- `external_request_executed=false`
- physical business requests: `0`
- query planner: `pending`
- entitlement: `POLICY_BLOCKED`
- reason: `personal_data_setting_off`
- Bridge error code: `OPERATION_DISABLED_BY_USER`
- stage: `personal_data_policy`
- operator action: `enable_personal_data_setting_and_submit_new_command`

## Root cause

This is not an Ozon/provider error and not an entitlement failure.

The current Bridge registry marks `fbs_posting_list` as `PERSONAL_DATA_READ_GATED` with `operator_personal_data_gate`, so the call is rejected locally whenever the personal-data setting is off, even when the logical business task only needs aggregate product/warehouse analytics.

Classification:

`LOCAL_PRIVACY_POLICY_BLOCK_EXPECTED_BY_CURRENT_CONTRACT_ZERO_PROVIDER_REQUESTS`

## Commercial/product finding

STD-09 Run1 proved warehouse-attributed FBO sales are available on Standard via `posting_fbo_list.analytics_data`.

Run1 produced 11 non-cancelled FBO units / 18,700 RUB, while the full-cabinet baseline STD-01 was 16 units / 27,200 RUB. The remaining 5 units / 8,500 RUB must be reconciled before the business question can be closed.

The next likely source is FBS, but the current FBS read requires enabling a personal-data operator setting even though the requested business output does not require PII.

This creates a portability/product-hardening requirement:

`AGGREGATE_FBS_BUSINESS_ANALYTICS_SHOULD_NOT_REQUIRE_EXPOSING_CUSTOMER_PII_TO_AI`

A future hardened design should support one of:
1. a privacy-safe FBS business projection that strips PII before AI delivery and does not require the broad personal-data gate; or
2. a dedicated aggregate FBS sales/warehouse operation; or
3. another verified Standard-safe non-PII source that reconciles the full-cabinet sales total.

Do not implement this during the Sol baseline. Record the gap and continue the live test using the current accepted product behavior.

## NO_SKIP_ON_FAILURE

STD-09 remains active. Do not move to STD-10.

The current accepted Bridge requires explicit operator action before the same FBS command can reach Ozon:
- enable `Показывать личные данные`;
- explicitly submit a new `fbs_posting_list` command.

No automatic retry is allowed.
