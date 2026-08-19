# Ozon Bridge — raw CDP page adapter correction for Windows validator

Date: 2026-08-19
Status: `VALIDATION_ONLY_BROWSER_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit and no operator-browser change.

## Evidence being corrected

Root-cause matrix report:
`70097f932d9848415c05a95ec223ea388f2bfef0`

Permanent gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Exact candidate remains:

- `service_worker.js` SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js` SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

The matrix proved:

1. baseline Windows Chrome GPU sandbox repeatedly exits its GPU child with `0xC0000022 / STATUS_ACCESS_DENIED` and then Chrome can terminate with `GPU process isn't usable`;
2. adding exactly `--disable-gpu-sandbox` removed that observed GPU fatal sequence during the diagnostic arms;
3. the GPU fatal is not the sole cause of `browser.newPage()` failure because `newPage()` still timed out in the diagnostic arm where the browser remained alive;
4. Chrome 151 `Target.createTarget` returned a raw target of type `page`, not `tab`;
5. in the diagnostic environment that raw PAGE existed and was attached, but Puppeteer `browser.targets()` did not expose it as a usable page target;
6. therefore the earlier specific hypothesis “Puppeteer waits on an unexposed TAB id” is superseded and must not be asserted;
7. the correct observed Puppeteer failure is a validator-environment PAGE attachment/exposure/initialization incompatibility around `browser.newPage()`, independent of the separately proven GPU sandbox fatal;
8. worker activation remained unresolved only because the previous matrix stopped when a Puppeteer-exposed PAGE was unavailable. It did not execute the required raw-CDP fallback.

Puppeteer `25.4.0` is the documented supported Puppeteer version for Chrome for Testing `151.0.7922.47`; dependency mismatch is therefore not an accepted explanation and no dependency update is authorized.

## Validation-only GPU exception

For the isolated validator Chrome only, this correction authorizes exactly one additional Chrome switch:

`--disable-gpu-sandbox`

It must be added to the already-qualified minimal argument sequence immediately before `about:blank`.

This authorization is based on the matrix evidence that the switch removed the observed GPU `STATUS_ACCESS_DENIED` fatal while all other semantic Chrome arguments remained unchanged.

It is NOT an operator-browser recommendation and does not change production behavior.

Still forbidden for an accepting full gate:

- `--no-sandbox`;
- `--disable-gpu`;
- `--disable-features=RendererAppContainer` unless used only as an explicitly non-accepting diagnostic control after the acceptance substrate already failed;
- any other sandbox/GPU/crash bypass;
- operator Chrome/profile.

## Raw CDP PAGE adapter — mandatory replacement for browser.newPage()

For validator browser assertions, `browser.newPage()` is superseded in this environment.

Do not patch Puppeteer package files and do not modify production.

After normal Puppeteer launch and `browser.installExtension(candidateDir)` / `browser.extensions()` enumeration:

1. obtain the local DevTools browser endpoint from the launched browser/profile;
2. create a PAGE using raw CDP `Target.createTarget({url:'about:blank'})` exactly when a new synthetic page is required;
3. record the returned raw `targetId` and require `Target.getTargets` to identify that same id as type `page`;
4. obtain that target's own DevTools WebSocket endpoint from the local Chrome remote-debugging endpoint (`/json/list` or equivalent local endpoint tied to the same launched browser);
5. connect directly to the exact PAGE target with Node's local WebSocket/CDP transport;
6. use only the PAGE target's CDP domains (`Runtime`, `Page`, `DOM`, `Fetch`, `Network`, `ServiceWorker`) for page/runtime/browser-test operations;
7. do not require the PAGE to appear in `browser.targets()` and do not call `browser.newPage()`;
8. retain Puppeteer for browser lifecycle, extension installation/enumeration, and extension worker access where those public APIs work.

The raw adapter must implement the exact behavioral equivalents required by the existing composer browser harness:

- `evaluate` -> `Runtime.evaluate` / `Runtime.callFunctionOn` as needed;
- `goto` -> `Page.navigate` with bounded lifecycle confirmation;
- request interception -> `Fetch.enable` + `Fetch.requestPaused`, fulfill only the synthetic top-level ChatGPT document and fail/abort unrelated requests;
- `reload` -> `Page.reload` plus bounded lifecycle confirmation;
- click -> DOM lookup/evaluation followed by the page element's actual `.click()` behavior;
- text/value/input dispatch -> `Runtime.evaluate` preserving the existing textarea setter + input/change events;
- DOM queries/toast/Ozon shadow-root assertions -> `Runtime.evaluate` with the same production-visible semantics as the existing browser harness.

