# STD-05 — Run 5 — Performance daily comparison

Date: 2026-09-02
Benchmark row: `STD-05`
Business question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

## Command

```text
OZON_API_V1
{
  "operation": "performance_daily",
  "params": {
    "dateFrom": "2026-08-31",
    "dateTo": "2026-09-01"
  }
}
```

## Transport/result

- bridge `ozon-llm-api-bridge` `0.1.19`
- request id `d4f6b587-38af-4e25-86a3-87c84d35ac80`
- provider `performance_api`
- operation `performance_daily`
- one logical business result
- one physical business request
- external request executed
- HTTP `200`
- elapsed `396 ms`
- no rate-limit metadata
- entitlement `SUPPORTED_AND_ENTITLED`
- entitlement reason `performance_provider_not_seller_subscription`
- command transformed: `false`

## AI aggregation across all returned campaign/day rows

### 2026-08-31

- views: `52,520`
- clicks: `1,228`
- moneySpent: `5,337.70 RUB`
- attributed orders: `22`
- ordersMoney: `35,564 RUB`

### 2026-09-01

- views: `49,913`
- clicks: `1,190`
- moneySpent: `5,534.91 RUB`
- attributed orders: `24`
- ordersMoney: `39,882 RUB`

### Change 2026-09-01 vs 2026-08-31

- views: `-2,607` / `-5.0%`
- clicks: `-38` / `-3.1%`
- moneySpent: `+197.21 RUB` / `+3.7%`
- attributed orders: `+2` / `+9.1%`
- ordersMoney: `+4,318 RUB` / `+12.1%`

## Important campaign example

Campaign `10384311` — `Продвижение в поиске — все товары`:

- 2026-08-31: views `8,961`; clicks `168`; spend `1,948.20 RUB`; orders `12`; ordersMoney `19,482 RUB`
- 2026-09-01: views `8,883`; clicks `206`; spend `2,318.80 RUB`; orders `14`; ordersMoney `23,188 RUB`

This directly rejects the simple hypothesis that sales collapsed because the main advertising activity stopped or its budget sharply fell.

## Interpretation

Seller analytics showed total revenue falling from `49,640 RUB` on 2026-08-31 to `27,200 RUB` on 2026-09-01 (`-45.2%`). Performance advertising did not fall comparably: spend increased, attributed orders increased and attributed `ordersMoney` increased.

Therefore:

`ADVERTISING_UNDERDELIVERY_AS_PRIMARY_CAUSE = DISFAVORED`

This does not prove advertising had no SKU-specific effect. Some individual campaigns changed materially, but the account-level advertising surface does not support a broad advertising shutdown as the primary cause of the Seller revenue collapse.

## Cross-source semantics warning discovered

On 2026-09-01 Performance `ordersMoney` summed to `39,882 RUB`, while Seller `analytics_data` revenue for the same calendar day was `27,200 RUB`.

These values must **not** be treated as the same accounting metric or forced to reconcile 1:1. Performance attribution windows/semantics can differ from Seller order/revenue semantics. The AI must preserve this distinction when correlating Seller and Performance data.

Product requirement discovered:

`CROSS_SOURCE_METRIC_SEMANTICS_MUST_BE_EXPLICIT_FOR_WEAK_MODELS`

A weak model must not infer that Performance `ordersMoney` is identical to Seller `revenue`, and must not diagnose data corruption merely because the two totals differ.

## STD-05 next step

Advertising underdelivery is not supported as the primary explanation. The next evidence branch is current catalog/listing visibility/status for the SKUs that were selling on 2026-08-31, especially the largest negative contributors. This remains current-state evidence and must not be presented as proof of historical state on 2026-09-01.

Checkpoint:

`STD_05_RUN5_PERFORMANCE_200_AD_UNDERDELIVERY_PRIMARY_CAUSE_DISFAVORED_NEXT_LISTING_VISIBILITY`
