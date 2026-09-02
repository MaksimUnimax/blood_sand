# Ozon AI Worker — Entitlement Preflight Gap Requirement

Date: 2026-09-02
Status: MANDATORY HARDENING REQUIREMENT DISCOVERED BY STD-05
Source: `STD-05 Run 9`, `STD-05 Run 10`

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

## Run 10 roles diagnostic

A same-account/key `roles` diagnostic then returned HTTP `200`.

The current key's `Admin read only` role explicitly contains:
- `/v1/analytics/product-queries`;
- `/v1/analytics/product-queries/details`.

Therefore the Run 9 403 is **not explained by the endpoint being absent from the API-key role set**.

This narrows the live contradiction to an account/subscription/provider-policy condition, a date/data-freshness restriction, or another provider-side condition not modeled by Bridge.

## Freshness-window hypothesis discovered after Run 10

Current documentation for `product_queries` describes a recent-data calculation delay: the newest roughly three days are not available while analytics is calculated.

Run 9 requested `2026-08-31` while the test date is `2026-09-02`, so the requested day falls inside that recent window.

This may explain why:
- the method is present in roles;
- Bridge's static contract sees the operation as generally available/partially available;
- Ozon still rejects the concrete request.

However the exact 403 trigger is **not yet proven**. The required controlled diagnostic is the same `product_queries` operation for an older date outside the recent calculation window, e.g. `2026-08-29`, using a minimal SKU set.

Do not classify `product_queries` as globally unavailable to Standard until that diagnostic is completed.

## Why this is a product defect

`SUPPORTED_AND_ENTITLED` communicates a stronger claim than the Bridge had actually proven.

The static reviewed OpenAPI rule for this method is represented as `ALL_ACCOUNTS_PARTIAL_RESPONSE`, while live provider behavior can still reject a concrete request because of conditions not represented in the current preflight model.

The Bridge currently conflates at least four different concepts:
1. operation exists in the reviewed contract;
2. current API-key role includes the endpoint;
3. current account/subscription may use the requested feature/data scope;
4. the concrete date/range is currently queryable.

These states must not collapse into one unconditional `SUPPORTED_AND_ENTITLED` label.

## Required semantic states

Bridge planning should distinguish static support from proven live entitlement and queryability. Candidate state model:

- `SUPPORTED_STATICALLY_ACCESS_UNKNOWN`
- `SUPPORTED_ROLE_CONFIRMED`
- `SUPPORTED_SUBSCRIPTION_CONFIRMED`
- `SUPPORTED_BUT_FRESHNESS_WINDOW_UNKNOWN`
- `SUPPORTED_AND_ENTITLED` only when live account/key evidence truly proves it
- `NOT_ENTITLED`
- `ENTITLEMENT_PROVIDER_DEPENDENT`
- `ENTITLEMENT_RULE_STALE_OR_CONTRADICTED_BY_PROVIDER`
- `DATA_WINDOW_NOT_READY` / equivalent when contract/provider evidence proves a freshness restriction

Exact enum names are not frozen, but the semantic distinction is mandatory.

## Required 403 behavior

When provider returns a permission/entitlement 403 after Bridge predicted access:

- `business_result_valid: false`
- `retryable: false` unless provider evidence says otherwise
- `failure_class: OZON_PERMISSION_OR_ENTITLEMENT_REJECTED` or stronger supported class
- preserve operation and logical fingerprint
- `external_request_executed: true`
- `automatic_retry: false`
- `preflight_entitlement_prediction` must be included
- `provider_contradicted_preflight: true`
- recommend deterministic diagnostics such as `roles` and, where relevant, an older-date freshness control
- keep the original business job active under `NO_SKIP_ON_FAILURE`
- do not reinterpret the failure as empty search data
- do not silently fall back to a Premium-only alternative

## Freshness / data-readiness requirement

For methods whose contract defines a calculation lag or recent-data exclusion, Bridge should expose this before dispatch where the requested date range can be evaluated locally.

Candidate metadata:

```text
queryability: {
  date_window_supported: true | false | null,
  data_ready: true | false | null,
  freshness_rule_known: true | false,
  freshness_rule_source: "reviewed_contract" | "provider" | "unknown",
  earliest_queryable_date: "YYYY-MM-DD" | null,
  latest_queryable_date: "YYYY-MM-DD" | null,
  recovery_action: "USE_OLDER_DATE_FOR_DIAGNOSTIC" | "WAIT_FOR_DATA_WINDOW" | null
}
```

Rules:
- do not send a known-not-ready recent date merely because the endpoint exists in roles;
- do not label a recent-window rejection as account entitlement failure when the contract proves data readiness is the issue;
- do not invent the provider's exact calculation delay if it is not documented;
- where documented, make the restriction machine-readable for weak models.

## Snapshot feedback requirement

A live provider contradiction should be recordable as evidence that the bundled entitlement/queryability snapshot may be stale or incomplete.

Bridge should not automatically rewrite static rules from one incident, but it should expose enough metadata so validation can distinguish:
- key-role issue;
- subscription/account issue;
- data-freshness/queryability issue;
- stale entitlement rule;
- unknown provider policy.

## Weak-model consequence

A weak model should not have to infer from `403 code 7` that a method present in its roles may still reject a concrete request because of subscription or freshness rules.

Principles:

`DO_NOT_TELL_THE_MODEL_ENTITLED_WHEN_ENTITLEMENT_IS_ONLY_STATICALLY_ASSUMED`

`DO_NOT_REQUIRE_MODEL_INTELLIGENCE_TO_DISCOVER_DOCUMENTED_DATA_FRESHNESS_WINDOWS`

## Current checkpoint

`STD_05_PRODUCT_QUERIES_403_ROLE_CAUSE_REJECTED_FRESHNESS_CONTROL_NEXT`
