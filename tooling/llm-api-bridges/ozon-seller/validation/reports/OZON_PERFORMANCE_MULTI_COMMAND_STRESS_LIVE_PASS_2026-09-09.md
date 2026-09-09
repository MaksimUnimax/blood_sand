# Ozon Performance multi-command stress — LIVE PASS — 2026-09-09

## Verdict

**PASS.** One explicit sequential batch containing five independent Performance reads executed as exactly five logical business results and five physical business requests, in source order, with no coalescing, hidden pagination, retry, polling, fan-out, provider chaining, or command transformation.

## Tested authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective production source installed for live test: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Bridge: `ozon-llm-api-bridge v0.1.19`
- Test date: `2026-09-09`
- Statistics interval: `2026-07-07` through `2026-09-06` inclusive (`62` calendar days)

## Delivery artifact

Bridge delivered the complete batch as a generated text attachment:

- delivery representation: `ATTACHED_COMPLETE_TEXT_DOCUMENT`
- delivery id: `manual-delivery-29a0c514-b861-43e6-91d7-001982116139`
- filename: `ozon-bridge-result-manual-delivery-29a0c514-b861-43e6-91d7-001982116139.txt`
- MIME: `text/plain;charset=utf-8`
- source kind: `generated_bridge_text`
- marker bytes: `2207800`
- physical bytes: `2207800`
- marker SHA-256: `7b72bad7e2578af87e608df6e6e38ea2a16a09bb2ad23067a909be33a7356e63`
- physical SHA-256: `7b72bad7e2578af87e608df6e6e38ea2a16a09bb2ad23067a909be33a7356e63`

Physical verification additionally confirmed valid UTF-8, exactly five parseable `OZON_RESULT_V1` JSON objects, and normal JSON termination after result 5/5.

## Outer batch accounting

- `result_count = 5`
- `logical_business_result_count = 5`
- `physical_business_request_count = 5`
- `coalesced_group_count = 0`
- `coalesced_logical_count = 0`
- capability probe: `not_needed` / not performed

## Exact result ledger

### 1. `performance_campaigns`

- request id: `623b0c07-8477-4f45-9b6b-c3a33f6c8622`
- HTTP: `200`
- elapsed: `1778 ms`
- external request executed: `true`
- capability probe executed: `false`
- exact request preserved: `true`
- command fingerprint: `051bb998`
- logical fingerprint: `051bb998`
- physical fingerprint: `051bb998`
- command transformed: `false`
- pagination: `null`
- rate limit: `null`
- campaign rows returned: `1128`
- provider total: `1128`

### 2. `performance_expense`

- request id: `518f1751-f6e6-439a-91ed-1fe8c2a4461f`
- HTTP: `200`
- elapsed: `414 ms`
- external request executed: `true`
- capability probe executed: `false`
- exact request preserved: `true`
- logical/physical fingerprint: `d6335d3b = d6335d3b`
- command transformed: `false`
- pagination: `null`
- rate limit: `null`
- rows: `1368`

### 3. `performance_daily`

- request id: `1f14d239-fbac-4e13-901d-649faacac5c6`
- HTTP: `200`
- elapsed: `453 ms`
- external request executed: `true`
- capability probe executed: `false`
- exact request preserved: `true`
- logical/physical fingerprint: `fdf7aff4 = fdf7aff4`
- command transformed: `false`
- pagination: `null`
- rate limit: `null`
- rows: `1506`

### 4. `performance_campaign_product`

- request id: `158b1398-948d-401b-8532-ddd918758da4`
- HTTP: `200`
- elapsed: `399 ms`
- external request executed: `true`
- capability probe executed: `false`
- exact request preserved: `true`
- logical/physical fingerprint: `bd7376b1 = bd7376b1`
- command transformed: `false`
- pagination: `null`
- rate limit: `null`
- rows: `768`

### 5. `performance_media`

- request id: `5aad75b4-dccd-457d-9e2a-ce3da1812f5c`
- HTTP: `200`
- elapsed: `377 ms`
- external request executed: `true`
- capability probe executed: `false`
- exact request preserved: `true`
- logical/physical fingerprint: `6af2ef93 = 6af2ef93`
- command transformed: `false`
- pagination: `null`
- rate limit: `null`
- rows: `10`

No result contains a provider/Bridge error.

## Cross-endpoint business reconciliation

Both `performance_expense` and `performance_daily` cover all `62` dates from `2026-07-07` through `2026-09-06`, with no missing date in either surface.

### Expense totals

- spend: `319439.42`
- bonus spend: `0.00`
- prepayment spend: `0.00`

### Daily totals

