# Patch B2 — Prices / Listing State contract closure gate

Date: 2026-08-26
Status: `B2_CONTRACT_RESEARCH_AUTHORIZED`

## Roadmap authority

B2 starts only after accepted B1 Assortment Master.

The existing implementation queue places `P0_prices_listing_state` immediately after `P0_assortment_master`.

This gate covers exactly these four current read methods:

1. `/v5/product/info/prices`
2. `/v1/product/prices/details`
3. `/v1/seller-actions/list`
4. `/v1/seller-actions/products/list`

Existing operation IDs from the repository queue must be reused:

- `product_prices_bulk`
- `product_price_details`
- `seller_actions_list`
- `seller_action_products`

No alias is to be invented when an existing queue ID exists.

## Sole contract authority

Use the fixed Ozon-owned Seller API Swagger source:

`https://docs.ozon.ru/api/seller/swagger.json`

The exact operator-supplied Swagger artifact already used for B1 may be reused only if its SHA-256 is exactly:

`39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`

Expected byte length:

`3933043`

Do not substitute a mirror, SDK, forum post, third-party API description, or model memory.

## Evidence required before implementation

For each target capture:

- exact HTTP method and path;
- operationId and deprecation state;
- required auth headers;
- requestBody required state as actually represented;
- request schema required fields;
- exact request field allowlist;
- array/item types, enums, formats and bounds;
- explicit cursor/offset/limit semantics;
- response continuation fields;
- response identifiers and price/action fields required for joins;
- endpoint-local subscription restrictions;
- documented errors;
- any current deprecation/replacement wording.

If a schema uses `uint64` as a JSON number, implementation must not silently coerce an unsafe JavaScript number. A safe representable subset may be enforced rather than corrupting the identifier.

## Safety boundary

Research stage:

- Seller business requests: `0`
- Performance requests: `0`
- credentials: `0`
- production modifications: `0`
- no Autorun or Work-session changes
- no provider retry/pagination/fanout/report polling

Only exact evidence may authorize production implementation.
