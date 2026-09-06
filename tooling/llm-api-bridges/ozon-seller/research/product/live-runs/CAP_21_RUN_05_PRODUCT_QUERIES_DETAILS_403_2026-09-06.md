# CAP-21 — Product query details 403 + freshness diagnosis reopened

Status: `FAILED_PROVIDER_AUTH_OR_PERMISSION__FRESHNESS_OR_ENTITLEMENT_UNRESOLVED`

Date: 2026-09-06

Live request: `product_queries_details` against the same recent own-SKU query-analysis step defined by CAP-21 setup.

Request ID: `fade9dae-10e2-4f12-b58e-30222ba5ef60`

Observed result:
- provider endpoint: `POST /v1/analytics/product-queries/details`;
- external request executed: `true`;
- capability probe: not needed / not performed;
- HTTP `403`, provider code `7`, category `auth_or_permission`;
- one logical business result -> one physical business request;
- Bridge planning reported `SUPPORTED_AND_ENTITLED` with `provider_may_return_subscription_dependent_scope`;
- `exact_request_preserved = false`;
- `command_transformed = true`;
- logical fingerprint `e7250751`, physical fingerprint `bd4a19e1`.

## Important correction to the immediate CAP-21 diagnosis

The earlier CAP-21 seller-info diagnostic proved the current cabinet is non-Premium, but that fact does **not** establish that these 403 responses are a subscription/paywall denial.

Branch-specific preserved STD-05 evidence is controlling here:
- `STD_05_RUN_9_PRODUCT_QUERIES_403_2026-09-02.md` records provider 403/code 7 for the recent target day `2026-08-31`;
- `/v1/roles` then proved the query endpoint was present in the same key role set;
- `STD_05_RUN_11_PRODUCT_QUERIES_FRESHNESS_CONTROL_2026-09-02.md` records HTTP 200 for the same `product_queries` operation/account/key on the older control day `2026-08-29`, SKU `1636048691`.

STD-05 therefore established:

`RECENT_DATA_FRESHNESS_OR_DATA_READINESS_RESTRICTION_STRONGLY_SUPPORTED / EXACT_BOUNDARY_NOT_PROVEN`

Accordingly, the current CAP-21 recent-window 403s remain:

`FRESHNESS_OR_ENTITLEMENT_UNRESOLVED`

They must not be classified as a subscription denial until a readiness-controlled older-date request is tested on the current live state.

## Next recovery

Re-run the proven STD-05 control shape on `product_queries` for SKU `1636048691` and the single day `2026-08-29`, with explicit `page: 0` and `page_size: 10`.

If the current control still returns 200, the recent CAP-21 403 is again explained by data readiness/freshness rather than global query-surface entitlement. If it returns 403, the current live entitlement/provider boundary must be reopened because the same previously queryable control has changed.

Checkpoint: `CAP_21_READINESS_CONTROL_PRODUCT_QUERIES_2026_08_29_NEXT`
