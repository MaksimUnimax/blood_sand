# Ozon Bridge — qualified Windows CFT/Puppeteer validation environment

Date: 2026-08-19
Status: `QUALIFIED_VALIDATION_ENVIRONMENT_WITH_FUNCTIONAL_CDP_CORRECTION`

This is validation-environment authority only. It authorizes no production edit.

## Current authority resolution

The original environment materialization preflight and the later functional browser executions prove two different layers and must not be conflated.

### Layer A — CFT materialization / extension installation

Authoritative environment preflight report commit:
`6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`

Preflight authority commit:
`6677ec9656720416a1ed66386b86732776903d98`

This layer proved the validation-owned CFT copy, `setup.exe` exit `78`, byte identity, browser launch and extension installation/enumeration. Its sandboxed launch did **not** prove the later required raw PAGE + worker Runtime/Network functional CDP path.

### Layer B — functional raw PAGE / worker CDP

Later current-candidate execution evidence supersedes Layer A only for the functional CDP launch/worker-transport details:

- RERUN13 report commit: `9e275d784b46c46dc86f1f0ca02eb5e12094ec37`
  - exact current candidate;
  - fresh validation-owned CFT copy;
  - copied `setup.exe --configure-browser-in-directory=<copy>` exit `78`;
  - source/copy/post-setup byte identity;
  - raw PAGE websocket + `Runtime.enable` + `Page.enable` + `Fetch.enable` PASS;
  - raw PAGE `Runtime.evaluate('1+1')` PASS;
  - candidate worker direct CDP `Runtime.enable`, `Runtime.evaluate('1+1')`, `Network.enable` PASS;
  - browser liveness PASS;
  - `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `REAL_CHATGPT_REQUESTS=0`;
  - validator-only `--no-sandbox` was used.

- RERUN18 report commit: `9188b934e1c648acecfa390cc5c49074195a3e4b`
  - independently reached the current-candidate browser substrate again;
  - canonical CFT `308` files / digest `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
  - copied setup exit `78`;
  - exact spawn args PASS;
  - raw PAGE Runtime/Page/Fetch and local adapter self-check PASS;
  - selected worker transport `PUPPETEER_DIRECT_CDP`;
  - worker liveness PASS;
  - zero real Ozon/Performance/ChatGPT network.

RERUN14–RERUN17 and RERUN19–RERUN21 do not supersede this functional substrate evidence. Their reports classify their failures as harness/environment-orchestration errors before a complete permanent functional matrix; none reports a production browser assertion failure. In particular, RERUN18 invalidated its own umbrella marker because the permanent B01–B15 matrix was incomplete, **not** because its browser substrate failed.

Therefore the effective rule is:

- Layer A remains authority for canonical CFT identity, owned-copy creation and `setup.exe` qualification;
- Layer B is authority for functional raw PAGE/worker CDP execution;
- the validator-only `--no-sandbox` exception is authorized only for this disposable independent validation environment because it is the configuration in which the required direct-CDP substrate was actually demonstrated on the exact current candidate;
- `--no-sandbox` MUST NOT enter production, the extension package, manifest, operator Chrome instructions, operator profile, or live user browser instructions.

## Immutable production candidate

- gate input checkpoint: `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

No environment correction changes these production bytes.

## Qualified browser materialization contract

For an authoritative functional validation against the unchanged candidate:

1. Verify the canonical source CFT tree is exactly `308` regular files with canonical inventory SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.
2. Create a fresh validation-owned copy of the entire source CFT tree.
3. Verify source and copy relative paths, sizes and SHA-256 values are byte-identical.
4. Run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, without elevation and with `shell:false`.
5. Require setup exit code `78`.
6. Recompute copied-tree inventory and require byte identity to the source inventory.
7. Use Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`.
8. Launch the copied `chrome.exe` with:
   - `ignoreDefaultArgs:true`;
   - `headless:false`;
   - `enableExtensions:true`;
   - `waitForInitialPage:false`;
   - `dumpio:true`;
   - a fresh disposable validation profile;
   - the exact functional validation argument sequence below.
9. Runtime-install the exact reconstructed candidate with `browser.installExtension(candidateDir)`.
10. Require `browser.extensions()` to enumerate the same returned candidate id, enabled, version `0.1.19`.
11. Continue to raw PAGE and worker functional observation only after the materialization invariants pass.

Exact functional-validation Chrome argument sequence after executable path:

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
--no-sandbox
about:blank
```

No `--disable-gpu`, no `--disable-gpu-sandbox`, no dependency-update switches, no operator-profile arguments, and no other Chrome switch.

`--no-sandbox` is a validator-only functional-CDP exception. It is not production behavior and is never an operator/browser installation instruction.

## Raw PAGE and network contract

Use the already-proven raw-CDP substrate:

- create the validation PAGE through browser-level `Target.createTarget({url:'about:blank'})`;
- do not use `browser.newPage()` as the accepted functional transport;
- enable `Runtime`, `Page` and `Fetch` on the raw PAGE before supported-origin navigation;
- require a harmless `1+1===2` Runtime check;
- fulfill synthetic ChatGPT/Alice documents locally;
- fail unexpected page requests locally instead of continuing them;
- require `REAL_CHATGPT_REQUESTS=0`;
- keep Seller and Performance network blocked/observed and require both real-request counters to remain zero.

## Worker activation and observation

The environment materialization stage may initially observe zero extension workers; that alone is not failure.

For the functional gate use the later proven direct-CDP semantics:

1. Inspect the installed candidate extension and existing worker targets.
2. If the exact candidate worker is already active, use it without reactivation.
3. If absent, use the already-proven raw PAGE service-worker registration route to identify the exact candidate registration scope and start that exact worker once; do not use operator interaction.
4. Require the worker URL to be under `chrome-extension://<current-extension-id>/`.
5. Prefer the exact candidate Puppeteer `WebWorker` direct CDP client (`worker.client`) when available.
6. Require direct worker `Runtime.enable`, `Runtime.evaluate('1+1') === 2`, and `Network.enable`.
7. A raw active service-worker target/session is the fallback transport for the same worker if the direct Puppeteer CDP client is unavailable; do not create another worker merely to change transports.
8. Require browser liveness after worker qualification.

Do not use `worker.evaluate()` / `worker.evaluateHandle()` as the accepted worker-runtime authority.

## Full-gate rule

Environment/substrate PASS is only readiness evidence. It is not a production PASS and does not authorize packaging.

The final current process is governed by `validation/CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md`: the exact candidate must be checked through B01–B15; a complete PASS requires every block to PASS. Codex does not create or modify test infrastructure during that run. Packaging remains a separate post-review action after full B01–B15 PASS.

If any production byte changes before the final run, the candidate must be re-frozen and all production-dependent evidence rerun.