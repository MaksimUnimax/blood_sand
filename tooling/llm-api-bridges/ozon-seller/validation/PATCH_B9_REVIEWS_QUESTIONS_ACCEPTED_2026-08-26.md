# Patch B9 Reviews / Questions — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B9_REVIEWS_QUESTIONS_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact independently tested candidate: `ae222f9a07d8fd4ca40f4894cbe2baf01ae71887`
- Independent validation commit: `bd4f9a263ca741e5bc112927327520cf7eb284ab`
- Accepted B8 authority: `600a6922fd3f339fb2d57bc3828d51ecba1670d7`
- B9 gzip transport SHA-256: `5974889dffd45003b505d8be4d088366fdd5118578ca96358d609e0797704e7f`
- B9 raw patch SHA-256: `b938688273bbf66732d9c45b4765e7a87db94f5e1d6a1a5ce2ccc1060aa4bb8a`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `d955dbfd1a667e40ea0cb04374b31e0cfe95bbf75b3b355d11c50d10f748a6d5`

## Accepted scope

B9 closes roadmap priority `P2_reviews_questions` with the current Seller API read core:

- `review_list` -> `POST /v2/review/list`
- `review_info` -> `POST /v2/review/info`
- `question_list` -> `POST /v1/question/list`

All three operations remain fixed `seller_api`, `READ`, `single_read`, `json_body` operations. No caller-controlled host, URL, path, HTTP method, headers, authorization material, retry, automatic pagination, identifier fanout, provider chaining, comment retrieval or secondary media fetch is introduced.

## Currentness boundary

The historical queue paths `/v1/review/list` and `/v1/review/info` are not promoted. The exact Seller Swagger marks them deprecated and points to the current replacements `/v2/review/list` and `/v2/review/info`.

`/v1/question/list` remains current.

Review/comment/question mutations remain blocked, including:

- `/v1/review/comment/create`
- `/v2/review/comment/delete`
- `/v2/review/change-status`
- `/v1/question/answer/create`
- `/v1/question/answer/delete`
- `/v1/question/change-status`

B9 is read-only.

## Contract closure

Accepted request contracts include:

- `review_list.limit` required, minimum 20, maximum 100;
- `review_list.sort_dir` exact enum `ASC|DESC`;
- review status/order-status filters closed to documented enums;
- review SKU filters remain string `int64`, maximum 1000;
- review publish timestamps validate as RFC3339 and reject reversed ranges;
- `review_info.review_id` is required and string-typed;
- `question_list` has no required properties and supports only the documented filter/last_id/limit/sort_dir surface;
- optional `question_list.limit` has maximum 100 with no invented lower bound;
- undeclared fields are rejected;
- no hidden `last_id` continuation or pagination loops are performed.

## Personal-data policy

All three accepted operations remain `PERSONAL_DATA_READ_GATED` under `operator_personal_data_gate`, policy group `personal_data_read`, default OFF, guidance visibility conditional.

This is intentional because reviews/questions contain buyer-generated free text and `question_list` may return `author_name`.

The existing service-worker personal-data policy gate remains byte-identical and executes before provider business execution. B9 does not modify Autorun, Work-session lifecycle, Manual-mode behavior, provider transport or credentials.

## Entitlement boundary

The exact current review endpoints permit access with either the separate Ozon subscription `Управление отзывами` or Premium Pro. The existing `/v1/seller/info` capability model cannot represent the separate review-management subscription.

Therefore B9 correctly does not collapse reviews into a false Premium-Pro-only precondition. `review_list` and `review_info` compile to an unresolved entitlement alternative with reason:

`endpoint_subscription_alternative_unrepresentable`

and planning retains `ENTITLEMENT_UNKNOWN` without a capability probe requirement, while the personal-data policy gate remains authoritative before provider execution.

`question_list` is representable and remains strictly Premium Plus gated with `allowed_subscription_types = ["PREMIUM_PLUS"]`.

## Exact production identities

Accepted changed production files:

- `shared/ozon_operation_registry.js` -> `e157dfa70ecddc2d473d5968e045448f8d5693ed6553063798b417743a1d88eb`
- `shared/ozon_contract.js` -> `e80b3d07f6deef12412e8ddfc99dad4ad62236b932ed2a7246b8afb90c9ef674`
- `shared/ozon_entitlements.js` -> `8f006b298fb4bdff969ba4cca54f796821bacc124c078203d6e2f49fd418df70`

Protected runtime identities remain unchanged, including:

- `content_script.js` -> `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js` -> `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js` -> `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js` -> `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js` -> `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` -> `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js` -> `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_guidance.js` -> `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`

B7 analytics entitlement parsing and B8 supply semantics remain preserved on the accepted B9 tree.

## Exact Swagger authority

Author-side validation used the original operator-supplied Seller Swagger:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

Exact currentness and entitlement gates passed author-side and were rerun against the downloaded CI production artifact. The independent tester did not have the exact raw Swagger and correctly did not substitute another authority; this environment-only omission is not an acceptance failure.

## CI validation

GitHub Actions run `32959105335` completed successfully on exact candidate `ae222f9a07d8fd4ca40f4894cbe2baf01ae71887`.

Both jobs passed:

- Linux exact materialization, B1-B8 carry-forward gates, B9 regression, JavaScript syntax and artifact publication;
- Windows transport identity, exact materialization, carry-forward gates, B9 regression and JavaScript syntax.

Artifact `9603145461` was published with GitHub digest:

`sha256:aec4a7dcb037837b15dc4dc8ac23e5bba73cd1766f747eddc692b5c637abf022`

The downloaded artifact independently matched the accepted 21-file production tree and all changed/protected identities.

## Independent validation

Independent validation commit `bd4f9a263ca741e5bc112927327520cf7eb284ab` is exactly one commit ahead of the tested B9 candidate. Its merge-base is the candidate and its only changed file is:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B9_REVIEWS_QUESTIONS_INDEPENDENT_TEST_RESULT_2026-08-26.md`

No production file changed in the independent-test commit.

The independent result records:

- exact B9 candidate and accepted B8 authority;
- gzip/raw patch identities matched;
- exact 21-file production tree matched;
- all three changed production hashes matched;
- B1-B6 carry-forward passed;
- exact B7-base regression passed;
- exact B8-base regression passed;
- B9 registry, request-contract, personal-data, entitlement, guidance and protected-runtime gates passed;
- all 18 production JavaScript files passed syntax validation;
- Seller business requests = `0`;
- Performance business requests = `0`;
- credentials used = `0`;
- tester production modifications = `0`.

Independent final decision:

`PATCH_B9_REVIEWS_QUESTIONS_INDEPENDENT_TEST_PASS`

## Roadmap gate

B9 Reviews / Questions is accepted.

With B9 accepted, the priorities listed in `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1` are closed through its final `P2_reviews_questions` item. Further Ozon expansion must begin with a fresh coverage/currentness review and a new evidence-backed implementation queue rather than inventing a B10 scope from stale gaps.

Autorun, Work-session lifecycle, Manual-mode behavior, provider transport, credentials and unrelated runtime semantics remain protected unless separately reviewed and gated.
