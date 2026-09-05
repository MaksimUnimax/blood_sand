# STD-10 post-repair Run 2 — pre-incident Samara exposure

Date: 2026-09-05
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse from fresh Run 1B: `САМАРА_РФЦ`, warehouse_id `23128509046000`, address `446114, Россия, Самарская обл, Чапаевск г, Индустриальная ул, зд. 3`.
Additional same-physical-address logical warehouse discovered in Run 1B: `САМАРА_РФЦ_ЮВЕЛИРНЫЙ`, warehouse_id `1020001351192000`.

## Bridge run

Operation: `posting_fbo_list`
Request id: `814074da-57bd-40a8-8938-39dbd5acf50b`
Endpoint: `POST /v3/posting/fbo/list`
HTTP: `200`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Provider pagination: `has_next=false`, `cursor=""`

Requested window:
`2026-08-19T00:00:00Z..2026-08-21T23:59:59Z`
with `analytics_data=true`.

## Exact incident-warehouse matches

Two postings were attributed to `САМАРА_РФЦ` / `23128509046000`.
No posting in this terminal result was attributed to `САМАРА_РФЦ_ЮВЕЛИРНЫЙ` / `1020001351192000`.

### 1. Delivered posting

- posting_number: `77372441-0327-6`
- created_at: `2026-08-20T07:09:06.161336Z`
- status: `delivered`
- substatus: `posting_received`
- sku: `2271188511`
- offer_id: `Знак зодиака "Лев" (Символы)`
- quantity: `1`
- price: `1700 RUB`
- warehouse: `САМАРА_РФЦ`
- warehouse_id: `23128509046000`

### 2. Ozon-cancelled posting

- posting_number: `0268338192-0010-1`
- created_at: `2026-08-21T05:39:58.353943Z`
- status: `cancelled`
- substatus: `posting_canceled`
- sku: `1720141903`
- offer_id: `Знак зодиака "Водолей"`
- quantity: `1`
- price: `1700 RUB`
- warehouse: `САМАРА_РФЦ`
- warehouse_id: `23128509046000`
- cancellation_type: `Ozon`
- cancellation_initiator: `Ozon`
- cancel_reason_id: `695`
- cancel_reason: `Не удалось доставить заказ`

## What this proves

Fresh post-repair evidence confirms positive pre-incident exposure: seller goods were moving through the exact affected Chapayevsk fulfillment center immediately before the 2026-08-22 incident. At least SKUs `2271188511` and `1720141903` were in that Samara FBO flow.

This does not prove how many units were physically inside the building at the moment of the incident. The Ozon cancellation of SKU `1720141903` is relevant but cannot be causally attributed to the incident because this response does not provide a cancellation timestamp or explicit incident marker.

## Next step

Read current FBO stock-by-warehouse for both historically exposed SKUs and verify current placement / Samara absence explicitly.

Checkpoint:
`STD_10_POST_REPAIR_RUN2_PREINCIDENT_SAMARA_EXPOSURE_PROVEN_CURRENT_FBO_PLACEMENT_NEXT`
