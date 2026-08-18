# Ozon Bridge v0.1.19 — manual delivery composer-wait regression + final Codex gate

Date: 2026-08-18
Status: `REQUIRED_BEFORE_OPERATOR_HANDOFF`

## Authority / current release state

Repository: `MaksimUnimax/blood_sand`

Development branch:
`dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

Starting artifact authority:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

Published artifact commit:
`5245551cb4ff01e388146397b1a0075c0e0f013b`

Important release state:

`v0.1.19` MUST NOT be treated as fully live-tested on 2026-08-18. The complete live Step1+Step2+Step3+Step4+quota+delivery suite remains pending and must be resumed after this delivery defect is closed.

## Production defect to close

Observed live behavior:

1. Manual Ozon provider work completes successfully.
2. Report becomes ready for delivery.
3. ChatGPT composer contains unrelated operator text.
4. Existing delivery path returns `COMPOSER_CONTAINS_OTHER_TEXT` and preserves the report.
5. No durable active wait for composer-clear is maintained.
6. Manual owner remains busy and Ozon buttons can remain disabled.

The required behavior is NOT to overwrite existing operator text and NOT to discard the report automatically.

## Required product behavior

### Busy composer

When a Manual report is ready and the target composer contains unrelated text:

- preserve the pending report durably;
- enter an explicit durable `WAITING_FOR_COMPOSER_CLEAR`-equivalent delivery state;
- show a persistent user-visible plate with exact operator-facing meaning:
  `Очистите поле ввода, чтобы получить отчёт.`
- the plate MUST NOT auto-expire while the pending report still exists and has not been inserted;
- do not modify, clear, replace, select, submit, or otherwise mutate unrelated operator composer text;
- watch/reacquire the current composer using event-driven DOM observation with a bounded fallback poll only as resilience;
- once the correct target composer is empty, insert the preserved report exactly once and continue through the existing proven delivery FSM;
- after successful report insertion, remove the composer-wait plate;
- preserve the existing one-Send-click rule and existing delivery confirmation semantics;
- a content-script restart/page lifecycle recovery must restore the waiting state from worker-owned durable state without duplicating insertion or Send.

### Manual OFF cancellation scope

Turning Manual mode OFF while this owner has a pending Manual request/result/delivery MUST cancel and delete ONLY that current pending Manual operation/delivery for that owner.

Required cancellation effects:

- stop only that operation's composer-clear watcher/recovery;
- remove only that operation's persistent plate;
- delete only that operation's pending report/result/delivery transient state;
- release only that Manual owner operation so the conversation can accept a new Manual request after Manual mode is enabled again;
- ensure Ozon buttons become usable again when no new Manual operation is active.

Manual OFF MUST NOT reset or mutate unrelated system state, including:

- Seller provider quota state;
- `last_provider_request_at`;
- `next_allowed_at`;
- 60000 ms reviewed provider minimum;
- 5000 ms bridge launch safety;
- effective guarded 65000 ms boundary;
- Retry-After extensions;
- verified analytics cache or cache TTL/state;
- Seller identity / credential revision state except through existing credential-specific flows;
- conversation binding;
- extension settings unrelated to Manual mode itself;
- diagnostics history except normal new diagnostic events;
- other conversation/owner operations;
- Autorun state belonging to other owners;
- Performance API state;
- native ChatGPT Copy behavior.

After Manual OFF -> ON, a fresh Manual command is a new Manual operation, but it MUST still obey the pre-existing Seller quota/cache state. Example: on a cold cache miss, if the 65000 ms guarded interval has not elapsed, the new request must enter the normal quota wait rather than bypassing or resetting it.

## Regression tests to add before production modification

The tests are protection, not after-the-fact documentation. They must be created first and demonstrated to catch the current defect where applicable.

### A. Worker state/cancellation guard

Required assertions:

- pending Manual delivery survives `COMPOSER_CONTAINS_OTHER_TEXT` as a recoverable waiting delivery;
- Manual OFF removes only that owner's pending operation/result/delivery;
- Manual OFF leaves provider quota state byte/structurally unchanged;
- Manual OFF leaves provider result cache byte/structurally unchanged;
- Manual OFF leaves other owners' Manual operations unchanged;
- Manual OFF leaves unrelated Autorun owners unchanged;
- Manual OFF -> ON reports ready state for a new operation when no new operation is active;
- a new cold-cache request after OFF -> ON still respects existing `next_allowed_at`/65000 ms guard;
- no provider request is replayed as part of cancellation/re-enable;
- no automatic retry is introduced.

### B. Browser behavioral composer-wait guard

Use synthetic ChatGPT fixtures and blocked/intercepted provider hosts; no real credentials and no real provider requests.

Required assertions:

- report-ready + non-empty composer shows persistent plate;
- exact operator-facing message includes `Очистите поле ввода, чтобы получить отчёт.`;
- unrelated composer text remains byte/text identical while waiting;
- plate remains present across time and does not auto-dismiss before insertion/cancel;
- clearing the correct composer triggers exactly one report insertion;
- report is never inserted into the wrong conversation/owner composer;
- plate disappears only after successful insertion or explicit Manual OFF cancellation;
- existing one-Send-click behavior is preserved;
- content-script/page recovery restores waiting without duplicate insertion;
- Manual OFF while waiting removes pending report/wait plate and releases buttons;
- Manual OFF -> ON allows a new Manual operation;
- other owner remains unaffected;
- native ChatGPT Copy remains independent;
- ChatGPT and Alice structural bindings remain protected unless this change necessarily touches an adapter, in which case both require explicit regression coverage.

### C. Existing carry-forward regression suite

The new tests do not replace existing Step1-4 / live-repair gates. Final candidate must also pass the existing protected regression surfaces:

- strict contract validation / zero-provider preexec failures;
- capability resolver privacy and non-AI-callability;
- one-probe-per-relevant-batch and zero-probe universal/performance cases;
- entitlement matrix;
- Step2 planner/coalescing/projection and restart-no-retry;
- Step3 global Seller quota isolation, durable waits, Retry-After extension-only, response verifier and safe errors;
- Step4 verified cache/prefetch semantics, cache-before-quota and Seller isolation;
- effective 65000 ms quota guard;
- zero immediate retry;
- zero alarm/startup replay after an already-attempted request;
- two-owner isolation;
- ChatGPT/Alice binding regressions;
- native Copy independence;
- delivery FSM successful empty-composer path;
- security/transport/credential boundaries;
- all production JavaScript syntax checks;
- manifest parse;
- production inventory and protected-file/function drift checks appropriate to the final authorized delta.

## Development gate before independent Codex validation

ChatGPT engineering must complete all of the following before asking Codex to validate:

1. reconstruct the exact published starting production tree;
2. record starting hashes/inventory;
3. add and execute the regression tests above;
4. implement the smallest coherent production change needed for the defect;
5. avoid unrelated refactors, duplicated state machines, timer stacks, magic polling loops, or broad reset helpers;
6. run the complete local/mock/browser regression set with provider network blocked;
7. prove `REAL_OZON_REQUESTS=0` and `REAL_PERFORMANCE_REQUESTS=0` in automated validation;
8. freeze one exact candidate commit and exact production hashes;
9. do not package/operator-handoff a candidate that has not passed this engineering gate.

## Mandatory final independent Codex gate

Codex is the FINAL INDEPENDENT VALIDATOR, not the implementation agent.

Codex must receive a standalone prompt pinned to one exact frozen candidate commit and exact expected production hashes.

Codex MUST NOT modify production.

Codex must independently:

- reconstruct or materialize the exact candidate from live GitHub;
- verify exact candidate commit/hash/inventory before tests;
- run the new worker cancellation/quota/cache regression guard;
- run the new browser composer-wait behavioral guard;
- run the complete existing carry-forward Step1-4/live-repair/security/delivery regression suite;
- use only mocked/intercepted provider behavior;
- perform zero real Ozon requests;
- perform zero real Performance requests;
- verify no broad Manual reset was introduced;
- verify Manual cancellation is owner-scoped;
- verify provider quota/cache survive Manual OFF -> ON unchanged;
- verify 65000 ms guarded timing remains effective after OFF -> ON;
- verify no hidden retry/replay/pagination/fanout was introduced;
- classify any failure as production behavior, harness fixture, harness error, or environment error rather than editing production to make a harness pass;
- publish a report-only validation branch/commit;
- make no release/promotion decision itself.

## Handoff rule

The extension may be handed to the operator for real manual testing ONLY when:

- ChatGPT engineering regression gate: PASS;
- independent Codex final gate: PASS;
- exact packaged ZIP is built from the exact independently-tested production tree;
- fresh extraction hashes match the tested tree;
- package SHA-256 is recorded;
- no automated test used real Ozon/Performance credentials or provider calls.

After operator handoff, the previously pending full `v0.1.19` live suite still must be resumed. The current work closes the delivery defect and its regressions; it does not retroactively mark the full v0.1.19 package as live-tested.
