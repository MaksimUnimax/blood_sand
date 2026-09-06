# CAP-21 — product_queries_details readiness control page 1 PASS

Status: `PASS_READINESS_CONTROL_DETAILS_PAGE_1`

Date: 2026-09-06

Live request: `product_queries_details` for proven-ready control day `2026-08-29`, own SKU `1636048691`, page `0`, page_size `10`, limit_by_sku `15`.

Request ID: `e206b707-2fa7-4ad1-8262-5bda4d59b8ee`

Observed result:
- endpoint: `POST /v1/analytics/product-queries/details`;
- external request executed: `true`;
- HTTP `200`;
- one logical business result -> one physical business request;
- Bridge planning: `SUPPORTED_AND_ENTITLED`;
- exact_request_preserved: `false`;
- command_transformed: `true`;
- logical fingerprint `cd2f72e1`, physical fingerprint `e0f788c9`;
- analytics period exactly `2026-08-29 00:00:00 UTC` .. `2026-08-29 23:59:59 UTC`;
- `total = 15`, `page_count = 2`;
- page 0 returned 10 factual query rows.

Returned queries, in provider order:
1. `подвеска` — unique_search_users `2486`;
2. `в машину` — `474`;
3. `подвеска в машину` — `234`;
4. `подвеска в машину на зеркало` — `223`;
5. `оберег` — `168`;
6. `от сглаза` — `105`;
7. `амулет` — `101`;
8. `талисман` — `96`;
9. `магия` — `94`;
10. `оберег для дома` — `92`.

For all returned query rows on this partial-response account surface:
- `position = null`;
- `unique_view_users = null`;
- `view_conversion = null`;
- `gmv = 0`;
- `order_count = 0`.

## Diagnostic conclusion

The detail endpoint is also queryable on the proven older ready day. Therefore the recent-window HTTP 403 on `product_queries_details` is not evidence of global endpoint or API-key denial. Together with the summary endpoint control, the strongest supported classification remains:

`RECENT_DATA_FRESHNESS_OR_DATA_READINESS_RESTRICTION_STRONGLY_SUPPORTED / EXACT_BOUNDARY_NOT_PROVEN`.

The returned query terms are valid CAP-21 own-product query evidence and may be used to construct the semantic core. Exact search position and view/conversion performance are not proven because those fields are null on this account response.

Explicit pagination is required: `total = 15`, `page_count = 2`; fetch page `1` next. No hidden pagination.

Checkpoint: `CAP_21_PRODUCT_QUERIES_DETAILS_READY_DAY_PAGE_1_NEXT`
