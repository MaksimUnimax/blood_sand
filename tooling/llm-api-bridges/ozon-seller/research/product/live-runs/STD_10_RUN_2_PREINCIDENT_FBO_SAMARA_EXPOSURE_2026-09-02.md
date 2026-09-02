# STD-10 Run 2 — pre-incident FBO Samara exposure

Date: 2026-09-02
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target warehouse from Run 1: `САМАРА_РФЦ`, warehouse_id `23128509046000`.

## Bridge run

Operation: `posting_fbo_list`
Request id: `b86e3b6d-5d46-4a26-b335-8b8638220ae2`
Endpoint: `POST /v3/posting/fbo/list`
HTTP: `200`
Elapsed: `1450 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Command transformed: `false`
Provider pagination: `has_next=false`, `cursor=""`
Bridge pagination metadata: `null`

Requested pre-incident UTC window:
`2026-08-19T00:00:00Z..2026-08-21T23:59:59Z`
with `analytics_data=true`.

## Exact Samara matches

The terminal FBO result contains two postings attributed to `САМАРА_РФЦ` / `23128509046000`.

### 1. Delivered pre-incident posting

- posting_number: `77372441-0327-6`
- created_at: `2026-08-20T07:09:06.161336Z`
- status: `delivered`
- substatus: `posting_received`
- offer_id: `Знак зодиака "Лев" (Символы)`
- sku: `2271188511`
- quantity: `1`
- price: `1700 RUB`
- warehouse: `САМАРА_РФЦ`
- destination city: `Ижевск`

This is direct evidence that seller inventory was present in the Samara FBO fulfillment flow immediately before the 2026-08-22 incident.

### 2. Ozon-cancelled pre-incident posting

- posting_number: `0268338192-0010-1`
- created_at: `2026-08-21T05:39:58.353943Z`
- status: `cancelled`
- substatus: `posting_canceled`
- offer_id: `Знак зодиака "Водолей"`
- sku: `1720141903`
- quantity: `1`
- price: `1700 RUB`
- warehouse: `САМАРА_РФЦ`
- cancellation_type: `Ozon`
- cancellation_initiator: `Ozon`
- cancel_reason_id: `695`
- cancel_reason: `Не удалось доставить заказ`

This is operationally relevant because the cancellation was initiated by Ozon rather than the buyer. However, this run does not expose a cancellation timestamp or causal incident marker, so it must **not** be claimed that the 2026-08-22 attack caused this cancellation. It is a correlation requiring separate evidence.

## What Run 2 proves

Positive historical exposure is now established:

- seller goods were actively shipping from the exact affected Samara fulfillment center before the incident;
- at least SKUs `2271188511` and `1720141903` were in that Samara FBO flow;
- therefore the business question `был ли там мой товар?` is answered **YES** at the level supported by Seller API historical postings.

The result does **not** prove the quantity physically remaining inside the building at the moment of the incident, because a historical inventory snapshot for 2026-08-22 has not been obtained.

## Current-state correlation already available

STD-08's complete current warehouse-stock traversal on 2026-09-02 contained no `САМАРА_РФЦ` rows. That means no current seller warehouse-stock row at Samara was visible on that surface on 2026-09-02, but it does not explain whether affected inventory was sold, moved, written off, compensated, or otherwise reconciled.

## Next investigation step

Run a focused current FBO stock-by-warehouse read for the two historically exposed SKUs:

- `2271188511` — `Знак зодиака "Лев" (Символы)`;
- `1720141903` — `Знак зодиака "Водолей"`.

Purpose:
- verify whether either SKU currently has FBO stock;
- identify current warehouse placement;
- verify Samara absence specifically for the exposed SKUs;
- distinguish `historically exposed but currently healthy elsewhere` from a current inventory problem.

STD-10 remains `IN_PROGRESS`.

Checkpoint:
`STD_10_RUN2_PREINCIDENT_SAMARA_EXPOSURE_PROVEN_TWO_SKUS_ONE_OZON_DELIVERY_FAILURE_CURRENT_FBO_PLACEMENT_NEXT`
