# Ozon Bridge clustering — current-state audit

Date: 2026-09-01
Scope: current production installable `v0.1.19`, SHA-256 `f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574`.

## What clustering is for

Clustering is a local command-guidance layer, not an Ozon query planner that may autonomously execute follow-up business calls.

Current flow:

1. AI emits `OZON_API_V1` or `OZON_HELP_V1/V2`.
2. If an API command is exact and valid, it may proceed to one provider business request.
3. If a command is malformed / unsupported / ambiguous enough to produce local guidance, `OzonGuidance` classifies the sanitized attempt descriptor into a semantic cluster.
4. Bridge returns `OZON_GUIDANCE_RESULT_V1/V2` with `external_request_executed=false` and `physical_business_request_count=0`.
5. Guidance contains cluster/section choices and exact operation templates.
6. AI chooses one exact next command and sends a NEW explicit assistant command.
7. Only that new exact command may execute against Ozon.

This design preserves the core invariants: no hidden pagination, no hidden retry, no hidden fan-out and no autonomous follow-up provider chain.

## Current registry size

The production operation registry and contract both contain exactly `270` executable aliases and `catalogValidation` passes with zero errors.

- Seller command aliases: `245`.
- Performance command aliases: `25`.
- Accepted authority endpoint reads remain `266 = 245 Seller + 21 Performance`.
- Difference `270 - 266 = 4` is intentional: four documented Performance JSON-suffix aliases do not inflate the 48-operation Performance authority universe:
  - `performance_media` -> JSON variant of `performance_media_csv` authority operation.
  - `performance_campaign_product` -> JSON variant of `performance_campaign_product_csv`.
  - `performance_expense` -> JSON variant of `performance_expense_csv`.
  - `performance_daily` -> JSON variant of `performance_daily_csv`.

## Latest Seller additions coverage

All 26 latest Seller aliases are present in the registry and have valid cluster + section assignments. Missing latest aliases: `0`.

Current placements:

- `orders_postings`: `arrival_pass_list`, `fbs_product_exemplar_validate`, `carriage_delivery_list_v2`, `posting_fbs_pickup_code_verify`, `posting_global_etgb`, `posting_digital_list_v2`, `posting_marks`.
- `returns_cancellations`: `rfbs_returns_get`, `conditional_cancellation_list`, `order_cancel_check`.
- `reviews_questions`: `chat_list_v3`.
- `finance`: `finance_b2b_sales_json`, `receipts_seller_list`.
- `prices_promotions`: `discount_task_list_v2`.
- `account_access`: `notification_list`, `notification_push_type_list`.
- `supplies_fbo`: `fbp_archive_get`, `fbp_archive_list`, `fbp_draft_get`, `fbp_draft_list`, `fbp_order_get`, `fbp_order_list`.
- `warehouse_logistics`: `delivery_check`, `delivery_checkout_v2`, `delivery_map`, `delivery_point_list`.

So the problem is NOT missing registration of the latest 26 commands. The problem is discoverability / section quality after the registry grew.

## Current cluster distribution

There are `13` top-level clusters and `50` sections.

| Cluster | Aliases | Current sections |
|---|---:|---|
| `catalog_products` | 33 | product_list_info 10; attributes_categories 5; certification 13; limits_diagnostics 3; description_content 1; pictures 1 |
| `prices_promotions` | 20 | prices 4; pricing_strategy 6; actions_promotions 10 |
| `stocks_inventory` | 8 | stock_analytics 2; current_aggregate 1; warehouse_fbs 3; warehouse_fbo 1; stock_movement_turnover 1 |
| `account_access` | 5 | roles_access 1; seller_settings 4 |
| `warehouse_logistics` | 29 | seller_warehouses 12; delivery_methods 8; ozon_warehouses 3; warehouse_diagnostics 5; clusters 1 |
| `sales_analytics` | 5 | sales_revenue_units 1; delivery_returns_cancellations_metrics 4 |
| `search_visibility` | 4 | product_queries 1; query_details 1; marketplace_search_queries 2 |
| `orders_postings` | 44 | fbo_postings 2; fbp_postings 2; fbs_postings 15; assembly_carriage 17; labels_documents 8 |
| `returns_cancellations` | 24 | returns 7; return_giveout 7; cancellations 10 |
| `finance` | 16 | accruals_balance 4; documents_reports 8; transactions 1; realization 3 |
| `supplies_fbo` | 47 | supply_orders 18; drafts 8; timeslots 5; cargoes 13; acts 3 |
| `reviews_questions` | 10 | reviews 3; review_comments 1; questions 4; answers 1; chats 1 |
| `advertising_performance` | 25 | campaigns 9; statistics 16 |