Do not weaken or reinterpret any existing browser assertion while adapting its transport.

## Synthetic ChatGPT page requirement

The browser harness must continue to exercise a synthetic URL of the form:

`https://chatgpt.com/c/<uuid>`

No real ChatGPT network request is allowed.

Before navigating the raw PAGE target to that URL:

1. enable `Fetch` interception on that exact target;
2. fulfill the main-document request locally with the existing synthetic ChatGPT HTML fixture;
3. abort/fail every other external request;
4. keep the page URL/origin/conversation semantics required by the production content script and binding logic;
5. require the actual installed candidate content script/browser behavior to initialize as required by the existing browser assertions.

## Direct MV3 worker activation

`extension.triggerAction()` remains superseded and forbidden as a worker-start mechanism.

After extension install/enumeration and after obtaining a raw PAGE CDP connection:

1. query `extension.workers()` once;
2. if the candidate worker is already active, use it;
3. otherwise enable the PAGE target `ServiceWorker` domain;
4. listen for registration/version events for diagnostic evidence;
5. identify the candidate extension scope if emitted;
6. call `ServiceWorker.startWorker` exactly once for the candidate scope; the expected extension-origin scope is `chrome-extension://<extensionId>/`, and successful appearance of the candidate worker is required as proof that the scope was accepted;
7. bounded-poll only the candidate `extension.workers()`;
8. require a worker URL beginning `chrome-extension://<extensionId>/` and corresponding to the candidate background service worker;
9. require harmless worker Runtime evaluation to succeed before functional browser assertions;
10. no popup/action click, synthetic ChatGPT wake, retry, or timeout-as-pass.

## Acceptance substrate gate

Before any permanent browser functional assertion is accepted, the single authoritative run must prove all of the following in the same launched validator environment:

- canonical CFT source/copy/setup invariants PASS;
- setup exit code exactly `78`;
- actual launch arguments equal the previously-qualified minimal sequence plus exactly `--disable-gpu-sandbox`;
- Chrome remains alive;
- candidate install/enumeration PASS;
- raw PAGE `Target.createTarget` PASS;
- raw PAGE target-level WebSocket/CDP connection PASS;
- PAGE `Runtime.evaluate('1+1')` returns `2`;
- PAGE local synthetic-document navigation/interception PASS;
- candidate MV3 worker activation/access PASS;
- worker Runtime evaluation PASS;
- zero real Ozon/Performance/ChatGPT network traffic from the synthetic validation path.

If this substrate fails, no permanent browser block may be called PASS and packaging is forbidden.

## One-run failure diagnostics

To avoid another one-preflight-at-a-time loop, the next authoritative command may, after the accepting substrate fails, run diagnostic-only controls inside fresh isolated Chrome/profile materializations before publishing its single final report.

Allowed diagnostic controls after acceptance failure only:

1. capture Windows process/job membership of the validator and Chrome parent;
2. capture relevant Chrome child process command lines/types and browser dumpio;
3. read relevant Chrome Windows policy values, including Renderer AppContainer policy state if present;
4. read bounded Windows CodeIntegrity/AppLocker/Defender/Application events generated during the failed arm;
5. one `--no-sandbox` control may be used only to determine whether the remaining PAGE/renderer failure is sandbox-caused. A `--no-sandbox` control can never qualify an accepting browser environment and can never proceed to the permanent full gate or packaging.

Do not ask the operator to execute intermediate diagnostics. All allowed diagnostics belong to the same next Codex command and one final report.

## Full-gate rule

The next Codex command must be one consolidated execution:

`environment substrate qualification -> if PASS, permanent blocks 01-16 -> package exact tested tree -> fresh-extract verification`

If substrate qualification FAILS, continue only the authorized diagnostics above, publish one report, and STOP.

If substrate qualification PASSES, do not publish an intermediate report and do not ask for operator interaction: continue directly through the full permanent gate in the same top-level execution.
