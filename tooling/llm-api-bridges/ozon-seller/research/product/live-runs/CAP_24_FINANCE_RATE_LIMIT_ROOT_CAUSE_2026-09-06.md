# CAP-24 — Finance rate-limit root-cause diagnosis (2026-09-06)

- Capability: `CAP-24`
- Scope: current `finance_accrual_types` HTTP 429 blocker
- Branch at diagnosis start: `repair/ozon-date-contract-2026-09-04`
- Runtime version observed in live test: `0.1.19`
- Status: `ROOT_CAUSE_CONFIRMED__EXECUTABLE_PATCH_NOT_AUTHORIZED`
- Execution boundary: diagnosis/evidence only; no executable patch, rebuild, ref move, or LIVE continuation in this record.

## Live symptom

The active CAP-24 finance sequence reached a real provider `HTTP 429` on `finance_accrual_types` (`POST /v1/finance/accrual/types`) twice. The provider response exposed `Retry-After: 1` through Bridge diagnostics.

A preceding finance request (`finance_accrual_postings`) had succeeded. This proves that the failing call reached Ozon and that the 429 is a real provider response. It does **not** by itself prove the exact provider-side quota grouping shared by `/postings` and `/types`.

## Earlier 429 evidence

The general 429 failure class was already observed and recorded earlier in CAP-24 on `analytics_data`, but with a materially different execution path:

- `external: false`;
- provider request count `0`;
- local quota family `seller.analytics.v1`;
- `min_interval_ms: 60000`;
- explicit `next_allowed_at`;
- `automatic_retry: false`.

That earlier analytics result proves that Bridge already has a local pre-request quota guard for selected operations.

No earlier checked repository evidence was found for this exact endpoint-specific failure (`finance_accrual_types` returning 429). Therefore the correct historical statement is:

`GENERAL_429_PREVIOUSLY_OBSERVED__EXACT_FINANCE_ACCRUAL_TYPES_429_NOT_PREVIOUSLY_FOUND_IN_CHECKED_EVIDENCE`

## Historical contract evidence

The repository's Ozon rate-limit contract fragment (`OZON_ERROR_RATE_LIMIT_CONTRACT_FRAGMENT_2026-08-11.json`) already records:

- Ozon-owned provider-wide rate-limit error semantics;
- last general evidence of 50 requests/second per Client ID as of 2025-05-22, with an explicit warning that method-specific limits may differ;
- provider-wide `Retry-After` semantics were not proven at that time;
- engineering rule to revalidate current general and method-specific quotas before real-account acceptance.

The finance-accrual contract fragment (`OZON_FINANCE_ACCRUAL_CONTRACT_FRAGMENT_2026-08-11.json`) separately listed `permissions and method-specific rate limits` among still-missing evidence.

Therefore a finance-specific static interval must **not** be invented from the old generic limit or copied from analytics.

## Active-source root cause

### 1. Local quota mapping does not include finance

Current `dist-step7-candidate/service_worker.js` defines only these local quota families:

- `seller.analytics.v1` => `60000 ms`;
- `seller.stock_turnover.v1` => `60000 ms`.

`getOperationQuotaFamily(operation)` maps only:

- `analytics_data` / `analytics_data_limited` => `seller.analytics.v1`;
- `warehouse_stock_turnover` => `seller.stock_turnover.v1`;
- every other operation => `null`.

Therefore `finance_accrual_types` receives no local quota family.

### 2. Finance is always allowed through the local precheck

Because the operation maps to `null`, `checkOperationQuota("finance_accrual_types")` returns `ok: true` with no `min_interval_ms` and no `next_allowed_at`.

`trackOperationQuotaAttempt()` then receives `null` and stores no finance attempt timestamp.

Result: an immediate finance request is allowed to hit the provider even when the preceding provider response should cause the caller to wait.

### 3. Provider Retry-After is parsed correctly

Current `dist-step7-candidate/shared/ozon_provider.js` captures the `retry-after` response header and exposes parsed rate-limit metadata / `retry_after` in the provider response.

So the defect is **not** loss of the provider header.

### 4. Retry-After state extension is analytics-only

Current `service_worker.js` uses `extendAnalyticsQuotaFromRetryAfter(quotaFamily, rateLimit)` and immediately returns unless:

`quotaFamily === "seller.analytics.v1"`.

Consequently, even when `finance_accrual_types` reaches Ozon and Ozon returns `Retry-After: 1`, Bridge does not convert that provider instruction into finance `next_allowed_at` state for the next explicit command.

## Root-cause classification

`FINANCE_LOCAL_RATE_LIMIT_ORCHESTRATION_COVERAGE_GAP`

What is proven:

1. the current finance 429 is a real provider response;
2. Bridge correctly captures/exposes the provider `Retry-After` value;
3. Bridge has no local quota-family mapping for `finance_accrual_types`;
4. Bridge has no finance attempt state / next-allowed state in the generic precheck;
5. provider Retry-After extension is hard-coded to analytics only;
6. therefore repeated finance calls are not protected by the local mechanism already used for analytics.

What is **not** proven and must not be fabricated:

- that all finance endpoints share one provider quota bucket;
- that `/v1/finance/accrual/postings` and `/v1/finance/accrual/types` definitely share one provider quota bucket;
- a fixed finance minimum interval such as 60 seconds;
- that `Retry-After: 1` is a universal finance rule rather than the provider instruction for the observed 429 response.

## Minimal repair design — pending explicit patch authorization

A correct repair should avoid a guessed static finance interval.

Minimum defensible design:

1. generalize `extendAnalyticsQuotaFromRetryAfter(...)` into quota-family-agnostic Retry-After handling;
2. introduce a finance quota family only for the operation set whose shared provider quota relationship is actually proven;
3. for a provider 429 carrying a valid `Retry-After`, store `next_allowed_at` for that mapped quota family;
4. on an immediate next explicit command in that family, fail locally with `external: false` / zero physical requests until `next_allowed_at`;
5. after the provider-specified wait expires, allow exactly one explicit request;
6. preserve the invariant: one explicit `OZON_API_V1` command => at most one physical provider request; no hidden retry;
7. preserve existing analytics and stock-turnover throttling behavior unchanged;
8. add deterministic regression coverage for provider-429 -> local-block -> post-wait allowance;
9. perform LIVE retest on the same `finance_accrual_types` CAP-24 step before continuing CAP-24.

If exact shared-family evidence cannot be established, the safer fallback design is endpoint-specific Retry-After state for `finance_accrual_types`, not a broad guessed `seller.finance.v1` family.

## CAP-24 state

`BLOCKED_ON_FINANCE_RATE_LIMIT_REPAIR_OR_EXPLICIT_LIVE_RETRY_POLICY`

Do not advance to the next CAP-24 evidence class until this blocker is dispositioned and the same failing finance step is retested.
