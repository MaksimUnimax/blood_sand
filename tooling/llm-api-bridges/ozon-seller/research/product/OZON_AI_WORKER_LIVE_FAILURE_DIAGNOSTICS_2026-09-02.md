# Ozon AI Worker — Live Failure Diagnostics

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Status: ACTIVE — STD-01 INCIDENT CLOSED FOR BENCHMARK PROGRESSION

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

## Closed incident — STD-01 / analytics_data HTTP 429 then recovery

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

## Evidence established before recovery

1. `/v1/analytics/data` is a method with a special slow request quota; the accepted Bridge models this family at 60 seconds plus 5 seconds launch safety.
2. The Bridge quota identity is keyed by a hash of Seller `clientId`, so changing API-key revision does not intentionally create an independent account quota bucket.
3. Each STD-01 business run executed exactly one physical business request. There was no hidden retry/pagination/fanout.
4. Run 2 occurred 117.962 seconds after Run 1, therefore the Bridge's own 65-second effective spacing cannot by itself explain the second provider 429.
5. Provider transport captures safe `Retry-After` metadata and can extend the local analytics quota from it; neither 429 delivered a `retry_after` value.
6. The accepted project operational-constraints evidence explicitly warns not to invent exact provider quota/reset semantics when Ozon does not expose them.

## Diagnostic D1 — completed PASS

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

## Diagnostic D2 / Business Run 3 — recovery PASS

Exact original command was repeated with no logical changes:
- `date_from`: `2026-09-01`;
- `date_to`: `2026-09-01`;
- `dimension`: `[day]`;
- `metrics`: `[revenue, ordered_units]`;
- `limit`: `100`.

Observed:
- request id `7b670916-262e-46f3-8702-c55dfb862225`;
- HTTP `200`;
- exactly one physical business request;
- no automatic retry;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- `last_provider_request_at`: `1788337707374` = 2026-09-02 08:28:27.374 UTC;
- Bridge `next_allowed_at`: `1788337772374` = 2026-09-02 08:29:32.374 UTC;
- elapsed `6007 ms`;
- returned revenue `27200`;
- returned ordered units `16`.

Elapsed from Run 2 dispatch to successful D2 dispatch: `1013.748 seconds` = `16m 53.748s`.

## Final incident classification

`TRANSIENT_ANALYTICS_METHOD_QUOTA_OR_PROVIDER_STATE_RECOVERED / EXACT_TRIGGER_UNRESOLVED`

The incident is closed for benchmark progression because the exact requested commercial read succeeded and the business result is now available.

### Strongly rejected classes

- `AI_COMMAND_SELECTION_ERROR` — exact intended method and metrics ultimately succeeded unchanged.
- `BRIDGE_CONTRACT_OR_PLANNER_ERROR` — exact request was preserved and accepted by provider on recovery.
- `AUTH_OR_ROLE_ERROR` — D1 roles returned 200 and explicitly permitted `/v1/analytics/data`.
- `ENTITLEMENT_ERROR` — entitlement remained `SUPPORTED_AND_ENTITLED` throughout.
- `OZON_GLOBAL_RATE_LIMIT` — D1 roles returned 200 while analytics was the affected family.
- general provider outage — not supported by D1 and later analytics recovery.
- basic `BRIDGE_RATE_LIMIT_STATE_ERROR` as direct cause — Run 2 already respected more than the locally protected interval and each command emitted exactly one external request.

### Remaining indistinguishable causes

#### H1 — `OZON_METHOD_RATE_LIMIT` / extended method cooldown

Consistent with recovery after a substantially longer quiet interval, but not proven because Ozon did not expose a reset time or diagnostic detail in the delivered 429s.

Status: `PLAUSIBLE / NOT DISTINGUISHABLE FROM H2/H3`.

#### H2 — `PARALLEL_EXTERNAL_CONSUMER_OR_UNTRACKED_CALL`

Another caller using the same seller account could have consumed the method quota before the first two Bridge attempts and then stopped before D2.

Status: `PLAUSIBLE / NOT PROVEN`.

#### H3 — `OZON_PROVIDER_CIRCUIT_BLOCK`

An extended provider-side block/circuit could also explain recovery after ~17 minutes, but the sanitized provider response did not contain enough evidence to prove this mechanism.

Status: `PLAUSIBLE / NOT PROVEN`.

No more precise root cause should be asserted without provider/account-level traffic evidence.

## Benchmark implication

STD-01 is `PASS`:
- 2026-09-01 revenue: `27,200 RUB`;
- ordered units: `16`.

Benchmark may now proceed to STD-02 under the same `NO_SKIP_ON_FAILURE` rule. If `/v1/analytics/data` returns 429 again during later rows, this incident becomes relevant recurrence evidence and should be reopened with the new timestamps rather than treated as an unrelated first occurrence.

## Current checkpoint

`STD_01_TRANSIENT_ANALYTICS_429_RECOVERED_HTTP_200_INCIDENT_CLOSED_STD_02_READY`
