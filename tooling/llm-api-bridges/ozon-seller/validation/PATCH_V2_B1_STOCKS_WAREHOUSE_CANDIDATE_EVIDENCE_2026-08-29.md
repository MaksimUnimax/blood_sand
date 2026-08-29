# Canonical V2 B1 Stocks + Warehouse Logistics — candidate evidence

Status: `V2_B1_AUTHOR_GATE_PASS`

## Authority and base

- Canonical repair base: accepted B0 commit `3795359959c965fc5cd1837b9a1c978493ae2ac5`.
- Accepted B0 production tree: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`.
- V2 authority: `OZON_BRIDGE_FULL_READ_DYNAMIC_ENTITLEMENTS_AND_CLUSTERS_SPEC_2026-08-25.md` and `OZON_BRIDGE_TARGET_READ_SURFACE_2026-08-25.json`.
- Exact Seller Swagger: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths/operations.
- This candidate is canonical V2 B1 only: `stocks_inventory` + `warehouse_logistics`. No canonical B2 coverage is started.

## Production scope

B1 exposes 30 fixed Seller reads in the two required V2 clusters: 6 `stocks_inventory` operations and 24 `warehouse_logistics` operations. The complete registry remains 42 operations because the 12 other B0 operations are preserved unchanged.

### `stocks_inventory` — 6 reads

- `stocks_current` → `POST /v4/product/info/stocks`
- `fbs_stock_by_warehouse` → `POST /v2/product/info/stocks-by-warehouse/fbs`
- `fbo_stock_by_warehouse` → `POST /v1/product/info/stocks-by-warehouse/fbo`
- `stock_analytics` → `POST /v1/analytics/stocks`
- `stock_turnover_analytics` → `POST /v1/analytics/turnover/stocks`
- `product_fbs_warehouse_stocks` → `POST /v1/product/info/warehouse/stocks`

### `warehouse_logistics` — 24 reads

- FBS warehouse setup references: create/update drop-off lists, create/update drop-off timeslots, create/update pick-up timeslots, create/update return-point lists.
- Pick-up/history/reference: `warehouse_fbs_pickup_history_list`, `warehouse_fbs_pickup_planning_list`.
- Warehouse lists: `seller_warehouse_list`, `ozon_warehouse_list`, `fbo_seller_warehouse_list`, `fbp_warehouse_list`, `supplier_available_warehouses`.
- Cluster/delivery references: `cluster_list`, `seller_delivery_method_list`, `delivery_method_return_settings`, `delivery_polygon_list`.
- Diagnostics/status: `warehouse_invalid_products`, `warehouses_with_invalid_products`, `warehouse_fbs_return_mile_check`, `warehouse_fbs_return_mile_info`, `warehouse_operation_status`.

The fixed V2 warehouse sections are exactly `clusters`, `ozon_warehouses`, `seller_warehouses`, `delivery_methods`, `warehouse_diagnostics`. No ad-hoc top-level Seller cluster is introduced.

## Currentness and exclusions repaired from the drifted lineage

The canonical B1 does not blindly transplant B1–B49.

- `/v2/analytics/stock_on_warehouses` is **not enabled**. Exact Swagger says the method will be disabled and directs callers to `/v1/analytics/stocks`.
- `/v1/analytics/manage/stocks` is not enabled; exact Swagger records shutdown and replacement by `/v1/analytics/stocks`.
- `/v1/warehouse/list` is not enabled; exact Swagger records shutdown and replacement by `/v2/warehouse/list`.
- `/v1/delivery-method/list` is not enabled; exact Swagger records shutdown and replacement by `/v2/delivery-method/list`.
- `/v1/product/info/stocks-by-warehouse/fbs` is not enabled; exact Swagger records shutdown and replacement by `/v2/product/info/stocks-by-warehouse/fbs`.
- `/v1/report/warehouse/stock` is intentionally deferred to canonical V2 B7 because it starts an asynchronous report workflow and returns a report identifier for later `/v1/report/info` retrieval.
- Warehouse create/update/archive/unarchive, courier create/cancel, polygon create/bind/delete/update and stock mutation endpoints remain blocked as state-changing methods.
- FBO supply-draft warehouse/cluster methods whose business purpose is supply planning remain assigned to canonical B4 `supplies_fbo`, not pulled forward into B1 merely because their paths mention warehouse/cluster.

## Exact request-contract repairs

The candidate removes constraints that the drifted lineage had inferred from malformed OpenAPI numeric keywords on arrays:

- `/v2/warehouse/list` `warehouse_ids.maximum=200` is not treated as `maxItems`; a 201-element explicit array is accepted.
- `/v1/product/info/stocks-by-warehouse/fbo` `offer_ids/skus.maximum=1000` is not treated as `maxItems`; the method also does not invent a requirement that an identifier selector must be present.
- `/v1/analytics/stocks` `skus.maximum=100` is not treated as `maxItems`.
- `/v1/warehouse/fbs/return-mile/info` numeric `minimum/maximum` attached to the array is not reinterpreted as an item-count limit.

Conversely `/v2/product/info/stocks-by-warehouse/fbs` uses a real OpenAPI `oneOf` and real `maxItems`: B1 requires exactly one of `sku` or `offer_id`, preserves the documented `maxItems=1000`, and requires `limit` with maximum 1000.

Every operation has a fixed host/method/path and strict operation-specific parameters. Caller-controlled URL/method/headers/auth injection remains rejected. Explicit cursor/offset/last-id values advance a read only when supplied by a new command; there is no hidden continuation.

## Turnover quota repair

Exact Swagger for `POST /v1/analytics/turnover/stocks` allows no more than one request per minute per `Client-Id`.

B1 therefore changes `service_worker.js` only as required to extend the existing persistent quota scheduler with a separate family:

`STOCK_TURNOVER_QUOTA_FAMILY = "seller.analytics_turnover_stocks.v1"`

The existing `analytics_data` family remains separate and unchanged. Both use the existing 60,000 ms provider minimum plus 5,000 ms launch safety. Retry-After extension is family-specific. Automatic retry remains false. Failure to read/write persistent quota state blocks the rate-limited business request rather than sending unsafely.

No Autorun, Work-session lifecycle, Manual-mode, credentials, provider transport, delivery/no-replay, cache/history or unrelated timing behavior is changed.

## Privacy

All B1 operations use `safe_projection`.

Operational warehouse/drop-off/return-point addresses that are necessary for logistics remain visible only on explicitly allowlisted response paths. Phone, email, customer/recipient/person/contact fields and arbitrary address fields remain redacted. No buyer/customer personal-data surface is newly enabled.

## Entitlements and exact Swagger validation

Full exact-Swagger entitlement compilation remains 463 operations with `unresolved_rule_count = 0`. All 30 B1 reads compile as `ALL_ACCOUNTS` with no endpoint-level subscription requirement, so B1 introduces no hidden `/v1/seller/info` capability probe for these commands.

Author validation also validates every B1 template against the exact OpenAPI request schema and passes all 18 production JavaScript files through `node --check`.

Deterministic regression markers include:

- `V2_B1_REGISTRY_TAXONOMY_PASS`
- `V2_B1_EXACT_REQUESTS_PASS`
- `V2_B1_NO_INVENTED_ARRAY_LIMITS_PASS`
- `V2_B1_SAFE_PROJECTION_PASS`
- `V2_B1_GUIDANCE_ZERO_REQUEST_PASS`
- `V2_B1_TURNOVER_QUOTA_FAMILY_PASS`
- `V2_B1_PROTECTED_RUNTIME_CARRY_FORWARD_PASS`
- `V2_B1_NO_HIDDEN_PAGINATION_RETRY_POLLING_FANOUT_CHAINING_PASS`
- `V2_B1_CURRENTNESS_REPLACEMENTS_PASS` when exact Swagger is supplied
- `V2_B1_EXACT_SWAGGER_ENTITLEMENTS_PASS` when exact Swagger is supplied
- `V2_B1_AUTHOR_CI_GATE_PASS`

Seller business requests during development/tests: `0`. Performance business requests: `0`. Credentials used: `0`.
