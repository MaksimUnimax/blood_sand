# Ozon Bridge — RERUN14 worker activation and Phase-B ordering correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_HARNESS_CORRECTION`

Production and candidate bytes are immutable.

## Evidence

RERUN13 report `9e275d784b46c46dc86f1f0ca02eb5e12094ec37` proved, on the accepted disposable no-sandbox validator contract:

- install/enumerate PASS;
- raw PAGE Runtime PASS;
- candidate service-worker activation/discovery PASS;
- `worker.client.send('Runtime.enable')` PASS;
- direct `Runtime.evaluate('1+1')` PASS with value 2;
- worker `Network.enable` PASS;
- browser liveness PASS.

RERUN14 report `b9f2c7674595e3a976ea7903901b4aeadf65f0ab` then failed only with bare `Error: worker missing`, while install/enumerate/raw PAGE Runtime/local fixture were PASS and `spawn_args_exact_match` was incorrectly left NOT_RUN. The report contains no evidence for registration scope discovery, `ServiceWorker.startWorker`, bounded discovery polling, raw service-worker target discovery, or an exact activation exception.

Therefore RERUN14 `ENVIRONMENT_ERROR` is not supported by the report. The failure is classified as validation-harness Phase-B ordering/worker-discovery error unless later direct evidence proves otherwise.

## Correct Phase-B order

The next integrated runner MUST execute these steps in this order and record each step separately:

1. Launch the already-authorized disposable validator CFT/profile contract.
2. Immediately normalize and compare actual launch arguments. `spawn_args_exact_match` MUST be PASS before extension install is attempted.
3. Install exact candidate once.
4. Enumerate extensions and require exact id/enabled/version.
5. Create/qualify raw PAGE: `Runtime.enable`, `Page.enable`, `Fetch.enable`, `Runtime.evaluate('1+1') === 2`, local fixture.
6. Call `extension.workers()` once and record the exact candidate workers returned.
7. Independently capture raw `Target.getTargets` and record any exact candidate `service_worker` target under `chrome-extension://<extensionId>/`.
8. If either Puppeteer worker or raw candidate service-worker target already exists, do NOT reactivate it; proceed to direct worker Runtime qualification.
9. Only if neither exists:
   - on the already-qualified PAGE CDP session install listeners for `ServiceWorker.workerRegistrationUpdated` and `ServiceWorker.workerVersionUpdated`;
   - call `ServiceWorker.enable`;
   - bounded-wait for the unique registration whose scope belongs to `chrome-extension://<extensionId>/`;
   - record exact registration id/scope/version data;
   - call `ServiceWorker.startWorker({scopeURL:<exact observed candidate scope>})` exactly once;
   - do not call `startWorker` a second time;
   - bounded-poll BOTH `extension.workers()` and raw `Target.getTargets` for the exact candidate worker target.
10. Candidate worker activation/discovery is PASS if a unique exact candidate service-worker target is observed by either route. A temporary Puppeteer exposure miss is not an activation failure if the raw target exists.
11. Runtime qualification:
   - if `extension.workers()` exposes the exact worker, try `worker.client.send('Runtime.enable')`, then direct `Runtime.evaluate('1+1')`, then `Network.enable`;
   - if this direct Puppeteer client is unavailable/fails, attach raw CDP to the SAME active service-worker target without restart/reactivation and perform the same Runtime/Network assertions;
   - never use `worker.evaluate()` / `worker.evaluateHandle()`.
12. Require post-worker browser liveness and raw-page adapter self-check.

## Failure evidence contract

The next runner MUST NOT emit a generic `worker missing` failure.

If activation/discovery fails, the final report must contain:

- initial `extension.workers()` result;
- pre-activation raw target table;
- whether `ServiceWorker.enable` succeeded;
- all candidate registration/version events observed;
- exact registration scope selected or `NONE`;
- whether `startWorker` was called;
- exact `startWorker` result/error;
- post-start bounded poll duration;
- final `extension.workers()` result;
- final raw target table;
- browser liveness/exit status;
- exact exception.

`ENVIRONMENT_ERROR` is allowed only if those direct observations support an environment failure. Missing harness steps or an exposure race are `HARNESS_ERROR`.

## No separate preflight

This correction authorizes no standalone preflight. It must be consumed by the next single integrated full-gate execution. After Phase B PASS, the same top-level executable must continue directly through permanent blocks 01-16 and packaging.