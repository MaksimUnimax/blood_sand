# STD-11 Run 1 — Aquarius reservation forensic and final closure

Date: 2026-09-02
Canonical question: `У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных.`
Target SKU: `1720141903`, offer `Знак зодиака "Водолей"`.

## Pre-run evidence

Earlier same-day stock evidence established a real change:
- earlier STD-07 Run 2: FBO `present=1`, `reserved=0`, free FBO = `1`;
- later STD-10 Run 3/4: FBO `present=1`, `reserved=1`, free FBO = `0`;
- the only non-zero FBO warehouse in the focused Run 3 was `warehouse_id=1020001007805000` with `present=1,reserved=1`;
- product remained sellable and had FBS `present=43,reserved=0`.

The forensic question was therefore whether the disappearing **free** FBO unit was physically lost or merely reserved for an active order.

## Bridge run

Operation: `posting_fbo_list`
Request id: `b4b5686b-593a-4ff1-ad60-533019985fd3`
Endpoint: `POST /v3/posting/fbo/list`
HTTP: `200`
Elapsed: `1717 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Provider pagination: `has_next=false`, `cursor=""`
Bridge pagination metadata: `null`

Requested window: `2026-09-02T00:00:00Z..2026-09-02T23:59:59Z`, `analytics_data=true`.

## Exact target posting found

The terminal result contains one posting for target SKU `1720141903`:

- posting_number: `0223728377-0109-5`
- order_number: `0223728377-0109`
- order_id: `38647734857`
- offer_id: `Знак зодиака "Водолей"`
- sku: `1720141903`
- quantity: `1`
- price: `1700 RUB`
- status: `awaiting_packaging`
- substatus: `posting_created`
- cancellation: `null`
- created_at: `2026-09-02T11:09:59.696968Z`
- in_process_at: `2026-09-02T11:09:58.065426Z`
- warehouse_id: `1020001007805000`
- warehouse_name: `ВОРОНЕЖ_2_РФЦ`

This warehouse_id is an exact match to the only non-zero FBO warehouse row from STD-10 Run 3 where the same SKU had `present=1,reserved=1`.

## Forensic conclusion

The strongest evidence-backed explanation for the free-FBO change `1 -> 0` is **reservation for this newly created active FBO posting**, not physical disappearance.

The evidence chain is unusually strong:
1. target SKU free FBO changed from 1 to 0 while `present` remained 1;
2. `reserved` changed from 0 to 1;
3. the sole non-zero FBO warehouse is `1020001007805000`;
4. an active, not-yet-completed posting for exactly 1 unit of the same SKU exists at exactly warehouse `1020001007805000`;
5. posting status is `awaiting_packaging / posting_created`, so this is not yet a completed delivery/sale state;
6. cancellation is null.

Therefore the seller-facing statement `товар исчез с FBO, а продаж с этого склада не было` is correctly resolved as:

`FREE_STOCK_DISAPPEARED_BECAUSE_UNIT_IS_RESERVED_FOR_ACTIVE_FBO_ORDER_NOT_BECAUSE_PHYSICAL_PRESENT_STOCK_WAS_LOST`

No return/removal/supply investigation is required for this concrete case because the active-order explanation directly reconciles the exact SKU, quantity, reservation state and warehouse. Under `NO_SKIP_ON_FAILURE`, additional movement reads would be redundant rather than diagnostic.

## Important semantic rule

A weak model must distinguish at least:
- `present` physical/accounted stock;
- `reserved` stock committed to an order;
- `free = present - reserved` stock currently available for new orders;
- completed sale/delivery status.

`FREE_FBO_DECREASE_IS_NOT_EQUIVALENT_TO_PHYSICAL_FBO_LOSS_OR_COMPLETED_SALE`.

An active posting can explain a free-stock decrease before any delivered sale appears.

## Final classification

Business answerability: `PASS`.
Operational reliability: `PASS_FIRST_PROVIDER_READ`.
Operator business steering: `NO`.
Provider/API incidents: `NONE`.
Runs: `1`.

STD-11 is complete.

Checkpoint:
`STD_11_COMPLETE_AQUARIUS_FREE_FBO_DISAPPEARANCE_EXPLAINED_BY_EXACT_ACTIVE_ORDER_RESERVATION_STD_12_READY`
