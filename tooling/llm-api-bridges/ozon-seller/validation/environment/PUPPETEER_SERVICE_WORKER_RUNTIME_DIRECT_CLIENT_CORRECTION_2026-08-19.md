# Ozon Bridge — Puppeteer service-worker runtime direct-client correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_BROWSER_CORRECTION`

Production candidate remains immutable. This correction changes only validation/browser harness behavior.

## Evidence

RERUN12 report:
`b062a39da8d0d97840db71d7499a5b9c70085b15`

RERUN12 proved in the accepted disposable validator environment:

- exact candidate reconstruction/inventory/hashes PASS;
- validation-owned byte-identical CFT copy/setup exit 78 PASS;
- exact `--no-sandbox` validator-only launch contract PASS;
- extension install/enumeration PASS;
- raw PAGE Runtime PASS;
- local synthetic fixture PASS;
- candidate service worker activation/discovery PASS;
- candidate worker URL observed as `chrome-extension://lfnmkifnnmmdhhnmdommhjhjgjfenkdl/service_worker.js`;
- browser remained alive after worker discovery;
- only worker Runtime qualification failed;
- Codex classified the failure `HARNESS_ERROR`.

The report did not preserve the exact worker-runtime exception. RERUN13 must preserve it if any worker Runtime command fails.

## Exact Puppeteer 25.4.0 behavior

At tag `puppeteer-v25.4.0`:

1. `Extension.workers()` returns `WebWorker[]` by finding exposed `service_worker` targets and calling `target.worker()`.
2. `CdpWebWorker` exposes its underlying CDP session publicly as `worker.client`.
3. `CdpWebWorker.evaluate()` does **not** directly evaluate immediately. It first awaits the private `#workerLoaded` deferred.
4. That deferred is resolved only by the session event `Inspector.workerScriptLoaded` observed after construction of the `CdpWebWorker` object.
5. Therefore `worker.evaluate()` is not an acceptable substrate qualification primitive for an extension service worker that may already have completed script loading before the `CdpWebWorker` wrapper was created/discovered.
6. The underlying `worker.client` is the correct validation transport for direct Runtime qualification because it can send CDP commands without depending on the `#workerLoaded` deferred.

This correction does **not** claim that Puppeteer necessarily caused the exact RERUN12 failure, because RERUN12 omitted the exact exception. It removes that race/deferred dependency from the validator and requires exact diagnostics if direct CDP itself fails.

## Mandatory worker-runtime validation path

After exact candidate worker discovery via `extension.workers()`:

- identify exactly one worker whose URL starts with `chrome-extension://<extensionId>/` and matches the candidate service-worker URL;
- obtain `const workerClient = worker.client`;
- do **not** use `worker.evaluate()` or `worker.evaluateHandle()` for substrate qualification or the Ozon worker harness;
- call `workerClient.send('Runtime.enable')` and require success;
- call `workerClient.send('Runtime.evaluate', {expression:'1+1', returnByValue:true, awaitPromise:true})` and require a normal value `2`, with no `exceptionDetails`;
- use this same `workerClient.send('Runtime.evaluate', ...)` transport for worker-side test expressions needed by the browser harness;
- use `workerClient.send('Network.enable')` and `Network.requestWillBeSent` for provider-network accounting where required;
- if a command fails, record exact method, exact exception/error message, whether the worker target still exists, worker URL, browser liveness and exit code before classification;
- never silently fall back from direct CDP to `worker.evaluate()`;
- never reactivate/restart the worker merely because a Runtime assertion fails after worker discovery; that would mask an activation/runtime defect.

## Accepted environment remains unchanged

The accepted disposable validator-browser contract remains the RERUN12 supersession:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- fresh validation-owned byte-identical CFT copy;
- copied setup.exe exactly once, exit 78;
- fresh validation-only profile;
- `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`;
- exact minimal args from RERUN12 with validation-only `--no-sandbox` and no `--disable-gpu-sandbox`;
- raw PAGE adapter, no `browser.newPage()`;
- synthetic/local fulfilled supported-origin fixtures only;
- zero real Seller, Performance and ChatGPT requests;
- zero operator browser actions;
- no real credentials.

No production file, manifest, operator instruction or package may contain `--no-sandbox` or any validation harness code.

## Full-gate consequence

There is no separate operator-visible preflight after this correction.

The next top-level execution must:

1. reconstruct the exact immutable candidate from scratch;
2. qualify PAGE + local fixture + exact candidate worker using the direct `worker.client` Runtime path above;
3. if and only if that substrate passes, continue immediately in the same execution through every applicable permanent block 01–16;
4. package exactly the tested 17-file tree only after blocks 01–15 PASS;
5. fresh-extract and byte-verify the package;
6. publish one final report only.

A substrate failure remains a harness/environment failure unless an actual production assertion was reached and failed.