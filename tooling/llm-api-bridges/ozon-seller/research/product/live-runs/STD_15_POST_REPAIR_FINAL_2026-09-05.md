# STD-15 post-repair final — current delivery/logistics restrictions

Date: 2026-09-05
Canonical question: `Какие товары или склады сейчас имеют ограничения доставки и что именно не так?`
Branch: `repair/ozon-date-contract-2026-09-04`

## Evidence reuse boundary

STD-14 immediately preceding this row executed a fresh live `warehouses_with_invalid_products` request specifically to investigate delivery restrictions. That read is the exact primary surface required by STD-15, was executed moments before this row, and remains current evidence for the same observation point.

Do not issue an identical provider request only to relabel the same data as another benchmark row.

## Fresh live evidence

Operation: `warehouses_with_invalid_products`
Request id: `5107d23a-6591-41b2-a530-bf6d59cd99e0`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`

Provider result:

```json
{"warehouse_ids":[]}
```

## Interpretation

Ozon's dedicated account-level warehouse diagnostic reports no warehouses containing products with delivery restrictions.

Because the discovery result is empty, there are no warehouse IDs to drill into with `warehouse_invalid_products`; issuing that operation without a returned warehouse would fabricate a target.

Therefore the correct current seller-facing answer is:

- warehouses with delivery-invalid products: `0`;
- identified products with delivery restrictions from this diagnostic chain: `0`;
- no current reason/details exist to enumerate because the provider returned no affected warehouse.

## Final classification

Business answerability: `PASS_CURRENT_ZERO`.
Operational reliability: `PASS`.
Provider/API incidents in the STD-15 evidence read: `NONE`.
Additional duplicate provider call avoided: `YES`.
Fabricated affected warehouse/SKU: `NO`.

Final marker:

`STD_15_PASS_NO_CURRENT_DELIVERY_RESTRICTION_WAREHOUSES_STD_16_READY`
