# Ozon Seller API — logistics / delivery / geography coverage — 2026-08-11

Статус: **RESEARCH COVERAGE MAP — current configuration families confirmed; Average Delivery Time analytics retired; full contracts pending**

Цель: дополнить seller diagnostics слоем между `warehouse stock` и `order/posting`: наличие товара на складе само по себе не доказывает, что для этого склада/схемы была доступна и корректно настроена доставка.

## 1. Seller account / Ozon Logistics connection

### `/v1/seller/ozon-logistics/info`

Ozon Seller API notification:

- beta added 2025-11-11 for seller connection information to Ozon Logistics;
- moved beta → main 2025-12-30;
- method was again announced in Seller API changes on 2026-03-24.

Role in diagnostics:

- account-level logistics connection evidence;
- distinguish seller/account logistics state from product/warehouse stock state.

Still pending before implementation:

- HTTP verb;
- full request/response schema;
- exact connection/status fields;
- permissions/role restrictions;
- fulfilment-scheme coverage.

## 2. Delivery methods per seller warehouse

### `/v2/delivery-method/list`

Ozon-owned lifecycle evidence:

- beta introduced 2025-12-02 as a method for getting delivery methods on a warehouse;
- moved beta → main 2026-02-02;
- method name/description updated 2026-02-09;
- old `/v1/delivery-method/list` was later deprecated/disabled in favour of v2.

Engineering boundary:

- do not generalise scheme coverage beyond the full current contract;
- verify whether v2 covers FBS, rFBS, realFBS or only specific warehouse types.

Role in diagnostics:

- warehouse → delivery-method relation;
- evidence for stock-positive but delivery-method-absent/paused/misconfigured cases;
- join posting/carriage `delivery_method_id` to warehouse logistics configuration where current contracts allow it.

Still pending:

- HTTP verb;
- required warehouse identifier/filter;
- response ids/names/types/statuses;
- pagination;
- scheme coverage;
- permissions/rate limits.

## 3. Delivery methods and carriages/shipments

### `/v2/carriage/delivery/list`

Ozon-owned lifecycle evidence:

- beta introduced 2025-12-02;
- moved beta → main 2026-02-02;
- on 2026-02-09 Ozon updated request field `filter.delivery_method_id`;
- older `/v1/posting/carriage-available/list` and `/v1/carriage/delivery/list` were deprecated in favour of v2.

Confirmed join fragment:

- request has `filter.delivery_method_id`.

Related write-method changes also show `warehouse_id` and `delivery_method_id` as separate logistics identifiers. Those mutation methods are **not** initial bridge targets; they are only identity-model evidence.

Role in read-only diagnostics:

- delivery method → carriage/shipment availability/context;
- investigate whether a warehouse was operational but no appropriate shipment/carriage path was available;
- link delivery configuration to posting/logistics anomalies where current read contracts permit it.

Still pending:

- HTTP verb/full request;
- response carriage/shipment fields;
- date/status filters;
- pagination/history;
- exact scheme coverage;
- rate/access restrictions.

## 4. Warehouse and cluster context already known

Current related read families:

- `/v2/warehouse/list` — seller warehouses; cursor pagination fragments confirmed (`limit`, `cursor`, response `cursor`, `has_next`);
- `/v1/warehouse/ozon/list` — Ozon warehouses;
- `/v1/warehouse/fbo/seller/list` — seller/FBO supply warehouses;
- `/v2/cluster/list` — current cluster dictionary;
- `/v4/product/info/stocks` — current product stock including `warehouse_ids`;
- `/v2/product/info/stocks-by-warehouse/fbs` and `/v1/product/info/stocks-by-warehouse/fbo` — warehouse-level stock families;
- `/v1/analytics/stocks` — stock analytics, with announced real-time transition 2026-08-17.

For cross-dock FBO supply, current Ozon 2026 evidence says `macrolocal_cluster_id` is relevant and historical `warehouse_id` assumptions may no longer be sufficient.

## 5. Current correction — Average Delivery Time analytics is retired

The earlier research state treated these methods as current because Ozon updated their descriptions on 2026-03-17:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`.

A later Ozon-owned 2026 announcement supersedes that state: Ozon said the **Average Delivery Time functionality is fully disabled** and its methods are removed from documentation.

Current disposition:

- all three methods = **DISABLED / DO NOT TARGET**;
- replacement = **NOT CONFIRMED**;
- no compatibility wrapper or fallback should be created for them;
- no scraping fallback.

Canonical correction artifact:

- `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md`.

This removes an incorrect branch from the diagnostic graph. It does **not** prove that no current Ozon API exposes delivery dates or delivery-quality evidence elsewhere. Such evidence may only be added from a separately verified current Ozon-owned contract.

## 6. Correct current diagnostic chain

For logistics-related sales decline the future system should not stop at `stock > 0`.

Current evidence chain should be capable of checking, using explicit requests:

`seller logistics connection`
→ `seller warehouse status`
→ `SKU stock by warehouse`
→ `warehouse delivery methods`
→ `delivery method / carriage availability`
→ `cluster/geography context`
→ `posting/order outcome`.

A separate delivery-quality/date layer is a **research gap**, not an assumed API family.

This is a research dependency graph, not permission for hidden automatic fan-out. Each provider request remains an explicit controlled operation.

## 7. Current gate impact

Current read families for seller delivery-method configuration are confirmed at family/currentness level:

- `/v1/seller/ozon-logistics/info`;
- `/v2/delivery-method/list`;
- `/v2/carriage/delivery/list`.

Implementation contracts are still pending.

The retired Average Delivery Time family must not enter 03A.4. If a replacement or alternative delivery-quality surface exists, it must be independently confirmed from a current Ozon-owned contract.

`03A.3` remains `[~] IN PROGRESS`; `03A.4` remains `NOT STARTED`.
