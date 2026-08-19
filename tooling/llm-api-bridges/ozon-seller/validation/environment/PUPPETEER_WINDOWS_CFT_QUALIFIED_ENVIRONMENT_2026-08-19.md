# Ozon Bridge — qualified Windows CFT/Puppeteer validation environment

Date: 2026-08-19
Status: `QUALIFIED_VALIDATION_ENVIRONMENT`

This is validation-environment authority only. It authorizes no production edit.

## Qualification evidence

Authoritative environment preflight report commit:
`6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`

Preflight authority commit:
`6677ec9656720416a1ed66386b86732776903d98`

Immutable production candidate remains:

- gate input checkpoint: `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

The preflight proved:

- source CFT inventory: 308 files;
- source inventory SHA-256: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
- byte-identical temporary copy before setup: PASS;
- copied-tree Chromium `setup.exe --configure-browser-in-directory=<copy>` returned exit code `78`, the required AppContainer sandbox-success result;
- copied-tree inventory remained byte-identical after setup;
- source CFT tree remained unchanged;
- Node `v24.12.0`, Puppeteer `25.4.0`, Chrome for Testing `151.0.7922.47`;
- launch through Puppeteer: PASS;
- actual Chrome spawn args exactly matched the authorized minimal list;
- `browser.installExtension(candidateDir)`: PASS;
- `browser.extensions()` candidate enumeration: PASS;
- candidate id `pnachmeopomlkachmojdbhocnkhdklnb`, enabled, version `0.1.19`;
- initial `extension.workers()` count `0` was observed and is allowed at environment-materialization stage;
- real Ozon requests `0`;
- real Performance requests `0`;
- operator browser actions `0`;
- production/candidate/source-CFT modifications `0`.

## Qualified browser materialization contract

For the next authoritative full gate, use exactly this browser-environment materialization before browser-functional assertions:

1. Verify the source CFT tree inventory is exactly 308 files and inventory SHA-256 is `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.
2. Create a new temporary validation-owned copy of the entire source CFT tree.
3. Verify source and copy relative paths, sizes, and SHA-256 values are byte-identical.
4. Run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, without elevation and with `shell:false`.
5. Require setup exit code `78`.
6. Recompute copied-tree inventory and require byte identity to the source inventory; setup may alter ACLs but must not alter regular-file bytes/inventory.
7. Launch the copied `chrome.exe` through the existing Puppeteer `25.4.0` project with:
   - `ignoreDefaultArgs:true`;
   - `headless:false`;
   - `enableExtensions:true`;
   - `waitForInitialPage:false`;
   - `dumpio:true`;
   - fresh temporary `userDataDir`;
   - exact minimal Chrome args below.
8. Runtime-install the exact reconstructed candidate with `browser.installExtension(candidateDir)`.
9. Require `browser.extensions()` to enumerate the exact returned candidate id, enabled, version `0.1.19`.
10. Continue into the existing full browser behavior harness only after those environment invariants pass.

Exact Chrome argument sequence after executable path:

```text
--user-data-dir=<fresh-temporary-profile>
--remote-debugging-port=0
--no-first-run
--no-default-browser-check
--disable-background-networking
--disable-component-update
--disable-sync
--metrics-recording-only
--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0
about:blank
```

No other Chrome switch is authorized. In particular, do not add:

- `--disable-gpu`;
- `--no-sandbox`;
- GPU sandbox/crash-limit bypass switches;
- dependency-install/update switches;
- operator-profile arguments.

## Worker activation

The environment qualification intentionally did not require an initially active MV3 worker. An initial worker count of zero is not an environment failure.

For the full browser-functional gate, use the already-authorized Puppeteer Extension API semantics from validation correction `d9c42e2cbffca37fc84cd14f294d455e423da542` after the candidate has been successfully installed and enumerated in this qualified environment:

- query the candidate `Extension` object's active workers;
- if none is active, one bounded `extension.triggerAction(page)` validation wake on an inert local page is allowed;
- then bounded-poll the same candidate `Extension` object's workers;
- require the candidate's own worker before worker-dependent functional assertions;
- this validation automation does not count as an operator action;
- no synthetic ChatGPT wake or popup-only wake is a primary discovery mechanism;
- no timeout increase or timeout-as-pass is authorized.

Because earlier worker-discovery attempts ran against an unqualified CFT permission context, they do not supersede this qualified-environment execution.

## Full-gate rule

The preflight PASS is not a production PASS, not a functional browser PASS, and not operator handoff acceptance.

The next authoritative action is one consolidated full pre-operator gate execution of every currently applicable permanent block 01–16 against the unchanged candidate, using this qualified environment for browser blocks.

If any production byte changes before that run, this environment qualification may still describe the browser environment, but the production candidate must be re-frozen and all production-dependent gate evidence rerun.
