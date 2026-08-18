# Ozon Bridge v0.1.19 — bounded live repair implementation and local evidence

Date: 2026-08-18
Status: `IMPLEMENTED_CANDIDATE_PREFREEZE_RECONSTRUCTION_REQUIRED`

## Trigger

The final controlled live run against frozen Step-4 target `4ce190c8bbdc438dcdf407abbe4dbecd846736df` was independently recorded as `FINAL_LIVE_REJECTED` on report branch `validation/ozon-final-live-acceptance-2026-08-18`, report commit `888b12a`.

Load-bearing observations:

- the accepted local analytics scheduler waited to its stored 60000 ms boundary, then a real provider attempt still received HTTP 429;
- no usable Retry-After was present in the sanitized diagnostic evidence;
- the durable wait was operationally invisible to the operator and looked like a hung bridge;
- Alice cache behavior is not classified as a defect because the fixed 60-second cache TTL was missed by operator timing.

No real Ozon requests were executed during this repair implementation.

`REAL_OZON_REQUESTS = 0`

## Frozen repair scope

Scope commit:

`4a20160ca5b39ccb99c30cc3ac887d9e488f2b92`

Only two repairs are implemented:

1. a fixed internal 5000 ms launch-safety guard on top of the existing nominal 60000 ms same-Seller analytics interval;
2. a visible durable owner/conversation-scoped quota-wait countdown plate.

No cache semantics, capability, query planner, provider surface, allowlist or delivery algorithm is intentionally changed.

## Patch integrity

Patch manifest:

`development/live-repair-quota-countdown/PATCH_PARTS.md`

Concat patch:

- bytes: `12381`
- SHA-256: `b30a91128fbbec229d4bf1083f5df94cbdc5ed1b6b951fe4c75333654264a575`
- parsed production files: exactly `service_worker.js`, `content_script.js`

Git numstat:

- `service_worker.js`: +38 / -2
- `content_script.js`: +103 / -0

All three uploaded raw parts were fetched back from live GitHub and matched local Git blob SHAs exactly.

## Repair A — quota launch safety

Existing nominal contract remains:

- family `seller.analytics_data.v1`
- `min_interval_ms = 60000`

New fixed internal bridge guard:

`ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5000`

Effective dispatch boundary:

`last_provider_request_at + 60000 + 5000`

The bridge reports the 5000 ms quantity explicitly as `bridge_launch_safety_ms`; it is not described as an Ozon-documented endpoint limit.

Important migration behavior: an old persisted family record whose `next_allowed_at` reflects only the former +60000 ms boundary cannot bypass the new guard. Acquisition recomputes a lower bound from persisted `last_provider_request_at` and uses the maximum of the stored boundary and guarded boundary.

Every real dispatch reserves the new guarded next boundary before provider execution. A provider 429 is still returned once and is not retried. Existing usable Retry-After behavior remains max/extension-only.

## Repair B — visible wait countdown

The worker safely exposes the current durable quota-wait state through the already existing public manual/autorun state objects. Exposed wait fields are limited to:

- quota family;
- nominal interval;
- bridge launch safety;
- effective interval;
- `next_allowed_at`;
- queue index;
- waiting timestamp;
- `automatic_retry=false`.

Account hash, credential revision/scope and credentials are not included in this public wait object.

The content runtime displays:

`Ожидание лимита Ozon`

`Ограничение частоты запросов Ozon. Следующий запрос через MM:SS.`

`Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`

and the local absolute due clock.

At/after due time, before completion is known, it displays:

`Лимит Ozon снят — отправляем запрос…`

After manual batch admission the content runtime briefly checks the existing worker manual-state endpoint for up to 5 seconds at local 250 ms intervals only to discover whether the durable batch entered `quota_waiting`. Once discovered, the visible countdown is calculated locally from `next_allowed_at` once per second. These are extension runtime messages only; they do not contact Ozon or any provider.

On content-state/manual-state restoration, the same public durable wait rehydrates the countdown. Existing manual busy readiness keeps Ozon execution buttons disabled while the batch is active.

## Local checks

Exact operator baseline ZIP present locally:

- size `100320`
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`
- 17 production files

Its `content_script.js` SHA-256 was:

`b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`

which is exactly the frozen Step-4 content-script hash. The repaired content script passed `node --check` and has SHA-256:

`d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

The combined repair patch passed Git patch syntax/numstat parsing. It was also applied against a deterministic proxy containing the exact accepted Step-3 quota-function text and exact frozen content script; both resulting JS files passed `node --check`.

Static proxy result:

`REPAIR_STATIC_PROXY_PASS`

Quota VM result:

`QUOTA_GUARD_VM_PASS`

The VM proved:

- first dispatch records nominal 60000 ms + fixed 5000 ms guard;
- a call at +60001 ms is still denied;
- a call at +65000 ms is allowed;
- old persisted +60000 ms state is migration-guarded to +65000 ms from `last_provider_request_at`;
- a shorter Retry-After cannot shorten the current guarded boundary;
- a longer Retry-After extends it.

Countdown pure-function VM result:

`COUNTDOWN_TEXT_VM_PASS`

It proved a durable due time renders `MM:SS` and switches exactly to the sending-state copy at/after due.

No network/provider call exists in the countdown renderer/ticker.

## Pre-freeze limitation and mandatory next checkpoint

This runtime no longer contains the full reconstructed frozen Step-4 `service_worker.js` bytes, only the exact operator baseline plus GitHub patch lineage. Therefore this document does NOT claim a final repaired service-worker SHA or exact 17/17 repaired reconstruction.

Do not freeze this implementation yet.

Mandatory next engineering checkpoint is an exact detached reconstruction of `4ce190c8bbdc438dcdf407abbe4dbecd846736df` from the accepted operator ZIP + Step1/2/3/4 raw Git patch bytes, verification of the frozen 17-file hashes, application of the exact repair concat SHA `b30a91128fbb...`, then:

- `git apply --check` / patch apply PASS against exact frozen bytes;
- exactly two changed production files;
- all other fifteen byte-identical to frozen Step 4;
- resulting repaired `service_worker.js` SHA recorded;
- repaired content-script SHA must equal `d95d2ca0...`;
- all 17 JS syntax / manifest / diff checks;
- mocked quota/countdown integration only;
- `REAL_OZON_REQUESTS = 0`.

Only after that checkpoint may ChatGPT freeze the exact repair implementation SHA and publish a standalone independent Codex validation plan.