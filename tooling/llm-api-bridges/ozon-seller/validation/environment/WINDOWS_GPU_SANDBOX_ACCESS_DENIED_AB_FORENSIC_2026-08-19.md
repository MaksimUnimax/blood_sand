# Ozon Bridge — Windows GPU sandbox ACCESS_DENIED A/B forensic

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_FORENSIC`

Production candidate remains immutable. This document authorizes no production edit and no full 01–16 gate.

## Established evidence before this forensic

The qualified CFT environment repeatedly proves:

- Chrome for Testing `151.0.7922.47` launches;
- source CFT canonical inventory is 308 files with SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
- validation-owned byte-identical copy + copied `setup.exe --configure-browser-in-directory=<copy>` returns Chromium success code `78`;
- copied regular-file bytes remain unchanged;
- Puppeteer `25.4.0` can install and enumerate the exact extension before the browser dies;
- repeated Chrome dumpio records GPU child exit `-1073741790`, which is Windows NTSTATUS `0xC0000022` (`STATUS_ACCESS_DENIED`);
- after repeated GPU child failures Chromium intentionally terminates the browser with `GPU process isn't usable. Goodbye.`;
- `--disable-gpu` did not eliminate the failure because disabling hardware acceleration does not guarantee absence of the GPU process/software display-compositor process.

Relevant validator reports:

- preflight6 PASS: `6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`
- RERUN10: `1162902368486cc5c8618748b5b057400d828427`
- page-session preflight8: `b92eb20e0d4330b1a813a73b386ba131a1dc7a4c`

## Purpose

Do not guess which Windows resource is denied. First prove or falsify whether the fatal condition is specifically dependent on Chromium's Windows GPU sandbox.

Run one controlled two-arm environment-only comparison using the same copied CFT materialization and fresh profile semantics.

No extension installation is needed for this A/B because the observed fatal is a Chrome GPU-process failure and preflight8 reproduced it before any worker/CDP activation.

## Arm A — baseline

Launch copied Chrome exactly with the currently qualified minimal args and no additional switches.

After launch:

1. record main browser PID/version;
2. record initial target inventory;
3. call `browser.newPage()` exactly once;
4. if it returns, navigate only to `data:text/html,<html><body>gpu-sandbox-baseline</body></html>`;
5. evaluate `document.body.textContent`;
6. hold only long enough for a bounded 5-second liveness check;
7. record dumpio tail and browser main-process exit code.

Expected reproduction signature, if the environment failure is stable:

- GPU child exit code `-1073741790` / `0xC0000022`;
- browser fatal `GPU process isn't usable. Goodbye.`;
- page creation/navigation/evaluation or liveness fails because browser exits.

Do not retry Arm A.

## Arm B — one-variable GPU-sandbox experiment

Create a fresh validation-owned copied CFT tree again from the same source, require source/copy byte identity, run copied setup once and require exit `78`, use a fresh browser profile.

Launch with the exact same qualified settings and exact same argument order as Arm A, with one and only one additional Chrome switch immediately before `about:blank`:

`--disable-gpu-sandbox`

Do not add `--disable-gpu`, `--no-sandbox`, `--disable-gpu-appcontainer`, `--disable-gpu-lpac`, software-renderer flags, or any other switch.

Run the exact same `newPage -> data: navigation -> read-only evaluate -> 5-second liveness` sequence once.

Do not retry Arm B.

## Interpretation

Classify `GPU_SANDBOX_INCOMPATIBILITY_CONFIRMED` only if all are true:

1. both arms use the same source CFT canonical inventory and byte-identical copied-tree setup with exit `78`;
2. Arm A reproduces the GPU child `0xC0000022` failure and browser fatal/exit;
3. Arm B reaches page creation, data navigation, evaluation, and 5-second browser liveness;
4. Arm B has no GPU child `0xC0000022` fatal sequence during the bounded observation;
5. the only Chrome-argument difference between arms is `--disable-gpu-sandbox`;
6. no extension, production behavior, provider request, or operator action is involved.

Classify `GPU_SANDBOX_INCOMPATIBILITY_NOT_PROVEN` if the above differential is not obtained. Do not infer another cause; publish the exact evidence and stop.

## Security boundary

`--disable-gpu-sandbox` weakens only the browser validation environment and MUST NOT be added to production, extension code, operator Chrome configuration, or package.

It is not authorized for the permanent full gate merely by this forensic document. A separate validation-environment correction is required after a confirming A/B result.

Hard counters remain:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications `0`
- candidate modifications `0`
- source CFT modifications `0`
