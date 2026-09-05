# STD-12 post-repair Run 2 — active supply order IDs

Date: 2026-09-05
Canonical question: `Какие мои поставки сейчас активны и что с каждой происходит?`

## Run 1 authority

Fresh `supply_order_status_counter` returned:
- `READY_TO_SUPPLY=4`;
- `ACCEPTANCE_AT_STORAGE_WAREHOUSE=1`;
- `DATA_FILLING=0`;
- `IN_TRANSIT=0`;
- terminal cumulative counts: `COMPLETED=74`, `CANCELLED=26`.

Therefore Run 2 requested only the two current non-zero non-terminal states.

## Bridge run

Operation: `supply_order_list`
Request id: `83bad797-cdc0-4650-801f-46cadc1fa974`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Provider result `last_id`: empty string.

Requested filter:
- states: `READY_TO_SUPPLY`, `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- limit: `100`;
- sort: `ORDER_CREATION DESC`.

Returned active order IDs:
- `125820894`
- `125819631`
- `125818485`
- `125818083`
- `122149074`

## Reconciliation with 2026-09-02 historical snapshot

The five returned order IDs exactly match the historical active set from 2026-09-02.

However their lifecycle distribution has progressed:
- on 2026-09-02 the same five-order set was represented by `4 DATA_FILLING + 1 IN_TRANSIT`;
- on 2026-09-05 the active set is represented by `4 READY_TO_SUPPLY + 1 ACCEPTANCE_AT_STORAGE_WAREHOUSE`.

This is a real lifecycle delta for the same bounded five-order population. It must not be interpreted as five newly created supplies.

Because `last_id=""`, there is no continuation required for this filtered active-set read. The current active order population is exactly these five IDs under the selected current non-terminal states.

## Next step

Run one explicit `supply_order_get` for all five IDs. The current Bridge contract accepts up to 50 `order_ids`, so all five can be resolved in one logical/physical provider read.

Required evidence:
- exact current state per order;
- creation/update/timeslot data;
- destination / storage warehouse context;
- whether the historical stale `122149074` progressed into acceptance or whether one of the four September 5 scheduled orders did;
- whether any current order requires deeper bundle/acceptance investigation.

Checkpoint:
`STD_12_POST_REPAIR_RUN2_SAME_FIVE_ACTIVE_IDS_LIFECYCLE_PROGRESS_CONFIRMED_SUPPLY_ORDER_GET_ALL_FIVE_NEXT`
