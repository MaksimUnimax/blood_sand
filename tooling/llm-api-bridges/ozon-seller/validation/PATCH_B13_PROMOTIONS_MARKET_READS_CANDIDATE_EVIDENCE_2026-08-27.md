# B13 Promotions / Market Reads — candidate evidence

Date: 2026-08-27

## Authority

- Accepted B12 authority: `1f659c16408c39955e4aa5a5c5faf0c2bee1c905`
- Accepted B12 production tree: `6362eba1469f9e3fdd3a34a27e33ea6db5d3dce82d851955cbdc06b6104b0caa`
- Exact Seller Swagger: `3933043` bytes
- Exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- Paths: `463`

`OZON_IMPLEMENTATION_CONTRACT_QUEUE_V2` next priority after B12 is `P1_promotions_market_reads`.

## Exact read surface

- `ozon_actions_list` -> `GET /v1/actions` (`Promos`, tag `Promos`, current)
- `ozon_action_candidates` -> `POST /v1/actions/candidates` (`PromosCandidates`, tag `Promos`, current)
- `ozon_action_products` -> `POST /v1/actions/products` (`PromosProducts`, tag `Promos`, current)
- `ozon_auto_add_products` -> `POST /v1/actions/auto-add/products/list` (`ActionsAutoAddProductsList`, tag `PromosBeta`, beta)
- `ozon_auto_add_candidates` -> `POST /v1/actions/auto-add/products/candidates` (`ActionsAutoAddProductsCandidates`, tag `PromosBeta`, beta)

All five exact operations are non-deprecated in the authority Swagger.

## Exact request closure

`GET /v1/actions` has no request body and no parameters.

`POST /v1/actions/candidates` and `POST /v1/actions/products` use `seller_apiGetSellerProductV1Request`:
- required `action_id`;
- `action_id`, optional `limit`, optional `last_id` are OpenAPI `number/double`;
- Swagger specifies no numeric minimum/maximum, so B13 does not invent one.

The two auto-add beta reads require:
- `action_id`: integer/uint64;
- `auto_add_date`: RFC3339 date-time;
- `limit`: integer/uint64, 1..100;
- optional `offset`: integer/uint64.

Unknown fields and transport/auth injection are rejected. Pagination markers are caller-visible only; there is no hidden `last_id` or `offset` loop, retry, fanout or chaining.

## Entitlements and privacy

Exact full-Swagger entitlement compilation gives `ALL_ACCOUNTS` for all five operations with no endpoint subscription types. Full-Swagger unresolved rule count remains `12`.

All five are safe-projection reads. No personal-data gate is required.

## Materialized production identity

- Production file count: `21`
- B13 tree SHA-256: `df77a8cff2e446380ec92c38ba818638ab72cae96d2e0f6a2c2b0f1b4ab854b5`
- Raw patch SHA-256: `3ae79617e1def360f764382466477c23572db1a80d471626702dbe6351ec7ca3`
- Gzip patch SHA-256: `431165f6690175aa1b788fbeabbc541a6c8595e6df8250336710a7e44524ad07`

Changed production files:
- `shared/ozon_operation_registry.js` -> `a86ade0fb3ed7d9654bab9c1809bbd44a4267bd17c2e7088aec5e23c51dfbe9e`
- `shared/ozon_contract.js` -> `4aa5d025443bbe178c0812acc98534aedbf2648090f532f0ae897179a46cf08b`
- `shared/ozon_entitlements.js` -> `bd96f978d2346a9f9a5b2cf083198000ec536e453d3fc0d5dc9743145cc44f08`

All other 18 production files remain byte-identical to B12/B11, including Autorun, Work-session, Manual controls, service worker, provider, transport and guidance.

Author-side deterministic B13 regression passed with the exact Seller Swagger. Seller requests = 0. Performance requests = 0. Credentials used = 0.
