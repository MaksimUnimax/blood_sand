# Patch B17 Reviews / Questions Extended Reads — Candidate Evidence

## Authority

- Accepted B16 authority: `b5462aa7441b8073f3c4dc69232b2b397289e1c6`
- Accepted B16 production tree: `03953160b440712f202c5e710226d93ceb540e132d8e821ea4763904a8b887eb`
- Exact operator-supplied Seller Swagger: 3,933,043 bytes
- Exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- Paths: `463`

## B17 scope

B17 adds six fixed read-only Seller API operations:

1. `review_comment_list` -> `POST /v1/review/comment/list`
2. `review_count` -> `POST /v2/review/count`
3. `question_answer_list` -> `POST /v1/question/answer/list`
4. `question_count` -> `POST /v1/question/count`
5. `question_info` -> `POST /v1/question/info`
6. `question_top_sku` -> `POST /v1/question/top-sku`

All six are non-deprecated in the exact Swagger. No caller-controlled host, URL, path, method, headers, or authorization material is introduced. Every alias remains `workflow_role = single_read`; there is no hidden retry, pagination, fanout, or provider chaining.

## Personal-data boundary

The exact Swagger response examples prove free text and/or author names for:

- `review_comment_list` (`comments[].text`)
- `question_answer_list` (`answers[].author_name`, `answers[].text`)
- `question_info` (`author_name`, `text`)

Those three operations therefore use the already accepted operator personal-data policy gate: `PERSONAL_DATA_READ_GATED`, `operator_personal_data_gate`, `policy_group = personal_data_read`, `default_allowed = false`, and conditional guidance.

The aggregate reads `review_count`, `question_count`, and `question_top_sku` expose no buyer free text or author names in their exact response examples and remain `READ_SAFE` / `safe_projection`.

## Entitlements

Exact current Swagger states that review comment/count access is available with either the separate `Управление отзывами` subscription or Premium Pro. SellerInfo cannot represent the separate review-management subscription. B17 therefore preserves the accepted fail-open-to-provider entitlement model used by B9: the two review rules compile as `UNKNOWN` with reason `endpoint_subscription_alternative_unrepresentable`; no false Premium-Pro-only local rejection is introduced.

All four question endpoints explicitly require Premium Plus. That requirement is representable and remains fail-closed: unknown capability rejects, `PREMIUM_PLUS` executes, and `PREMIUM_PRO` does not substitute for Premium Plus.

Exact full-Swagger compile remains at unresolved rule count `12`.

## Contract closure

- `review_comment_list`: `limit` required and documented `20..100`; exactly one selector is required by OpenAPI `oneOf`: `review_id` or `filter.sku`; optional RFC3339 published range, integer offset, and `ASC|DESC`. `filter.sku` is numeric int64 and is accepted only as a safe JavaScript integer.
- `review_count`: true no-body POST.
- `question_answer_list`: requires `question_id` string and numeric int64 `sku`; `last_id` is explicit pagination input only. The exact schema emits `type: null` for `last_id` while its description/example define an explicit cursor; B17 accepts only string or null and never follows it automatically.
- `question_count`: true no-body POST.
- `question_info`: requires `question_id` string.
- `question_top_sku`: requires int64 `limit` with exact bounds `1..100`.

## Mutations excluded

B17 does not enable review/comment/question mutations, including:

- `/v1/review/comment/create`
- `/v2/review/comment/delete`
- `/v2/review/change-status`
- `/v1/question/answer/create`
- `/v1/question/answer/delete`
- `/v1/question/change-status`

## Deferred analytics turnover gap

`POST /v1/analytics/turnover/stocks` is useful and current, but the exact Swagger explicitly limits it to one request per minute per Client-Id. The current protected worker scheduler is scoped to `analytics_data`. B17 does not weaken that safety boundary or change protected runtime merely to add another rate-limited operation; turnover remains deferred to a separately reviewed scheduler patch.

## Author-side deterministic verification

Passed locally against the exact 21-file B17 tree and the exact Seller Swagger:

- `B17_REVIEWS_QUESTIONS_EXTENDED_REGISTRY_PASS`
- `B17_REVIEWS_QUESTIONS_EXTENDED_EXACT_REQUEST_PASS`
- `B17_REVIEWS_QUESTIONS_EXTENDED_CONTRACTS_PASS`
- `B17_REVIEWS_QUESTIONS_EXTENDED_ENTITLEMENTS_PASS`
- `B17_REVIEWS_QUESTIONS_PERSONAL_DATA_BOUNDARY_PASS`
- `B17_REVIEWS_QUESTIONS_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS`
- `B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS`
- `B17_REVIEWS_QUESTIONS_EXACT_SWAGGER_CURRENTNESS_AND_PRIVACY_PASS`
- `B17_REVIEWS_QUESTIONS_EXACT_ENTITLEMENTS_PASS`
- `B17_REVIEWS_QUESTIONS_PROTECTED_RUNTIME_IDENTITIES_PASS`
- all 18 production JavaScript files pass `node --check`

No Seller request, Performance request, or credential use was required.
