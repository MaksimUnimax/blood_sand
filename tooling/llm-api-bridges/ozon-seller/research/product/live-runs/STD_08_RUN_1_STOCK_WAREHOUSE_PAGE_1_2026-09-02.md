# STD-08 Run 1 — warehouse stock page 1

Date: 2026-09-02
Question: `Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему.`

## Command

`stock_on_warehouses_v2`

- `warehouse_type=ALL`
- `limit=100`
- `offset=0`

## Bridge result

- request_id: `a4100daa-76b8-4fae-b28c-473f09dfbe1a`
- HTTP: `200`
- physical business requests: `1`
- external_request_executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement key: `POST /v2/analytics/stock_on_warehouses`
- `pagination=null`
- logical fingerprint: `95496b42`
- physical fingerprint: `99155276`
- `command_transformed=true`

## Page completeness

The provider returned a full page at the requested `limit=100` while Bridge exposed `pagination:null`.

Under the already-discovered weak-model pagination requirement, a full page is not a safe terminal signal. STD-08 must continue explicitly with `offset=100` and, if another full page is returned, `offset=200` until a short terminal page is observed.

Classification for this run:

`HTTP_200_FULL_PAGE_PAGINATION_NULL_CONTINUE_REQUIRED`

## Semantic boundary

This operation is treated as Ozon warehouse/FBO analytics. It must not be presented as the seller's total FBO+FBS sellable inventory. Prior STD-05/STD-07 evidence proved that seller-product stock surfaces can additionally contain large FBS inventory that is not represented by this warehouse analytics view.

## Evidence visible in page 1

The page contains warehouse-level rows with:
- `sku`
- `warehouse_name`
- `promised_amount`
- `free_to_sell_amount`
- `reserved_amount`

Examples showing why all three stock states matter:
- `Печать Велеса` has large free stock across multiple warehouses and `31` promised units at `ХАБАРОВСК_2_РФЦ`;
- `Алатырь` has `5` promised units at `ХАБАРОВСК_2_РФЦ`;
- `Громовик` has `2` promised units at `ХАБАРОВСК_2_РФЦ`;
- some rows contain reserved stock even when free stock is zero.

Final STD-08 warehouse ranking will be calculated only after all explicit pages are collected. The final persisted result must aggregate warehouse totals across the complete page set, not this page alone.

## Next step

Repeat the same operation with `offset=100`, preserving `limit=100` and `warehouse_type=ALL`.
