# Patch B6 Performance API Read Core — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B6_PERFORMANCE_READ_CORE_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact independently tested candidate: `d54bd90179454159c22c5db1f3743a0357dbe23f`
- Independent validation commit: `94d17aa9467edc1886c129efe3376d930ebeaa02`
- Accepted B5 authority: `e296ff76b975470e8e12e566e2c4aff29adea00c`
- B6 gzip transport SHA-256: `04f4151c035b14698107e3e7a54cf6da3c4f137b7a294db976e8df2d5a9c2ac9`
- B6 raw patch SHA-256: `2b780f1d4bba1e6b4bf2b2a8d6072163bd534f505c63a2f209b95dc21c4bfd9f`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57`

## Accepted production scope

B6 enables exactly these six fixed Performance API reads:

- `performance_campaign_objects` -> `GET /api/client/campaign/{campaignId}/objects`
- `performance_bid_limits` -> `GET /api/client/limits/list`
- `performance_campaign_products` -> `GET /api/client/campaign/{campaignId}/v2/products`
- `performance_search_promo_products` -> `POST /api/client/campaign/search_promo/v2/products`
- `performance_media` -> `GET /api/client/statistics/campaign/media/json`
- `performance_sku_statistics` -> `POST /api/client/statistics/products/sku`

All are fixed single-read operations using provider `performance_api`. Campaign path substitution is limited to the fixed `{campaignId}` placeholder after strict string-uint64 validation. Caller-controlled host, URL, path, method, headers and authorization injection remain forbidden.

B6 preserves the existing JSON Performance routes:

- `/api/client/statistics/expense/json`
- `/api/client/statistics/daily/json`
- `/api/client/statistics/campaign/product/json`

## Side-effect and mutation boundary

Known asynchronous Performance report creation/generation endpoints remain blocked fail-closed and are not exposed as bridge reads. No hidden create/poll/retrieve report workflow is authorized.

The existing Performance mutation blocklist remains active for campaign creation/editing, activation/deactivation, promoted-product changes, bid changes and Search Promo mutations.

Performance reads do not use Seller subscription capability probing and do not invent Seller entitlement rules for Performance API access.

## Exact production delta

Exactly two production files differ from accepted B5:

- `shared/ozon_operation_registry.js` -> `d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b`
- `shared/ozon_contract.js` -> `e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7`

`shared/ozon_entitlements.js` remains byte-identical to B5:

- `e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0`

No service-worker, content-script, Autorun, Work-session, Manual-control, provider transport, credentials, quota/cache/history/no-replay, timing or delivery production code changed in B6.

## Deterministic and CI validation

Author-side exact validation used the original operator-supplied Performance Swagger:

- byte length: `304771`
- SHA-256: `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`
- paths: `47`
- HTTP operations: `48`

The exact Swagger-backed regression passed with:

`B6_PERFORMANCE_EXACT_SWAGGER_PASS`

GitHub Actions run `32951552908` completed successfully on the exact candidate `d54bd90179454159c22c5db1f3743a0357dbe23f` with both Linux and Windows exact materialization/regression jobs passing.

CI artifact `9600323966` was independently downloaded and inspected author-side:

- artifact ZIP SHA-256: `02120eb9d2abcf44118f35021cde39e6d41619cb282368d958c9ef7655f0e0f5`
- production file count: `21`
- production tree: `2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57`
- changed and protected core hashes matched
- B6 deterministic regression on the CI artifact with the exact Swagger again emitted `B6_PERFORMANCE_EXACT_SWAGGER_PASS`

## Independent validation

Independent validation commit `94d17aa9467edc1886c129efe3376d930ebeaa02` is exactly one commit ahead of the tested B6 candidate, with merge-base equal to the candidate and exactly one added file:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B6_PERFORMANCE_READ_CORE_INDEPENDENT_TEST_RESULT_2026-08-26.md`

No production file changed in the independent-test commit.

The independent result records:

- exact candidate revision tested;
- gzip and raw patch identities matched;
- 21-file tree identity matched;
- all B1-B5 carry-forward regressions passed;
- all B6 deterministic gates passed;
- all 18 production JavaScript files passed syntax validation;
- six fixed read contracts and path substitution were inspected;
- async report side effects remained blocked;
- Performance mutations remained blocked;
- Seller capability probing remained absent for Performance reads;
- Seller business requests = `0`;
- Performance business requests = `0`;
- credentials used = `0`;
- tester production modifications = `0`.

The exact raw Performance Swagger and optional CI artifact were not available in the independent tester environment. The tester correctly did not substitute another authority. Those exact gates had already passed author-side and on the CI artifact, so this environment-only omission is not an acceptance failure.

Independent final decision:

`PATCH_B6_PERFORMANCE_READ_CORE_INDEPENDENT_TEST_PASS`

## Protected semantics

No retry, hidden pagination/continuation, fanout, report creation/polling/retrieval, credential exposure, provider ownership change, timing reset, Autorun behavior change, Work-session lifecycle change or Manual-mode behavior change is authorized by B6.

## Gate for subsequent work

B6 Performance API Read Core is accepted.

Subsequent work must continue evidence-first from this accepted B6 authority. Performance mutations and asynchronous report-generation workflows remain out of scope unless separately reviewed and gated.