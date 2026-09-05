# STD-13 post-repair final — supply acceptance diagnosis

Date: 2026-09-05
Canonical question: `Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.`
Real-account case: order `122149074` / order number `2000062599609` / supply `2000062599609`.

## Why this case is valid

The same order was a real operational concern in earlier live evidence:

- created `2026-08-10T09:01:34.061334Z`;
- planned crossdock timeslot `2026-08-11T14:00:00Z..15:00:00Z`;
- on 2026-09-02 it was still `IN_TRANSIT`, with the state last updated on 2026-08-12;
- bundle `019feae9-0fbe-75af-8f63-b9df1ca38840` contained 54 units across 9 SKUs.

STD-13 therefore reuses a real unresolved-at-the-time supply case rather than inventing an artificial failure.

## Run 1 — fresh supply-order details

Operation: `supply_order_details`
Request id: `90cc5e14-4c60-41b4-bd62-b839a4148409`
HTTP: `200`
Logical/physical business requests: `1/1`
Exact request preserved: `true`

Fresh state:

- order state: `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- order state updated: `2026-09-04T13:13:46.708202Z`;
- supply state: `ACCEPTED_AT_STORAGE_WAREHOUSE`;
- supply id: `2000062599609`;
- bundle id: `019feae9-0fbe-75af-8f63-b9df1ca38840`;
- drop-off: `ЗЛАТОУСТ_89`;
- crossdock: `true`;
- no overdue reason (`UNSPECIFIED`).

Interpretation: the order is no longer stuck before storage acceptance. The supply itself has reached `ACCEPTED_AT_STORAGE_WAREHOUSE`, while the parent order remains in the broader `ACCEPTANCE_AT_STORAGE_WAREHOUSE` lifecycle stage.

## Run 2 — fresh bundle composition

Operation: `supply_order_bundle`
Request id: `ce67532d-80f9-424a-9300-76d753c2b6a0`
HTTP: `200`
Logical/physical business requests: `1/1`
Terminal: `has_next=false`

Fresh composition exactly matches the preserved historical bundle: 54 units / 9 SKUs.

| SKU | Product | Qty |
|---|---|---:|
| `2559748332` | Герб России | 2 |
| `2559437928` | Чур | 5 |
| `1636048691` | Печать Велеса | 31 |
| `2183985513` | Перун | 2 |
| `2184234912` | Звезда Лады | 2 |
| `1640330072` | Громовик | 2 |
| `1640251697` | Алатырь (Крест Сварога) | 5 |
| `2326866320` | Спаси и Сохрани | 2 |
| `1602717077` | Шлем ужаса — Эгисхьяльм | 3 |

## Run 3 — current FBO stock, first attempt

Operation: `fbo_stock_by_warehouse`
Request id: `0f7d35e7-b488-42e4-957b-85810878f764`
HTTP: `429`
Provider category: `rate_limit`
Provider code: `8`
Retry-After: `1`
Automatic retry: `false`
External request executed: `true`
Logical/physical business requests: `1/1`

This response contained no stock evidence and was not interpreted as zero stock. Under `NO_SKIP_ON_FAILURE`, the exact same business job was preserved and retried explicitly.

## Run 3 retry — Page 1

Request id: `e179efc8-7d9d-43a7-8570-6c50a03137d1`
HTTP: `200`
Logical/physical business requests: `1/1`
Command transformed: `true`
Exact request preserved: `false`
Provider pagination: `has_next=true`
Cursor: `MTYzNjA0ODY5MTsxODA0NDI0OTc4MTAwMA==`

The retry recovered successfully from the transient 429 but was non-terminal.

## Run 3 — Page 2 / terminal

Request id: `ff851d00-8b44-4436-addb-07c7f4344ddf`
HTTP: `200`
Logical/physical business requests: `1/1`
Command transformed: `true`
Exact request preserved: `false`
Provider pagination: `has_next=false`
Cursor: empty.

Across both pages, current FBO `present` totals for the 9 bundle SKUs are:

| SKU | Product | FBO present | FBO reserved |
|---|---|---:|---:|
| `2559748332` | Герб России | 1 | 0 |
| `2559437928` | Чур | 1 | 0 |
| `1636048691` | Печать Велеса | 175 | 2 |
| `2183985513` | Перун | 3 | 0 |
| `2184234912` | Звезда Лады | 5 | 0 |
| `1640330072` | Громовик | 0 | 0 |
| `1640251697` | Алатырь (Крест Сварога) | 2 | 0 |
| `2326866320` | Спаси и Сохрани | 18 | 1 |
| `1602717077` | Шлем ужаса — Эгисхьяльм | 4 | 0 |

Thus 8/9 bundle SKUs currently have non-zero FBO stock; `Громовик` is the only bundle SKU with current FBO `present=0`.

### Critical provenance boundary

The stock endpoint is a current stock surface, not a per-supply provenance ledger. Therefore current FBO quantities must not be attributed automatically to supply `122149074`.

Correct statement:

`SUPPLY_REACHED_STORAGE_WAREHOUSE_ACCEPTANCE_BUT_EXACT_SUPPLY_TO_FBO_MATERIALIZATION_IS_NOT_PROVEN_BY_CURRENT_STOCK_SURFACE`.

## Run 4 — current product showcase visibility

Operation: `product_visibility_info`
Request id: `0cd9da6e-4c9c-4263-9a20-1117685bd83b`
HTTP: `200`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`

