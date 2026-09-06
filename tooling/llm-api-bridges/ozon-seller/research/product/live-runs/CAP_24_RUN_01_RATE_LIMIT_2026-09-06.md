# CAP-24 Run 01 — August SKU sales ranking — rate-limit result

Date: 2026-09-06
Status: `RATE_LIMIT_BLOCKED_RETRY_SAME_COMMAND`

Canonical CAP-24 job:
`Возьми один реально продававшийся товар из моего текущего каталога и посчитай по нему юнит-экономику за последний полный календарный месяц...`

Run 01 intended purpose:
- obtain August 2026 revenue and ordered units grouped by SKU;
- select a genuinely sold SKU from provider evidence before doing any unit-economics attribution.

Operation: `analytics_data`
Request ID: `f0f3694f-db6a-42b3-9ef1-d6d6e4e1b90e`
Provider surface: Seller API `POST /v1/analytics/data`

Requested business parameters:
- `date_from = 2026-08-01`
- `date_to = 2026-08-31`
- `dimension = [sku]`
- `metrics = [revenue, ordered_units]`
- `sort = revenue DESC`
- `limit = 1000`
- `offset = 0`

Execution evidence:
- HTTP `429`
- external request executed: `true`
- logical business result count: `1`
- physical business request count: `1`
- capability probe: not needed / not performed
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- provider error category: `rate_limit`
- provider error code: `8`
- automatic retry: `false`
- quota family: `seller.analytics_data.v1`
- minimum interval: `60000 ms`
- `next_allowed_at = 1788681119528` = `2026-09-06T07:51:59.528Z`

Planner evidence:
- acquisition profile: `analytics_basic_metrics_v1`
- prefetch applied: `false`
- requested metrics = physical metrics = `[revenue, ordered_units]`
- `exact_request_preserved = false`
- `command_transformed = true`
- logical fingerprint `ac485cc5`
- physical fingerprint `0560f9d1`

Interpretation:
- this run produced no August SKU sales data and therefore cannot select a target SKU;
- HTTP 429 is a provider quota/timing result, not a business-data result and not evidence of zero sales;
- Bridge correctly did not auto-retry and did not create hidden additional provider traffic;
- the correct next action is to retry the same logical command only after the provider-declared quota window opens;
- no downstream finance, advertising, placement, or unit-economics reads should start until Run 01 returns actual SKU sales evidence.

Commercial-value significance:
- the failed attempt adds operational evidence about safe rate-limit handling but does not yet add business-value evidence for SKU unit economics;
- valuation evidence remains pending until the same Run 01 successfully returns a real sold SKU and actual August revenue/units.

Checkpoint: `CAP_24_RUN_01_RATE_LIMIT_RETRY_SAME_COMMAND_AFTER_2026_09_06T07_51_59_528Z`
