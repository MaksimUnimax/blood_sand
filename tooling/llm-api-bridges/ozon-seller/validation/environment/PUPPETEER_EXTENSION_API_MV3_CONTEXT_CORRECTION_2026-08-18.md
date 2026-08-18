# Ozon Bridge — Puppeteer Extension API MV3 validation correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit.

## Evidence from rerun 5

Report commit:
`20c901dda279b048013ce2095cad0943736091ca`

The exact candidate reconstructed correctly and blocks 01-14 passed. Browser block failed before behavioral assertions because the generic `browser.waitForTarget(target.type()==='service_worker')` path did not acquire the installed extension MV3 target after install/popup bootstrap.

## Correct Puppeteer 25.4.0 extension-runtime path

The accepted QA environment uses Puppeteer 25.4.0. Its public Extension API is the authority for installed extension background contexts.

Validation-only browser harness must use this sequence:

1. `const extensionId = await browser.installExtension(candidateDir);`
2. `const extensions = await browser.extensions();`
3. `const extension = extensions.get(extensionId);`
4. assert `extension` exists, is enabled, and `extension.id === extensionId`;
5. create an inert local/synthetic page suitable for action triggering; no external network;
6. query `await extension.workers()`;
7. if no worker is active, call `await extension.triggerAction(page)` exactly once as validation automation, then poll `await extension.workers()` within a bounded timeout;
8. require exactly the candidate extension's own active worker/background context before continuing;
9. use that returned extension worker for extension-context validation where supported, rather than relying on generic service-worker target discovery;
10. if lower-level CDP access is still required by an existing assertion, resolve it only after the Extension API has proved the candidate worker exists; do not weaken the behavioral assertion.

The one `triggerAction(page)` call is harness automation, not an operator browser action. It must not change stored Manual/Autorun settings and must not execute provider calls. The runner must retain:

`OPERATOR_BROWSER_ACTIONS=0`
`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`

## Superseded validation bootstraps

For the authoritative rerun, supersede as primary worker-discovery mechanisms:

- synthetic ChatGPT wake bootstrap from `f363ea1cb31c2ceeb0bc1776a207acd8e40c7ab5`;
- popup-page-only wake bootstrap from `100811a5607edc57902f9458ef08ccda5e760715`;
- generic `browser.waitForTarget(... service_worker ...)` as the sole proof that the installed candidate MV3 worker is active.

Those attempts remain historical evidence only.

The DevToolsActivePort atomic/transient-lock corrections remain applicable because they concern initial browser attachment before the Extension API is available.

## Assertions are not weakened

This correction changes only how the accepted browser fixture discovers/awakens the installed candidate extension runtime.

Do not change:

- candidate production bytes;
- Chrome for Testing version;
- Node/Puppeteer versions;
- `browser.installExtension()` requirement;
- synthetic ChatGPT/Alice page fixtures used by existing behavior tests;
- quota/countdown timings;
- owner isolation assertions;
- native Copy assertions;
- occupied/missing composer assertions;
- Manual OFF/ON assertions;
- one-Send/Microphone assertions;
- provider/network counters;
- packaging requirements.

If the official Extension API cannot enumerate the installed candidate or cannot obtain its worker after one bounded `triggerAction(page)` wake attempt, classify `ENVIRONMENT_ERROR` and stop without changing production.
