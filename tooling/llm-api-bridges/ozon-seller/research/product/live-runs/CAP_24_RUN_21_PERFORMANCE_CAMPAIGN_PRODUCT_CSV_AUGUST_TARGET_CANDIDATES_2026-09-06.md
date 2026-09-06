# CAP-24 Run 21 — historical August candidate-campaign CSV evidence

Date: 2026-09-06
Status: `PASS__HISTORICAL_CANDIDATE_CAMPAIGN_METRICS_CONFIRMED__CSV_HAS_NO_SKU_COLUMN`

## Business purpose

CAP-24 is determining whether August 2026 advertising spend can be defensibly attributed to target SKU `1636048691` without heuristic allocation or double counting.

Prior evidence:

- Run 19: historical August campaign statistics exposed four `Печать` candidate campaigns with total `moneySpent = 35785.11 RUB`.
- Run 20: current `performance_campaign_products` reads showed each of those four campaigns currently contains exactly one returned product, target SKU `1636048691`.
- Historical SKU membership still required an explicit provider-backed proof before removing the membership-drift caveat.

Target identity:

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- frozen period: `2026-08-01..2026-08-31`

## Exact Bridge execution

Observed result:

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- operation: `performance_campaign_product_csv`
- request_id: `7010835f-84e6-49c8-8e88-750df95133df`
- fingerprint: `93d2e239`
- provider: `ozon`
- host_alias: `performance_api`
- HTTP method: `GET`
- HTTP status: `200`
- elapsed: `384 ms`
- external_request_executed: `true`
- capability_probe_executed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `performance_provider_not_seller_subscription`
- exact_request_preserved: `true`
- command_transformed: `false`
- pagination: `null`
- rate_limit: `null`
- batch result_count: `1`
- logical_business_result_count: `1`
- physical_business_request_count: `1`

Invariant preserved:

`1 explicit business command => 1 physical provider request`.

Provider payload:

- content_type: `text/csv`
- encoding: `base64`
- byte_length: `1070`

The returned Base64 payload was decoded as UTF-8 CSV for evidence interpretation. No additional provider request was needed for decoding.

## Decoded CSV schema

The CSV header is:

```text
ID;Название кампании;Статус;Тип продвижения;Места размещения;Недельный бюджет, ₽;Расход, ₽;Показы;Клики;Добавления в корзину;CTR, %;Средняя стоимость клика, ₽;Продано товаров, шт.;Продажи в продвижении, ₽;ДРР в продвижении, %;Стратегия
```

Important boundary: the returned CSV does **not** contain a concrete SKU/product identifier column.

Therefore this operation can confirm historical campaign metrics for the selected campaign set, but it cannot by itself prove historical SKU membership.

## Exact returned rows

| campaign_id | title | status | promotion type | spend, RUB | impressions | clicks | cart adds | sold items | promoted sales, RUB | DRR, % | strategy |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `33379108` | Печать Поиск 21.03 Вывод в топ 25.03 26.07.2026 | inactive | top-promotion | 14900.95 | 54745 | 1894 | 228 | 67 | 110381.00 | 13.5 | TARGET_BIDS |
| `33379127` | Печать Реком 21,03 26.07.2026 | inactive | search-and-category | 14291.96 | 138973 | 4117 | 309 | 31 | 51697.00 | 27.6 | TARGET_BIDS |
| `37130607` | Печать Поиск 21.03 Вывод в топ 25.03 27.08.2026 | running | top-promotion | 3431.80 | 11238 | 419 | 29 | 4 | 6800.00 | 50.5 | TARGET_BIDS |
| `37130634` | Печать Реком 21,03 27.08.2026 | running | search-and-category | 3160.40 | 32830 | 987 | 55 | 2 | 3400.00 | 93.0 | `TARGGET_BIDS` as returned |

Exact spend arithmetic:

`14900.95 + 14291.96 + 3431.80 + 3160.40 = 35785.11 RUB`.

This exactly matches the four-candidate historical spend subtotal from Run 19.

Additional exact aggregates from the CSV, used only as descriptive reconciliation evidence:

- sold items reported across these four campaign rows: `67 + 31 + 4 + 2 = 104`
- promoted sales: `110381 + 51697 + 6800 + 3400 = 172278 RUB`

These advertising metrics are **not** substituted for Seller Analytics canonical monthly target-SKU revenue `259136 RUB` or `ordered_units = 155`.

## What this run proves

This run provides a second historical provider surface for the four candidate campaigns and confirms:

1. the four exact campaign IDs are present in the returned CSV;
2. their spend values reconcile exactly to Run 19;
3. historical campaign-level metrics such as spend, impressions, clicks, sold items, promoted sales and DRR are materially available;
4. the four-campaign historical spend subtotal remains exactly `35785.11 RUB`.

Combined with Run 20, the evidence state is stronger than title inference:

- historical campaign spend: provider-backed;
- current campaign-to-product relation: provider-backed;
- current returned product set for all four campaigns: exactly target SKU `1636048691` only.

However the CSV contains no historical SKU key or membership interval. Therefore it does **not** prove that campaign membership could not have changed during the frozen month.

Current defensible classification remains:

`STRONGLY_TARGET_LINKED_CAMPAIGN_SPEND__HISTORICAL_MEMBERSHIP_INTERVAL_NOT_EXPOSED`.

## Invalid historical SKU-statistics attempt before this run

A prior attempted `performance_sku_statistics` command produced `OZON_GUIDANCE_RESULT_V2` with:

- error: `INVALID_OPERATION_PARAMS`
- external_request_executed: `false`
- physical_business_request_count: `0`

That result was not a provider business read and cannot be treated as historical SKU evidence.

More importantly, the preserved CAP-24 contract check already established from the exact Performance contract that `performance_sku_statistics` has a near-date restriction (`dateFrom` not earlier than the previous day). It is therefore not a valid reconstruction source for `2026-08-01..2026-08-31` on 2026-09-06.

Do not retry August through `performance_sku_statistics` merely with different parameter spelling.

## Advertising attribution decision after Run 21

The exact historical `35785.11 RUB` may not yet be silently promoted to an unqualified target-SKU advertising cost solely because current campaign membership is single-SKU.

Before final CAP-24 arithmetic, one of the following is required:

1. a provider surface exposing historical campaign-to-SKU membership or historical SKU-level spend for the frozen month; or
2. an explicit documented acceptance of the evidence boundary that historical spend + current exclusive product membership is the strongest available attribution evidence, labeled with the membership-interval caveat.

No heuristic split is allowed.

## Duplicate-cost boundary remains open

The directly attributable finance ledger is `113264.00 RUB` and intentionally excludes `NON_ITEM` promotion-related rows without a SKU key.

Performance spend must not be blindly added to finance until the Performance-vs-finance promotion overlap is reconciled. Matching or similar finance `NON_ITEM` charges can be reconciliation evidence, but they cannot be re-added as separate SKU costs without proof that they are distinct.

## Current CAP-24 state after Run 21

- direct August target-attributable finance ledger: complete — `113264.00 RUB`
- historical candidate advertising spend: confirmed twice — `35785.11 RUB`
- current exclusive campaign-product identity: PASS for all 4 campaigns — target SKU `1636048691`
- historical campaign-to-SKU membership interval: not exposed by Run 21
- `performance_sku_statistics` historical reconstruction: invalid source for August
- Performance-vs-finance duplicate reconciliation: PENDING
- placement/storage attribution: PENDING
- executable Bridge change: none
