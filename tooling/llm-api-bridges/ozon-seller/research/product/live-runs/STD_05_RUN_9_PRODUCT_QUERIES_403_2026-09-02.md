# STD-05 Run 9 — product_queries provider 403

Date: 2026-09-02
Benchmark: `STD-05`
Question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

## Intended evidence

Test organic/search-demand evidence for the 24 SKUs that sold on 2026-08-31 using Standard-scope operation `product_queries` for 2026-08-31.

## Result

- request_id: `4b947e9e-2549-4387-b885-992dccae6d56`
- operation: `product_queries`
- fingerprint: `ba85f8a6`
- provider: Seller API
- endpoint: `POST /v1/analytics/product-queries`
- external_request_executed: `true`
- physical_business_request_count: `1`
- HTTP: `403`
- provider error code: `7`
- category: `auth_or_permission`
- automatic_retry: `false`
- no business/search data returned

Bridge planning metadata before dispatch said:
- entitlement status: `SUPPORTED_AND_ENTITLED`
- capability_required: `false`
- reason: `provider_may_return_subscription_dependent_scope`
- rule source: `reviewed-openapi-463-2026-08-19`

## Product finding

This is not a transport failure and not an empty business result. It is a provider permission/entitlement rejection.

The important product defect is that Bridge preflight represented the operation as `SUPPORTED_AND_ENTITLED` even though the live provider denied it for this account/key. The current bundled entitlement rule marks `/v1/analytics/product-queries` as `ALL_ACCOUNTS_PARTIAL_RESPONSE` with Premium restrictions only for history older than one month, but live Ozon behavior for this Standard account/key is stricter than that preflight prediction.

Classification until diagnostic:

`PROVIDER_403_ENTITLEMENT_OR_ROLE_MISMATCH / EXACT_CAUSE_PENDING_ROLES_DIAGNOSTIC`

Do not retry the same business command blindly: 403 is not a rate-limit recovery case.

## Required next diagnostic

Use `roles` to inspect whether the current API key explicitly exposes `/v1/analytics/product-queries`.

Interpretation plan:
- method absent from roles => key/role access explains the 403;
- method present in roles but provider still 403 => subscription/account-level capability or changed provider policy becomes the leading cause;
- either way, Standard organic-search branch remains active but blocked until entitlement is root-caused enough to classify.

## Product hardening implication

Bridge entitlement output must distinguish at least:
- statically documented support;
- account/key entitlement proven by capability/roles evidence;
- unknown/live-provider-dependent access.

`SUPPORTED_AND_ENTITLED` is too strong when live entitlement is not proven and provider may reject the method.

## Checkpoint

`STD_05_RUN9_PRODUCT_QUERIES_403_RECORDED_NEXT_ROLES_DIAGNOSTIC_NO_SKIP`
