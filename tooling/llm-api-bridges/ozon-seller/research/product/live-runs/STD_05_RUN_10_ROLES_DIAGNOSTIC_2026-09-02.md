# STD-05 Run 10 — roles diagnostic

Date: 2026-09-02
Benchmark row: `STD-05`
Question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

## Input

```text
OZON_API_V1
{
  "operation": "roles",
  "params": {}
}
```

## Bridge / provider result

- request id: `816ec939-9f7a-4110-9aa6-239fcd9f8085`
- operation: `roles`
- HTTP: `200`
- physical business requests: `1`
- provider request executed: `true`
- key expiry: `2027-02-06T08:09:07.738279Z`

## Load-bearing finding

The current key's `Admin read only` role explicitly contains:

- `/v1/analytics/product-queries`
- `/v1/analytics/product-queries/details`

Therefore STD-05 Run 9 HTTP 403 for `POST /v1/analytics/product-queries` is **not explained by the endpoint being absent from the API-key roles**.

Current strongest classification:

`PRODUCT_QUERIES_PROVIDER_403_WITH_ROLE_PRESENT / KEY_ROLE_CAUSE_REJECTED`

Remaining plausible classes include:

1. account/subscription/provider policy not represented by the Bridge entitlement snapshot;
2. endpoint-specific data freshness/calculation window;
3. another provider-side condition not modeled by Bridge.

## Freshness-window diagnostic hypothesis

Current Ozon documentation/mirrors for `product_queries` describe a recent-data calculation delay: the newest roughly three days can be unavailable while analytics is being calculated. Run 9 requested `2026-08-31`, only two days before the current test date `2026-09-02`.

This is not yet proven as the exact 403 trigger. A controlled diagnostic on an older date is required before classifying the whole operation as unavailable to Standard.

Next diagnostic: use the same operation on `2026-08-29` (outside the recent three-day window), with a minimal SKU set. Do not repeat the unavailable 2026-08-31 query blindly.

## Product consequence

Bridge currently cannot distinguish:

- key role confirmed,
- static entitlement snapshot prediction,
- provider live entitlement,
- recent-data calculation/freshness restrictions.

This should be hardened before weak-model benchmarking.