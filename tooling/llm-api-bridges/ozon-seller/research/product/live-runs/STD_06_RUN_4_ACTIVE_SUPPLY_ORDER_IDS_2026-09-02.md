# STD-06 Run 4 — active supply order IDs

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Question: `Что сегодня в моём кабинете требует внимания в первую очередь?`

## Command/result

Operation: `supply_order_list`
Request ID: `fd7a57a5-7d2d-48f0-8124-e9c1ce756518`
HTTP: `200`
Physical business requests: `1`

Filter:
- states: `DATA_FILLING`, `IN_TRANSIT`
- limit: `100`
- sort: `ORDER_CREATION DESC`

Returned order IDs:
- `125820894`
- `125819631`
- `125818485`
- `125818083`
- `122149074`

`last_id` was empty.

## Interpretation

Run 3 reported exactly four `DATA_FILLING` orders and one `IN_TRANSIT` order. Run 4 returned exactly five IDs under those states, so the active supply set is bounded to these five orders for the current triage.

The list response contains identifiers only and does not expose enough detail to determine:
- which exact order is `IN_TRANSIT`;
- creation/update/timeslot age of each `DATA_FILLING` order;
- destination/warehouse context;
- supply contents and whether the in-transit supply mitigates the inventory priorities found in STD-06 Run 2.

Therefore STD-06 remains active. The correct next step is one explicit `supply_order_get` call for all five order IDs. This preserves the Bridge invariant `ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST` while avoiding five separate lookups.

## Current triage state

- seller rating/penalty emergency: not found;
- supply rejection/acceptance emergency: not found;
- slow-turnover/overstock cluster: confirmed and currently the strongest broad operational issue;
- FBO/distribution risk for some recent sellers: requires cross-surface interpretation, not total-stock inference;
- active supplies: four `DATA_FILLING`, one `IN_TRANSIT`; exact details pending.

## Checkpoint

`STD_06_RUN4_ACTIVE_SUPPLY_IDS_FOUND_SUPPLY_ORDER_GET_ALL_FIVE_NEXT`
