# Ozon Bridge v0.1.19 — pre-Codex browser/session acquisition correction

Date: 2026-08-20
Status: `STOP_SESSION_ACQUISITION_NOT_PROVEN`

Repository: `MaksimUnimax/blood_sand`
Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

This document supersedes the **READY conclusion** of:

`tooling/llm-api-bridges/ozon-seller/validation/engineering-preflight/PRE_CODEX_B01_B15_READINESS_RESOLUTION_2026-08-19.md`

That prior resolution correctly investigated provider interception capability, but incorrectly treated a historically demonstrated browser/CDP capability as equivalent to a freshly obtainable document-only browser/CDP session.

The final Codex gate is therefore **not ready for another run**.

## 1. Triggering evidence

Latest document-only report:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_DOCUMENT_ONLY_B01_B15_2026-08-19.md`

Report commit:

`a8cd835a34144fb7b787f1165163388ba204acd5`

Observed result:

- B01: `PASS`
- B02–B15: `BLOCKED`
- production modifications: `0`
- test infrastructure modifications: `0`
- ZIP: `NOT_BUILT`

Factual common blocker reported by Codex:

`No already-active permitted direct-CDP/browser session was available to execute the required runtime/browser checks in document-only mode. Creating a runner, helper, harness, fixture, or other test program was forbidden.`

No production failure was reported.

## 2. What was wrong in the previous READY reasoning

The previous readiness resolution established that, **once an exact-candidate browser/worker CDP session exists**, the required DevTools capabilities have historical evidence:

- raw PAGE Runtime/Page/Fetch;
- candidate service-worker direct CDP;
- worker Runtime;
- worker Network;
- browser liveness;
- standard service-worker Fetch capability suitable for local request interception.

That is capability evidence.

It did **not** establish the required fresh-run transition:

`no validation browser/session -> existing unmodified allowed environment action -> fresh validation-owned browser -> exact reconstructed candidate installed -> active exact-candidate PAGE/worker CDP session`

A capability that existed inside a historical custom runner is not automatically an available session-acquisition path in a later document-only run.

## 3. Existing standing launcher evidence

Standing QA acceptance from commit:

`a5539c8663bb6b48dce197f59e0abfe2d388af93`

records the existing external launcher:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`

with:

- Node launcher using `child_process.spawn()`;
- dynamic `--remote-debugging-port=0` / `DevToolsActivePort` discovery;
- Puppeteer connection;
- runtime extension installation;
- CFT `151.0.7922.47`.

However that acceptance also records its fixed harness extension source as:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\mv3-extension`

and the tested extension was the harness extension (`Codex Puppeteer MV3 Harness`, version `1.0.0`), not Ozon Bridge v0.1.19.

The repository evidence currently available does **not** prove that the unmodified standing `launch-cft.mjs` accepts an arbitrary exact Ozon candidate path and leaves/returns a usable session for the B02–B15 document-only operations.

Therefore existence of `launch-cft.mjs` alone is not sufficient readiness evidence.

## 4. Exact-current candidate historical CDP evidence is not session-acquisition evidence

RERUN13 report commit:

`9e275d784b46c46dc86f1f0ca02eb5e12094ec37`

proved on the exact current candidate:

- browser launch;
- exact extension installation/enumeration;
- raw PAGE Runtime/Page/Fetch;
- candidate worker direct `worker.client.send(...)` CDP;
- worker Runtime and Network;
- browser liveness;
- zero real Ozon/Performance/ChatGPT network.

But its exact command was:

`node RERUN11_INTEGRATED_RUNNER.mjs ...`

That top-level runner was part of the historical validation orchestration. The current document-only checklist forbids Codex from creating/rebuilding such runner/helper/harness infrastructure.

RERUN18 has the same important boundary: its browser substrate evidence remains valid capability evidence, but its full-gate runner was later invalidated for incomplete matrix execution and is not current document-only execution authority.

## 5. Current root gap

The current single root gap is now:

`EXISTING_UNMODIFIED_FRESH_SESSION_ACQUISITION_PATH_FOR_EXACT_CANDIDATE_NOT_PROVEN`

This is earlier than worker-side Fetch interception.

Until an active exact-candidate session can be obtained by a **pre-existing, unmodified, explicitly permitted** environment mechanism, dependent runtime/browser blocks cannot execute.

## 6. What must be proven before another full Codex run

Before any new consolidated B01–B15 prompt, engineering must prove all of the following **without creating or modifying a test program during the final gate**:

1. Starting from no active validation browser/session, a named existing environment command/action can be invoked.
2. That action uses the qualified Node/Puppeteer/CFT environment.
3. It creates a fresh validation-owned browser/profile.
4. It installs the exact reconstructed Ozon v0.1.19 candidate, not the fixed dummy harness extension.
5. It exposes or returns an active browser/CDP control surface usable by the validator.
6. The exact candidate PAGE/worker can be reached through that control surface.
7. Direct worker `Runtime` and `Network` are available.
8. Standard worker `Fetch` can then be enabled for local Seller/Performance interception.
9. No source/test/harness file needs to be created, copied over, patched, or rewritten to obtain that session during the final run.
10. The acquisition method is repeatable from a fresh no-session state.

Historical PASS from a different runner or an already-running old browser does not satisfy these ten items.

## 7. Allowed investigation before the final gate

The final B01–B15 gate remains stopped.

Engineering may inspect existing environment assets and historical evidence to determine whether the standing unmodified launcher already satisfies the ten requirements above.

The critical external asset to inspect is:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`

Questions that must be answered from the actual existing file/environment, not guessed from reports:

- Does it accept an extension/candidate path as an input?
- If not, is its extension source hard-coded to `mv3-extension`?
- Does it terminate the browser/session after its own checks, or expose a reusable control endpoint/session?
- Can it start the exact validation browser without modifying its source or fixture directory?
- Is there another already-existing generic launcher in the accepted QA environment intended for arbitrary extension candidates?

If the answer demonstrates a ready unmodified path, record the exact command and evidence and then re-audit B01–B15.

If no such path exists, the process must remain STOP until an environment launcher is prepared and independently accepted **outside** the final Codex gate. A new full Codex prompt cannot be used to discover or build that launcher.

## 8. Production/candidate status

Production candidate remains unchanged:

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch bytes: `13648`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- inventory: exactly `17`
- production delta: only `service_worker.js` and `content_script.js`
- protected remaining `15`: byte-identical frozen ZIP.

No production edit is authorized by this correction.

## 9. Current decision

Pre-Codex gate:

`STOP`

Reason:

`EXISTING_UNMODIFIED_FRESH_SESSION_ACQUISITION_PATH_FOR_EXACT_CANDIDATE_NOT_PROVEN`

Previous readiness status:

`B01_B15_EXECUTION_PATHS_READY`

is superseded and must not be used to justify another Codex run.

Next permitted work:

`inspect/prove the existing external QA launcher/session-acquisition path; do not issue another full B01–B15 Codex prompt until that proof exists.`

Packaging remains forbidden.