# CAP-21 — Product queries readiness control PASS

Status: `PASS_READINESS_CONTROL_REPRODUCED`

Date: 2026-09-06

Live request: `product_queries` for the preserved STD-05 control day `2026-08-29`, own SKU `1636048691`.

Request ID: `e456355c-63ec-435d-84bc-5d57cf8dbf9c`

Observed result:
- provider endpoint: `POST /v1/analytics/product-queries`;
- external request executed: `true`;
- capability probe: not needed / not performed;
- HTTP `200`;
- one logical business result -> one physical business request;
- exact request preserved: `true`;
- command transformed: `false`;
- logical fingerprint = physical fingerprint = `a81903f5`;
- analytics period exactly `2026-08-29 00:00:00 UTC` through `2026-08-29 23:59:59 UTC`;
- returned exactly one row for SKU `1636048691`;
- `unique_search_users = 4876`;
- `gmv = 1244 RUB`;
- `position = null`;
- `unique_view_users = null`;
- `view_conversion = null`;
- `total = 1`, `page_count = 1`.

## Diagnostic conclusion

This reproduces the branch-specific STD-05 Run 11 control on the current live state, including the same command fingerprint and the same returned business values.

Therefore the CAP-21 recent-window `product_queries` HTTP 403 is **not** evidence that the current account/key globally lacks access to `/v1/analytics/product-queries`. The current key can execute that endpoint successfully for a queryable older day.

Together with:
- current `/v1/roles` proving `/v1/analytics/product-queries` and `/v1/analytics/product-queries/details` are present in the key role set;
- the preserved STD-05 recent-day 403 versus older-day 200 control;
- current CAP-21 recent-window 403;

the strongest supported classification is:

`RECENT_DATA_FRESHNESS_OR_DATA_READINESS_RESTRICTION_STRONGLY_SUPPORTED / EXACT_BOUNDARY_NOT_PROVEN`

The non-Premium seller profile must not be used to relabel this as a subscription denial. The exact provider readiness cutoff remains unproven.

## Next recovery

Apply the same readiness-controlled single-day window to the separate `product_queries_details` endpoint for SKU `1636048691`, using explicit `page: 0`, `page_size: 10`, and `limit_by_sku: 15`. This tests whether the detail surface is also queryable on the proven older day and can provide factual query terms for CAP-21.

Checkpoint: `CAP_21_READINESS_CONTROL_PRODUCT_QUERIES_DETAILS_2026_08_29_NEXT`
