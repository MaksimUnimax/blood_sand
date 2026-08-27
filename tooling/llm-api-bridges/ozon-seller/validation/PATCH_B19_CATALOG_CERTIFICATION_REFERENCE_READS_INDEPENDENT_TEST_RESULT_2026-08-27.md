# B19 Catalog Certification Reference Reads — independent test result

- Tested commit: `ae34aa6218b675d2c7d91bee7a605fb92d6b86e5`
- Accepted B18 authority: `f8c0a706bdd5d5d763e50f1162ba7989ed064908`
- Direct parent/one-commit ancestry and authorized six-file validation-only delta: PASS; no production extension file is directly committed.
- Gzip patch SHA-256: `d4e87ee9f255c6c739c6801971067452cbf4230bce7f4c1a92bd06b32bddfefb` — PASS.
- Raw patch SHA-256: `3cd1aecccea0ce438f8b1a9f6b7348eeabf900059d1f3324073ce8266496071d` — PASS.
- Materialized production tree: 21 files; SHA-256 `5d67ec8a6b58d510898ddd87de8c8ced3ef3c1233e67680a476e46baef409615` — PASS.

Changed production identities PASS: `shared/ozon_operation_registry.js` `5ebd0cec2a925ba1141f0416008c54329dcba49f43453633f9c2ea8d727ad4a3`; `shared/ozon_contract.js` `54e46903122145780175ca72b1416c89c03d41d59d8e3efa6fb0fa4e201af228`; `shared/ozon_entitlements.js` `e85a979449c6741bfbfb60911213f8e0ecbf1d9a531091f2921310c6d1f074c8`.

Protected runtime identities all PASS: `content_script.js` `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`; `service_worker.js` `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`; `bridge_autorun_model.js` `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`; `work_session_model.js` `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`; `ozon_provider.js` `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`; `provider_transport_core.js` `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`; `manual_controls.js` `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`; `ozon_guidance.js` `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`.

Materializer command executed:

```text
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling\llm-api-bridges\ozon-seller\validation\materialize_patch_b19_catalog_certification_reference_reads_candidate.py --repo-root D:\codex\Test\ozon-b19-independent-source-20260827 --work-root D:\codex\Test\ozon-b19-work-20260827 --out D:\codex\Test\ozon-b19-independent-20260827
PATCH_B19_B18_BASE_IDENTITY_PASS
PATCH_B19_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B19_PATCH_APPLY_PASS
PATCH_B19_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B19_CHANGED_FILE_IDENTITIES_PASS
PATCH_B19_PROTECTED_B18_IDENTITIES_PASS
PATCH_B19_TREE_MANIFEST_SHA256_PASS
```

All predecessor A1–A5/B0–B18 materialization gates passed. The accepted B18 base regression passed all B18 markers. B19 regression passed:

```text
B19_CATALOG_CERTIFICATION_REGISTRY_PASS
B19_CATALOG_CERTIFICATION_EXACT_REQUEST_PASS
B19_CATALOG_CERTIFICATION_CONTRACTS_PASS
B19_CATALOG_CERTIFICATION_ENTITLEMENTS_PASS
B19_CATALOG_CERTIFICATION_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B19_CATALOG_CERTIFICATION_PROTECTED_RUNTIME_IDENTITIES_PASS
B19_SYNTAX_PASS JS=18
```

The regression passed seven fixed `seller_api` read-only, safe-projection, single-read operations: brand company certification list; three true no-body certificate-status/rejection dictionaries; two no-body GET dictionaries; and v2 product certification categories. It enforces int32/int64 representation and documented page-size limits without inventing unspecified page bounds, rejects unknown/injected input, and has no request arrays, page loops, pagination, retry, fanout or provider chaining.

It passed v1 certification legacy-route exclusion, v2 accordance-types-only surface, entitlement execution without capability probes, certificate mutation exclusion, and carry-forward preservation of B18–B7 operations, entitlements, Premium parsing and analytics constants.

`B19_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

The exact raw Swagger was unavailable locally, and no substitute was downloaded or used. The CI artifact was not retrieved because GitHub Actions CLI tooling is unavailable; this is permitted after exact independent materialization.

- Seller business requests: `0`
- Performance business requests: `0`
- Credentials used: `0`
- Tester production modifications: `0`

PATCH_B19_CATALOG_CERTIFICATION_REFERENCE_READS_INDEPENDENT_TEST_PASS
