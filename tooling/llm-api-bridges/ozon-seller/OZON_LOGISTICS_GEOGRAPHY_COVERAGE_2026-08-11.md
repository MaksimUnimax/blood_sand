# Ozon Seller API — logistics / delivery / geography coverage — 2026-08-11

Статус: **RESEARCH COVERAGE MAP — current families confirmed; full contracts pending**

Цель: дополнить seller diagnostics слоем между `warehouse stock` и `order/posting`: наличие товара на складе само по себе не доказывает, что для этого склада/схемы была доступна и корректно настроена доставка.

## 1. Seller account / Ozon Logistics connection

### `/v1/seller/ozon-logistics/info`

Ozon Seller API notification:

- beta added 2025-11-11 for seller connection information to Ozon Logistics;
- moved beta → main 2025-12-30;
- method was again announced in current Seller API changes on 2026-03-24.

Role in diagnostics:

- account-level logistics connection evidence;
- helps distinguish seller/account logistics state from product/warehouse stock state.

Still pending before implementation:

- HTTP verb;
- full request/response schema;
- exact connection/status fields;
- permissions/role restrictions;
- whether method is relevant to all fulfilment schemes or only a subset.

## 2. Delivery methods per seller warehouse

### `/v2/delivery-method/list`

Ozon-owned lifecycle evidence:

- beta introduced 2025-12-02 as a method for getting delivery methods on a warehouse;
- moved beta → main on 2026-02-02 together with the new warehouse/logistics families;
- method name/description updated 2026-02-09;
- old `/v1/delivery-method/list` was later explicitly deprecated and scheduled for shutdown 2026-04-07 with instruction to switch to v2.

English Ozon notification describes the v2 family as delivery methods for realFBS warehouses. The Russian notification uses broader wording “получение методов доставки на складе”.

Engineering boundary:

- do not generalise scheme coverage beyond the full current contract;
- treat v2 as current family, but verify whether a warehouse/list request covers FBS, rFBS, realFBS or only specific warehouse types.

Role in diagnostics:

- warehouse → delivery-method relation;
- evidence for a case where stock exists but usable delivery method is absent/paused/misconfigured;
- input for joining posting/carriage `delivery_method_id` back to warehouse logistics configuration.

Still pending:

- HTTP verb;
- required warehouse identifier/filter;
- response delivery-method identifiers/names/types/statuses;
- pagination if any;
- scheme coverage;
- permissions/rate limits.

## 3. Delivery methods and carriages/shipments

### `/v2/carriage/delivery/list`

Ozon-owned lifecycle evidence:

- beta introduced 2025-12-02 for delivery methods and shipments/carriages;
- moved beta → main on 2026-02-02;
- 2026-02-09 Ozon updated request field `filter.delivery_method_id`;
- older `/v1/posting/carriage-available/list` and `/v1/carriage/delivery/list` were deprecated in favour of v2.

Confirmed join fragment:

- request has `filter.delivery_method_id`.

Related current integration evidence:

- `/v2/posting/fbs/act/create` uses `delivery_method_id` in its request;
- `/v2/order/create` current documentation changes explicitly include `splits.delivery_method.delivery_method_id` and `splits.warehouse_id` among required request fields.

Those sibling methods are write operations and are **not** initial bridge targets. Their relevance is only to establish the identity model: `warehouse_id` and `delivery_method_id` are distinct logistics identifiers used across current Ozon workflows.

Role in read-only diagnostics:

- delivery method → carriage/shipment availability/context;
- investigate whether a warehouse was operational but no appropriate shipment/carriage path was available;
- link delivery configuration to posting timing/logistics anomalies where current read contracts permit it.

Still pending:

- HTTP verb/full request;
- response carriage/shipment fields;
- date/status filters;
- pagination/history;
- exact FBS/rFBS coverage;
- rate/access restrictions.

## 4. Warehouse and cluster context already known

Current related read families:

- `/v2/warehouse/list` — seller warehouses; cursor pagination fragments confirmed (`limit`, `cursor`, response `cursor`, `has_next`);
- `/v1/warehouse/ozon/list` — Ozon warehouses;
- `/v1/warehouse/fbo/seller/list` — seller/FBO supply warehouses;
- `/v2/cluster/list` — current cluster dictionary;
- `/v4/product/info/stocks` — current product stock, including `warehouse_ids`;
- `/v2/product/info/stocks-by-warehouse/fbs` and `/v1/product/info/stocks-by-warehouse/fbo` — warehouse-level stock families;
- `/v1/analytics/stocks` — stock analytics, announced transition to real-time on 2026-08-17.

For cross-dock FBO supply, current Ozon 2026 evidence says `macrolocal_cluster_id` is the relevant cluster identifier and historical `warehouse_id` assumptions may no longer be sufficient.

## 5. Geography / delivery-time evidence

Ozon has current analytics methods:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`.

They were moved beta → main in November 2025 and their descriptions were updated again in March 2026.

These methods are relevant to seller diagnostics because stock can remain positive while delivery promise deteriorates by region/cluster.

They are **not yet promoted to implementation-ready operations** because this pass has not extracted:

- HTTP verbs;
- dimensions/region/cluster fields;
- date/history windows;
- pagination;
- plan/access restrictions.

## 6. Correct diagnostic chain

For logistics-related sales decline the future system should not stop at `stock > 0`.

Evidence chain should be capable of checking, using explicit requests:

`seller logistics connection`
→ `seller warehouse status`
→ `SKU stock by warehouse`
→ `warehouse delivery methods`
→ `delivery method / carriage availability`
→ `cluster/geography context`
→ `average delivery-time evidence`
→ `posting/order outcome`.

This is a **research dependency graph**, not permission for hidden automatic fan-out. Each provider request remains an explicit controlled operation.

## 7. Current gate impact

This pass closes the question whether Ozon has current read families for seller delivery-method configuration: **yes, v2 families exist and are in main**.

It does not close implementation contracts.

Add to 03A.3 blocking contract extraction:

- `/v1/seller/ozon-logistics/info`;
- `/v2/delivery-method/list`;
- `/v2/carriage/delivery/list`;
- average-delivery-time analytics family where useful for regional/logistics diagnostics.

`03A.3` remains `[~] IN PROGRESS`; `03A.4` remains `NOT STARTED`.
