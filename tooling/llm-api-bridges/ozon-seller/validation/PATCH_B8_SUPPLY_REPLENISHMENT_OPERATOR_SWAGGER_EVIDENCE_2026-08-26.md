# Patch B8 Supply / Replenishment — exact Seller Swagger evidence

Date: 2026-08-26

Exact operator-supplied Seller Swagger authority:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

## Current endpoints

The exact Swagger contains:

- `POST /v3/supply-order/list` — `SupplyOrderList`
- `POST /v3/supply-order/get` — `SupplyOrderGet`
- `POST /v1/supply-order/status/counter` — `SupplyOrderAPI_SupplyOrderStatusCounter`
- `POST /v1/supply-order/bundle` — `SupplyOrderBundle`
- `POST /v2/supply-order/timeslot/list` — `SupplyOrderTimeslotList`
- `POST /v1/supply-order/details` — `SupplyOrderAPI_SupplyOrderDetails`

`/v1/supply-order/status/counter` has no request body.

## Currentness evidence

The current snapshot does not contain the old `/v1/supply-order/list`, `/v1/supply-order/get`, `/v1/supply-order/items`, `/v2/supply-order/list`, or `/v2/supply-order/get` paths.

The snapshot still documents `/v1/supply-order/timeslot/get` with a warning that the method is disabled on **19 August 2026** and instructs migration to `/v2/supply-order/timeslot/list`. B8 therefore uses only the v2 replacement.

## Contract evidence

`v3SupplyOrderListRequest` requires `filter`, `limit`, and `sort_by`.

- `limit`: 1..100
- `filter.states`: required
- `filter.order_number_search`: minimum 3 characters
- `filter.dropoff_warehouse_ids`: array of string/int64 identifiers
- `filter.timeslot_from_range.from/to`: RFC3339 date-time
- timeslot filter type: `BY_LOCAL_TIME | BY_UTC_TIME`
- sort: `ORDER_CREATION | ORDER_STATE_UPDATED_AT | TIMESLOT_FROM_UTC | TIMESLOT_FROM_LOCAL`
- direction: `ASC | DESC`

`v3SupplyOrderGetRequest` requires `order_ids`; maximum 50; every item is `string` with `int64` format.

`v1GetSupplyOrderBundleRequest` requires `bundle_ids` and `limit`.

- bundle_ids: 1..100
- limit: 1..100
- item-tag storage warehouses: documentation says no more than 25
- sort field: `SKU | NAME | QUANTITY | TOTAL_VOLUME_IN_LITRES`

Both `supply_order.v2.SupplyOrderTimeslotListRequest` and `v1SupplyOrderDetailsRequest` require one integer/int64 `order_id`.

## Result privacy evidence

The exact details response contains `vehicle.value.driver_name`, `vehicle.value.driver_phone`, and `vehicle.value.vehicle_number`. The existing safe projection redacts those fields. Operational storage/dropoff warehouse addresses remain explicitly allowlisted for supply operations.

The v3 get response contains operational warehouse addresses but no driver/vehicle contact block. The list response returns order identifiers and pagination state.

## Entitlement evidence

Compiling this exact Swagger through the accepted B7 entitlement compiler yields:

- operation count: 463
- unresolved rule count: 0

All six B8 supply endpoints compile to `ALL_ACCOUNTS` without subscription-only endpoint or feature restrictions.
