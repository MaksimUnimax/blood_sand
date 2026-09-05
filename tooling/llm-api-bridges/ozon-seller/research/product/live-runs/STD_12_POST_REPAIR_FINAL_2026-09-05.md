# STD-12 post-repair final — current active supplies

Date: 2026-09-05
Canonical question: `Какие мои поставки сейчас активны и что с каждой происходит?`

## Run 1 — current state counter

Operation: `supply_order_status_counter`
Request id: `38d350a9-93dd-42df-a73b-23f29fadfcb2`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`

Current state counts:

- `READY_TO_SUPPLY` — 4
- `ACCEPTANCE_AT_STORAGE_WAREHOUSE` — 1
- `COMPLETED` — 74
- `CANCELLED` — 26
- `DATA_FILLING` — 0
- `ACCEPTED_AT_SUPPLY_WAREHOUSE` — 0
- `IN_TRANSIT` — 0
- `REPORTS_CONFIRMATION_AWAITING` — 0
- `REPORT_REJECTED` — 0
- `REJECTED_AT_SUPPLY_WAREHOUSE` — 0
- `UNSPECIFIED` — 0

Only the two non-zero non-terminal states were treated as current active work. Historical cumulative `COMPLETED` and `CANCELLED` counts were not classified as active supplies.

## Run 2 — exact active ID set

Operation: `supply_order_list`
Request id: `83bad797-cdc0-4650-801f-46cadc1fa974`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Filter states: `READY_TO_SUPPLY`, `ACCEPTANCE_AT_STORAGE_WAREHOUSE`
Limit: `100`
Sort: `ORDER_CREATION DESC`

Returned IDs:

- `125820894`
- `125819631`
- `125818485`
- `125818083`
- `122149074`

`last_id=""`, so the current active set is terminal and complete for this filter.

This is the exact same five-order population seen on 2026-09-02, but the lifecycle distribution has changed materially.

## Run 3 — current state of every active supply

Operation: `supply_order_get`
Request id: `7da8be0b-539c-4ff8-9a8b-632a8eadbd0b`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`

### Order 122149074 / 2000062599609

Current state: `ACCEPTANCE_AT_STORAGE_WAREHOUSE`
State updated: `2026-09-04T13:13:46.708202Z`
Created: `2026-08-10T09:01:34.061334Z`
Original timeslot: `2026-08-11T14:00:00Z..15:00:00Z`
Drop-off: `ЗЛАТОУСТ_89`
Crossdock: `true`
Supply id: `2000062599609`
Bundle id: `019feae9-0fbe-75af-8f63-b9df1ca38840`
Macrolocal cluster: `4002`

Historical reconciliation:

- on 2026-09-02 this order was still `IN_TRANSIT` and had been unchanged since 2026-08-12, making it a possible stuck-supply incident;
- by 2026-09-04 it progressed to `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- therefore the prior stale-`IN_TRANSIT` incident is resolved as lifecycle progression, not a permanently stuck transit state.

It is still active because warehouse acceptance is not terminal completion.

### Order 125818083 / 2000064869357

Current state: `READY_TO_SUPPLY`
State updated: `2026-09-04T09:06:27.832121Z`
Created: `2026-08-30T10:50:32.518336Z`
Timeslot: `2026-09-05T07:00:00Z..08:00:00Z`
Drop-off: `ЗЛАТОУСТ_89`
Crossdock: `true`
Bundle: `01a0524b-6726-739e-bcc3-d3c751d56138`
Cluster: `4039`

### Order 125818485 / 2000064869588

Current state: `READY_TO_SUPPLY`
State updated: `2026-09-04T09:05:11.870254Z`
Created: `2026-08-30T10:54:20.229970Z`
Timeslot: `2026-09-05T07:00:00Z..08:00:00Z`
Drop-off: `ЗЛАТОУСТ_89`
Crossdock: `true`
Bundle: `01a05251-09ff-7557-b613-7437b9024b8d`
Cluster: `4036`

### Order 125819631 / 2000064870258

Current state: `READY_TO_SUPPLY`
State updated: `2026-09-04T08:59:35.854385Z`
Created: `2026-08-30T11:06:13.085399Z`
Timeslot: `2026-09-05T07:00:00Z..08:00:00Z`
Drop-off: `ЗЛАТОУСТ_89`
Crossdock: `true`
Bundle: `01a05259-34f7-7059-b226-492671edfc84`
Cluster: `4067`

### Order 125820894 / 2000064871008

Current state: `READY_TO_SUPPLY`
State updated: `2026-09-04T08:57:54.941922Z`
Created: `2026-08-30T11:17:57.980905Z`
Timeslot: `2026-09-05T07:00:00Z..08:00:00Z`
Drop-off: `ЗЛАТОУСТ_89`
Crossdock: `true`
Bundle: `01a05264-2b43-7b21-b08c-c93a3d6df65f`
Cluster: `4007`

Historical reconciliation for these four:

- on 2026-09-02 all four were `DATA_FILLING` with a data-filling deadline on 2026-09-05 and the same planned timeslot;
- by 2026-09-04 all four had progressed to `READY_TO_SUPPLY`;
- `data_filling_deadline` is now null, consistent with the data-filling stage being completed rather than still pending.

## Seller-facing answer

There are exactly five current active supply orders.

- Four (`125818083`, `125818485`, `125819631`, `125820894`) are `READY_TO_SUPPLY` and share the planned 2026-09-05 `07:00..08:00Z` slot at `ЗЛАТОУСТ_89`.
- One (`122149074`) is already beyond transit and is now in `ACCEPTANCE_AT_STORAGE_WAREHOUSE`; this is the same order that looked stale in `IN_TRANSIT` on 2026-09-02, so the old transit-stall signal has materially progressed rather than remaining frozen.
- There are no current active orders in `DATA_FILLING`, `IN_TRANSIT`, report-rejected, supply-warehouse-rejected, or report-confirmation-waiting states.

No extra bundle/product-composition read is required to answer STD-12 because the business question asks which supplies are active and what state each is in; Run 3 resolves that for every active ID.

## Final classification

Business answerability: `PASS`.
Operational reliability: `PASS_THREE_EXPLICIT_PROVIDER_READS`.
Active-set completeness: `PASS_LAST_ID_EMPTY`.
Historical stale-IN_TRANSIT incident: `RESOLVED_BY_PROGRESS_TO_ACCEPTANCE_AT_STORAGE_WAREHOUSE`.
Operator business steering: `NO`.
Provider/API incidents: `NONE`.

STD-12 post-repair is complete.

Checkpoint:
`STD_12_POST_REPAIR_COMPLETE_FIVE_ACTIVE_SUPPLIES_FOUR_READY_ONE_STORAGE_ACCEPTANCE_OLD_IN_TRANSIT_STALL_PROGRESS_RESOLVED_STD_13_READY`
