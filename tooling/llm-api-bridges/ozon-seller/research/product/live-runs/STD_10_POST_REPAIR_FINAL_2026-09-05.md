# STD-10 post-repair final — Samara/Chapayevsk incident exposure and current state

Date: 2026-09-05
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target physical facility: Ozon logistics center at Chapayevsk, Samara region, Industrialnaya 3.

## Run 1A — empty warehouse filter provider rejection

Operation: `ozon_warehouse_list`
Request id: `a377617f-a410-4f8c-95ae-8e549bfc64d8`
HTTP: `400`
External request executed: `true`
Logical/physical: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Provider code: `3`

Current Bridge contract accepts `params:{}` for this operation, but the provider rejected the empty body. This is retained as a live contract/provider-behavior mismatch candidate. No hidden retry was performed.

## Run 1B — explicit FULL_FILLMENT filter

Command: `{"operation":"ozon_warehouse_list","params":{"warehouse_types":["FULL_FILLMENT"]}}`
Request id: `27847b28-0499-4192-a1f4-ee858880ee74`
HTTP: `200`
External request executed: `true`
Logical/physical: `1/1`
Exact request preserved: `true`
Command transformed: `false`

Fresh exact incident-site matches:
- `САМАРА_РФЦ`, warehouse_id `23128509046000`, address `446114, Россия, Самарская обл, Чапаевск г, Индустриальная ул, зд. 3`, `is_active=true`, type `FULL_FILLMENT`;
- `САМАРА_РФЦ_ЮВЕЛИРНЫЙ`, warehouse_id `1020001351192000`, same Chapayevsk/Industrialnaya 3 physical site, `is_active=true`, type `FULL_FILLMENT`.

Important semantic boundary: registry `is_active=true` is not proof of normal post-incident operations.

## Run 2 — pre-incident FBO exposure

Operation: `posting_fbo_list`
Window: `2026-08-19T00:00:00Z..2026-08-21T23:59:59Z`
Request id: `814074da-57bd-40a8-8938-39dbd5acf50b`
HTTP: `200`
External request executed: `true`
Logical/physical: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Provider pagination: `has_next=false`, `cursor=""`.

Two exact historical matches to `САМАРА_РФЦ` / `23128509046000` immediately before the 2026-08-22 incident:

1. SKU `2271188511` — `Знак зодиака "Лев" (Символы)`
   - posting `77372441-0327-6`
   - created `2026-08-20T07:09:06.161336Z`
   - quantity `1`
   - status `delivered`
   - price `1700 RUB`.

2. SKU `1720141903` — `Знак зодиака "Водолей"`
   - posting `0268338192-0010-1`
   - created `2026-08-21T05:39:58.353943Z`
   - quantity `1`
   - status `cancelled`
   - cancellation initiator/type `Ozon`
   - reason id `695`
   - reason `Не удалось доставить заказ`
   - price `1700 RUB`.

This proves seller products were in the exact affected Samara FBO fulfillment flow before the incident. It does not prove physical units remaining in the building at incident time or that the attack caused the Ozon cancellation.

## Run 3 — current FBO placement for exposed SKUs

Operation: `fbo_stock_by_warehouse`
Request id: `cd7bb07f-1950-418e-a0c3-bfc33f43c2b9`
HTTP: `200`
External request executed: `true`
Logical/physical: `1/1`
Exact request preserved: `false`
Command transformed: `true`
Provider pagination: `has_next=false`, `cursor=""`.

Current Samara rows:
- SKU `1720141903` / Водолей: Samara `present=0,reserved=0`; every returned FBO warehouse row is zero.
- SKU `2271188511` / Лев (Символы): Samara `present=0,reserved=0`; nonzero FBO elsewhere totals `present=4,reserved=0`:
  - `17717042026000` = 2
  - `18044249781000` = 1
  - `23843917228000` = 1.

## Run 4 — fresh aggregate product state

Operation: `seller_product_info_list`
Product IDs: `1217129635` (Водолей), `1947980208` (Лев Символы)
Request id: `730b6b7d-ae01-461d-8710-412ecf0d828a`
HTTP: `200`
External request executed: `true`
Logical/physical: `1/1`
Exact request preserved: `true`
Command transformed: `false`

### SKU 1720141903 — Водолей

Current product state:
- `status_name=Продается`
- `moderate_status=approved`
- `validation_status=success`
- `errors=[]`
- `is_archived=false`
- `is_autoarchived=false`
- `visibility_details.has_price=true`
- `visibility_details.has_stock=true`
- availability `AVAILABLE` with no reasons.

Fresh aggregate stock:
- FBO `present=0,reserved=0`
- FBS `present=42,reserved=0`
- total free under project convention `present-reserved` = `42`.

Interpretation: no total stockout. The current issue is FBO placement only: zero FBO, healthy FBS.

### SKU 2271188511 — Лев (Символы)

Current product state:
- `status_name=Продается`
- `moderate_status=approved`
- `validation_status=success`
- `errors=[]`
- `is_archived=false`
- `is_autoarchived=false`
- `visibility_details.has_price=true`
- `visibility_details.has_stock=true`
- availability `AVAILABLE` with no reasons.

Fresh aggregate stock:
- FBO `present=4,reserved=0`
- FBS `present=43,reserved=0`
- total free = `47`.

Interpretation: historically exposed at Samara, currently healthy and distributed outside Samara.

## Final business answer

**Was seller product at the affected warehouse? YES.** Historical FBO postings prove at least two seller SKUs were in the exact `САМАРА_РФЦ` flow immediately before the incident.

**What is the current state?** Both exposed SKUs are explicitly zero at Samara now. Both cards are active and sellable. `Лев (Символы)` has 47 free units across FBO+FBS. `Водолей` has zero FBO but 42 free FBS units, so there is no current total inventory loss.

**What should be controlled?**
- keep historical incident exposure separate from current placement;
- watch `Водолей` FBO allocation if FBO coverage matters commercially;
- do not treat `is_active=true` from warehouse registry as proof of normal facility operation;
- treat cancellation reason 695 as correlation, not incident causality;
- if proof of physical destroyed/damaged units or incident-specific compensation/write-off is required, the current evidence does not establish it.

## Final classification

Business answerability: `PASS_WITH_EXPLICIT_INCIDENT_CAUSALITY_AND_HISTORICAL_SNAPSHOT_LIMITS`.
Operational reliability: `PASS_WITH_OZON_WAREHOUSE_EMPTY_FILTER_PROVIDER_400_CONTRACT_DRIFT_SIGNAL`.
No skip on failure: satisfied; the empty-filter provider 400 was preserved and corrected with one new explicit command using `FULL_FILLMENT`.

Checkpoint:
`STD_10_POST_REPAIR_COMPLETE_EXPOSURE_PROVEN_CURRENT_SAMARA_ZERO_BOTH_CARDS_HEALTHY_AQUARIUS_FBO_ZERO_FBS42_STD11_READY`
