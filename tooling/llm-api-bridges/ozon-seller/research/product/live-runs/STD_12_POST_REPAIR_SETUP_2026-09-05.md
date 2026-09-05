# STD-12 post-repair setup — current active supplies

Date: 2026-09-05
Canonical question: `Какие мои поставки сейчас активны и что с каждой происходит?`

## Authority boundary

STD-11 post-repair is complete. STD-12 must use fresh 2026-09-05 provider state and must not silently reuse the 2026-09-02 supply snapshot as current evidence.

Historical context only:

- 2026-09-02 `supply_order_status_counter` observed `DATA_FILLING=4` and `IN_TRANSIT=1` among non-terminal states;
- historical active IDs were `125820894`, `125819631`, `125818485`, `125818083`, `122149074`;
- `122149074` was already stale `IN_TRANSIT` in the earlier investigation;
- four `DATA_FILLING` orders were then scheduled for 2026-09-05.

Those facts are useful only for delta interpretation after a fresh read. They are not current-state evidence.

## Planned workflow

1. Fresh `supply_order_status_counter` with `{}`.
2. Identify all non-zero non-terminal/attention states from the returned counter.
3. Run `supply_order_list` only for those current states, with explicit limit/sort and no hidden continuation.
4. If list output is insufficient, run `supply_order_get` for all returned active IDs in one explicit request.
5. Drill into bundles/acceptance/details only when the current state requires it.
6. Do not classify cumulative `COMPLETED` or `CANCELLED` counts as active work.

## Run 1 next

Operation: `supply_order_status_counter`
Params: `{}`

Required evidence:

- HTTP/provider result;
- one logical -> one physical request when accepted;
- exact current counts by state;
- non-zero non-terminal states;
- comparison with 2026-09-02 only after fresh 2026-09-05 state is known.

STD-12 status: `READY_FOR_POST_REPAIR_RUN1`.

Checkpoint:
`STD_12_POST_REPAIR_CURRENT_ACTIVE_SUPPLY_STATUS_COUNTER_NEXT`
