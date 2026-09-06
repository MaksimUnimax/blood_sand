# CAP-21 — Seller info subscription diagnostic

Status: `PASS_NON_PREMIUM_PROFILE_CONFIRMED`

Date: 2026-09-06

Live request: `seller_info`

Request ID: `b5d67a1b-948f-4227-b49a-dd23dfc09b1c`

Result:
- HTTP 200;
- one logical business result -> one physical business request;
- exact request preserved;
- no transformation;
- `subscription.is_premium = false`;
- `subscription.type = UNSPECIFIED`.

Interpretation:
- the current Seller cabinet is not Premium;
- the prior `roles` result proved that the API key itself explicitly includes both `/v1/analytics/product-queries` and `/v1/analytics/product-queries/details`;
- therefore the `product_queries` HTTP 403 is not explained by missing key-method permission;
- the live evidence is consistent with a provider/subscription entitlement boundary that the bundled Bridge rule currently models too permissively as `ALL_ACCOUNTS_PARTIAL_RESPONSE` for recent own-product query requests;
- because the provider did not expose raw error text to AI, do not overclaim the exact commercial tier requirement from this single 403.

Next diagnostic:
Run `product_queries_details` for the same recent, non-history-gated window, same own SKU, no restricted sort, and a small explicit `limit_by_sku`. This is a separate provider endpoint and determines whether the whole own-query surface is unavailable or only the summary endpoint.

Checkpoint: `CAP_21_PRODUCT_QUERIES_DETAILS_BOUNDARY_PROBE_NEXT`
