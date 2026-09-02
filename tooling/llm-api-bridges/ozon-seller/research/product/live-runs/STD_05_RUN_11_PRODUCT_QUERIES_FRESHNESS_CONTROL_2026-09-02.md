# STD-05 Run 11 — product_queries freshness control

Date: 2026-09-02
Benchmark: `STD-05`
Question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

## Purpose

Run 9 used `product_queries` for `2026-08-31` and received provider HTTP 403/code 7 even though Bridge preflight reported `SUPPORTED_AND_ENTITLED`. Run 10 then proved `/v1/analytics/product-queries` is present in the current API key's `Admin read only` role. Run 11 is a controlled older-date request intended to distinguish a recent-data freshness/calculation restriction from a general account/key entitlement denial.

## Command

```text
OZON_API_V1
{
  "operation": "product_queries",
  "params": {
    "date_from": "2026-08-29T00:00:00Z",
    "date_to": "2026-08-29T23:59:59Z",
    "page": 0,
    "page_size": 10,
    "skus": ["1636048691"]
  }
}
```

## Result

- request id: `41e392f8-ad80-41eb-81f8-c84644df59bc`;
- operation: `product_queries`;
- logical fingerprint: `a81903f5`;
- one physical business request;
- external request executed: `true`;
- HTTP `200`;
- elapsed `1439 ms`;
- same endpoint as Run 9: `POST /v1/analytics/product-queries`;
- same live account/key as Run 9/10;
- returned one requested SKU row;
- analytics period exactly `2026-08-29 00:00:00 UTC` through `2026-08-29 23:59:59 UTC`;
- SKU `1636048691` «Печать Велеса»:
  - `unique_search_users = 4876`;
  - `gmv = 1244 RUB`;
  - `position = null`;
  - `unique_view_users = null`;
  - `view_conversion = null`;
- `total = 1`, `page_count = 1`.

## Diagnostic conclusion

The endpoint is not globally unavailable to this Standard account/key. A controlled older date succeeded after:

- target-date Run 9 (`2026-08-31`) returned provider 403;
- Run 10 proved the endpoint exists in the key's role set;
- Run 11 (`2026-08-29`) returned 200 using the same operation/provider/account.

Strongest supported classification:

`RECENT_DATA_FRESHNESS_OR_DATA_READINESS_RESTRICTION_STRONGLY_SUPPORTED / EXACT_BOUNDARY_NOT_PROVEN`

This rejects:
- missing API-key role as the Run 9 cause;
- global Standard-account denial of `product_queries`;
- general operation/parameter invalidity.

Do not overclaim the exact provider cutoff from this one control. The evidence only proves that the newer requested day was rejected while the older control day was queryable.

## Product requirement consequence

Bridge should not expose unconditional `SUPPORTED_AND_ENTITLED` for a concrete request when a known freshness/data-readiness rule may make the requested date unqueryable. Preflight/queryability metadata should distinguish:

- endpoint supported;
- key role confirmed;
- account/subscription entitlement;
- concrete date range currently queryable/data ready.

Where the freshness rule is documented and locally evaluable, Bridge should fail closed before the physical provider request or return explicit machine-readable recovery guidance such as `WAIT_FOR_DATA_WINDOW` / `USE_OLDER_DATE_FOR_DIAGNOSTIC`, without hidden retry or fallback.

## STD-05 business consequence

Direct organic/search comparison for `2026-08-31` vs `2026-09-01` cannot be completed on the current test date because the target search analytics are not yet queryable. This is a data-readiness boundary, not evidence of zero organic demand.
