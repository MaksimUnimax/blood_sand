# R4 — Stage 06 Ozon Tier A enrichment contract verification — 2026-08-26

Status: **PASS — exact current v0.1.19 read-only contract verified**

## Purpose

Verify the exact Ozon Bridge v0.1.19 operation names and legal request shapes before asking for any Tier A product-passport enrichment. No operation names or parameters are inferred from generic Ozon API knowledge.

## Accepted bridge authority

Current development authority used by the operator is the accepted B8 tree on:

- branch: `feature/ozon-b8-supply-replenishment-2026-08-26`
- B8 accepted candidate: `d40d213de9c6d753f21525a4797671401d585218`
- accepted production tree SHA-256: `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`
- accepted B8 document: `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B8_SUPPLY_REPLENISHMENT_ACCEPTED_2026-08-26.md`

B8 independent validation explicitly passed the B1–B6 carry-forward gates. Therefore the previously accepted B1 Assortment Master operations remain part of the current B8 v0.1.19 contract.

## Exact accepted B1 product-master operations

B1 acceptance adds exactly:

- `seller_product_list` -> `POST /v3/product/list`
- `seller_product_info_list` -> `POST /v3/product/info/list`
- `seller_product_attributes` -> `POST /v4/product/info/attributes`

Authority:
- `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_ACCEPTED_2026-08-26.md`
- `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_REGRESSION_2026-08-26.mjs`
- `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_CONTRACT_RESEARCH_RESULT_2026-08-25.md`

The current B1 contract was closed against the operator-supplied Ozon Seller OpenAPI 3.0 artifact:
- Ozon Seller document version `2.1`;
- byte length `3933043`;
- SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`;
- 463 paths;
- target local `$ref` closure complete, unresolved refs `0`.

## Exact request shapes relevant to Stage 06

### `seller_product_info_list`

Accepted regression command:

```json
{"operation":"seller_product_info_list","params":{"sku":["1602711278"]}}
```

Contract:
- fixed `POST /v3/product/info/list`;
- request body required;
- identifier arrays: `offer_id`, `product_id`, `sku`;
- exactly one homogeneous identifier group in one bridge command;
- identifiers validated without unsafe JS int64 coercion;
- maximum 1000 products;
- no pagination field;
- response: `items[]`;
- one explicit command -> one physical Seller request; no hidden fanout/retry/pagination.

### `seller_product_attributes`

Accepted regression command shape:

```json
{"operation":"seller_product_attributes","params":{"filter":{"product_id":["1082848375"],"visibility":"AUTO_ARCHIVED"},"last_id":"","limit":1000,"sort_by":"title","sort_dir":"ASC"}}
```

Contract:
- fixed `POST /v4/product/info/attributes`;
- request body required;
- filters: `offer_id`, `product_id`, `sku`, `visibility`;
- explicit `last_id` + `limit` pagination;
- `limit` 1..1000;
- documented sort fields include `sku`, `offer_id`, `id`, `title`;
- no automatic continuation;
- response continuation: `last_id`; response total: `total`.

## Tier A first request decision

First request will use **one** `seller_product_info_list` command for the five Tier A SKUs because:
- all five identifiers are the same homogeneous `sku` type;
- 5 is safely below the max 1000;
- the endpoint has no pagination;
- one bridge command produces one physical Seller request;
- this is the smallest request that can refresh common current product/listing facts for all five priority identities without a five-request fanout.

Tier A SKU set:
1. Печать Велеса — `1636048691`
2. Велес — `1636041142`
3. Алатырь — `1640251697`
4. Vegvisir — `1602722942`
5. Шлем Ужаса — `1602717077`

Planned exact command:

```text
OZON_API_V1
{"operation":"seller_product_info_list","params":{"sku":["1636048691","1636041142","1640251697","1602722942","1602717077"]}}
```

The result must be saved before any attributes request. Attributes will be a separate explicit command chosen only after inspecting what `seller_product_info_list` actually closes in the passports.

## Decision

`TIER_A_PRODUCT_INFO_LIST_CONTRACT_VERIFIED_PASS`
