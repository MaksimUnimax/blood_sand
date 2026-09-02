# STD-10 Run 3 — current FBO placement for Samara-exposed SKUs

Date: 2026-09-02
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Historically exposed SKUs from Run 2:
- `2271188511` — `Знак зодиака "Лев" (Символы)`;
- `1720141903` — `Знак зодиака "Водолей"`.

## Bridge run

Operation: `fbo_stock_by_warehouse`
Request id: `45e153c0-3da9-4e5b-a21c-928ffaf9da74`
Endpoint: `POST /v1/product/info/stocks-by-warehouse/fbo`
HTTP: `200`
Elapsed: `1389 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `true`
Provider pagination: `has_next=false`, `cursor=""`
Bridge pagination metadata: `null`

## Current Samara state

Both historically exposed SKUs have an explicit current row for the incident warehouse with zero stock:

- SKU `1720141903` / `Водолей`: `warehouse_id=23128509046000`, `present=0`, `reserved=0`;
- SKU `2271188511` / `Лев (Символы)`: `warehouse_id=23128509046000`, `present=0`, `reserved=0`.

Therefore current FBO stock for these two exposed SKUs is absent at `САМАРА_РФЦ` on this read.

This is stronger than merely observing that Samara was absent from the broad STD-08 stock traversal: the focused per-SKU operation explicitly returns the Samara warehouse row with zero present/reserved inventory for each exposed SKU.

## SKU `1720141903` — Водолей

The result contains 13 warehouse rows for this SKU.

Only one row has non-zero stock:
- warehouse_id `1020001007805000`: `present=1`, `reserved=1`.

All other returned warehouses, including Samara, have `present=0`, `reserved=0`.

Using the same project stock convention already used in STD-07 (`free FBO = present - reserved`), current free FBO for this read is therefore `0` units and one FBO unit is reserved.

Important same-day dynamic-state observation:
- earlier STD-07 Run 2 on 2026-09-02 saw this SKU at aggregate `FBO present=1`, `FBO reserved=0`, `FBS present=43`, `total free=44`;
- Run 3 now shows the single FBO unit as reserved (`present=1`, `reserved=1`).

This demonstrates that inventory state is changing during the test day. The earlier FBS=43 value must not be silently treated as an exact current total for STD-10; a fresh aggregate product-info read is required.

## SKU `2271188511` — Лев (Символы)

The result contains 7 warehouse rows.

Non-zero current FBO rows:
- warehouse_id `17717042026000`: `present=2`, `reserved=0`;
- warehouse_id `18044249781000`: `present=1`, `reserved=0`;
- warehouse_id `23843917228000`: `present=1`, `reserved=0`.

Current FBO total across returned rows:
- `present=4`;
- `reserved=0`;
- free FBO under the established convention: `4`.

Samara itself is explicitly zero for this SKU.

## Business interpretation after Run 3

Run 3 supports two different current states:

1. `Лев (Символы)` is historically Samara-exposed but currently has FBO stock distributed to other warehouses and zero at Samara. This does not look like a current total FBO disappearance.
2. `Водолей` is historically Samara-exposed, has zero at Samara, and its only visible current FBO unit is reserved. This is a current FBO-placement scarcity signal, but it is not yet a total-stockout signal because a fresh FBS/aggregate stock check has not been performed.

No evidence from this run proves that any current stock state was caused by the 2026-08-22 incident. It establishes current placement only.

## Next investigation step

Run one fresh `seller_product_info_list` read for both exposed SKUs.

Purpose:
- obtain current aggregate FBO and FBS stock for both SKUs;
- verify current sellability / product status;
- determine whether `Водолей` is merely FBO-scarce while healthy on FBS or is approaching a true total-stock problem;
- confirm whether `Лев (Символы)` remains healthy outside Samara.

STD-10 remains `IN_PROGRESS`.

Checkpoint:
`STD_10_RUN3_SAMARA_ZERO_FOR_BOTH_EXPOSED_SKUS_LEO_FBO4_ELSEWHERE_AQUARIUS_ONLY_FBO_UNIT_RESERVED_FRESH_TOTAL_PRODUCT_STATE_NEXT`