## Current guidance implementation

`OZON_GUIDANCE_RESULT_V1/V2` uses sanitized descriptors containing only intent fields and parameter keys. It scores:

- exact alias match;
- exact fixed path match;
- text clues configured per cluster;
- several parameter-key heuristics for analytics, stocks, search, postings and supplies.

Guidance itself executes zero provider requests.

`OZON_HELP_V2` already supports section selection: if a selected cluster has multiple sections, V2 returns section cards first and only then operation cards. `OZON_HELP_V1` does not provide this intermediate section split.

## Problems found

### 1. Startup documentation is stale

Runtime startup text advertises only six semantic areas:

- sales_analytics
- stock_inventory (alias of `stocks_inventory`)
- search_visibility
- fulfillment_supply (alias of `supplies_fbo`)
- advertising_performance
- account_access

The registry actually has thirteen top-level clusters. Seven real clusters are absent from the startup guidance: `catalog_products`, `prices_promotions`, `warehouse_logistics`, `orders_postings`, `returns_cancellations`, `finance`, `reviews_questions`.

### 2. Startup tells AI to use V1 although V2 already exists

The default instruction says to answer with `OZON_HELP_V1`. With 270 aliases, V1 can dump an entire large cluster at once (for example 47 aliases in `supplies_fbo` or 44 in `orders_postings`). V2 section-first guidance exists in production and should become the primary documented path.

### 3. Several sections are now too broad

Largest overloaded sections include:

- `supplies_fbo/supply_orders`: 18 aliases.
- `orders_postings/assembly_carriage`: 17.
- `advertising_performance/statistics`: 16.
- `orders_postings/fbs_postings`: 15.
- `catalog_products/certification`: 13.
- `supplies_fbo/cargoes`: 13.
- `warehouse_logistics/seller_warehouses`: 12.

### 4. Advertising is especially under-clustered

All 25 Performance aliases are squeezed into only `campaigns` (9) and `statistics` (16). This does not distinguish:

- campaign discovery/filtering;
- campaign products/objects;
- bid/min-bid operations;
- JSON statistics;
- CSV/export statistics;
- prepared-report workflow;
- vendor/external-traffic analytics.

That makes the exact next-command choice unnecessarily ambiguous.

### 5. Broad valid results have no post-result refinement guidance

Pre-execution guidance already works. What is missing for `performance_campaigns` is a bounded-result/refinement layer after a valid provider response. The live test returned 1128 campaign objects (~1.35 MB model-visible payload). Bridge should be able to return a bounded result plus explicit NEW-command choices for refinement without automatically executing those choices.

### 6. Some latest commands deserve better semantic sections

The latest 26 are present, but a few placements should be refined during clustering maintenance rather than left in generic buckets:

- `arrival_pass_list` belongs with inbound supply/pass workflow rather than generic order/carriage guidance.
- `notification_list` and `notification_push_type_list` deserve a dedicated notifications section instead of generic seller settings.
- exemplar/marking operations should be separated from generic FBS posting reads.
- FBP archive/order reads should be separated from generic supply orders.
- delivery map/points and phone-dependent delivery checkout/check should be separate delivery subsections.

## Audit conclusion

`CURRENT_CLUSTER_REGISTRY_COVERAGE_PASS`: all 270 current executable aliases are registered and contract-aligned.

`LATEST_26_CLUSTER_REGISTRATION_PASS`: all latest 26 Seller aliases are present.

`CLUSTER_DISCOVERABILITY_MAINTENANCE_REQUIRED`: documentation, V1/V2 usage and section granularity are stale relative to the expanded command surface.
