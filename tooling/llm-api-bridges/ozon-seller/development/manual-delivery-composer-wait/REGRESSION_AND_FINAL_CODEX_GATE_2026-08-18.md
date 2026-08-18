# Ozon Bridge v0.1.19 — manual delivery composer-wait targeted regression plan

Date: 2026-08-18
Status: `TARGETED_DEVELOPMENT_GATE`

## Authority

Repository: `MaksimUnimax/blood_sand`

Development branch:
`dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

Starting artifact authority:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

Published artifact commit:
`5245551cb4ff01e388146397b1a0075c0e0f013b`

Permanent full pre-operator handoff gate:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Important status:

`v0.1.19` MUST NOT be treated as fully live-tested on 2026-08-18. The complete live Step1+Step2+Step3+Step4+quota+delivery suite remains pending and must be resumed after this delivery defect is closed and a new build is handed to the operator.

## Production defect

Observed live behavior:

1. Manual Ozon provider work completes successfully.
2. Report becomes ready for delivery.
3. ChatGPT composer contains unrelated operator text.
4. Existing delivery path returns `COMPOSER_CONTAINS_OTHER_TEXT` and preserves the report.
5. No durable active wait for composer-clear is maintained.
6. Manual owner remains busy and Ozon buttons can remain disabled.

The repair must preserve operator text and retain the report until it can be delivered or the current pending Manual operation is explicitly cancelled by Manual OFF.

## Required behavior

### Busy composer

When a Manual report is ready and the target composer contains unrelated text:

- preserve the pending report durably;
- enter an explicit durable waiting-for-composer-clear state integrated into existing Manual delivery ownership;
- show a persistent plate whose operator-facing text includes exactly:
  `Очистите поле ввода, чтобы получить отчёт.`
- do not auto-expire the plate while the report is still pending;
- do not modify, clear, replace, select or submit unrelated operator composer text;
- watch/reacquire the correct composer using event-driven DOM observation with bounded fallback polling only for resilience;
- once the correct target composer is empty, insert the preserved report exactly once;
- remove the plate after successful insertion;
- continue through the existing one-Send/Microphone delivery FSM;
- content-script/page recovery must restore waiting from durable worker state without duplicate insertion or Send.

### Manual OFF cancellation scope

Turning Manual mode OFF while this owner has a pending Manual request/result/delivery must cancel and delete ONLY that current pending Manual operation/delivery for that owner.

Required effects:

- stop only that operation's composer-clear watcher/recovery;
- remove only that operation's plate;
- delete only that operation's pending report/result/delivery transient state;
- release only that owner operation so a new Manual operation can be accepted after re-enable;
- restore Ozon button readiness when no operation is active.

Manual OFF must NOT reset or mutate unrelated state, including:

- Seller provider quota state;
- `last_provider_request_at`;
- `next_allowed_at`;
- 60000 ms provider minimum;
- 5000 ms bridge launch safety;
- effective 65000 ms guarded boundary;
- Retry-After extensions;
- verified analytics cache / cache TTL/state;
- Seller identity / credential revision state except existing credential-specific flows;
- conversation binding;
- unrelated settings;
- diagnostics history except normal new diagnostic events;
- other Manual owners;
- unrelated Autorun owners;
- Performance state;
- native ChatGPT Copy.

After Manual OFF -> ON, a fresh Manual command is a new operation, but existing quota/cache state still applies. On a cold cache miss before the existing `next_allowed_at`, the new operation must enter normal quota wait rather than bypassing/resetting timing.

# Targeted development tests for this repair

These are the ONLY mandatory development tests while this repair is being implemented. They do not trigger the permanent full historical project suite.

## A. Worker state/cancellation guard

Required assertions:

- occupied-composer delivery remains recoverable/pending rather than terminally lost;
- Manual OFF removes only that owner's current pending operation/result/delivery;
- Manual OFF leaves provider quota state structurally/byte-equivalent;
- Manual OFF leaves provider result cache structurally/byte-equivalent;
- Manual OFF leaves other Manual owners unchanged;
- Manual OFF leaves unrelated Autorun owners unchanged;
- OFF -> ON returns the owner to ready state when no new operation is active;
- a new cold-cache operation after OFF -> ON still respects existing `next_allowed_at` and 65000 ms guard;
- cancellation/re-enable executes zero provider requests;
- no automatic retry/replay is introduced.

## B. Browser composer-wait guard

Use synthetic ChatGPT fixtures and blocked/intercepted provider hosts. No real credentials/provider requests.

Required assertions:

- report-ready + non-empty composer shows the persistent plate;
- plate includes `Очистите поле ввода, чтобы получить отчёт.`;
- unrelated composer text remains identical while waiting;
- plate does not auto-dismiss before insertion/cancel;
- clearing the correct composer triggers exactly one report insertion;
- wrong conversation/owner composer is never used;
- plate disappears only after successful insertion or explicit Manual OFF cancellation;
- existing one-Send-click behavior remains intact;
- recovery restores waiting without duplicate insertion;
- Manual OFF removes pending report/plate and releases buttons;
- OFF -> ON allows a new operation;
- second owner is unaffected;
- native ChatGPT Copy remains independent;
- ChatGPT/Alice binding code is regression-tested only if this repair actually touches their adapter/binding paths.

## C. Changed-path static/integrity guard

Required assertions:

- all changed production JavaScript passes `node --check`;
- changed files are exactly the authorized repair scope;
- directly affected delivery/manual-state functions are reviewed for duplicate state machines/timer stacks;
- no new provider URL/host/method/auth surface;
- no new retry/replay/pagination/fanout;
- no real Ozon/Performance requests in automated repair tests.

## Development completion rule

Before freezing this repair candidate:

1. reconstruct the exact starting production tree;
2. record starting hashes/inventory;
3. demonstrate the defect with a targeted RED test where practical;
4. implement the smallest coherent production correction;
5. run A+B+C targeted tests until GREEN;
6. freeze one exact candidate commit and production hashes.

Do NOT run the permanent full historical regression gate after every edit.

## Pre-operator rule

Only when the complete candidate is ready to be handed to the operator, follow:

`OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

That permanent document requires ONE consolidated full Codex run over all currently Codex-testable functionality. The current composer-wait/cancellation behavior becomes part of that permanent full gate once implemented.

No installable/testable ZIP may be handed to the operator before that final full gate passes and the package is proven byte-identical to the tested production tree.
