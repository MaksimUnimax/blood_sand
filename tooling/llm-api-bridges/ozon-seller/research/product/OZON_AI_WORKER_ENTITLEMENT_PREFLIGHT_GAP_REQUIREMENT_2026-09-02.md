# Ozon AI Worker — Entitlement Preflight Gap Requirement

Date: 2026-09-02
Status: MANDATORY HARDENING REQUIREMENT DISCOVERED BY STD-05
Source: `STD-05 Run 9`

## Incident

Bridge accepted and dispatched `product_queries` (`POST /v1/analytics/product-queries`) for a Standard/non-Premium live account.

Before dispatch Bridge reported:
- `entitlement.status = SUPPORTED_AND_ENTITLED`;
- `capability_required = false`;
- `reason = provider_may_return_subscription_dependent_scope`.

Ozon then returned:
- HTTP `403`;
- provider code `7`;
- category `auth_or_permission`.

No business data was returned.

## Why this is a product defect

`SUPPORTED_AND_ENTITLED` communicates a stronger claim than the Bridge had actually proven.

The static reviewed OpenAPI rule for this method is currently represented as `ALL_ACCOUNTS_PARTIAL_RESPONSE`, with known Premium restrictions only for history older than one month. Live provider behavior on the tested Standard account/key contradicted the implied current-access conclusion.

Possible underlying causes still being diagnosed:
1. current API key role does not include the method;
2. account/subscription policy is stricter than the bundled rule;
3. provider entitlement behavior changed since the reviewed snapshot;
4. another provider-side permission condition is not modeled by Bridge.

The exact cause must not be invented until the `roles` diagnostic is completed.

## Required semantic states

Bridge planning should distinguish static support from proven live entitlement. Candidate state model:

- `SUPPORTED_STATICALLY_ACCESS_UNKNOWN`
- `SUPPORTED_ROLE_CONFIRMED`
- `SUPPORTED_SUBSCRIPTION_CONFIRMED`
- `SUPPORTED_AND_ENTITLED` only when live account/key evidence truly proves it
- `NOT_ENTITLED`
- `ENTITLEMENT_PROVIDER_DEPENDENT`
- `ENTITLEMENT_RULE_STALE_OR_CONTRADICTED_BY_PROVIDER`

Exact enum names are not frozen, but the semantic distinction is mandatory.

## Required 403 behavior

When provider returns a permission/entitlement 403 after Bridge predicted access:

- `business_result_valid: false`
- `retryable: false` unless provider evidence says otherwise
- `failure_class: OZON_PERMISSION_OR_ENTITLEMENT_REJECTED`
- preserve operation and logical fingerprint
- `external_request_executed: true`
- `automatic_retry: false`
- `preflight_entitlement_prediction` must be included
- `provider_contradicted_preflight: true`
- recommend a deterministic diagnostic such as `roles` when applicable
- keep the original business job active under `NO_SKIP_ON_FAILURE`
- do not reinterpret the failure as empty search data
- do not silently fall back to a Premium-only alternative

## Snapshot feedback requirement

A live provider contradiction should be recordable as evidence that the bundled entitlement snapshot may be stale or incomplete.

Bridge should not automatically rewrite static rules from one incident, but it should expose enough metadata so validation can distinguish:
- key-role issue;
- subscription/account issue;
- stale entitlement rule;
- unknown provider policy.

## Weak-model consequence

A weak model should not have to infer from `403 code 7` that the method may be unavailable despite `SUPPORTED_AND_ENTITLED` metadata. Contradictory Bridge/provider semantics are especially dangerous for provider portability.

Principle:

`DO_NOT_TELL_THE_MODEL_ENTITLED_WHEN_ENTITLEMENT_IS_ONLY_STATICALLY_ASSUMED`

## Next diagnostic

Run `roles` on the same live account/key and check specifically for `/v1/analytics/product-queries`.

## Checkpoint

`STD_05_ENTITLEMENT_PREFLIGHT_CONTRADICTION_RECORDED_AWAITING_ROLES_DIAGNOSTIC`
