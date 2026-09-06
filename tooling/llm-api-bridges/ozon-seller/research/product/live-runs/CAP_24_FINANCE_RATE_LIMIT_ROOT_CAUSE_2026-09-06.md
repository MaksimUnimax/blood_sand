# CAP-24 — Finance rate-limit root-cause diagnosis (2026-09-06) — SUPERSEDED

- Capability: `CAP-24`
- Scope: `finance_accrual_types` HTTP 429 investigation
- Runtime observed: `ozon-llm-api-bridge v0.1.19`
- Status: `SUPERSEDED__DO_NOT_USE_AS_ROOT_CAUSE_AUTHORITY`

## Supersession notice

The earlier version of this file incorrectly classified the incident as:

`FINANCE_LOCAL_RATE_LIMIT_ORCHESTRATION_COVERAGE_GAP`

and treated the absence of a Bridge-local finance `next_allowed_at` as a defect relevant to the CAP-24 blocker.

That conclusion is withdrawn.

The authoritative replacement is:

`CAP_24_FINANCE_ACCRUAL_TYPES_ROOT_CAUSE_AND_OPERATING_SOLUTION_2026-09-06.md`

## Why the earlier diagnosis was wrong

The earlier diagnosis proved only a code fact: Bridge v0.1.19 has selected local quota families for analytics/stock-turnover and does not maintain an equivalent local quota family for `finance_accrual_types`.

That fact does **not** prove a defect.

Bridge must make an Ozon request to obtain current provider data. A later explicit user command is allowed to make its one physical request unless a documented/provider-proven rule justifies local rejection. The project did not have such a proven numeric `/types` interval, and `Retry-After: 1` from one rejected response did not establish a universal static rule.

Subsequent live evidence showed:

1. `/v1/finance/accrual/types` returned HTTP 200 at least once with fingerprint `405f0634`;
2. the same method/fingerprint later returned provider HTTP 429 repeatedly;
3. a later quiet-baseline `/types` request also returned 429;
4. `POST /v3/product/list` returned HTTP 200 while `/types` was failing;
5. neighboring `POST /v1/finance/accrual/by-day` returned HTTP 200;
6. immediately after successful `/by-day`, `/types` again returned HTTP 429.

Therefore the failure is provider-side and method-specific, not caused by Bridge failing to pre-block the request.

## Corrected root-cause class

`METHOD_SPECIFIC_ANTI_REPEAT_CIRCUIT_OR_DYNAMIC_METHOD_QUOTA__FINANCE_ACCRUAL_TYPES`

Current Ozon documentation states that many identical or erroneous requests can cause Seller API access restrictions without warning; the common `Circle is open` condition blocks a method for several minutes after a large number of requests; individual-method restrictions are considered in addition to the general Client-ID limit. The `/v1/finance/accrual/types` method is currently a `BetaMethod` reference endpoint.

The observed test sequence repeatedly sent the same no-body `/types` command with the same fingerprint. The global 50 requests/second Client-ID limit was not approached by the manual sequence, and other methods remained operational. The evidence therefore converges on method-specific resource protection for `/types`.

The exact numeric threshold/reset algorithm is not published and must not be invented.

## Correct operating solution

`/v1/finance/accrual/types` is a reference dictionary, not transactional finance data.

Use it as follows:

1. fetch the dictionary when needed;
2. persist the provider-derived mapping with provenance;
3. obtain changing finance facts from `/v1/finance/accrual/by-day` and `/v1/finance/accrual/postings`;
4. join their `type_id` values against the persisted dictionary locally;
5. do not re-fetch `/types` for every day/page/posting;
6. refresh `/types` only when an unknown `type_id`, an explicit user refresh, or verified contract change creates a real need;
7. on refresh 429, do not hidden-retry: keep known mappings and mark unknown IDs pending until a later explicit refresh.

CAP-24 already has a successful 124-row dictionary from Run 02 and working `/by-day` SKU-attributable finance evidence from Run 06, so repeated `/types` access is not required to continue the business job.

## Bridge classification

`NO_BRIDGE_RATE_LIMIT_CONTROL_DEFECT_PROVEN_FOR_THIS_INCIDENT`

A separate observability limitation remains: current model-visible error handling suppresses the provider's raw `message`, while diagnostics are payload-free. This prevents literal-message confirmation of `Circle is open` versus another method-specific `RESOURCE_EXHAUSTED` message. It does not cause the 429 and does not justify blocking explicit provider requests.

No executable Bridge patch is authorized by this correction.
