# Ozon Seller API — logistics / delivery / geography coverage — 2026-08-11

Статус: **RESEARCH COVERAGE MAP — current configuration + restriction/error families confirmed; Average Delivery Time retired; full contracts pending**

Цель: объяснять logistics-related sales decline шире, чем `stock > 0`.

## 1. Seller/Ozon Logistics connection

### `/v1/seller/ozon-logistics/info`

Lifecycle evidence:

- beta 2025-11-11;
- main 2025-12-30;
- method announced again 2026-03-24.

Role: account-level logistics connection state.

Still pending: HTTP verb, request/response, exact status fields, scheme coverage, permissions/rate limits.

## 2. Delivery methods per warehouse

### `/v2/delivery-method/list`

- beta 2025-12-02;
- main 2026-02-02;
- current replacement for old v1.

Role: warehouse → delivery-method relation and detection of absent/paused/misconfigured delivery path.

Still pending: warehouse filter/id, response ids/names/types/statuses, scheme coverage, pagination/access/rate limits.

## 3. Carriage/shipment configuration

### `/v2/carriage/delivery/list`

- beta 2025-12-02;
- main 2026-02-02;
- current request fragment: `filter.delivery_method_id`.

Role: delivery method → carriage/shipment availability/context.

Still pending: HTTP/full request, response fields, date/status filters, pagination/history, scheme coverage, access/rate limits.

## 4. FBS/rFBS error index — current main diagnostic family

### `/v1/rating/index/fbs/info`
### `/v1/rating/index/fbs/posting/list`

Ozon-owned lifecycle:

- 2025-11-20: added as beta methods for FBS/rFBS error index;
- 2026-02-02: moved from beta to the main Seller API section.

Diagnostic role:

- seller/posting operational error-quality evidence;
- distinguish logistics/fulfilment errors from demand, advertising or simple stock problems;
- allow posting-level causal investigation once current identifier schema is extracted.

Still pending:

- HTTP verbs;
- request filters;
- exact error/rating metrics and status taxonomy;
- posting identifiers;
- pagination/history;
- permissions/rate limits.

## 5. FBS product/warehouse delivery restrictions — current main diagnostic family

### `/v1/warehouse/invalid-products/get`
### `/v1/warehouse/warehouses-with-invalid-products`

Ozon-owned lifecycle:

- 2025-12-15: beta methods added specifically for FBS delivery restrictions;
- 2026-02-02: moved to main.

Diagnostic role:

- product has stock but is restricted for delivery;
- warehouse contains products with delivery restrictions;
- identify delivery-eligibility problems before attributing decline to traffic or conversion.

Still pending:

- HTTP verbs;
- product/warehouse identifiers;
- restriction reason/status schema;
- pagination;
- exact scheme coverage;
- permissions/rate limits.

## 6. Posting-level promised delivery window

Current `/v3/posting/fbs/get` received explicit Ozon documentation updates on 2026-03-17 for:

- `result.analytics_data.client_delivery_date_begin`;
- `result.analytics_data.client_delivery_date_end`.

The method remained an active target in later 2026 changes.

Role:

- posting-level FBS promised delivery window;
- useful for order-level diagnostics after full semantics/joins are verified.

Boundary:

- this is **not** aggregate Average Delivery Time analytics;
- do not assume the same fields exist in `/v4/posting/fbs/list` until full current contract is extracted;
- do not transfer old FBO v2 fields into current FBO v3 without direct evidence.

## 7. Warehouse and cluster context

Related current families:

- `/v2/warehouse/list` — request `limit`, `cursor`; response `cursor`, `has_next`;
- `/v1/warehouse/ozon/list`;
- `/v1/warehouse/fbo/seller/list`;
- `/v2/cluster/list`;
- `/v4/product/info/stocks`;
- `/v2/product/info/stocks-by-warehouse/fbs`;
- `/v1/product/info/stocks-by-warehouse/fbo`;
- `/v1/analytics/stocks` — announced real-time transition 2026-08-17.

For cross-dock FBO supply, `macrolocal_cluster_id` must be preserved where returned.

## 8. Average Delivery Time retirement — DO NOT TARGET

Earlier research treated:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`

as current because descriptions were updated 2026-03-17.

A later Ozon-owned 2026 announcement supersedes that state: the **Average Delivery Time functionality was fully disabled and its methods removed from documentation**.

Disposition:

- all three = disabled/do-not-target;
- one-to-one replacement = **NOT CONFIRMED**;
- no scraping fallback;
- no compatibility wrapper.

Canonical correction: `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md`.

## 9. Correct current causal graph

`seller logistics connection`
→ `warehouse status`
→ `SKU stock by warehouse`
→ `delivery method`
→ `product/warehouse delivery restrictions`
→ `FBS/rFBS error index`
→ `carriage/shipment availability`
→ `cluster/geography`
→ `posting promised-delivery window where confirmed`
→ `posting/order outcome`.

This is a research evidence graph, **not permission for hidden fan-out**. Each provider request and pagination step remains explicit.

## 10. Gate impact

Current logistics diagnostics are materially stronger than the earlier state, because delivery restrictions and error-index families are now identified as main Seller API families. They do not close 03A.3 because full contracts/joins/history/access semantics are still missing.

`03A.3` remains `[~] IN PROGRESS`; `03A.4` remains `NOT STARTED`.
