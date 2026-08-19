# Ozon Bridge — Chrome 151 target-model forensic correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_FORENSIC_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit, no extension install, no full 01–16 gate, no dependency change, and no new Chrome switch.

## Proven evidence

GPU sandbox A/B report:
`1b34539c9869bc93c6a367e65c353a8d79f39a7b`

In both A/B arms, before `browser.newPage()` Puppeteer exposed only `browser` and `other` targets. Arm A then died with GPU `0xC0000022`; Arm B suppressed that GPU fatal but `browser.newPage()` still timed out while the browser process remained alive. Therefore the `newPage()` timeout is not explained by the GPU fatal alone.

Puppeteer 25.4.0 source authority:

- `packages/puppeteer-core/src/cdp/Browser.ts`: `_createPageInContext()` sends `Target.createTarget({url:'about:blank', ...})`, receives `targetId`, then waits for a Puppeteer target with exactly that same id before returning a Page.
- `packages/puppeteer-core/src/cdp/Target.ts`: target type `tab` maps to `TargetType.TAB`, and `_isTargetExposed()` explicitly returns false for TAB targets.
- `packages/puppeteer-core/src/cdp/TargetManager.ts`: Chrome tab targets and their child page targets are handled separately by the auto-attach model.

These source facts create one precise unresolved question: on Chrome for Testing 151.0.7922.47, does `Target.createTarget` return a top-level `tab` target id while the actual page is exposed as a different child `page` target id? If yes, Puppeteer 25.4.0 `_createPageInContext()` can wait forever for the returned tab id because TAB is deliberately not exposed.

That relationship must be measured directly before any further worker or full-gate attempt.

## Authorized forensic

Use the same qualified Windows environment materialization already proven by preflight6:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- CFT `151.0.7922.47`
- canonical CFT inventory algorithm from correction `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
- validation-owned byte-identical CFT copy
- copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` once, `shell:false`, no elevation, require exit code `78`
- post-setup regular-file byte identity
- `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`, fresh profile
- exact existing minimal argument list only; do not add `--disable-gpu-sandbox` or any other new switch for this forensic

Do not install the extension.
Do not call `browser.newPage()`.
Do not use `extension.triggerAction()`.
Do not invoke any ServiceWorker command.

After launch, use a browser-level CDP session only for the Target domain and perform exactly one direct:

`Target.createTarget({url:'about:blank'})`

Capture the returned `targetId` immediately.

Before and after that call, capture raw `Target.getTargets` results. Also subscribe before the call to raw Target events needed to establish identity/relationship, including `Target.targetCreated`, `Target.targetInfoChanged`, `Target.attachedToTarget`, and `Target.detachedFromTarget` where available on that session.

For every target related to the returned id or its descendants/children, record at minimum:

- targetId
- type
- url
- attached
- openerId, if present
- subtype, if present
- browserContextId, if present

Determine whether:

A. returned id itself is type `page` and becomes visible/attached;
B. returned id is type `tab` and a distinct child `page` target is created/attached;
C. no usable page target is created at all;
D. another exact target topology occurs.

Also capture Puppeteer `browser.targets()` after the raw CDP create operation, but do not call `browser.newPage()`.

Do not navigate, evaluate page JavaScript, or install the candidate. This forensic is only target-model diagnosis.

## Required conclusion rule

Classify only from observed raw target topology:

- `PUPPETEER_CHROME151_TAB_PAGE_ID_MISMATCH_PROVEN` only if `Target.createTarget` returns a `tab` id and a distinct child `page` target exists while Puppeteer does not expose the returned TAB id.
- `PUPPETEER_TARGET_MODEL_MISMATCH_NOT_PROVEN` for any other topology.
- `ENVIRONMENT_ERROR` only if the raw Target operation itself cannot be completed because Chrome exits or the protocol operation fails.

No production implication may be inferred from this forensic.

## Safety counters

Require:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications `0`
- candidate modifications `0`
- source CFT modifications `0`
