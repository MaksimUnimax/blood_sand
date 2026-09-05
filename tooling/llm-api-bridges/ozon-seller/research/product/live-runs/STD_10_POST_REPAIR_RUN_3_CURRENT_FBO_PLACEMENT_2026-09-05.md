# STD-10 post-repair Run 3 — current FBO placement for Samara-exposed SKUs

Date: 2026-09-05
Question: `На складе Ozon был пожар или авария. Был ли там мой товар и что контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Historically exposed SKUs from post-repair Run 2:
- `2271188511` — `Знак зодиака "Лев" (Символы)`;
- `1720141903` — `Знак зодиака "Водолей"`.

## Bridge run

Operation: `fbo_stock_by_warehouse`
Request id: `cd7bb07f-1950-418e-a0c3-bfc33f43c2b9`
Endpoint: `POST /v1/product/info/stocks-by-warehouse/fbo`
HTTP: `200`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `false`
Command transformed: `true`
Logical fingerprint: `03cbdf1e`
Physical fingerprint: `444f2262`
Provider pagination: `has_next=false`, `cursor=""`

## Current Samara state

Both historically exposed SKUs have explicit zero rows at the incident warehouse:
- SKU `1720141903` / `Водолей`: `present=0`, `reserved=0` at warehouse `23128509046000`;
- SKU `2271188511` / `Лев (Символы)`: `present=0`, `reserved=0` at warehouse `23128509046000`.

This directly proves current FBO absence at Samara for both exposed SKUs on this read.

## SKU 1720141903 — Водолей

All returned FBO warehouse rows are `present=0,reserved=0`.
Current FBO total across the returned terminal result: `present=0`, `reserved=0`, free FBO `0`.

This is stronger current scarcity than the historical 2026-09-02 run, where one FBO unit was visible/reserved. It still does not establish total-stockout because FBS/aggregate product stock has not yet been refreshed in this run.

## SKU 2271188511 — Лев (Символы)

Non-zero current FBO rows:
- warehouse `17717042026000`: `present=2`, `reserved=0`;
- warehouse `18044249781000`: `present=1`, `reserved=0`;
- warehouse `23843917228000`: `present=1`, `reserved=0`.

Current FBO total: `present=4`, `reserved=0`, free FBO `4`.
Samara is explicitly zero.

## Interpretation

- `Лев (Символы)` is historically Samara-exposed but currently has FBO stock elsewhere and zero at Samara.
- `Водолей` is historically Samara-exposed and currently has zero FBO stock across all returned warehouse rows, including Samara.
- No causal claim is made that the present placement was caused by the 2026-08-22 incident.

## Next read

Refresh aggregate product state for both product IDs obtained from this response:
- `1217129635` — Водолей;
- `1947980208` — Лев (Символы).

Use `seller_product_info_list` to determine current FBO+FBS stock, stock visibility, and availability before final STD-10 classification.

Checkpoint:
`STD_10_POST_REPAIR_RUN3_SAMARA_ZERO_BOTH_AQUARIUS_FBO_ZERO_LEO_FBO4_ELSEWHERE_FRESH_AGGREGATE_PRODUCT_STATE_NEXT`
