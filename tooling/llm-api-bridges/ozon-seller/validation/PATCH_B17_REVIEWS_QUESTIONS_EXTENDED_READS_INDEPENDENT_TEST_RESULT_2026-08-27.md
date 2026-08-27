# B17 Reviews / Questions Extended Reads — independent test result

## Authority and exact candidate

- Tested commit: `2219c01cfd7c9a8321348cfe6b1b99e386960e7b`
- Accepted B16 authority: `b5462aa7441b8073f3c4dc69232b2b397289e1c6`
- Direct-parent ancestry and one-commit distance: PASS.
- Direct delta: PASS. Only the six authorized B17 workflow/validation transport, materializer, regression, evidence and manifest files are present; no production extension file is directly committed.
- Gzip patch SHA-256: `4c51c31d9d7b82c513a420b253d6f0fcb149d742a5d3980eaea2d0fefa226d5d` — PASS.
- Raw decompressed patch SHA-256: `0464197c4de3e2d6c66e2584b832f995d4847d225a1407cc4df0732bd841ec36` — PASS.
- Materialized B17 production tree: 21 files; SHA-256 `4577b9ac48988560caaa66e197179d76b05d35ce5f515f241a3b63e558b80e34` — PASS.

Changed identities all PASS:

- `shared/ozon_operation_registry.js`: `10a1ca1854473130b6ad7082a8ee5cebd45086c9ea6f4b0ce5e125666755f6a7`
- `shared/ozon_contract.js`: `d8565eee7b2ba72fa5e96411f3aae8f961d177595c623906039812ee3095593b`
- `shared/ozon_entitlements.js`: `327f597f9f924d51d43e1aad6081420f2f95ec55950300d4e7532042c701e4d3`

Protected B16 runtime identities all PASS:

- `content_script.js`: `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js`: `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js`: `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js`: `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js`: `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js`: `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js`: `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_guidance.js`: `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`

## Executed evidence

```text
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling\llm-api-bridges\ozon-seller\validation\materialize_patch_b17_reviews_questions_extended_reads_candidate.py --repo-root D:\codex\Test\ozon-b17-independent-source-20260827 --work-root D:\codex\Test\ozon-b17-work-20260827 --out D:\codex\Test\ozon-b17-independent-20260827
```

Required materializer markers all PASS:

```text
PATCH_B17_B16_BASE_IDENTITY_PASS
PATCH_B17_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B17_PATCH_APPLY_PASS
PATCH_B17_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B17_CHANGED_FILE_IDENTITIES_PASS
PATCH_B17_PROTECTED_B16_IDENTITIES_PASS
PATCH_B17_TREE_MANIFEST_SHA256_PASS
```

All predecessor identity gates A1–A5 and B0–B16 also passed.  The accepted B16 base regression passed all seven B16 markers.  B17 regression passed:

```text
B17_REVIEWS_QUESTIONS_EXTENDED_REGISTRY_PASS
B17_REVIEWS_QUESTIONS_EXTENDED_EXACT_REQUEST_PASS
B17_REVIEWS_QUESTIONS_EXTENDED_CONTRACTS_PASS
B17_REVIEWS_QUESTIONS_EXTENDED_ENTITLEMENTS_PASS
B17_REVIEWS_QUESTIONS_PERSONAL_DATA_BOUNDARY_PASS
B17_REVIEWS_QUESTIONS_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B17_REVIEWS_QUESTIONS_PROTECTED_RUNTIME_IDENTITIES_PASS
B17_SYNTAX_PASS JS=18
```

## Contract, privacy and entitlement validation

The regression passed exact fixed request contracts and one-command/one-request behavior for the six B17 reads:

- `review_comment_list` — `POST /v1/review/comment/list`: limit `20..100`, exactly one selector (`review_id` or `filter.sku`), optional validated offset/sort/date range, no offset loop.
- `review_count` — `POST /v2/review/count`: true no-body POST; only `{}` accepted and physical body is `undefined`.
- `question_answer_list` — `POST /v1/question/answer/list`: required string `question_id` and safe-integer `sku`; explicit `last_id` accepts only string or null, never numeric and never automatically followed.
- `question_count` — `POST /v1/question/count`: true no-body POST.
- `question_info` — `POST /v1/question/info`: required string `question_id`.
- `question_top_sku` — `POST /v1/question/top-sku`: safe integer limit `1..100`.

Invalid types, unsafe integers, invalid date range, unknown fields, and transport-injection fields are rejected.  There are no request arrays, offset/last-id loops, automatic pagination/retry, review/question fanout, chained detail calls, or provider chaining.  All listed mutation paths remain disabled.

Personal-data gate PASS: `review_comment_list`, `question_answer_list`, and `question_info` are `PERSONAL_DATA_READ_GATED`, use `operator_personal_data_gate` / `personal_data_read`, default deny, and conditional guidance.  The existing service-worker gate is byte-identical.  `review_count`, `question_count`, and `question_top_sku` remain `READ_SAFE` / `safe_projection`.

Entitlements PASS: review reads remain `known=false`, `required=false`, `ENTITLEMENT_UNKNOWN` with `endpoint_subscription_alternative_unrepresentable` and no capability probe; the personal-data gate remains independent.  The four question reads are Premium Plus only: unknown rejects `ENTITLEMENT_UNKNOWN`, `PREMIUM_PLUS` executes, and `PREMIUM_PRO` rejects `SUBSCRIPTION_REQUIRED`.  Prior B16–B7 paths, review/question behavior, Premium parser distinction, and analytics constants passed carry-forward checks.

## External evidence status

`B17_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

The exact local raw Seller Swagger was unavailable; no web documentation, SDK, mirror, or replacement snapshot was used.  The optional exact-Swagger rerun therefore was not performed, as permitted by the instruction.

The named CI artifact was not downloaded because no GitHub Actions CLI is installed in the tester environment.  Artifact unavailability is non-failing after independent exact materialization.

## Safety accounting

- Seller business requests: `0`
- Performance business requests: `0`
- Credentials used: `0`
- Tester production modifications: `0`

PATCH_B17_REVIEWS_QUESTIONS_EXTENDED_READS_INDEPENDENT_TEST_PASS
