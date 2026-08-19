# Ozon Bridge — page-session direct ServiceWorker activation correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit.

## Evidence

Preflight7 report commit:
`ce79be984d80b7784cc57dcd45b57301bd1e3329`

Preflight7 proved the qualified owned-copy CFT path through runtime extension enumeration, then failed before any activation call with:

`Protocol error (ServiceWorker.enable): 'ServiceWorker.enable' wasn't found`

The failed command was issued on a browser-target CDP session created from `browser.target().createCDPSession()`.

## Correct CDP target

Chromium wires `protocol::ServiceWorkerHandler` to render-frame/page DevTools sessions, not to the browser-target session used by preflight7. Therefore the direct activation command must be sent through a page-target CDP session.

Validation-only worker activation sequence:

1. Use the already-qualified owned-copy CFT materialization and exact candidate.
2. Runtime-install and enumerate the candidate with Puppeteer Extension API.
3. Query `await extension.workers()` once. Zero is allowed initially.
4. If zero, create exactly one inert `about:blank` page with no external requests.
5. Create a CDP session from that page target: `await page.target().createCDPSession()`.
6. Call `ServiceWorker.enable` on that page-target session and require success.
7. Define candidate scope exactly as `chrome-extension://${extensionId}/`.
8. Observe `ServiceWorker.workerRegistrationUpdated`/`workerVersionUpdated` only for diagnostics; absence of a registration event before activation is not by itself failure because registration may already exist before the handler is enabled.
9. Call `ServiceWorker.startWorker` exactly once with the exact candidate scope.
10. Bounded-poll only `await extension.workers()` for the candidate's own worker.
11. Require at least one returned worker whose URL begins `chrome-extension://${extensionId}/`.
12. Require a minimal `Runtime.evaluate` through that worker to prove its CDP runtime is usable.
13. Require the main browser process to remain alive for a bounded post-activation liveness interval.

## Forbidden paths

Do not:

- use `browser.target().createCDPSession()` for the ServiceWorker domain;
- call `extension.triggerAction()`;
- open/click extension popup/action UI;
- use synthetic ChatGPT wake or popup wake;
- add/change Chrome flags;
- use `--disable-gpu` or `--no-sandbox`;
- retry a failed activation stage;
- change production/candidate bytes.

## Safety

Required throughout:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications `0`
- candidate modifications `0`
- source CFT modifications `0`

This correction is environment validation only. A PASS does not replace the permanent full gate.