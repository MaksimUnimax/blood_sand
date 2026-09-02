# STD-06 Run 3 — supply status counter

Date: 2026-09-02
Benchmark row: `STD-06`
Question: `Что сегодня в моём кабинете требует внимания в первую очередь?`
Operation: `supply_order_status_counter`
Request ID: `ebf697ff-3319-4f3d-8b4f-4a9683db7cc6`
Bridge version: `0.1.19`
HTTP: `200`
Physical business requests: `1`

## Provider result

- `ORDER_STATE_DATA_FILLING`: `4`
- `ORDER_STATE_IN_TRANSIT`: `1`
- `ORDER_STATE_COMPLETED`: `74`
- `ORDER_STATE_CANCELLED`: `26`
- `ORDER_STATE_READY_TO_SUPPLY`: `0`
- `ORDER_STATE_ACCEPTED_AT_SUPPLY_WAREHOUSE`: `0`
- `ORDER_STATE_ACCEPTANCE_AT_STORAGE_WAREHOUSE`: `0`
- `ORDER_STATE_REPORTS_CONFIRMATION_AWAITING`: `0`
- `ORDER_STATE_REPORT_REJECTED`: `0`
- `ORDER_STATE_REJECTED_AT_SUPPLY_WAREHOUSE`: `0`
- `ORDER_STATE_UNSPECIFIED`: `0`

## Interpretation

No acute rejected/acceptance/report-confirmation incident is visible in the status counter.

The active supply signals are:
- four orders in `DATA_FILLING`;
- one order `IN_TRANSIT`.

These states require a drill-down before they can be prioritized:
- `DATA_FILLING` may represent harmless old drafts or unfinished current supply jobs;
- the single `IN_TRANSIT` order may already be carrying inventory that changes the urgency of replenishment recommendations from STD-06 Run 2.

Do not classify cancelled/completed historical orders as current attention items merely from cumulative counts.

## Current STD-06 priority state after Run 3

1. Critical/very slow turnover remains a confirmed current attention class from Run 2.
2. Potential FBO-distribution/replenishment signals remain active for strong-selling SKUs, but Run 2 `current_stock` must not be interpreted as total FBO+FBS sellable stock.
3. Seller rating/penalty surface remains healthy from Run 1.
4. Supply process has no visible rejection/acceptance emergency, but the four `DATA_FILLING` and one `IN_TRANSIT` orders require targeted inspection.

## Next action

List only active supply orders in states `DATA_FILLING` and `IN_TRANSIT`, sorted by creation time, then inspect their age/current status and determine whether the in-transit supply mitigates any current inventory priority.

Checkpoint:
`STD_06_RUN3_SUPPLY_COUNTER_200_ACTIVE_4_DATA_FILLING_1_IN_TRANSIT_NO_REJECTION_EMERGENCY_DRILLDOWN_NEXT`
