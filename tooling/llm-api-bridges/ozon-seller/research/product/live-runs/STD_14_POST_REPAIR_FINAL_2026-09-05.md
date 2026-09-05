# STD-14 post-repair final — availability / visibility investigation

Date: 2026-09-05
Canonical question: `Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна?`
Branch: `repair/ozon-date-contract-2026-09-04`

## Goal

Find a real current-account availability case without inventing a SKU, then diagnose whether the symptom comes from visibility or delivery/logistics restrictions.

## Run 1 — account-wide visibility discovery contract drift

Operation: `product_visibility_info`
Params: `{}`
HTTP: `400`
Provider category: `provider_request`
Provider code: `3`
External request executed: `true`
Logical/physical business requests: `1/1`

The current Bridge validator permits an empty `product_visibility_info` request because `skus` is optional locally, but the live provider rejects that request.

Recorded contract gap:

`PRODUCT_VISIBILITY_INFO_EMPTY_SKUS_LOCALLY_ACCEPTED_BUT_PROVIDER_REJECTED`

This is not a business zero.

## Run 2 — invisible-product discovery

Operation: `seller_product_list`
Filter: `visibility=INVISIBLE`
Limit: `1000`
Request id: `e6897efe-9b07-4acc-a793-d6bd1dbdb808`
HTTP: `200`
Logical/physical business requests: `1/1`
Exact request preserved: `true`

Result:

- items: `[]`
- total: `0`
- last_id: `""`

Current invisible products: `0`.

## Run 3 — delivery-restriction warehouse discovery

Operation: `warehouses_with_invalid_products`
Request id: `5107d23a-6591-41b2-a530-bf6d59cd99e0`
HTTP: `200`
Logical/physical business requests: `1/1`
Exact request preserved: `true`

Result:

- `warehouse_ids=[]`

Current warehouses with delivery-invalid products: `0`.

## Business conclusion

At the current observation point the account does not contain a reproducible case matching STD-14:

- no products are currently returned as `INVISIBLE`;
- no warehouses are currently reported as containing products with delivery restrictions.

Therefore the correct seller-facing answer is not to invent a cause. The worker should state that the current cabinet does not show evidence of the requested visibility/delivery problem and that a future investigation would need the exact affected SKU/location if the seller observes the symptom later.

This is a valid live-benchmark outcome:

`NO_CURRENT_ACCOUNT_CASE_FOUND_DO_NOT_FABRICATE_CAUSE`

## Reliability classification

Business answerability: `PASS_NO_CURRENT_CASE_FOUND`.
Business-data reads after recovery: `PASS`.
Current invisible-product evidence: `NONE`.
Current invalid-delivery warehouse evidence: `NONE`.
Operational reliability: `PASS_WITH_RECORDED_PRODUCT_VISIBILITY_EMPTY_FILTER_CONTRACT_GAP`.
Operator intervention required to preserve the business job: `NO`.
Weak-model portability gap: `YES` — account-wide discovery through `product_visibility_info {}` is not deterministic from the current Bridge contract.

## Final marker

`STD_14_PASS_NO_CURRENT_AVAILABILITY_CASE_WITH_PRODUCT_VISIBILITY_EMPTY_FILTER_CONTRACT_GAP_STD_15_READY`
