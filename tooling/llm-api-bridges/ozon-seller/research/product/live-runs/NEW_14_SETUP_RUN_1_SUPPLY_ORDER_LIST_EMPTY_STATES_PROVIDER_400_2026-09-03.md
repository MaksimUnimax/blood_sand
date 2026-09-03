# NEW-14 setup Run1 — supply_order_list empty states provider 400

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Purpose

Obtain a real supply/order identifier for NEW-14 `cargoes_label_create` without inventing provider IDs.

## Submitted setup command

`OZON_API_V1 {"operation":"supply_order_list","params":{"filter":{"states":[]},"limit":100,"sort_by":"ORDER_CREATION","sort_dir":"DESC"}}`

This exact shape came from the active runtime registry template for `supply_order_list`.

## Observed

- request id: `deba7764-b75b-4fbd-ada0-7e163844d109`
- HTTP: `400`
- provider code: `3`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `d0967438`
- physical fingerprint: `d0967438`
- command transformed: `false`

## Contract finding

Active runtime `normalizeSupplyOrderListParams` requires `filter.states` and passes it to `validateEnumArray`. The validator only validates each present element against `SUPPLY_ORDER_STATES`; it does not reject an empty array. The active operation registry template itself uses `filter.states: []`.

Therefore the bridge advertises and accepts a request shape that the provider rejects with HTTP400/code3.

## Classification

New numbered defect:
`DEFECT-005 — SUPPLY_ORDER_LIST_EMPTY_STATES_TEMPLATE_PROVIDER_INVALID`

This is a bridge contract/template defect, not a generic provider failure, because the provider-invalid form is both accepted by local validation and supplied as the bridge's own template.

No runtime patch is allowed yet. Continue collection using a distinct setup request with a non-empty explicit state set.

RAW evidence:
`live-runs/repaired-26/raw/NEW_14_SETUP_RUN_1_SUPPLY_ORDER_LIST_EMPTY_STATES_PROVIDER_400_RAW_2026-09-03.json`
