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

1. `/v1/analytics/data` is a method with a special slow request quota; the accepted Bridge models this family at 60 seconds plus 5 seconds launch safety.
2. The Bridge quota identity is keyed by a hash of Seller `clientId`, so changing API-key revision does not intentionally create an independent account quota bucket.
3. Each STD-01 business run executed exactly one physical business request. There was no hidden retry/pagination/fanout.
4. Run 2 occurred 117.962 seconds after Run 1, therefore the Bridge's own 65-second effective spacing cannot by itself explain the second provider 429.
5. Provider transport captures safe `Retry-After` metadata and can extend the local analytics quota from it; neither 429 delivered a `retry_after` value.
6. The accepted project operational-constraints evidence explicitly warns not to invent exact provider quota/reset semantics when Ozon does not expose them.

## Diagnostic D1 — completed

Command: `roles` / `POST /v1/roles`.

Observed:

- HTTP `200`;
- exactly one physical business request;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- no rate-limit metadata;
- current API key expiry `2027-02-06T08:09:07.738279Z`;
- returned `Admin read only` role explicitly contains `/v1/analytics/data`.

### Hypotheses rejected by D1

- `AUTH_OR_ROLE_ERROR` — rejected: key works and analytics method is explicitly allowed.
- expired API key — rejected: expiry is in 2027.
- `OZON_GLOBAL_RATE_LIMIT` at the D1 observation point — rejected: another Seller method returned 200.
- general Seller API/provider outage — rejected at D1 observation point.
- `ENTITLEMENT_ERROR` for the requested basic metrics — rejected by both entitlement planner and returned role permission.

## Current narrowed hypotheses after D1

### H1 — `OZON_METHOD_RATE_LIMIT` / extended method cooldown

The analytics method may still be in a provider-side method-specific quota window or cooldown beyond the nominal local 65-second protection used by Bridge.

Status: `PLAUSIBLE / NOT YET PROVEN`.

### H2 — `PARALLEL_EXTERNAL_CONSUMER_OR_UNTRACKED_CALL`

Another browser/profile/extension instance, script, integration, analytics product or other caller may be consuming the same seller-account `/v1/analytics/data` quota. Such traffic is invisible to this extension's local quota state.

Status: `PLAUSIBLE / NOT YET PROVEN`.

### H3 — `OZON_PROVIDER_CIRCUIT_BLOCK`

Ozon may be maintaining an extended provider-side block/circuit for this method after previous excessive traffic.

Status: `PLAUSIBLE / NOT YET PROVEN`; current sanitized 429 output does not contain enough provider detail to distinguish this from H1.

### H4 — `BRIDGE_RATE_LIMIT_STATE_ERROR`

The basic local scheduling rule is not supported as the direct cause because Run 2 was nearly 118 seconds after Run 1 and only one physical request occurred per run.

Status: `CURRENTLY DISFAVORED / NOT FULLY CLOSED`.

## Next diagnostic — D2

Repeat the exact original `/v1/analytics/data` logical read after the substantially longer elapsed interval, without changing date, dimensions or metrics.

Expected interpretations:

- `HTTP 200`: STD-01 data becomes available. Earlier failures are consistent with a temporary/extended analytics-method quota condition; external concurrent use remains possible unless separately excluded.
- `HTTP 429`: do not skip. Persistent method-specific block/external untracked consumption becomes the main incident. Next inspect local request history/diagnostics and known integrations/parallel instances before issuing another business query.
- other HTTP/error: classify separately rather than collapsing it into the current rate-limit hypothesis.

## Current checkpoint

`STD_01_D1_ROLES_200_AUTH_GLOBAL_ROLE_REJECTED_D2_EXACT_ANALYTICS_REPEAT_READY`
