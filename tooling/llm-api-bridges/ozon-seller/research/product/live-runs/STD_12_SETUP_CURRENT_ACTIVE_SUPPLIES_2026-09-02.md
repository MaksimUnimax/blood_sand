# STD-12 setup — current active supplies

Date: 2026-09-02
Canonical question: `Какие мои поставки сейчас активны и что с каждой происходит?`

## Why a fresh run is required

Earlier STD-06 supply diagnostics on 2026-09-02 observed:
- `DATA_FILLING`: 4;
- `IN_TRANSIT`: 1;
- no READY_TO_SUPPLY / acceptance / report-rejected emergencies;
- active IDs then were `125820894`, `125819631`, `125818485`, `125818083`, `122149074`.

STD-06 later showed:
- order `122149074` was stale `IN_TRANSIT`, created 2026-08-10, slot 2026-08-11, last state update 2026-08-12;
- four `DATA_FILLING` orders were fresh and scheduled for 2026-09-05.

Those earlier reads must not be silently reused as current state for STD-12 because live state can change during the same test day. STD-11 just demonstrated an actual same-day inventory state transition.

## Planned workflow

1. `supply_order_status_counter` fresh read to determine which supply states currently have non-zero active counts.
2. `supply_order_list` for only the current non-terminal/attention states returned by the counter, explicit limit/sort and no hidden continuation.
3. `supply_order_get` for all returned active IDs in one explicit request, if list output does not itself contain sufficient business detail.
4. Continue into supply details/bundles/acceptance only when the current order state requires that drill-down.

Do not classify cumulative COMPLETED/CANCELLED counts as active work.

## First read

Operation: `supply_order_status_counter`
Params: `{}`

Target evidence:
- exact current counts by state;
- identify all non-zero non-terminal supply states;
- compare current state distribution with earlier STD-06 evidence only as historical context, not as a substitute for current reads.

STD-12 status: `READY_FOR_RUN1`.

Checkpoint:
`STD_12_SETUP_CURRENT_ACTIVE_SUPPLY_STATUS_COUNTER_NEXT`
