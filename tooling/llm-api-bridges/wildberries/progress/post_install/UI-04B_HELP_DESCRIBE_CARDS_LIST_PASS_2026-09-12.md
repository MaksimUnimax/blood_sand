# UI-04B — installed WB 0.2.1 HELP describe cards_list

Date: 2026-09-12.
Source: operator-provided result from installed `wildberries-llm-api-bridge` 0.2.1.
Status: **PASS**.

## Command under test

`WB_HELP_V1` → `describe` → alias `cards_list`.

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
- `operation_card.operation=cards_list`.
- `known=true`.
- family/category=`content`.
- HTTP method metadata=`POST`, effect=`READ`.
- path=`/content/v2/get/cards/list`.
- `current_in_snapshot=true`.
- `execution_enabled=true`.
- `blocked_reason=null`.
- privacy=`standard`.
- `body_required=true`; therefore `template=null` and `template_runnable=false` are expected.
- `account_access=UNVERIFIED_REAL_ACCOUNT`, so this local help result does not claim actual account entitlement/currentness.

## Acceptance

Installed local HELP correctly describes an enabled operation without a provider request and keeps live-account access explicitly unverified.

Next: UI-04C `describe subscriptions`; expected to remain known but execution-disabled with zero provider calls.
