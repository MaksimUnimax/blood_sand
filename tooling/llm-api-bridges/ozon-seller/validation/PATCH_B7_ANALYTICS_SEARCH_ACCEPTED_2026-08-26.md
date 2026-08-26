# Patch B7 Analytics / Search — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B7_ANALYTICS_SEARCH_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact independently tested candidate: `27f1b2d0e94282ff45eae2be27a1e03170e422c7`
- Independent validation commit: `f929121d54b01a8ddba9bd5c066cddb6e7cb1a4f`
- Accepted B6 authority: `d6ec73e48e3ad51da23323016b2dcdf34f21ef0c`
- B7 gzip transport SHA-256: `a3d88d1be345254aa99522f148c01907111bbd3d87463b22d632f5ea0f15fb3a`
- B7 raw patch SHA-256: `4c1de93a97938f9541936cd1edf8060a21b93acf19b296f16cf81a4994cfeac4`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `dbac8600c41367ad7ba270f5391b48e11e2244c1d8fa0d1018baa712c0d0627c`

## Accepted scope

B7 closes roadmap priority `P1_analytics_search` by exact contract revalidation of the three already-enabled Seller API reads inherited from B0:

- `analytics_data` -> `POST /v1/analytics/data`
- `product_queries` -> `POST /v1/analytics/product-queries`
- `product_queries_details` -> `POST /v1/analytics/product-queries/details`

No endpoint was added, removed, renamed, or rerouted in B7. Their fixed `seller_api` JSON single-read request semantics remain unchanged, including no arbitrary URL/host/path/method/header/auth injection, no hidden retry, no automatic pagination, and no fanout.

## Proven defect and accepted fix

Exact Seller Swagger revalidation established one production mismatch in the entitlement compiler. The pre-B7 Premium Pro text matcher could classify the ordinary Premium documentation URL slug `premium-program` as `premium-pro` because it matched that substring without a terminating word boundary.

That false positive incorrectly widened the field-level restricted sort entitlement for `POST /v1/analytics/product-queries/details` to include Premium Pro even though the exact Swagger field description authorizes only Premium and Premium Plus.

B7 fixes only that parser boundary. Real Premium Pro references such as `podpiska-premium-pro` continue to resolve as Premium Pro.

## Exact production delta

Exactly one production file differs from accepted B6:

- `shared/ozon_entitlements.js` -> `c22377e2224564646ca29637491e9cb719a466adee68d1ca2bebf0a80b3c7530`

Protected identities remain unchanged, including:

- `shared/ozon_operation_registry.js` -> `d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b`
- `shared/ozon_contract.js` -> `e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7`
- `content_script.js` -> `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js` -> `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js` -> `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js` -> `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js` -> `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` -> `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js` -> `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`

No Autorun, Work-session lifecycle, Manual-mode behavior, provider transport, credentials, timing, quota/cache/history/no-replay, retry, pagination, or delivery production semantics changed in B7.

## Exact Swagger authority and validation

Author-side exact validation used the original operator-supplied Seller Swagger:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

The exact Swagger-backed regression passed author-side and again on the downloaded CI artifact with:

- `B7_ANALYTICS_SEARCH_EXACT_SWAGGER_PASS`
- `B7_ANALYTICS_ENTITLEMENT_COMPILER_EXACT_PASS`

The accepted compiler result preserves:

- `product_queries_details_restricted_sort` -> Premium + Premium Plus only;
- `analytics_data` restricted metrics/dimensions/history -> Premium Plus + Premium Pro where authorized;
- product-query older-history rules -> Premium + Premium Plus + Premium Pro where authorized;
- both product-query base operations as `ALL_ACCOUNTS_PARTIAL_RESPONSE`.

The dedicated `analytics_data` quota scheduler remains unchanged with the provider minimum interval of 60 seconds plus 5 seconds launch safety.

## CI validation

GitHub Actions run `32953550747` completed successfully on the exact candidate `27f1b2d0e94282ff45eae2be27a1e03170e422c7`.

Both jobs passed:

- Linux exact materialization + B1-B7 regression chain + JavaScript syntax + artifact publication;
- Windows gzip/raw identity + exact materialization + B1-B7 regression chain + JavaScript syntax.

CI artifact `9601079630` was downloaded and independently inspected author-side:

- artifact ZIP SHA-256: `5b04e5eaf15e2a40c68ecbdb0f7f58cd85e96a4e35bb65b3bfa33f8d9a89c5f0`
- production file count: `21`
- production tree SHA-256: `dbac8600c41367ad7ba270f5391b48e11e2244c1d8fa0d1018baa712c0d0627c`
- changed and protected identities matched;
- exact Seller Swagger regression on the artifact passed.

## Independent validation

Independent validation commit `f929121d54b01a8ddba9bd5c066cddb6e7cb1a4f` is exactly one commit ahead of the tested B7 candidate. Its merge-base is the candidate and the only changed file is:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B7_ANALYTICS_SEARCH_INDEPENDENT_TEST_RESULT_2026-08-26.md`

No production file changed in the independent-test commit.

The independent result records:

- exact candidate revision tested;
- gzip/raw patch identities matched;
- exact 21-file production tree matched;
- B1-B6 carry-forward regressions passed;
- all B7 deterministic gates passed;
- all 18 production JavaScript files passed syntax validation;
- Premium URL false-positive regression passed;
- real Premium Pro detection remained intact;
- analytics quota runtime remained unchanged;
- protected B6 identities matched;
- Seller business requests = `0`;
- Performance business requests = `0`;
- credentials used = `0`;
- tester production modifications = `0`.

The exact raw Seller Swagger and optional CI artifact were unavailable in the tester environment. The tester correctly did not substitute another authority. Those exact gates had already passed author-side and on the CI artifact, so this environment-only omission is not an acceptance failure.

Independent final decision:

`PATCH_B7_ANALYTICS_SEARCH_INDEPENDENT_TEST_PASS`

## Gate for subsequent work

B7 Analytics / Search is accepted.

Subsequent work must continue evidence-first from this accepted B7 authority. The next roadmap priority is `P1_supply_replenishment`; runtime lifecycle and unrelated provider semantics remain protected unless separately reviewed and gated.
