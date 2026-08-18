# Full-gate composer-wait browser harness manifest

Status: `PINNED_FOR_FINAL_CONSOLIDATED_GATE`

Harness reconstructs from exactly:

1. `composer-wait-browser-parts/00.mjs.part`
   - bytes: `6925`
   - SHA-256: `50108245f2fd935425ac9b15a03355bf03448ecf4a34ee21598774bd544f2f51`
   - Git blob SHA: `b056c2d2b0a6189d310b99944bf14501cc15a6d7`
2. `composer-wait-browser-parts/01.mjs.part`
   - bytes: `6427`
   - SHA-256: `a54ba5b3aa9d70e84c1172d93c2c94244d46ec1208bef3ff600f4b3653b67db5`
   - Git blob SHA: `18fc993168945659ae22150dcad23d60677a4638`

Reconstruct:

```bash
cat composer-wait-browser-parts/00.mjs.part composer-wait-browser-parts/01.mjs.part > OZON_COMPOSER_WAIT_BROWSER_HARNESS.mjs
```

Expected harness:

- bytes: `13352`
- SHA-256: `ce38adbf78a5501c6c130845f5d76d1e832234b5f8d217d7c9980f8958f7a5c1`
- `node --check`: PASS in development environment.

CLI:

```text
node OZON_COMPOSER_WAIT_BROWSER_HARNESS.mjs <candidate-dir> <CFT-exe> <expected-worker-sha256>
```

The harness requires repaired exact content SHA:

`ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

and receives the exact final worker SHA calculated during final candidate reconstruction.

It uses the accepted architecture:

`child_process.spawn -> CFT -> dynamic DevToolsActivePort -> Puppeteer connect -> browser.installExtension()`

Provider hosts are mapped away and service-worker Network events are observed. No real credentials are seeded.

Required browser behavior includes:

- real extension service worker + real content script on a synthetic ChatGPT conversation;
- worker-owned claimed Manual report while composer contains operator draft;
- exact persistent plate `Очистите поле ввода, чтобы получить отчёт.`;
- plate still present after more than the 2000 ms fallback interval;
- draft unchanged while waiting;
- extension Ozon control busy while report pending;
- native Copy independent while waiting;
- composer clear -> exactly one report insertion and one staged Send click;
- synthetic Send transitions to Microphone and existing completion FSM clears the operation;
- second claimed report -> Manual OFF cancellation;
- quota/cache state byte/JSON-equivalent across OFF and OFF -> ON;
- operator draft untouched by OFF;
- OFF -> ON restores an enabled Ozon control;
- after cancellation and later composer clear, old report never reappears and Send is not clicked;
- provider network observed: zero.

Required terminal markers:

- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`

Development environment note: local Node syntax validation passed. A local Linux system-Chromium/Playwright extension-launch probe did not reach extension runtime and is classified as an environment-path limitation, not production behavior evidence. The executable browser verdict is reserved for the already-qualified Windows CFT/Puppeteer environment in the final consolidated Codex gate.