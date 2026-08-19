# Ozon Bridge v0.1.19 — RERUN15 mutable discovery-state correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_HARNESS_CORRECTION`

Production candidate remains immutable. This correction changes no production file, candidate byte, browser version, dependency, permanent functional assertion, or packaging rule.

## Evidence

RERUN15 report commit:
`10b555429141be410fc34466f793cc976fb0c2da`

The exact RERUN15 runner terminated inside `phaseB` with:

`TypeError: Assignment to constant variable.`

while updating the Puppeteer/raw worker-discovery snapshot. Therefore Phase B did not run to completion and permanent blocks 01-16 were not reached. This is a validation harness implementation defect, not an environment or production failure.

## Required correction

The next integrated full-gate runner MUST NOT reuse the RERUN15 executable.

All worker-discovery snapshots/collections/references that are reassigned during bounded polling MUST be declared mutable (`let`) or updated in-place without rebinding. Immutable configuration/constants remain `const`.

At minimum the code paths that refresh these values during worker discovery must be safe from const reassignment:

- Puppeteer candidate worker snapshot;
- raw `Target.getTargets` candidate service-worker snapshot;
- selected candidate worker/target reference when initially absent and later discovered;
- registration/version evidence snapshots if they are rebound while waiting.

No production code may be changed to accommodate this.

## Mandatory runner self-test before browser launch

Before launching Chrome, the exact next top-level runner must execute an in-process, network-free harness-state self-test of the actual helper/functions used for Phase-B discovery. This is not a browser preflight and must occur inside the same final top-level execution.

The self-test must exercise at least these transitions on mock data:

1. no worker -> refreshed Puppeteer worker appears;
2. no worker -> refreshed raw service-worker target appears;
3. initial empty registration snapshot -> candidate registration appears;
4. repeated bounded refresh without discovery does not throw;
5. selected target reference transitions from absent to present;
6. both Puppeteer and raw snapshots can be refreshed more than once.

Any `TypeError`, const-reassignment error, stale immutable snapshot, or failure to observe the mock transition fails the runner before Chrome launch as `HARNESS_ERROR`.

Require exact marker:

`RERUN16_MUTABLE_DISCOVERY_STATE_SELFTEST_PASS`

## Existing accepted browser contract remains unchanged

Preserve the RERUN15 intended Phase-B order:

1. verify exact normalized Chrome args before extension install;
2. install/enumerate exact candidate;
3. qualify raw PAGE Runtime/Page/Fetch/local fixture;
4. call `extension.workers()` and raw `Target.getTargets`;
5. if candidate worker absent, `ServiceWorker.enable`;
6. observe exact candidate registration scope;
7. exactly one `ServiceWorker.startWorker(scopeURL)`;
8. bounded-poll BOTH Puppeteer workers and raw service-worker targets;
9. raw exact service-worker target is sufficient evidence of activation even if Puppeteer exposure lags;
10. Runtime through `worker.client.send(...)` first, raw same-target CDP fallback second;
11. no `worker.evaluate()`, no `browser.newPage()`, no action/popup wake.

A bare `worker missing` error without the required activation evidence is forbidden.

## Full-run continuation remains mandatory

After Phase B PASS, the same top-level runner must continue immediately through permanent blocks 01-14, block 15, block 16 packaging, fresh-extract byte verification, and only then `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`.
