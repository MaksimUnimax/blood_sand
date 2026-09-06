# CAP-23 Run 01 — own-product query position probe

Date: 2026-09-06
Status: `OWN_SEARCH_POSITION_PARTIAL_BOUNDARY_CONFIRMED`

Canonical CAP-23 job:
`Какое место занимает мой товар по ключевым запросам и в категории, кто выше и что мешает подняться?`

Target own-product authority:
- SKU `1636048691`
- Seller product_id `1119965443`
- offer_id `Печать Велеса`
- title `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`

Operation: `product_queries`
Request ID: `7331fb96-c3fd-4135-b5f5-1cd3798909be`
Provider surface: Seller API `POST /v1/analytics/product-queries`

Exact requested parameters:
- `date_from = 2026-08-29T00:00:00Z`
- `date_to = 2026-08-29T23:59:59Z`
- `page_size = 10`
- `skus = ["1636048691"]`
- `sort_by = BY_POSITION`
- `sort_dir = ASCENDING`

Execution evidence:
- HTTP `200`
- external request executed: `true`
- logical business result count: `1`
- physical business request count: `1`
- capability probe: not needed / not performed
- entitlement status: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `provider_may_return_subscription_dependent_scope`
- exact request preserved: `true`
- command transformed: `false`
- logical fingerprint = physical fingerprint = `14cdbabb`

Provider result for SKU `1636048691`:
- `unique_search_users = 4876`
- `gmv = 1244 RUB`
- `position = null`
- `unique_view_users = null`
- `view_conversion = null`
- category projection = `EPG`
- `total = 1`
- `page_count = 1`
- analytics period exactly `2026-08-29 00:00:00 UTC` through `2026-08-29 23:59:59 UTC`

Interpretation:
- the explicit `BY_POSITION ASCENDING` request was preserved exactly and executed successfully, yet the Standard response still returned `position = null`;
- `position = null` MUST NOT be interpreted as rank `0`, not-ranked, invisible, or any numeric search position;
- the same ready day and SKU reproduce the CAP-21 demand/GMV authority (`4876` unique search users, `1244 RUB` GMV), so this is a response-scope boundary, not a zero-demand finding;
- `unique_view_users = null` and `view_conversion = null` remain unavailable in this response and must not be reconstructed from unrelated fields;
- CAP-21 already completed the exact query-detail read on this same proven-ready day, so repeating `product_queries_details` here would add no new position evidence and is not required.

Commercial-value significance:
- the Bridge can expose factual own-product search demand and GMV for a queryable Standard period;
- the Bridge cannot truthfully promise exact own-product search-rank tracking from this response because the rank field is null even under an explicit position sort;
- this is a commercially relevant coverage boundary for SEO/rank-monitoring positioning: demand/content diagnostics are supported, exact rank is not proven by this Standard surface.

Checkpoint: `CAP_23_OWN_SEARCH_POSITION_PARTIAL_BOUNDARY_CONFIRMED_CATEGORY_COVERAGE_SYNTHESIS_NEXT`
