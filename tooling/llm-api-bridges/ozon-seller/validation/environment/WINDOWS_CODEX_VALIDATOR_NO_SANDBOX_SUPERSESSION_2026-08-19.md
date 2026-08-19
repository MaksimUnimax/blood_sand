# Ozon Bridge — Windows Codex validator sandbox supersession

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_SUPERSESSION`

Production candidate remains immutable. This document authorizes no production edit and no operator-browser change.

## Authorities

- permanent gate: `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
- gate checkpoint: `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- raw-CDP correction: `4ceedab6598a92de8cfc885f79e09b5e08b17950`
- RERUN11 report: `799528efd77e46808415f050230c400a3c38f252`
- candidate worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- candidate content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

## Proven RERUN11 environment facts

The exact candidate reconstructed correctly: 17 production files, exactly `service_worker.js` and `content_script.js` changed, protected 15 byte-identical.

The canonical CFT remained exact: 308 files, canonical inventory SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`; validation-owned copy was byte-identical before and after copied `setup.exe --configure-browser-in-directory=...`, which returned 78.

Under the prior accepting validator launch with normal Chromium Windows sandboxing retained and only `--disable-gpu-sandbox` added:

- browser launch PASS;
- extension install PASS;
- extension enumeration PASS;
- raw `Target.createTarget` returned a real `page` target;
- that target websocket was available and connected;
- `Runtime.enable` on that raw PAGE never completed and timed out.

In the same top-level RERUN11 failure-diagnostic path, a fresh byte-identical copied CFT/profile launched with `--no-sandbox` as the only sandbox-control replacement and no extension installed. On that control:

- raw PAGE create PASS;
- raw PAGE Runtime `1+1` PASS;
- inert local fixture PASS;
- five-second browser liveness PASS.

Therefore the evidence proves that the failing substrate is tied to Chromium's Windows sandboxed child-process path in the `hp\\codexsandboxoffline` validator environment. The evidence does NOT prove which internal Windows sandbox primitive is responsible (job object, restricted token, mitigation, desktop/winstation, or another child-process policy), because RERUN11 did not obtain reliable `IsProcessInJob`/child-policy telemetry. Do not claim a more specific primitive.

The RERUN11 terminal label `ENVIRONMENT_RAW_CDP_TRANSPORT_FAILURE` is superseded for root-cause description by:

`ENVIRONMENT_WINDOWS_SANDBOXED_CHILD_PROCESS_INCOMPATIBILITY`

This is an environment/validator-host classification, not a production behavior failure.

## Permanent-gate compatibility

The permanent gate requires an accepted Windows QA environment, runtime extension installation, synthetic browser behavior, zero real provider network, immutable production, and truthful environment/production failure separation. It does not require the validator Chrome itself to retain Chromium process sandboxing.

Accordingly this supersession authorizes one isolated validation-only browser contract for the next consolidated gate:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- fresh validation-owned byte-identical CFT copy;
- copied `setup.exe` once, `shell:false`, require exit code 78;
- fresh validation-only user-data directory;
- `ignoreDefaultArgs:true`;
- `headless:false`;
- `enableExtensions:true`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- exact minimal existing non-sandbox args;
- replace the prior validation-only `--disable-gpu-sandbox` exception with exactly one sandbox exception: `--no-sandbox` immediately before `about:blank`;
- do NOT also pass `--disable-gpu-sandbox`;
- no other sandbox/security switch;
- no operator Chrome/profile/credentials;
- no dependency/browser version changes.

This `--no-sandbox` authorization applies ONLY to the disposable validator Chrome process running synthetic fixtures. It must never be added to production code, extension files, operator instructions, operator Chrome, package contents, or live acceptance instructions.

## Compensating validation isolation

Because the disposable validator Chrome runs without Chromium process sandboxing, the consolidated runner must strengthen external isolation rather than weaken product assertions:

1. synthetic browser pages only;
2. no operator credentials/profile;
3. no real Seller/Performance credentials;
4. `REAL_OZON_REQUESTS=0` and `REAL_PERFORMANCE_REQUESTS=0` remain mandatory;
5. `REAL_CHATGPT_REQUESTS=0` remains mandatory for the synthetic browser block;
6. intercept/fulfill synthetic `chatgpt.com`/supported fixture navigations locally before network dispatch;
7. fixed Seller/Performance hosts remain blocked by the existing host-resolver rule;
8. browser/background-network reduction switches already in the qualified minimal args remain present;
9. any unexpected external request is terminal harness/environment FAIL;
10. provider/security product assertions remain unchanged and are not waived by the validator browser sandbox exception.

## Browser adapter contract

Do not use `browser.newPage()` for the acceptance behavior harness in this environment.

Use the raw-CDP PAGE route already proven through target creation/websocket discovery:

- browser-level `Target.createTarget({url:'about:blank'})` once for each isolated synthetic page as needed;
- resolve the returned raw PAGE target and target websocket;
- connect directly to the PAGE websocket;
- require `Runtime.enable` and harmless `1+1 === 2` before functional use;
- use raw CDP `Page`, `Runtime`, `DOM`, `Input`, and `Fetch` as required to implement the existing synthetic browser assertions;
- fulfill synthetic supported-origin HTML locally through `Fetch` interception so no real ChatGPT/Alice request occurs;
- do not weaken any existing behavioral assertion merely because the adapter changed.

For MV3 worker activation:

- runtime-install exact candidate and require enumeration first;
- use `extension.workers()` if the candidate worker is already active;
- otherwise, on the proven raw PAGE CDP session, use `ServiceWorker.enable`, observe the candidate extension registration for `chrome-extension://<extensionId>/`, call `ServiceWorker.startWorker({scopeURL:<exact candidate scope>})` exactly once, then bounded-poll candidate worker discovery;
- `extension.triggerAction()` remains forbidden as worker activation;
- require harmless worker Runtime evaluation before browser behavior assertions;
- require post-worker browser liveness.

## One-run rule

Do NOT create another separate preflight.

The next top-level Codex execution must perform, in one command:

`candidate reconstruction -> no-sandbox accepting substrate -> exact extension install/enumeration -> raw PAGE runtime/local fixture -> candidate worker activation/runtime/liveness -> all permanent blocks 01-15 -> exact packaging block 16 -> fresh extract/hash verification -> one report`.

If the no-sandbox accepting substrate fails, complete all diagnostics already embedded in that same top-level runner/report and STOP without asking the operator for an intermediate run.

No previous PASS may substitute for an applicable block in that consolidated execution, except immutable authority/hash reconstruction evidence that is itself reverified in the run.