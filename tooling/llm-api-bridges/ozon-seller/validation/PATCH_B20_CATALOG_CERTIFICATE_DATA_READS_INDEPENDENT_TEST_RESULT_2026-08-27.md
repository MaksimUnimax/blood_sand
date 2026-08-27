# B20 Catalog Certificate Data Reads — independent test result

- Tested commit: `515f6f890ee413547864e857d1f42698f59a5163`
- Accepted B19 authority: `23586900e59de9f743fe9fc2aac6e5883c644b4b`
- Direct parent/one-commit ancestry and authorized six-file validation-only delta: PASS; no production extension file is directly committed.
- Gzip patch SHA-256: `a56cfc934f42a6b4ad9f67a71fd7e230a280c84779f2a92071f773663c1ed190` — PASS.
- Raw patch SHA-256: `b72ccb007d13aafd904c3ff6aee8aef1a9bcbf3085271d7e4f087539d112abb2` — PASS.
- Materialized production tree: 21 files; SHA-256 `126ac9add7c099b758a962415fdbf0c662e00f0b51482228cf9c58a01afd7496` — PASS.

Changed identities PASS: `shared/ozon_operation_registry.js` `0b1070274aeee2c7cf048424da451d498b5021c7d263f841acae152774d73cb9`; `shared/ozon_contract.js` `de52a36b82093b3eb13ade808d680a878e55e10c716cc4ee6e2b7738534bbcf6`; `shared/ozon_entitlements.js` `ff37a2b368a7cf24321ac3017892f5eb61042b7405fc903822dd064717623eda`.

Protected runtime identities PASS: content `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`; worker `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`; Autorun `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`; Work lifecycle `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`; provider `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`; transport `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`; Manual `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`; guidance `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`.

Materializer command executed with `--repo-root D:\codex\Test\ozon-b20-independent-source-20260827 --work-root D:\codex\Test\ozon-b20-work-20260827 --out D:\codex\Test\ozon-b20-independent-20260827`.

```text
PATCH_B20_B19_BASE_IDENTITY_PASS
PATCH_B20_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B20_PATCH_APPLY_PASS
PATCH_B20_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B20_CHANGED_FILE_IDENTITIES_PASS
PATCH_B20_PROTECTED_B19_IDENTITIES_PASS
PATCH_B20_TREE_MANIFEST_SHA256_PASS
```

All predecessor A1–A5/B0–B19 materializer gates passed. Accepted B19 base regression passed all B19 markers. B20 regression passed:

```text
B20_CATALOG_CERTIFICATE_DATA_REGISTRY_PASS
B20_CATALOG_CERTIFICATE_DATA_EXACT_REQUEST_PASS
B20_CATALOG_CERTIFICATE_DATA_CONTRACTS_PASS
B20_CATALOG_CERTIFICATE_DATA_ENTITLEMENTS_PASS
B20_CATALOG_CERTIFICATE_DATA_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B20_CATALOG_CERTIFICATE_DATA_PROTECTED_RUNTIME_IDENTITIES_PASS
B20_SYNTAX_PASS JS=18
```

The regression passed three fixed Seller read contracts: `product_certificate_info`, `product_certificate_list`, and `product_certificate_products`. It permits the documented empty certificate number; validates int32 page/page_size and B20's newer limit-only products branch; rejects deprecated products `page/page_size`, invalid/injected fields and unsafe IDs; and does not invent undocumented lower bounds.

Entitlements execute without Seller capability probes. Certificate mutations remain excluded. No arrays, page/last-id loops, automatic pagination/retry, fanout, document fetch, chained request or provider chaining passed. B19 and earlier routes/entitlements, Premium parser and analytics constants are preserved by carry-forward.

`B20_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

No exact local Swagger existed; no substitute was downloaded. The named final CI artifact was not retrieved because GitHub Actions CLI tooling is unavailable; this is permitted after exact independent materialization.

- Seller business requests: `0`
- Performance business requests: `0`
- Credentials used: `0`
- Tester production modifications: `0`

PATCH_B20_CATALOG_CERTIFICATE_DATA_READS_INDEPENDENT_TEST_PASS
