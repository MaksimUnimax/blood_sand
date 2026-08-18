# Ozon Bridge v0.1.19 — bounded live-repair scope

Date: 2026-08-18
Status: `SCOPE_FROZEN_READY_FOR_IMPLEMENTATION`

## Authority and trigger

Production base is the exact frozen Step-4 candidate:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Rejected live report:

- branch `validation/ozon-final-live-acceptance-2026-08-18`
- report commit `888b12a`
- verdict `FINAL_LIVE_REJECTED`

The rejected run established two repair inputs and no others:

1. a durable `quota_waiting` owner looked stalled to the operator because the live UI did not explain the Ozon rate wait or show remaining time;
2. after the accepted local 60000 ms analytics interval had elapsed, the next real `analytics_data` launch still received HTTP 429. In the captured live diagnostics the second real launch began about 60014 ms after the preceding real launch. No usable `Retry-After` value was present in the sanitized diagnostics.

Alice cache behavior from that run is NOT a repair trigger: the 60-second cache window was missed by operator timing, so the live cache observation remains `INCONCLUSIVE`, not a proven cache defect.

## Repair A — analytics launch safety guard

Preserve the reviewed quota family and nominal provider interval:

- family: `seller.analytics_data.v1`
- nominal interval: `60000 ms`

Add one fixed bridge-owned launch-safety guard for this family only:

`ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5000`

Effective same-Seller not-before launch boundary becomes:

`last_provider_request_at + 60000 + 5000`

The extra 5000 ms is an internal conservative scheduling guard motivated by the live 429 immediately after the nominal boundary. It MUST NOT be represented as a claimed Ozon-documented method limit.

Rules:

- AI cannot set, reduce, bypass or inspect the guard as a control surface;
- different Seller accounts remain independent;
- a cache hit still executes before quota and consumes no quota/provider request;
- a real provider attempt still reserves exactly one slot;
- no automatic retry is introduced;
- existing `Retry-After` extension-only semantics remain preserved when a usable provider value exists;
- a 429 without usable `Retry-After` is returned once as the sanitized provider error; the failed command is not replayed automatically;
- future same-Seller launches respect the guarded next-allowed boundary derived from the last real provider attempt.

## Repair B — visible durable quota-wait countdown

When an admitted owner is durably waiting on the analytics provider quota, show an extension-owned status surface associated with that owner/conversation. It must visibly say that this is an Ozon request-rate restriction, not a hung request.

Required Russian copy while waiting:

`Ожидание лимита Ozon`

`Ограничение частоты запросов Ozon. Следующий запрос через MM:SS.`

`Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`

Also show the local absolute due time:

`Следующая попытка: HH:MM:SS`

Countdown source of truth is the worker-owned durable `next_allowed_at`. Rendering may tick locally once per second using `Date.now()`; it MUST NOT poll Ozon or create any provider request.

At/after the due boundary, before the provider result is known, change the visible status to:

`Лимит Ozon снят — отправляем запрос…`

Requirements:

- waiting execution control remains busy/disabled; repeated user click must not admit a duplicate request;
- timer is owner/conversation scoped, never a global-current-conversation singleton;
- tab switching, content-script restart and MV3 worker restart must reconstruct the wait display from durable worker state;
- multiple independent waiting owners must not overwrite each other's visible state;
- normal success/error delivery behavior remains unchanged after the wait;
- native Copy remains independent and must not become the execution/status control;
- no page-owned DOM outside the extension-owned UI is rewritten for the countdown.

## Explicitly out of scope

- changing cache TTL or cache semantics;
- retrying the failed live request;
- widening provider operations, hosts, methods, headers or auth surfaces;
- capability/entitlement changes;
- query planner/coalescing changes;
- delivery FSM rewrite;
- Alice lifecycle rewrite;
- mutations, `posting_fbs_get`, customer PII;
- release promotion;
- any real Ozon request during implementation or synthetic validation.

## Protected accepted behavior

Preserve all accepted Step 1–4 invariants, especially:

- strict contract/capability boundary;
- Step-2 exact semantic planning/coalescing/projection;
- Step-3 persistent same-Seller quota ownership, alarms/startup resume, no unknown-request replay, no automatic retry, verifier/safe errors;
- Step-4 verified cache/prefetch and cache-hit-before-quota semantics;
- independent ChatGPT/Alice/tabs/conversations;
- proven ChatGPT delivery FSM and separate Alice lifecycle;
- fixed read-only provider surface and credential privacy.

## Required implementation evidence before freeze

All provider behavior is mocked. `REAL_OZON_REQUESTS = 0`.

Must prove at minimum:

- exact reconstruction of frozen `4ce190c8...` before modification;
- effective analytics launch boundary is 65000 ms while nominal metadata remains 60000 ms and guard is explicit internal provenance;
- no provider call before guarded due time;
- exactly one provider call when due;
- 429 produces no retry/replay;
- existing usable Retry-After can only extend the guarded boundary, never shorten it;
- cache hit still bypasses quota entirely;
- countdown starts from durable `next_allowed_at`, decrements locally, restores after content/worker restart, reaches sending state at due time;
- duplicate click while waiting cannot admit a second request;
- two owners/tabs render independent wait state;
- ChatGPT/Alice binding and delivery protected surfaces remain unchanged except for the new quota-wait status presentation;
- all production JS syntax, manifest parse and diff checks pass.

After implementation, freeze an exact repair SHA and create a standalone independent Codex validation plan. A successful synthetic repair validation only unlocks a new separately authorized controlled live rerun; it does not promote a release.