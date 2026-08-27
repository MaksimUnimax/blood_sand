# B21 Return Giveout Reads — independent test result

- Tested commit: `2e2cbc4120a218e13b407c4c011cdbc9239bcbbf`
- Accepted B20 authority: `a85bce42c2b25677b8870b7847357f7df56204b3`
- Direct parent/one-commit ancestry and authorized six-file validation-only delta: PASS; no production extension file is directly committed.
- Gzip patch SHA-256: `20ea8158edadd35445099fe9bf4431de76e4f14f3a26b6cf51e150c11ecc078f` — PASS.
- Raw patch SHA-256: `b67665029fc8ae962aa390178fadc210f403e9ceac77107068f049a64f148321` — PASS.
- Materialized production tree: 21 files; SHA-256 `d65663eddb81b90261d5dc45824b5634d20545b4227afd5aac957350c1f118e7` — PASS.

Changed identities PASS: registry `6e4f4bb5a7d0ddd0350cd3edecfbdea806c6b51ec05e708ed6cff483d69c9470`; contract `18c2d80bbada1b12ce57cf7aec2686020b4f8cde45952a5dfef94eb0a6186887`; entitlements `e662ac981bbc1e9c305a00743a91ebf422dac52d4fc07790399116e84dd58fb7`.

Protected runtime identities PASS: content `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`; worker `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`; Autorun `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`; Work lifecycle `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`; provider `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`; transport `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`; Manual `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`; guidance `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`.

Materializer executed with `--repo-root D:\codex\Test\ozon-b21-independent-source-20260827 --work-root D:\codex\Test\ozon-b21-work-20260827 --out D:\codex\Test\ozon-b21-independent-20260827`.

```text
PATCH_B21_B20_BASE_IDENTITY_PASS
PATCH_B21_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B21_PATCH_APPLY_PASS
PATCH_B21_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B21_CHANGED_FILE_IDENTITIES_PASS
PATCH_B21_PROTECTED_B20_IDENTITIES_PASS
PATCH_B21_TREE_MANIFEST_SHA256_PASS
```

All predecessor A1–A5/B0–B20 materializer gates passed. Accepted B20 base regression passed all B20 markers. B21 regression passed:

```text
B21_RETURN_GIVEOUT_REGISTRY_PASS
B21_RETURN_GIVEOUT_EXACT_REQUEST_PASS
B21_RETURN_GIVEOUT_CONTRACTS_PASS
B21_RETURN_GIVEOUT_ENTITLEMENTS_PASS
B21_RETURN_GIVEOUT_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B21_B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B21_RETURN_GIVEOUT_PROTECTED_RUNTIME_IDENTITIES_PASS
B21_SYNTAX_DECLARED_JS=18
B21_SYNTAX_PASS JS=18
```

The regression passed four fixed single-read Seller API contracts: FBS return-company info, giveout availability, giveout list, and giveout info. It applies the documented FBS limit maximum 500 without inventing a lower bound, validates safe/int32/int64 representation, uses explicit last IDs only, and rejects unknown/injected data. It passed no arrays, automatic pagination/retry, fanout, chaining, or provider chaining.

Barcode, PDF/PNG barcode retrieval, and barcode reset are all excluded. Entitlements execute without Seller capability probes; B20 and prior accepted routes, review/question entitlements, Premium parsing and analytics constants remain preserved by carry-forward.

`B21_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

The exact raw Swagger was unavailable locally and no substitute was downloaded. The named CI artifact was not retrieved because GitHub Actions CLI tooling is unavailable; this is permitted after exact independent materialization.

- Seller business requests: `0`
- Performance business requests: `0`
- Credentials used: `0`
- Tester production modifications: `0`

PATCH_B21_RETURN_GIVEOUT_READS_INDEPENDENT_TEST_PASS
