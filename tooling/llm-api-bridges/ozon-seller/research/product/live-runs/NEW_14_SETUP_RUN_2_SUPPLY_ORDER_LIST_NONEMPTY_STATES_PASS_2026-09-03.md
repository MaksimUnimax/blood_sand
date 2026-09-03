# NEW-14 setup Run2 — supply_order_list with non-empty states

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Purpose

Obtain real provider `order_id` values for NEW-14 `cargoes_label_create`, after the registry-template setup using `filter.states=[]` returned provider HTTP400/code3.

## Submitted command

`OZON_API_V1 {"operation":"supply_order_list","params":{"filter":{"states":["DATA_FILLING","READY_TO_SUPPLY","ACCEPTED_AT_SUPPLY_WAREHOUSE","IN_TRANSIT","ACCEPTANCE_AT_STORAGE_WAREHOUSE","REPORTS_CONFIRMATION_AWAITING","REPORT_REJECTED","COMPLETED","REJECTED_AT_SUPPLY_WAREHOUSE","CANCELLED","OVERDUE"]},"limit":100,"sort_by":"ORDER_CREATION","sort_dir":"DESC"}}`

## Result

- request id: `3e5b9659-7664-4749-a34f-ad9a9af9ad42`
- HTTP: `200`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `bc9210cd`
- physical fingerprint: `bc9210cd`
- command transformed: `false`
- returned order ids: `100`
- first real order id: `125820894`
- last returned order id: `57848502`
- provider pagination cursor/last_id: present

## Judgment

`PASS_SETUP`.

This is the controlled A/B counterexample for DEFECT-005:
- runtime registry template + validator accepted/recommended `filter.states=[]` and provider returned HTTP400/code3;
- the same endpoint and surrounding parameters with an explicit non-empty runtime-valid state list returned HTTP200 and 100 real order IDs.

Therefore DEFECT-005 remains confirmed as a bridge contract/template defect, not a generic endpoint/provider outage.

No patch is applied during collection.

## Next action

Use the first returned real `order_id=125820894` in explicit safe READ `supply_order_get` to resolve one or more real `supply_id` values. Do not invent identifiers.
