# CAP-21 — Roles diagnostic

Status: `PASS_METHOD_ROLE_PRESENT`

Date: 2026-09-06

Live request: `roles`

Request ID: `8e2bc697-608a-4158-827b-464d249f4292`

Result:
- HTTP 200;
- one logical business result -> one physical business request;
- exact request preserved;
- no transformation;
- current key role list explicitly contains both `/v1/analytics/product-queries` and `/v1/analytics/product-queries/details` under `Admin read only`.

Conclusion: the prior `product_queries` HTTP 403 is **not explained by absence of the endpoint from the current API key's allowed methods**. The remaining live boundary is subscription/provider entitlement behavior versus the Bridge entitlement model.

Next diagnostic: read `/v1/seller/info` via `seller_info` to inspect the actual subscription profile used by Bridge capability probing.

Checkpoint: `CAP_21_PRODUCT_QUERIES_403_SELLER_INFO_DIAGNOSTIC_NEXT`
