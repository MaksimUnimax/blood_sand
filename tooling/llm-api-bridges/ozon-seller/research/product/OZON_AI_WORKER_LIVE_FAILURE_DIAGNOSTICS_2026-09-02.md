# Ozon AI Worker — Live Failure Diagnostics

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Status: ACTIVE

## Mandatory rule

`NO_SKIP_ON_FAILURE`

During the live commercial benchmark, a failed/blocked Bridge run is not skipped in order to continue with another query. The failure must first be investigated to the strongest evidence-backed root-cause classification available. Only after the cause is understood or proven external/uncontrollable may the benchmark proceed.

Required failure classes:

- `AI_COMMAND_SELECTION_ERROR`
- `BRIDGE_CONTRACT_OR_PLANNER_ERROR`
- `BRIDGE_RATE_LIMIT_STATE_ERROR`
- `OZON_METHOD_RATE_LIMIT`
- `OZON_GLOBAL_RATE_LIMIT`
- `OZON_PROVIDER_CIRCUIT_BLOCK`
- `PARALLEL_EXTERNAL_CONSUMER_OR_UNTRACKED_CALL`
- `AUTH_OR_ROLE_ERROR`
- `ENTITLEMENT_ERROR`
- `PROVIDER_OUTAGE_OR_SERVER_ERROR`
- `UNKNOWN_REQUIRES_MORE_DIAGNOSTICS`

## Active incident — STD-01 / analytics_data HTTP 429

Business query:

`Дай продажи за вчера: общая выручка и количество заказанных единиц.`

Target method:

`POST /v1/analytics/data`

Metrics:

- `revenue`
- `ordered_units`

These metrics were classified by the accepted entitlement registry as available to all accounts.

### Run 1

- dispatched_at / `last_provider_request_at`: `1788336575664` = 2026-09-02 08:09:35.664 UTC
- Bridge `next_allowed_at`: `1788336640664` = 2026-09-02 08:10:40.664 UTC
- HTTP: `429`
- provider error code: `8`
- category: `rate_limit`
- physical business request count: `1`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- provider response did not expose `Retry-After` in the delivered result

### Run 2

- dispatched_at / `last_provider_request_at`: `1788336693626` = 2026-09-02 08:11:33.626 UTC
- Bridge `next_allowed_at`: `1788336758626` = 2026-09-02 08:12:38.626 UTC
- HTTP: `429`
- provider error code: `8`
- category: `rate_limit`
- physical business request count: `1`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- provider response did not expose `Retry-After` in the delivered result

Elapsed between Bridge dispatches: `117.962 seconds`.

## Evidence already established

1. `/v1/analytics/data` is documented/replicated as a special slow method: no more than one request per minute from one seller account.
2. The accepted Bridge implements `ANALYTICS_MIN_INTERVAL_MS = 60_000` plus `ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000`, i.e. effective local interval 65 seconds.
3. The Bridge quota identity is keyed by a hash of Seller `clientId`, so changing API-key revision does not intentionally create an independent account quota bucket.
4. Each STD-01 run executed exactly one physical business request. There was no hidden retry/pagination/fanout.
5. Run 2 occurred 117.962 seconds after Run 1, therefore the Bridge's own 65-second local interval is not sufficient to explain the second provider 429.
6. Ozon general documentation allows a much higher provider-wide request rate and explicitly notes that method-specific restrictions also exist.
7. Ozon may temporarily block a method after excessive traffic (`Circle is open` / provider-side circuit behavior), potentially for multiple minutes; however the delivered sanitized result currently exposes only rate-limit category/code and not enough raw detail to prove that branch.
8. Provider transport captures only `content-type`, `content-length`, request ID and `Retry-After` as safe response metadata. Both delivered results lacked `retry_after`, so the Bridge had no server-provided reset time to extend its local quota window.

## Current narrowed hypotheses

### H1 — parallel/untracked consumer of the same seller-account analytics quota

Possible sources include another browser/profile/extension instance, script, integration, analytics service, or other caller using the same seller account. Because the documented quota is account-level, a request outside this Bridge quota state can consume the one-per-minute slot and cause both Bridge requests to receive 429 even though the two Bridge dispatches themselves are far enough apart.

Status: `PLAUSIBLE / NOT YET PROVEN`.

### H2 — Ozon provider-side extended circuit/cooldown

A prior burst or repeated rejected requests may have put the analytics method in an extended provider-side block beyond the nominal one-minute method interval.

Status: `PLAUSIBLE / NOT YET PROVEN`.

### H3 — Bridge local quota scheduler bug

The observed 117.962-second separation is greater than the configured 65-second effective local interval, and each response reports one external request with no automatic retry. That strongly argues against the basic local spacing rule as the cause of Run 2.

Status: `CURRENTLY NOT SUPPORTED BY OBSERVED EVIDENCE`; continue diagnostics before closing.

## Diagnostic sequence — do not skip STD-01

D1. Call standard `roles` once. Purpose: prove Seller API credentials/provider path are healthy and determine whether 429 is global vs analytics-family specific.

D2. If `roles` succeeds, classify global auth/provider outage as rejected and keep investigation on analytics-specific quota/circuit.

D3. Inspect any safe response metadata available from D1 and the next analytics attempt; specifically preserve `Retry-After` if Ozon supplies it.

D4. Perform the next `/v1/analytics/data` attempt only under a controlled quiet condition where no other intentional analytics_data caller is running for the seller account during the method window. If it succeeds, the strongest cause becomes external/untracked concurrent consumption or expired provider circuit. If it still 429s after a controlled quiet window, provider-side extended block/circuit or an unknown external consumer remains and further local diagnostics are required.

D5. Do not mark STD-01 PASS/PARTIAL/FAIL until actual sales data is obtained or the root cause is proven to make the query operationally unavailable.

## Current checkpoint

`STD_01_429_ROOT_CAUSE_INVESTIGATION_NO_SKIP_D1_ROLES_READY`
