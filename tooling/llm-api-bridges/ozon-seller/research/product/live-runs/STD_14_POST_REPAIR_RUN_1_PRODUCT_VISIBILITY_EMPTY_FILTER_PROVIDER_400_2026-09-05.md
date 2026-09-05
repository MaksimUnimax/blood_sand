# STD-14 post-repair Run 1 — product visibility empty-filter provider 400

Date: 2026-09-05
Canonical question: `Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна?`
Branch: `repair/ozon-date-contract-2026-09-04`

## Purpose

STD-14 requires a real current-account case. No previously preserved live-run is treated as a current case. The first discovery attempt asked `product_visibility_info` for an account-level visibility snapshot with an empty parameter object so that the model would not fabricate a SKU candidate.

## Run 1

Operation: `product_visibility_info`
Params: `{}`
Request id: `2680856b-87ad-4094-97bf-57c2cdc1e60c`
HTTP: `400`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Provider error category: `provider_request`
Provider code: `3`
Automatic retry: `false`

## Contract finding

The current Bridge validator for `product_visibility_info` permits an empty params object because `skus` is only validated when present. The live provider rejected the corresponding empty request with HTTP 400.

Therefore this is not a business zero and not evidence that all products are visible. It is a live contract/provider drift signal:

`PRODUCT_VISIBILITY_INFO_EMPTY_SKUS_LOCALLY_ACCEPTED_BUT_PROVIDER_REJECTED`

This matters for weak-model portability because account-level discovery through this operation is not deterministic from the current Bridge contract.

## Recovery path inside the same business job

Do not skip STD-14 and do not invent a SKU.

Use `seller_product_list` with an explicit provider-supported visibility filter to discover current invisible products:

- `filter.visibility = INVISIBLE`;
- explicit `limit`;
- follow `last_id` only if non-empty.

Then cross any returned candidates with current stock. If no invisible candidates exist, continue the same STD-14 into delivery/logistics restriction surfaces rather than concluding the user scenario is impossible.

## Reliability classification

Business answerability: `IN_PROGRESS`.
Run 1 business evidence: `NONE_DUE_PROVIDER_400`.
Operational reliability: `FAIL_CONTRACT_PROVIDER_DRIFT_PRODUCT_VISIBILITY_EMPTY_FILTER`.
Operator intervention to preserve job: `NO`.
NO_SKIP rule preserved: `YES`.

Checkpoint:
`STD_14_RUN1_PRODUCT_VISIBILITY_EMPTY_FILTER_PROVIDER_400_RECORDED_SELLER_PRODUCT_LIST_INVISIBLE_DISCOVERY_NEXT`
