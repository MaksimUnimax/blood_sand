# CAP-16 — Reviews / questions aggregate — roles diagnostic

Status: DIAGNOSTIC_PASS

Context:
- CAP-16 Run 1 `review_count` returned provider HTTP 403 / code 7.
- Bridge entitlement state for `POST /v2/review/count` was `ENTITLEMENT_UNKNOWN` because the bundled OpenAPI rule is unresolved (`endpoint_subscription_alternative_unrepresentable`).

Diagnostic command:
`OZON_API_V1 {"operation":"roles","params":{}}`

Observed:
- request_id: `d0fd1f4a-eddb-4083-a1c3-a1cb243a14ea`
- operation: `roles`
- HTTP 200
- exact request preserved: true
- command transformed: false
- logical business results / physical business requests: 1 / 1
- entitlement: `SUPPORTED_AND_ENTITLED`
- API key expiry: `2027-02-06T08:09:07.738279Z`

Relevant role evidence:
- `Review read only` explicitly contains `/v2/review/count`, `/v2/review/info`, `/v2/review/list`, and the v1 review methods.
- `Question read only` explicitly contains `/v1/question/count`, `/v1/question/info`, `/v1/question/list`, `/v1/question/answer/list`, `/v1/question/top-sku`.

Conclusion:
- The Run-1 403 on `review_count` is NOT explained by the API key lacking the review method/role.
- The remaining strongest supported class is an account/subscription/provider entitlement boundary that the current Bridge entitlement snapshot cannot deterministically represent for `/v2/review/count`.
- Do not treat the 403 as zero reviews and do not invent the exact paid-plan requirement without evidence.
- `question_count` is separately known by the Bridge entitlement authority as `SUBSCRIPTION_RESTRICTED` to `PREMIUM_PLUS`; the next CAP-16 step should validate that known boundary through normal Bridge planning rather than issuing a personal-data read.

Checkpoint: `CAP_16_REVIEW_403_ROLE_HYPOTHESIS_REJECTED_QUESTION_ENTITLEMENT_CHECK_NEXT`
