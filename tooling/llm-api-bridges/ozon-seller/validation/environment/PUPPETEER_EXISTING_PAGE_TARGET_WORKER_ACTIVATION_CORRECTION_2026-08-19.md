# Ozon Bridge — existing page-target CDP worker activation correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit.

## Evidence

RERUN10 report:
`1162902368486cc5c8618748b5b057400d828427`

Page-session preflight8 report:
`b92eb20e0d4330b1a813a73b386ba131a1dc7a4c`

Preflight8 proved all of the following before failure:

- exact candidate hashes: PASS;
- canonical 308-file CFT inventory: PASS;
- validation-owned byte-identical CFT copy: PASS;
- copied `setup.exe --configure-browser-in-directory=<copy>` exit code `78`: PASS;
- copied CFT regular-file bytes unchanged after setup: PASS;
- exact Puppeteer/CFT launch: PASS;
- exact minimal spawn args: PASS;
- `browser.installExtension(candidateDir)`: PASS;
- `browser.extensions()` candidate enumeration: PASS;
- initial candidate worker count: `0`.

The failure happened while calling `browser.newPage()` solely to obtain a page-target CDP session. Chrome hit the already-observed GPU fatal before `page.target().createCDPSession()`, `ServiceWorker.enable`, or `ServiceWorker.startWorker` were reached. Therefore preflight8 did not test the page-target ServiceWorker path.

## Corrected target acquisition

Do not call `browser.newPage()` for worker activation.

The qualified launch already includes `about:blank` as the final exact Chrome argument. After successful launch/install/enumeration:

1. inspect `browser.targets()` only;
2. record the target inventory `{type,url}`;
3. require an existing target with `target.type() === 'page'` and `target.url() === 'about:blank'`;
4. do not call `target.page()` or `target.asPage()` merely to obtain a CDP session;
5. call `await existingAboutBlankTarget.createCDPSession()` directly;
6. send `ServiceWorker.enable` on that page-target session;
7. define the exact candidate scope as `chrome-extension://<extensionId>/`;
8. registration events may be recorded as diagnostics, but candidate-registration event observation is not a prerequisite for the direct start command;
9. call `ServiceWorker.startWorker` exactly once with `{scopeURL: candidateScope}`;
10. bounded-poll only `await extension.workers()` for the same candidate extension;
11. require at least one returned candidate worker whose URL starts with the exact candidate scope;
12. prove the returned worker is executable using its existing Puppeteer worker evaluation/runtime surface; do not wake it a second time;
13. require browser-process liveness after activation before declaring PASS.

## Forbidden paths

This correction does not authorize:

- `browser.newPage()` during worker activation;
- `extension.triggerAction()`;
- toolbar action simulation;
- popup opening/clicking;
- synthetic ChatGPT/Alice wake as worker activation;
- browser-target `ServiceWorker.*` commands;
- new Chrome flags;
- `--disable-gpu`;
- `--no-sandbox`;
- GPU/sandbox/crash-limit bypass flags;
- timeout increases used to hide a failure;
- dependency changes;
- production/candidate/source-CFT changes.

## Safety and interpretation

The direct `ServiceWorker.startWorker` call is validator environment automation, not an operator browser action. It must preserve:

- `OPERATOR_BROWSER_ACTIONS=0`;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`.

If no existing `about:blank` page target is present, fail truthfully as an environment/harness failure. Do not create a replacement page in this preflight.

If `ServiceWorker.enable` is unavailable on the existing page-target session, record the exact protocol error and stop.

If `ServiceWorker.startWorker` is rejected, record the exact protocol error and stop without retry.

If start succeeds but the candidate worker never appears in `extension.workers()` within the bounded polling window, classify environment worker-activation failure and stop.

No full 01–16 gate is authorized by this correction alone.