- spend: `319439.42`
- views: `2751331`
- clicks: `60770`
- attributed orders: `1431`
- attributed order value: `2411490.00`

The `performance_expense` spend and `performance_daily` spend reconcile **exactly** to the kopeck.

Derived only from the returned provider numbers, not provider-native fields:

- CTR: approximately `2.20875%`
- average CPC: approximately `5.25653`
- attributed orders / clicks: approximately `2.35478%`
- spend / attributed order value: approximately `13.24656%`
- attributed order value / spend: approximately `7.54913x`
- spend / attributed order: approximately `223.23`

### Campaign-product totals

Across `768` unique campaign rows:

- spend: `196406.86`
- views: `2399199`
- clicks: `54921`
- orders: `702`
- attributed order value: `1181163.00`
- add-to-cart: `4088`

Status distribution:

- archived: `648`
- inactive: `100`
- running: `20`

Placement distribution:

- top-promotion: `390`
- search-and-category: `375`
- overtop: `3`

Strategy distribution:

- TARGET_BIDS: `691`
- NO_AUTO_STRATEGY: `52`
- TARGET_CIR: `20`
- TAKEOVER: `3`
- TOP_PROMOTION: `2`

For the `112` campaign IDs that occur in both `performance_daily` and `performance_campaign_product`, views/clicks/orders/order value reconcile exactly. Only `moneySpent` has provider aggregate-rounding differences: `58` IDs differ, maximum absolute per-ID difference `0.04`, total absolute difference `0.78`, and net campaign-product-minus-daily difference `+0.14`. This is classified as provider aggregate rounding, not a Bridge defect.

## SEARCH_PROMO/CPO semantic boundary

Exactly one daily campaign ID is not present in the SKU campaign-product surface:

- ID: `10384311`
- campaign master title: `Оплата за заказ: выбранные товары`
- expense title: `Оплата за заказ: выбранные товары`
- daily title: `Продвижение в поиске — все товары`
- master object type: `SEARCH_PROMO`
- master payment type: `CPO`

Period totals for this ID:

- spend: `123032.70`
- views: `352132`
- clicks: `5849`
- orders: `729`
- attributed order value: `1230327.00`

The title difference is a provider cross-endpoint naming inconsistency. It is **not** a Bridge rewrite: all tested commands preserved exact logical/physical fingerprints and `command_transformed=false`.

This one SEARCH_PROMO campaign explains the material difference between all-campaign daily totals and the SKU campaign-product surface; the remaining penny-level delta is the aggregate rounding described above.

## Zero-spend attribution boundary

There are `12` campaign IDs present in `performance_daily` but absent from `performance_expense`. Every one of those IDs has period spend `0.00` while still carrying attributed orders/order value in `performance_daily`.

Business consequence: absence from the expense row set or zero ad spend must not be interpreted as proof of zero attributed orders/revenue.

## Media surface

`performance_media` returned `10` rows. Across the tested period all returned media totals are zero for spend, views, clicks, orders, attributed order value, post-view orders and post-view order value. The endpoint is live and successful; the account simply has no measured media activity in this interval.

## Campaign-master shape warning

The campaign master contains `1128` objects:

- SKU: `768`
- REF_VK: `348`
- BANNER: `10`
- SEARCH_PROMO: `1`
- ALL_SKU_PROMO: `1`

States:

- archived: `652`
- running: `369`
- inactive: `107`

Payment types:

- CPC: `774`
- CAMPAIGN_TYPE_INVALID: `348`
- CPM: `4`
- CPO: `2`

The raw `369` running-state count must not be interpreted as 369 normal active ad campaigns without filtering object type: `348` master rows are `REF_VK` objects with invalid/placeholder payment semantics.

## Current 20 running SKU campaign-product rows

Provider aggregates:

- spend: `40027.06`
- views: `483641`
- clicks: `11167`
- orders: `78`
- attributed order value: `131637.00`
- add-to-cart: `781`

Derived:

- CTR: approximately `2.30894%`
- spend / attributed order value: approximately `30.40715%`
- spend / attributed order: approximately `513.17`

These are descriptive live observations only; they are not yet an optimization recommendation.

## Final stress verdict

**PASS** for the tested five-command Performance batch:

- five explicit independent commands;
- exactly five physical business requests;
- all HTTP 200;
- all exact requests preserved;
- zero command transformations;
- zero hidden coalescing/pagination/retry/polling/fan-out;
- complete 2.2 MB delivery artifact verified physically;
- meaningful cross-endpoint advertising data returned and reconciled.

CAP-24 remains frozen and is not part of this test. The separate `review_list` 403 remains a separate boundary test and is not part of the advertising line.