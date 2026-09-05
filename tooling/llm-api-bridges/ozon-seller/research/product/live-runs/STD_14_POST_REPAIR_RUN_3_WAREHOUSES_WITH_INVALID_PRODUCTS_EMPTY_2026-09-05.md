# STD-14 post-repair Run 3 — delivery-restriction warehouse discovery

Date: 2026-09-05
Canonical question: `Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна?`
Branch: `repair/ozon-date-contract-2026-09-04`

## Run 3

Operation: `warehouses_with_invalid_products`
Params: `{}`
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

The current account has no warehouses returned by Ozon's dedicated `warehouses-with-invalid-products` diagnostic surface. Therefore there is no current evidence that delivery is unavailable because products are marked invalid for delivery on a warehouse.

This is a real business zero, not an API failure.

Combined with Run 2:

- `seller_product_list` with `visibility=INVISIBLE` returned `0` products;
- `warehouses_with_invalid_products` returned `0` warehouses.

Therefore the current account does not contain a reproducible live case matching the canonical STD-14 symptom at this observation point.

Do not fabricate a SKU, invisible state or delivery restriction.

## Reliability note

Run 1 remains a separate Bridge contract defect:

`PRODUCT_VISIBILITY_INFO_EMPTY_SKUS_LOCALLY_ACCEPTED_BUT_PROVIDER_REJECTED`

That defect affects account-wide discovery ergonomics but does not change the business-zero evidence from Runs 2-3.

Checkpoint:
`STD_14_RUN3_NO_DELIVERY_RESTRICTION_WAREHOUSES_CURRENT_CASE_NOT_PRESENT_FINALIZE_WITH_RUN1_CONTRACT_GAP`
