# UI-04C — installed WB 0.2.1 HELP describe subscriptions

Date: 2026-09-12.
Source: operator-provided result from installed `wildberries-llm-api-bridge` 0.2.1.
Status: **PASS**.

## Command under test

`WB_HELP_V1` → `describe` → alias `subscriptions`.

## Observed result

- Bridge version: `0.2.1`.
- Batch status: `completed`.
- Item kind: `help`.
- Item state: `success`.
- Logical command count: `1`.
- Physical request count: `0`.
- Physical request min/max: `0/0`.
- `external_request_executed=false`.
- `automatic_retry=false`.
- `local=true`.
- `no_hidden_calls=true`.
- Registry counts remain `188/172/16`.
- `operation_card.operation=subscriptions`.
- `known=true`.
- family=`common`.
- method metadata=`GET`, effect=`READ`.
- path=`/api/common/v1/subscriptions`.
- `current_in_snapshot=true`.
- `execution_enabled=false`.
- `blocked_reason=SERVICE_TOKEN_ONLY_PERSONAL_BUILD`.
- `template=null` and `template_runnable=false`.
- `account_access=UNVERIFIED_REAL_ACCOUNT`.

## Acceptance

Installed local HELP correctly keeps the Service-token-only subscription operation disabled in the Personal-token build and makes zero provider requests.
