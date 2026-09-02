# Ozon AI Worker — Entitlement Preflight Gap Requirement

Date: 2026-09-02
Status: MANDATORY HARDENING REQUIREMENT DISCOVERED BY STD-05
Source: `STD-05 Run 9`, `STD-05 Run 10`, `STD-05 Run 11`

## Incident

Bridge accepted and dispatched `product_queries` (`POST /v1/analytics/product-queries`) for a Standard/non-Premium live account using target date `2026-08-31`.

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

A same-account/key `roles` diagnostic returned HTTP `200`.

The current key's `Admin read only` role explicitly contains:
- `/v1/analytics/product-queries`;
- `/v1/analytics/product-queries/details`.

Therefore the Run 9 403 is **not explained by the endpoint being absent from the API-key role set**.

## Run 11 controlled older-date result

Run 11 repeated the same operation on the same live account/key, but used an older control date outside the newest target window:

- operation: `product_queries`;
- date: `2026-08-29`;
- SKU: `1636048691`;
- request id: `41e392f8-ad80-41eb-81f8-c84644df59bc`;
- HTTP `200`;
- returned valid search analytics (`unique_search_users=4876`, `gmv=1244 RUB`).

This rejects:
- global account denial of `product_queries`;
- missing API-key role;
- invalid operation/parameter shape as the Run 9 cause.

Strongest supported classification is now:

`RECENT_DATA_FRESHNESS_OR_DATA_READINESS_RESTRICTION_STRONGLY_SUPPORTED / EXACT_BOUNDARY_NOT_PROVEN`

The exact provider cutoff must not be invented from one pass/fail pair. What is proven is that the newer target date was rejected while the older control date was queryable on the same endpoint/account/key.

## Why this is a product defect

`SUPPORTED_AND_ENTITLED` communicates a stronger claim than the Bridge had actually proven for the **concrete request**.

The current preflight model conflates at least four different concepts:
1. operation exists in the reviewed contract;
2. current API-key role includes the endpoint;
3. current account/subscription may use the endpoint/feature;
4. the concrete requested date/range is currently queryable and data-ready.

Runs 9-11 prove that the first three can be true enough for an older request while the fourth is false for a newer request. These states must not collapse into one unconditional entitlement label.

## Required semantic states

Bridge planning should distinguish static support, role, entitlement and queryability. Candidate state model:

- `SUPPORTED_STATICALLY_ACCESS_UNKNOWN`
- `SUPPORTED_ROLE_CONFIRMED`
- `SUPPORTED_SUBSCRIPTION_CONFIRMED`
- `SUPPORTED_BUT_FRESHNESS_WINDOW_UNKNOWN`
- `DATA_WINDOW_NOT_READY`
- `SUPPORTED_AND_QUERYABLE`
- `NOT_ENTITLED`
- `ENTITLEMENT_PROVIDER_DEPENDENT`
- `ENTITLEMENT_RULE_STALE_OR_CONTRADICTED_BY_PROVIDER`

Exact enum names are not frozen, but the semantic distinction is mandatory.

## Required 403 behavior

When provider returns a permission-looking 403 after Bridge predicted access:

- `business_result_valid: false`
- preserve operation and logical fingerprint
- `external_request_executed: true`
- `automatic_retry: false`
- expose `preflight_entitlement_prediction`
- expose `provider_contradicted_preflight: true`
- do not interpret the failure as empty business/search data
- do not silently fall back to a Premium-only alternative
- recommend deterministic diagnostics based on evidence:
  - role check when role is unknown;
  - older-date freshness control when the endpoint has a known recent-data lag;
- keep the original business job active under `NO_SKIP_ON_FAILURE`.

After an older-date control succeeds on the same endpoint/account/key, the AI-facing classification should move away from generic entitlement denial toward the strongest supported freshness/data-readiness class.

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
- do not label a recent-window rejection as account entitlement failure when evidence supports data readiness as the issue;
- do not invent the provider's exact calculation delay if it is not firmly represented in the reviewed contract;
- where documented, make the restriction machine-readable for weak models;
- an older successful control should be recorded as evidence that the operation/account entitlement exists while the target range is not yet queryable;
- no hidden retry, hidden date substitution or silent fallback is allowed.

## Snapshot feedback requirement

A live provider contradiction should be recordable as evidence that the bundled entitlement/queryability snapshot is incomplete even if its endpoint-level subscription rule is not stale.

Validation must distinguish:
- key-role issue;
- subscription/account issue;
- data-freshness/queryability issue;
- stale entitlement rule;
- unknown provider policy.

STD-05 demonstrates that endpoint-level entitlement metadata alone is insufficient for date-sensitive analytics methods.

## Weak-model consequence

A weak model should not have to infer from `403 code 7` that a method present in its roles and generally available may still reject a concrete request because the requested analytics period is not ready.

Principles:

`DO_NOT_TELL_THE_MODEL_ENTITLED_WHEN_QUERYABILITY_IS_UNPROVEN`

`DO_NOT_REQUIRE_MODEL_INTELLIGENCE_TO_DISCOVER_DOCUMENTED_DATA_FRESHNESS_WINDOWS`

`SEPARATE_ENDPOINT_ENTITLEMENT_FROM_CONCRETE_REQUEST_QUERYABILITY`

## Current checkpoint

`STD_05_PRODUCT_QUERIES_403_ROOT_CAUSE_NARROWED_TO_RECENT_DATA_FRESHNESS_QUERYABILITY_GAP_RUN11_OLDER_DATE_200`
