# STD-13 post-repair Run 1 — accepted supply details

Date: 2026-09-05
Canonical question: `Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.`
Target order: `122149074` / `2000062599609`.

## Request

Operation: `supply_order_details`
Request id: `90cc5e14-4c60-41b4-bd62-b839a4148409`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`

## Current provider state

Order-level state:
- `ACCEPTANCE_AT_STORAGE_WAREHOUSE`
- state updated `2026-09-04T13:13:46.708202Z`.

Supply-level state:
- supply id `2000062599609`;
- `supply_state=ACCEPTED_AT_STORAGE_WAREHOUSE`;
- crossdock `true`;
- bundle id `019feae9-0fbe-75af-8f63-b9df1ca38840`;
- macrolocal cluster `4002`;
- no overdue reason (`UNSPECIFIED`).

The original timeslot remains `2026-08-11T14:00:00Z..15:00:00Z`, but it can no longer be changed because the order state is no longer eligible and the deadline is exceeded. Vehicle is not required.

The supply content can no longer be changed (`INCORRECT_SUPPLY_STATE`, `DEADLINE`), and cancellation is no longer allowed in the current supply state.

## Interpretation

This live read resolves the first half of the customer complaint: the shipment is no longer stuck before physical acceptance. The nested supply has already reached `ACCEPTED_AT_STORAGE_WAREHOUSE`.

Do not collapse order and supply lifecycle vocabularies:
- order: `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- nested supply: `ACCEPTED_AT_STORAGE_WAREHOUSE`.

The remaining business question is whether the products from this accepted bundle have appeared in current FBO stock/sale state. This requires fresh bundle composition and then a cross-surface stock check. Historical 2026-09-02 bundle evidence is context only and must not silently substitute for a current read.

## Next

Fresh `supply_order_bundle` for bundle `019feae9-0fbe-75af-8f63-b9df1ca38840`.

Checkpoint:
`STD_13_RUN1_SUPPLY_ACCEPTED_AT_STORAGE_ORDER_STILL_ACCEPTANCE_STAGE_FRESH_BUNDLE_NEXT`
