# STD-12 post-repair Run 1 — current supply status counter

Date: 2026-09-05
Canonical question: `Какие мои поставки сейчас активны и что с каждой происходит?`

## Bridge run

Operation: `supply_order_status_counter`
Request id: `38d350a9-93dd-42df-a73b-23f29fadfcb2`
HTTP: `200`
Elapsed: `1332 ms`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`.

## Fresh current counts

- `ORDER_STATE_READY_TO_SUPPLY` — `4`
- `ORDER_STATE_ACCEPTANCE_AT_STORAGE_WAREHOUSE` — `1`
- `ORDER_STATE_COMPLETED` — `74`
- `ORDER_STATE_CANCELLED` — `26`
- `ORDER_STATE_DATA_FILLING` — `0`
- `ORDER_STATE_ACCEPTED_AT_SUPPLY_WAREHOUSE` — `0`
- `ORDER_STATE_IN_TRANSIT` — `0`
- `ORDER_STATE_REPORTS_CONFIRMATION_AWAITING` — `0`
- `ORDER_STATE_REPORT_REJECTED` — `0`
- `ORDER_STATE_REJECTED_AT_SUPPLY_WAREHOUSE` — `0`
- `ORDER_STATE_UNSPECIFIED` — `0`.

## Active-state classification

Current non-zero non-terminal/attention states are exactly:

1. `ORDER_STATE_READY_TO_SUPPLY` — 4 orders;
2. `ORDER_STATE_ACCEPTANCE_AT_STORAGE_WAREHOUSE` — 1 order.

`COMPLETED=74` and `CANCELLED=26` are cumulative terminal counts and must not be classified as current active work.

## Delta versus historical 2026-09-02 context

Historical 2026-09-02 non-terminal counts were `DATA_FILLING=4` and `IN_TRANSIT=1`. The fresh 2026-09-05 counter shows both historical states at zero and instead shows `READY_TO_SUPPLY=4` plus `ACCEPTANCE_AT_STORAGE_WAREHOUSE=1`.

This is a real workflow-state progression signal, not evidence that the historical IDs are unchanged. The next read must enumerate the current orders in the two fresh active states before any per-order conclusion is made.

## Classification

Run 1: `PASS`.
Operational reliability: `PASS_FIRST_PROVIDER_READ`.
Provider/API incidents: `NONE`.

Next: explicit `supply_order_list` for the two fresh non-zero non-terminal states only.

Checkpoint:
`STD_12_RUN1_PASS_READY_TO_SUPPLY_4_ACCEPTANCE_AT_STORAGE_1_LIST_CURRENT_ACTIVE_ORDERS_NEXT`
