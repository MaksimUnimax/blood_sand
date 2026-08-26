# Patch B1 — Assortment Master production implementation result

Date: 2026-08-26
Status: `PATCH_B1_ASSORTMENT_MASTER_CANDIDATE_GREEN`

## Authority

- accepted B0 production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- B1 contract research result: `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED`
- official Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- B1 patch SHA-256: `b5d5cec8a4c72b74374c41704b219dadfaf98001d0e2f3ca8734311fe1e08a41`
- B1 candidate production tree SHA-256: `2a0ec020c5ab02dc771ea909cf70f9b0e7981a992c7b458da80761cf9feac740`

The older implementation queue already assigned these operation IDs, so B1 reuses them rather than inventing aliases:

- `seller_product_list` -> `POST /v3/product/list`
- `seller_product_info_list` -> `POST /v3/product/info/list`
- `seller_product_attributes` -> `POST /v4/product/info/attributes`

The existing accepted B0 taxonomy places the first two in `catalog_products.product_list_info` and the attributes method in `catalog_products.attributes_categories`.

## Production delta

Exactly three production files change relative to accepted B0:

- `shared/ozon_operation_registry.js` -> `286f7746a3c45601dd973cba51d604778ae34d6911c323e818e5756eff7f0853`
- `shared/ozon_contract.js` -> `c633b190a4353501c7b683a8bbbdb799a8b5ae78520a6187fbb874449b64b1b1`
- `shared/ozon_entitlements.js` -> `ede46ce2112d8c07c70855e37dbac2ac82c7fa9746d5c2cf3e4f8c1d75022764`

No `service_worker.js`, `content_script.js`, Autorun, Work-session, manual-control, provider, transport, credentials, cache/history/no-replay, or timing code changes are part of B1.

## Contract behavior

- fixed Seller API host, POST method and exact path for all three operations;
- strict root/filter field allowlists;
- Product List identifier arrays and `limit` respect current Swagger/documented 1..1000 bounds;
- Product List rejects more than one identifier group in one command;
- Product Info List requires exactly one homogeneous identifier group and max 1000 items;
- `product_id` / `sku` / `skus` are validated as string int64 values, avoiding unsafe JS number coercion;
- current Product visibility values are allowlisted from the supplied Swagger snapshot;
- Attributes `limit` is 1..1000;
- Attributes `sort_by` and `sort_dir` are preserved as non-empty strings because the raw schema has no enum and the official `sort_dir` description/example are inconsistent;
- `last_id` is caller-controlled; no automatic continuation exists;
- each command builds one fixed request; no hidden retry, fanout, pagination or report workflow is added;
- bundled entitlement LKG contains ordinary `ALL_ACCOUNTS` rules for the three endpoints; dynamic Swagger compiler independently yields the same classification for the supplied official snapshot.

## Deterministic local validation

Passed markers:

- `B1_ASSORTMENT_REGISTRY_PASS`
- `B1_ASSORTMENT_EXACT_REQUEST_PASS`
- `B1_ASSORTMENT_CONTRACT_PASS`
- `B1_ASSORTMENT_ENTITLEMENTS_PASS`
- `B1_ASSORTMENT_GUIDANCE_PASS`
- `B1_NO_HIDDEN_PAGINATION_FANOUT_PASS`
- `B1_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS`
- `B1_PROTECTED_B0_IDENTITIES_PASS`
- `B1_PATCH_BYTE_EXACT_APPLY_PASS`

All candidate production JavaScript files pass `node --check`.

No real Seller or Performance business request was made during implementation validation.
