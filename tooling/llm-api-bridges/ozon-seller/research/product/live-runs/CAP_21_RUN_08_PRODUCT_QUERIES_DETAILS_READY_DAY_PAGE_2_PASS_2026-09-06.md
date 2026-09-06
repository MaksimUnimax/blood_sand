# CAP-21 — product_queries_details ready-day page 2 PASS

Status: `PASS_QUERY_DETAIL_PAGINATION_COMPLETE`

Date: 2026-09-06

Live request: `product_queries_details` for proven-ready control day `2026-08-29`, own SKU `1636048691`, page `1`, page_size `10`, limit_by_sku `15`.

Request ID: `e05fdb77-de37-441d-9527-c7d93309b024`

Observed result:
- endpoint: `POST /v1/analytics/product-queries/details`;
- external request executed: `true`;
- HTTP `200`;
- one logical business result -> one physical business request;
- Bridge planning: `SUPPORTED_AND_ENTITLED`;
- exact_request_preserved: `false`;
- command_transformed: `true`;
- logical fingerprint `6d5f3e34`, physical fingerprint `6e1912b8`;
- analytics period exactly `2026-08-29 00:00:00 UTC` .. `2026-08-29 23:59:59 UTC`;
- `total = 15`, `page_count = 2`;
- page 1 returned the terminal five rows (query_index 11..15).

Returned queries, in provider order:
11. `эзотерика` — unique_search_users `77`;
12. `оберег от сглаза и порчи` — `65`;
13. `коловрат` — `59`;
14. `оберег от сглаза` — `49`;
15. `велес` — `47`.

For all five rows:
- `position = null`;
- `unique_view_users = null`;
- `view_conversion = null`;
- `gmv = 0`;
- `order_count = 0`.

## Pagination conclusion

Explicit query-detail pagination is complete: page 0 returned indices 1..10 and page 1 returned indices 11..15; provider reports `total = 15`, `page_count = 2`. No additional page is justified.

## CAP-21 evidence state

The factual own-query set is now complete for the proven-ready day. The recent 403 responses remain classified as a freshness/data-readiness boundary rather than global endpoint denial because both summary and details endpoints succeed on `2026-08-29`.

CAP-21 is not final yet: the controlling SEO capability authority also requires structured product attributes and content-rating evidence in addition to description and search-query evidence. Attributes must be read next. Existing CAP-03 preserved evidence proves SKU `1636048691` belongs to the 74/76 cards rated 87.5/100 with the common Rich-content text gap, but CAP-21 will explicitly reconcile this authority before final scoring.

Checkpoint: `CAP_21_ATTRIBUTES_READ_NEXT`
