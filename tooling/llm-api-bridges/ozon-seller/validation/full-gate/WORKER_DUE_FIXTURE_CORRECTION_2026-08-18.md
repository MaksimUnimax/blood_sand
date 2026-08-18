# Ozon full-gate worker due fixture correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_FIXTURE_CORRECTION`

## Trigger

The first consolidated pre-operator gate report at commit `ee33f38a56e860dac7f2605de496b24c230516e9` classified the terminal failure as `HARNESS_FIXTURE_FAILURE`.

The exact production candidate reconstructed successfully:

- frozen artifact SHA-256 `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`;
- repair patch SHA-256 `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`;
- final worker SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
- final content SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`;
- 17 production files;
- exactly two changed production files;
- protected 15 byte-identical.

Blocks 11 and 12 passed. Real Seller/Performance requests and operator browser actions were all zero.

The consolidated run stopped in the accepted carry-forward worker harness after these markers:

- `V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS`

The failure was `waitFor timeout` while waiting for the mocked provider call after the synthetic guarded-due alarm.

## Root fixture issue

Pinned carry-forward worker source blob:

`0da73bdd1bb1608074781bb0c594c7875a4fe3ce`

The guarded-wait scenario obtains the actual durable worker-owned deadline at:

`waiting.batch.quota_wait.next_allowed_at`

but then waits using the separately calculated local fixture value `due` before firing the synthetic alarm.

The production contract is defined by the persisted worker-owned `next_allowed_at`, not by the harness's duplicate local calculation. Using the local calculation creates an unnecessary timer-boundary race and is not a production assertion.

## Authorized validation-only correction

For the guarded-wait scenario only, after `waiting` has been obtained, define:

```js
const persistedDue = Number(waiting.batch.quota_wait.next_allowed_at || 0);
assert(persistedDue > 0, 'durable guarded due missing');
assert(persistedDue >= due, 'guarded due was shortened');
```

Replace the old fixture wait/alarm section:

```js
await new Promise(r=>setTimeout(r,Math.max(0,due-Date.now()+30)));
for(const fn of alarmListeners) await fn({name:'ozon-provider-quota-wake-v1',scheduledTime:Date.now()});
await waitFor(()=>providerCalls.length===1,3000);
assert(providerCalls[0].at>=due-5,'provider dispatched before guarded due');
```

with:

```js
await new Promise(r=>setTimeout(r,Math.max(0,persistedDue-Date.now()+250)));
for(const fn of alarmListeners) await fn({name:'ozon-provider-quota-wake-v1',scheduledTime:Date.now()});
await waitFor(()=>providerCalls.length===1,10000);
assert(providerCalls[0].at>=persistedDue-5,'provider dispatched before persisted guarded due');
```

The existing post-call duplicate check remains mandatory:

```js
await new Promise(r=>setTimeout(r,250));
assert(providerCalls.length===1,'guarded resume created duplicate provider call');
```

## Why this does not weaken the gate

This correction strengthens alignment with production authority:

- the deadline being tested is the exact value persisted by the worker;
- no provider call is allowed before that persisted deadline;
- exactly one mocked provider call is still required after due;
- duplicate-call prevention remains required;
- quota family / 60000 / 5000 / 65000 semantics are unchanged;
- no production code is edited;
- no assertion is removed;
- no real network request is introduced.

The increase from 3000 ms to 10000 ms applies only after the fixture has already waited beyond the exact persisted deadline. It tolerates Windows/CFT/VM scheduling latency; it does not permit an early provider call.

## Rerun rule

The previous consolidated run is not a PASS and must not be reinterpreted.

A new authoritative consolidated full-gate run is required from the same deterministic production candidate, with only the validation-only fixture correction above in addition to the already accepted test-only harness transformations.

Do not modify production. Do not reuse partial PASS state from the failed run. Packaging remains forbidden until the new consolidated run emits `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`.
