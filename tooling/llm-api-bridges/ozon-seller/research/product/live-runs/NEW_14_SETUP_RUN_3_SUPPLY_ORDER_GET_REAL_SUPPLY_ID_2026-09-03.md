# NEW-14 setup Run3 — supply_order_get real supply id

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Purpose

Resolve a real provider `supply_id` for NEW-14 `cargoes_label_create` without inventing identifiers.

## Submitted command

`OZON_API_V1 {"operation":"supply_order_get","params":{"order_ids":[125820894]}}`

The `order_id=125820894` came directly from NEW-14 setup Run2 `supply_order_list` HTTP200 result.

## Result

- request id: `0d3a6203-fc53-4707-b72b-329ce10ce928`
- HTTP: `200`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `f41eda95`
- physical fingerprint: `f41eda95`
- command transformed: `false`
- returned order id: `125820894`
- order state: `DATA_FILLING`
- returned real integer supply id: `2000064871008`
- supply state: `DATA_FILLING`
- drop-off address was redacted in bridge output.

## Judgment

`PASS_SETUP_REAL_SUPPLY_ID_RESOLVED`.

No new defect is established by this read. Planning/execution metadata is clean. The bridge redacted the address field as intended.

The real provider-returned integer `supply_id=2000064871008` is now authorized as the standalone NEW-14 test input. Provider business-state acceptance for label generation is intentionally left to the actual NEW-14 command; do not substitute or invent another id.

## Next action

Run standalone NEW-14:

`OZON_API_V1 {"operation":"cargoes_label_create","params":{"supply_id":2000064871008}}`

Persist its result before any downstream status/document read or before advancing to NEW-15. Do not patch runtime.
