# Patch B10 Seller Health / Ratings — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B10_SELLER_HEALTH_RATINGS_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact independently tested candidate: `193cdd510368bcb94f8d8d17a7084275fec12add`
- Independent validation commit: `0a61c36b61b8039a09521c1f6425d539a9a9f046`
- Accepted B9 authority: `9996667c1213990c64ae6dc2bfca3cf030d089bc`
- B10 gzip transport SHA-256: `c0a1a486c8a28d6ccfed9338eab6f71f258bf2adf3fd1c0e12a77ac124aec4ea`
- B10 raw patch SHA-256: `44b5527e0cbde268c0e4d6cb378def971369f9815d6a633dae86947a6c68bed3`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `b5af358d19c5e4a720b34f61a6487a20bc07c82c7689a205fde96853c26d46b6`

## Accepted scope

B10 adds the current read-only Seller Health / Ratings core:

- `seller_rating_summary` -> `POST /v1/rating/summary`
- `seller_rating_history` -> `POST /v1/rating/history`
- `seller_fbs_error_index` -> `POST /v1/rating/index/fbs/info`
- `seller_fbs_error_postings` -> `POST /v1/rating/index/fbs/posting/list`

All four operations remain fixed `seller_api`, `READ`, `single_read` operations with no caller-controlled host, URL, path, method, headers or authorization material. No automatic pagination, retry, fanout, provider chaining or mutation is introduced.

## Contract closure

Accepted request behavior includes:

- rating summary sends the exact documented empty JSON object body `{}`;
- rating history validates required RFC3339 date range, documented rating identifiers and optional boolean `with_premium_scores`;
- FBS error index sends no request body and rejects non-empty params;
- FBS error postings validates the documented filter, cursor, limit and posting-number bounds;
- cursor/has_next is exposed to the caller but never followed automatically;
- undeclared fields are rejected.

## Entitlements

The exact Seller Swagger does not declare a subscription restriction for the four accepted B10 operations. They remain all-account reads with no Seller capability probe requirement.

## Exact production identities

Accepted changed production files:

- `shared/ozon_operation_registry.js` -> `783ba48f537e45a0ccc4f0274e8ed5daab97064e3bac6179d9acd33d903db2b7`
- `shared/ozon_contract.js` -> `06c9b3513ee3512ebe5b2b5caa81e51aa9ba9c03df1597f908298399b065d3d9`
- `shared/ozon_entitlements.js` -> `91a1c981f2da5c65f74f812e7912c00d34517e87691566becfd414a378bfacec`

Protected runtime identities remain unchanged, including `content_script.js`, `service_worker.js`, `shared/bridge_autorun_model.js`, `shared/work_session_model.js`, `shared/ozon_provider.js`, `shared/provider_transport_core.js`, `shared/manual_controls.js` and `shared/ozon_guidance.js`.

B7 analytics entitlement parsing, B8 supply semantics and B9 reviews/questions semantics remain preserved.

## Exact Swagger authority

Author-side validation used the original operator-supplied Seller Swagger:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

The exact Swagger gate passed author-side and on the CI candidate artifact. The independent tester did not have the exact raw Swagger and correctly did not substitute another authority.

## CI validation

GitHub Actions run `32962511463` completed successfully on exact candidate `193cdd510368bcb94f8d8d17a7084275fec12add`.

Both Linux and Windows exact-materialization/carry-forward jobs passed.

Artifact `9604407252` was published with GitHub digest:

`sha256:1105f3acc72bbb7435cf6bd210e590fc9e353067553503375cf6634993c8567f`

## Independent validation

Independent validation commit `0a61c36b61b8039a09521c1f6425d539a9a9f046` is exactly one commit ahead of the tested candidate. Its merge-base is the candidate and its only changed file is:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B10_SELLER_HEALTH_RATINGS_INDEPENDENT_TEST_RESULT_2026-08-26.md`

No production file changed in the independent-test commit.

The independent result records:

- exact candidate and B9 authority;
- gzip/raw patch identities matched;
- exact 21-file production tree matched;
- changed production hashes matched;
- B1-B9 carry-forward passed;
- B10 registry/request/contract/entitlement/guidance/protected-runtime gates passed;
- all 18 production JavaScript files passed syntax validation;
- Seller business requests = `0`;
- Performance business requests = `0`;
- credentials used = `0`;
- tester production modifications = `0`.

Independent final decision:

`PATCH_B10_SELLER_HEALTH_RATINGS_INDEPENDENT_TEST_PASS`

## Gate for subsequent work

B10 Seller Health / Ratings is accepted.

Subsequent Ozon expansion must continue evidence-first from this accepted B10 authority. Autorun, Work-session lifecycle, Manual-mode behavior, provider transport, credentials and unrelated runtime semantics remain protected unless separately reviewed and gated.
