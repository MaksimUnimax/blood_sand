# Ozon review_list — Tier A buyer evidence — provider 403

Date: 2026-09-07
Stage: 06.4 buyer/customer evidence
Status: `BLOCKED_BY_PROVIDER_PERMISSION`

## Request

- bridge: `ozon-llm-api-bridge`
- bridge version: `0.1.19`
- request id: `5649ec00-ecdb-437c-951d-f9edaddf9244`
- operation: `review_list`
- command fingerprint: `9f810d0d`
- provider: `ozon`
- host alias: `seller_api`
- HTTP method: `POST`
- path alias: `review_list`
- physical business requests: `1`
- external request executed: `true`
- capability probe executed: `false`

Requested Tier A SKUs:
- `1636048691` — Печать Велеса
- `1636041142` — Велес
- `1640251697` — Алатырь
- `1602722942` — Вегвизир
- `1602717077` — Шлем Ужаса / Эгисхьяльм

Request intent: newest-first direct Ozon reviews, up to 100 rows, for the five Tier A SKUs.

## Provider result

- HTTP status: `403`
- elapsed: `1392 ms`
- provider error category: `auth_or_permission`
- provider error code: `7`
- automatic retry: `false`
- external request executed: `true`

Bridge planning preserved the exact request and reported:
- entitlement key: `POST /v2/review/list`
- entitlement status: `ENTITLEMENT_UNKNOWN`
- entitlement reason: `entitlement_rule_unknown`
- capability required: `false`
- capability probe: `not_needed`

Raw provider error text was withheld by the bridge and is not reconstructed here.

## Evidence interpretation

This is not a local personal-data-gate rejection: the Seller API business request was actually executed and Ozon returned HTTP 403.

The only safe research conclusion is:

`CURRENT_DIRECT_OZON_REVIEW_READ = BLOCKED_BY_PROVIDER_PERMISSION`

The response does **not** prove which specific permission/subscription condition is missing. B9 contract evidence says review access can be granted by either the separate `Управление отзывами` entitlement or Premium Pro, so the 403 must not be relabeled as a proven missing Premium Pro subscription.

No review text was returned. Therefore:
- buyer themes are not observed from this request;
- absence of reviews is not inferred;
- no retry of the same request is justified without a permission-state change.
