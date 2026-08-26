# Patch B8 Supply / Replenishment — contract closure

Date: 2026-08-26

B8 is the `P1_supply_replenishment` read-core closure on top of accepted B7 authority `3769590c49e3deb5951769b3a27c79706a4f3ba9`.

## Current read core

B8 adds four fixed Seller API reads:

- `supply_order_list` -> `POST /v3/supply-order/list`
- `supply_order_status_counter` -> `POST /v1/supply-order/status/counter`
- `supply_order_bundle` -> `POST /v1/supply-order/bundle`
- `supply_order_timeslot_list` -> `POST /v2/supply-order/timeslot/list`

It also revalidates the two already-enabled supply reads:

- `supply_order_get` -> `POST /v3/supply-order/get`
- `supply_order_details` -> `POST /v1/supply-order/details`

All six remain fixed `seller_api` single-read operations. No caller-controlled URL, host, path, method, headers or authorization fields are allowed. Pagination remains explicit: B8 never follows `last_id` automatically and never fans out identifiers into multiple physical requests.

## Existing contract drift closed

The pre-B8 `supply_order_get` normalizer enforced only the 50-item ceiling. B8 also enforces the exact Swagger `string/int64` identifier type and rejects undeclared fields.

The pre-B8 `supply_order_details` normalizer accepted undeclared fields. B8 closes the schema to exactly `order_id` and requires a safely representable int64 JSON integer. The same exact order-id rule is used for the current v2 timeslot list.

## Currentness boundary

The exact Seller Swagger is authoritative for version selection.

B8 intentionally does not expose the removed legacy list/get routes:

- `/v1/supply-order/list`
- `/v1/supply-order/get`
- `/v1/supply-order/items`
- `/v2/supply-order/list`
- `/v2/supply-order/get`

The exact Swagger still carries `/v1/supply-order/timeslot/get` only with a warning that it is disabled on 19 August 2026 and directs callers to `/v2/supply-order/timeslot/list`. Because B8 is dated 26 August 2026, only the v2 replacement is enabled.

`/v1/supply-order/shipment-plan-compliance/get` is not present in the exact current Swagger and is not introduced.

Mutation operations and mutation-associated workflows are not promoted by B8. Beta FBO act methods are also outside this core closure and require their own review.

## Privacy

`supply_order_details` continues to redact driver name, driver phone and vehicle number. Operational warehouse addresses already explicitly allowed by the safe projection remain visible. No new personal-data setting or PII surface is introduced.

## Entitlements

Exact Swagger compilation resolves all six B8 supply reads as `ALL_ACCOUNTS`, with no endpoint subscription restriction and no feature-level subscription rule. The bundled snapshot is updated to match that exact compiled authority.

No provider request, capability probe, retry, pagination, fanout or runtime lifecycle behavior is introduced by B8.
