# STD-14 post-repair Run 2 — no current INVISIBLE products

Date: 2026-09-05
Canonical question: `Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна?`
Branch: `repair/ozon-date-contract-2026-09-04`

## Context

Run 1 established that `product_visibility_info` with an empty params object is locally accepted by the current Bridge but rejected by the live provider with HTTP 400. STD-14 therefore continued through a provider-supported account-level discovery path instead of treating the failed call as a business zero.

## Run 2

Operation: `seller_product_list`
Filter: `visibility=INVISIBLE`
Limit: `1000`
Request id: `e6897efe-9b07-4acc-a793-d6bd1dbdb808`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`

Provider result:
- `items=[]`;
- `total=0`;
- `last_id=""`.

## Interpretation

There are no products currently returned by the provider as `INVISIBLE` in this seller account. This is a valid business zero for the explicit `INVISIBLE` product-list filter and the result is terminal because `last_id` is empty.

This does **not** prove that no availability problem exists. The canonical question also includes cases where a product remains visible in the cabinet but delivery is unavailable or constrained. Therefore STD-14 must continue into warehouse/logistics restriction diagnostics.

The next account-level discovery operation is `warehouses_with_invalid_products`, whose registry purpose is to return warehouses where products have delivery restrictions. Any returned warehouse will then be drilled into with `warehouse_invalid_products` and correlated with current stock before a business conclusion is made.

## Current classification

Visibility-hidden branch: `NO_CURRENT_INVISIBLE_PRODUCTS`.
Business answerability: `IN_PROGRESS`.
Operational reliability for Run 2: `PASS`.
Run 1 contract/provider drift remains recorded separately and is not erased by this success.

Checkpoint:
`STD_14_RUN2_NO_INVISIBLE_PRODUCTS_WAREHOUSE_DELIVERY_RESTRICTION_DISCOVERY_NEXT`