All 9 bundle SKUs returned:

`showcases_visibility = OZON`.

Therefore this case does not currently show a card/showcase-visibility failure for any of the bundle SKUs.

Important distinction:

- showcase visibility is proven for all 9 SKUs;
- current non-zero FBO stock is proven for 8/9 SKUs;
- exact provenance of current FBO units back to this specific supply is not exposed by these reads;
- a visible card does not itself prove every buyer/location has delivery availability, which belongs to the next availability/logistics investigation.

## Seller-facing diagnosis

The real historical delay was in the supply lifecycle, not a listing invisibility problem:

1. On 2026-09-02 the supply was stale `IN_TRANSIT` long after its planned slot.
2. On 2026-09-04 it progressed into storage-warehouse acceptance.
3. Fresh detail now shows the supply itself as `ACCEPTED_AT_STORAGE_WAREHOUSE` while the parent order is still `ACCEPTANCE_AT_STORAGE_WAREHOUSE`.
4. The original 54-unit / 9-SKU bundle is still intact in provider data.
5. All 9 SKUs are currently visible on the Ozon showcase.
6. Eight of the nine have non-zero current FBO stock; one (`Громовик`) has current FBO zero.
7. The available APIs do not prove which current FBO units came specifically from this supply, so that provenance is not invented.

Strongest evidence-backed resolution:

`HISTORICAL_STUCK_IN_TRANSIT_SUPPLY_PROGRESSed_TO_STORAGE_ACCEPTANCE_NO_CURRENT_SHOWCASE_VISIBILITY_BLOCK_EXACT_SUPPLY_TO_STOCK_PROVENANCE_NOT_AVAILABLE`.

## Reliability finding

Business answerability: `PASS_WITH_EXPLICIT_PROVENANCE_LIMIT`.
Operational reliability: `PASS_AFTER_TRANSIENT_FBO_429_EXPLICIT_RETRY`.
Provider/API incidents: one transient `429` with `Retry-After: 1`, recovered by explicit same-job retry.
Automatic hidden retry: `NO`.
Operator job preserved under failure: `YES`.

The `fbo_stock_by_warehouse` execution also reports `command_transformed=true` and `exact_request_preserved=false` on successful pages. That is retained as a reliability observation; it did not prevent correct completion of this business job.

STD-13 is complete.

Checkpoint:
`STD_13_POST_REPAIR_COMPLETE_REAL_STALE_SUPPLY_PROGRESSed_TO_STORAGE_ACCEPTANCE_ALL_9_SKUS_OZON_VISIBLE_PROVENANCE_LIMIT_EXPLICIT_TRANSIENT_429_RECOVERED_STD_14_READY`
