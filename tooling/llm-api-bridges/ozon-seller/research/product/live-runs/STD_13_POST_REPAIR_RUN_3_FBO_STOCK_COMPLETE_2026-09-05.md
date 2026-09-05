# STD-13 post-repair Run 3 — complete current FBO stock snapshot

Date: 2026-09-05
Canonical question: `Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.`
Target supply order: `122149074` / `2000062599609`.
Target bundle: `019feae9-0fbe-75af-8f63-b9df1ca38840`.

## Context before stock read

Run 1 established:
- order state: `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- supply state: `ACCEPTED_AT_STORAGE_WAREHOUSE`;
- the earlier `IN_TRANSIT` stall had therefore resolved into storage-warehouse acceptance;
- the order itself was not yet terminal/completed.

Run 2 freshly replayed the bundle and confirmed the same complete content as the preserved historical snapshot: 54 units across 9 SKUs, `has_next=false`.

## Run 3 provider recovery

The first explicit `fbo_stock_by_warehouse` read for all 9 SKUs returned provider HTTP `429` with:
- `Retry-After: 1`;
- `automatic_retry=false`;
- external request executed;
- no stock business result.

The same logical read was repeated after the provider wait requirement. The retry succeeded with HTTP `200` and returned a two-page result set.

Page 1:
- request id: `e179efc8-7d9d-43a7-8570-6c50a03137d1`;
- HTTP `200`;
- one logical -> one physical request;
- `has_next=true`;
- cursor: `MTYzNjA0ODY5MTsxODA0NDI0OTc4MTAwMA==`.

Page 2:
- request id: `ff851d00-8b44-4436-addb-07c7f4344ddf`;
- HTTP `200`;
- one logical -> one physical request;
- `has_next=false`;
- cursor empty.

Both successful pages preserve the same logical 9-SKU scope. Bridge reports `command_transformed=true` / `exact_request_preserved=false` for this operation; that is retained as a reliability fact and is not interpreted as a business-data discrepancy.

## Complete current FBO totals by bundle SKU

Aggregating `present` across all warehouse rows from both terminal pages gives:

| SKU | Product | Bundle qty | Current FBO present | Current FBO reserved |
|---|---|---:|---:|---:|
| `2559748332` | Герб России | 2 | 1 | 0 |
| `2559437928` | Чур | 5 | 1 | 0 |
| `1636048691` | Печать Велеса | 31 | 175 | 2 |
| `2183985513` | Перун | 2 | 3 | 0 |
| `2184234912` | Звезда Лады | 2 | 5 | 0 |
| `1640330072` | Громовик | 2 | 0 | 0 |
| `1640251697` | Алатырь (Крест Сварога) | 5 | 2 | 0 |
| `2326866320` | Спаси и Сохрани | 2 | 18 | 1 |
| `1602717077` | Шлем ужаса — Эгисхьяльм | 3 | 4 | 0 |

Eight of nine bundle SKUs currently have non-zero FBO `present`. `Громовик` (`1640330072`) is the only bundle SKU with current aggregate FBO `present=0`.

## Critical attribution boundary

This current FBO snapshot does **not** prove that the observed present units came from supply `122149074`.

Reasons:
- the FBO endpoint exposes current stock by SKU/warehouse, not lot/supply provenance;
- several SKUs already had stock in the system independently of this supply;
- Run 1 returned `storage_warehouse=null` for the supply, so a direct accepted-supply -> exact storage-warehouse stock-row join is unavailable from this evidence;
- current `present` can include older inventory and subsequent movements.

Therefore it is valid to say:
- the supply itself has reached `ACCEPTED_AT_STORAGE_WAREHOUSE`;
- eight of its nine SKU identities currently have non-zero FBO stock somewhere;
- one bundle SKU (`Громовик`) still has zero FBO stock;
- the exact 54 accepted units cannot be proven to have materialized into current FBO rows from this endpoint alone.

It is **not** valid to say that the current FBO totals are the accepted quantities from this specific supply.

## Current diagnostic state

The strongest evidence-backed location of the business job is now:

`SUPPLY_REACHED_STORAGE_WAREHOUSE_ACCEPTANCE_BUT_ORDER_NOT_YET_TERMINAL_AND_EXACT_SUPPLY_TO_CURRENT_FBO_MATERIALIZATION_IS_NOT_PROVEN`.

The remaining phrase in the canonical question, `не появился в продаже`, requires a separate current product-visibility/sellability check rather than inferring sale visibility from FBO stock alone.

Checkpoint:
`STD_13_RUN3_COMPLETE_FBO_SNAPSHOT_EIGHT_OF_NINE_NONZERO_GROMOVIK_ZERO_VISIBILITY_CHECK_NEXT`
