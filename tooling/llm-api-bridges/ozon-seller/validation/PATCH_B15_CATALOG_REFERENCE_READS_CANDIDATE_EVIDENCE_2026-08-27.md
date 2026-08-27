# Patch B15 Catalog Reference Reads — candidate evidence

- Accepted B14 authority: `b3f16b6d9cc318aa1721fd12c52efc1b2714e9a1`
- Accepted B14 production tree: `fb4877ad074f86d0a855d51b67bcb5b574a2bfc88727f63b83927ff5eb8e64fa`
- Exact Seller Swagger: `3933043` bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI `3.0.0`, `463` paths.
- B15 raw patch SHA-256: `02db694b62064385d830ddb1c78ff625f5a47ee61de2bd7cf5fd6d6b82907d3f`
- B15 gzip patch SHA-256: `56ec5f5714df257875cafe01a861e55281bf1332984d52a8b692870e9b4e2f82`
- B15 production tree: `401692a486696189cc9bf81f58fd2066fe3babfb087747a7ccbb8519bacce07f`
- Production file count: `21`

Changed production files only:

- `shared/ozon_operation_registry.js` -> `2b2821c8a19095c4cc21b6a819cb0f7c632d0eba369b272e8adc4761268069e4`
- `shared/ozon_contract.js` -> `8bb6f6419cce892d0e7eb1a425039c83b55319d6df91f69666d981615b9a53bf`
- `shared/ozon_entitlements.js` -> `112fabe641f9be2f32c23f9cbdcf4e86d20f9016c52b7a0c80a00c48dc01c1e4`

B15 adds four fixed safe reads:

1. `description_category_tree` -> `POST /v1/description-category/tree`
2. `description_category_attributes` -> `POST /v1/description-category/attribute`
3. `description_category_attribute_values` -> `POST /v1/description-category/attribute/values`
4. `description_category_attribute_values_search` -> `POST /v1/description-category/attribute/values/search`

All four are current, non-deprecated `CategoryAPI` methods in the exact operator-supplied Swagger. Exact entitlement compilation resolves all four as `ALL_ACCOUNTS` with no capability probe.

Contract closure:

- category tree accepts only optional language enum `DEFAULT|RU|EN|TR|ZH_HANS`;
- category attributes requires safe int64 `description_category_id` and `type_id`, with optional language;
- attribute values requires `attribute_id`, `description_category_id`, `limit`, `type_id`; limit is `1..2000`; optional `last_value_id` remains explicit and is never auto-followed;
- attribute-value search requires the same identifiers, `limit 1..100`, and search text of at least 2 characters;
- no hidden pagination, retry, fanout or provider chaining;
- no production runtime file outside registry/contract/entitlements changes.

Author-side exact-Swagger regression passed:

- `B15_CATALOG_REFERENCE_REGISTRY_PASS`
- `B15_CATALOG_REFERENCE_EXACT_REQUEST_PASS`
- `B15_CATALOG_REFERENCE_CONTRACTS_PASS`
- `B15_CATALOG_REFERENCE_ENTITLEMENTS_PASS`
- `B15_CATALOG_REFERENCE_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS`
- `B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS`
- `B15_CATALOG_REFERENCE_EXACT_SWAGGER_CURRENTNESS_PASS`
- `B15_CATALOG_REFERENCE_EXACT_ENTITLEMENTS_PASS`
- `B15_CATALOG_REFERENCE_PROTECTED_RUNTIME_IDENTITIES_PASS`

No real Seller/Performance request or credential was used to produce the candidate.
