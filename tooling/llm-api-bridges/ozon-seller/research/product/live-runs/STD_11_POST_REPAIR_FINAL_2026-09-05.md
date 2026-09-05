# STD-11 post-repair final — historical Aquarius reservation replay

Date: 2026-09-05
Canonical question: `У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных.`
Historical target SKU: `1720141903`, offer `Знак зодиака "Водолей"`.

## Purpose

The 2026-09-05 current-state candidate sweep found no fresh same-day FBO disappearance among the 12 non-zero FBO candidates. Therefore STD-11 must not fabricate a new disappearance case. The valid real-account forensic case remains the contemporaneous 2026-09-02 Aquarius transition already preserved in repository evidence.

The required post-repair check is narrower: replay the historical 2026-09-02 FBO posting window through the repaired/current Bridge runtime and verify that the current operation still retrieves the exact historical SKU -> posting -> warehouse relationship.

## Preserved historical authority — 2026-09-02

Contemporaneous evidence established:

- earlier FBO state: `present=1,reserved=0`, free FBO = `1`;
- later FBO state: `present=1,reserved=1`, free FBO = `0`;
- the only non-zero focused FBO warehouse was `warehouse_id=1020001007805000`;
- an exact one-unit FBO posting for the same SKU existed at that same warehouse;
- at the time of the historical forensic run the posting status was `awaiting_packaging / posting_created`, with `cancellation=null`.

That contemporaneous evidence remains the authority for the historical reservation explanation. Current provider status must not be back-projected into the 2026-09-02 snapshot.

## Post-repair current-runtime replay

Operation: `posting_fbo_list`
Endpoint: `POST /v3/posting/fbo/list`
Request id: `48eb3d61-00b1-483d-a382-3178d313c03f`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Provider result: `has_next=false`, `cursor=""`.

The terminal current-runtime result again contains the exact historical target posting:

- posting_number: `0223728377-0109-5`
- order_number: `0223728377-0109`
- order_id: `38647734857`
- offer_id: `Знак зодиака "Водолей"`
- sku: `1720141903`
- quantity: `1`
- price: `1700 RUB`
- warehouse_id: `1020001007805000`
- warehouse_name: `ВОРОНЕЖ_2_РФЦ`
- created_at: `2026-09-02T11:09:59.696968Z`
- cancellation: `null`
- current provider status at replay time: `delivering`
- current provider substatus at replay time: `posting_in_pickup_point`.

## Reconciliation

The repaired/current Bridge runtime therefore still retrieves the exact relationship that made the historical case answerable:

`SKU 1720141903 -> posting 0223728377-0109-5 -> warehouse 1020001007805000`.

The status difference is expected lifecycle progression, not contradictory evidence:

- historical 2026-09-02 status at the contemporaneous forensic moment: `awaiting_packaging / posting_created`;
- current 2026-09-05 replay status for the same posting: `delivering / posting_in_pickup_point`.

The current status proves only the posting's later provider state. It does not replace or rewrite the historical stock/reservation snapshot.

## Final forensic conclusion

The strongest evidence-backed explanation for the 2026-09-02 free-FBO change `1 -> 0` remains reservation for the exact active FBO order, not physical disappearance:

1. `present` stayed `1`;
2. `reserved` changed `0 -> 1`;
3. free FBO therefore changed `1 -> 0`;
4. the exact one-unit posting matched the same SKU;
5. the exact posting matched the same warehouse `1020001007805000`;
6. the repaired/current Bridge still retrieves that exact posting/warehouse relationship;
7. the posting subsequently progressed through the provider lifecycle, which is consistent with a real order reservation rather than a fabricated historical explanation.

Seller-facing resolution remains:

`FREE_STOCK_DISAPPEARED_BECAUSE_UNIT_WAS_RESERVED_FOR_EXACT_FBO_ORDER_NOT_BECAUSE_PHYSICAL_PRESENT_STOCK_WAS_LOST`.

## Semantic invariant

`FREE_FBO_DECREASE_IS_NOT_EQUIVALENT_TO_PHYSICAL_FBO_LOSS_OR_COMPLETED_SALE`.

A correct model must keep separate:

- `present` — physical/accounted stock;
- `reserved` — stock committed to an order;
- `free = present - reserved` — stock available for new orders;
- posting lifecycle state at the observation time;
- later/current posting lifecycle state.

## Final classification

Business answerability: `PASS`.
Operational reliability: `PASS_POST_REPAIR_CURRENT_RUNTIME_REPLAY`.
Fresh 2026-09-05 disappearance fabricated: `NO`.
Historical evidence preserved without back-projection: `YES`.
Exact SKU/posting/warehouse relationship reproduced by repaired runtime: `YES`.
Provider/API incidents in replay: `NONE`.

STD-11 post-repair is complete.

Checkpoint:
`STD_11_POST_REPAIR_COMPLETE_HISTORICAL_AQUARIUS_RESERVATION_RELATIONSHIP_REPRODUCED_WITH_CURRENT_RUNTIME_WITHOUT_STATUS_BACK_PROJECTION_STD_12_READY`
