# Ozon Bridge — direct CDP MV3 worker activation correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_WORKER_ACTIVATION_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit, no browser-version change, no dependency update, and no functional assertion weakening.

## Evidence requiring correction

RERUN10 report commit:
`1162902368486cc5c8618748b5b057400d828427`

RERUN10 proved all of the following before the browser-runtime stop:

- exact candidate reconstruction PASS;
- production inventory 17 PASS;
- exactly two authorized changed production files PASS;
- protected other 15 production files byte-identical PASS;
- permanent blocks 01 through 14 PASS;
- canonical source CFT inventory PASS;
- source -> validation-owned CFT copy byte identity PASS;
- copied Chromium setup exit code 78 PASS;
- post-setup copied-CFT byte identity PASS;
- Chrome launch PASS;
- actual spawn args exact match PASS;
- `browser.installExtension(candidateDir)` PASS;
- `browser.extensions()` candidate enumeration PASS;
- zero real Ozon/Performance requests;
- zero operator browser actions;
- zero production/candidate/source-CFT modifications.

The run then failed before browser behavior assertions because the validation worker-activation path did not obtain the candidate MV3 worker and the CFT process later emitted the known GPU fatal.

## Why `Extension.triggerAction(page)` is no longer worker-activation authority

The earlier validation correction `d9c42e2cbffca37fc84cd14f294d455e423da542` allowed one `extension.triggerAction(page)` call when `extension.workers()` initially returned zero.

For Puppeteer 25.4.0, `CdpExtension.triggerAction(page)` is implemented by sending CDP `Extensions.triggerAction` with the extension id and page tab target id. The public API defines this as triggering the extension's default action; it is not a direct service-worker-start primitive.

Therefore the trigger-action call is superseded as the primary MV3 worker activation mechanism for this gate. It may not be used merely to obtain the service worker.

## Direct worker activation authority

Chrome DevTools Protocol exposes the `ServiceWorker` domain and the explicit command:

`ServiceWorker.startWorker({scopeURL})`

For the validation-only browser harness, after the exact candidate has been successfully installed and enumerated:

1. Obtain a browser-level CDP session through Puppeteer's public target/session API (`browser.target().createCDPSession()`).
2. Enable the `ServiceWorker` domain.
3. Capture current `ServiceWorker.workerRegistrationUpdated` / `ServiceWorker.workerVersionUpdated` diagnostics.
4. Identify only the registration belonging to the installed candidate extension id. Its scope must be under `chrome-extension://<candidateExtensionId>/`.
5. If the candidate `Extension` object already reports an active worker, use it and emit the existing worker-activation PASS marker without calling `startWorker`.
6. Otherwise call `ServiceWorker.startWorker({scopeURL:<exact candidate registration scope>})` exactly once.
7. Bounded-poll only `extension.workers()` for the same candidate extension.
8. Require the returned worker URL to start with `chrome-extension://<candidateExtensionId>/` before continuing to worker-dependent assertions.
9. Record the exact registration scope, service-worker version/running-status diagnostics, and whether `startWorker` was called.
10. Do not open/click a popup, do not call `extension.triggerAction(page)`, do not use a synthetic ChatGPT wake, and do not use popup-only wake as a worker-discovery mechanism.

If no candidate service-worker registration can be identified after successful extension installation/enumeration, or the direct `ServiceWorker.startWorker` call cannot obtain the candidate worker, classify as an environment/harness failure and stop without production edits.

## Browser environment remains unchanged

Retain exactly the qualified environment from:
`c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`

and canonical inventory/path corrections:

- `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
- `36bbb81062d12348e87ce6297af2df8566bf6a46`

Still require:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- validation-owned byte-identical copied CFT tree;
- copied setup exit code `78`;
- post-setup regular-file byte identity;
- `ignoreDefaultArgs:true`;
- `headless:false`;
- `enableExtensions:true`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- fresh temporary profile;
- exact already-qualified minimal Chrome args;
- no `--disable-gpu`;
- no `--no-sandbox`;
- no GPU/sandbox/crash-limit bypass switches;
- no dependency changes;
- no operator profile.

## Hard safety invariants

The worker-activation probe and later full gate must retain:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`
`candidate_modifications_by_validator=0`
`source_cft_modifications_by_validator=0`

This correction changes validation worker activation only. It does not carry forward RERUN10 as a full PASS and does not authorize packaging.