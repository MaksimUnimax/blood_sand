# Ozon Bridge v0.1.19 — environment-only preflight exception before final Codex gate

Date: 2026-08-20
Status: `ENVIRONMENT_ONLY_PREFLIGHT_PERMITTED_FINAL_B01_B15_STILL_STOPPED`

Repository: `MaksimUnimax/blood_sand`
Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Purpose

The controlling checklist correctly forbids another B01–B15 Codex validation run while any required execution path is not already proven. The latest document-only report proved one remaining environment gap:

`EXISTING_UNMODIFIED_FRESH_SESSION_ACQUISITION_PATH_FOR_EXACT_CANDIDATE_NOT_PROVEN`

This document adds one narrow process clarification so that the environment gap can be resolved without violating the final-gate prohibition.

## Narrow exception

A Codex run is permitted **only as an environment-only preflight** when all of the following are true:

1. It does not execute or score B01–B15.
2. It does not claim production PASS/FAIL.
3. It does not modify production or the reconstructed candidate.
4. It does not create or modify `.js`, `.mjs`, `.py`, `.ps1`, runner, helper, harness, fixture, validator, workflow, ready-test, assertion-ledger, authority bundle or other test infrastructure.
5. It may only inspect and invoke **already-existing, unmodified** Windows QA assets.
6. Its only purpose is to prove or disprove fresh browser/session acquisition from a cold state for the exact Ozon candidate.
7. It may create normal temporary runtime artifacts produced by the existing environment itself (fresh browser/profile/copy, logs, DevToolsActivePort), but no new source/test program.
8. It may publish only one Markdown environment-preflight report on a pre-created validation branch.
9. On completion it stops; it does not continue into B01–B15.
10. A PASS of this preflight is readiness evidence only. Another full B01–B15 run remains forbidden until ChatGPT re-audits all B01–B15 after reviewing the preflight report.

This exception does **not** permit using a new prompt to invent, adapt, patch or build a launcher. If the standing assets cannot acquire the exact-candidate session unmodified, the preflight result is `BLOCKED` and the final gate remains stopped.

## Existing standing assets to inspect first

Accepted QA harness evidence identifies:

- launcher: `D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`
- CFT source: `D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64`
- Puppeteer: `25.4.0`
- CFT: `151.0.7922.47`
- dynamic DevTools discovery through `--remote-debugging-port=0` + `DevToolsActivePort`
- runtime extension installation through `browser.installExtension()`

Historical Ozon browser acceptance also records an existing browser client:

`D:\codex\Test\qa-live-repair-final-prefreeze-rerun-current\accepted-browser-run\accepted-v3-browser.mjs`

with a historical invocation shape:

`node <accepted-v3-browser.mjs> <candidateDir> <launcherEndpoint> <chrome.exe>`

and a previously observed standing launcher endpoint:

`http://127.0.0.1:50502`

These paths are evidence leads only. The environment-only preflight must inspect the actual current files/process state and must not assume they are still usable.

## Exact questions the environment-only preflight must answer

Starting from no active validation browser/session:

1. Does `launch-cft.mjs` still exist at the standing path?
2. Record its SHA-256 without modifying it.
3. Does it accept an arbitrary extension/candidate path, or is `mv3-extension` hard-coded?
4. Does it expose or retain a reusable browser/DevTools endpoint after startup?
5. If it starts a server/endpoint, what is the exact existing invocation and actual endpoint?
6. Does `accepted-v3-browser.mjs` still exist? Record its SHA-256 without modifying it.
7. Does that unmodified client accept `<candidateDir> <launcherEndpoint> <chrome.exe>` as recorded historically?
8. Can the standing unmodified asset chain be invoked against a freshly reconstructed exact Ozon v0.1.19 candidate?
9. Does the resulting browser enumerate the exact candidate version `0.1.19`?
10. Can an active exact-candidate MV3 worker be obtained through the existing path?
11. Can direct worker `Runtime.enable`, `Runtime.evaluate('1+1')` and `Network.enable` be performed through the already-existing control surface?
12. Can the browser/session remain available long enough for a later document-only validator to perform direct DevTools/UI operations, rather than terminating at the end of a self-contained old harness test?

If any required step would need modifying/copying/rebuilding a JS launcher/client, the result is `BLOCKED`.

## PASS condition

`SESSION_ACQUISITION_PREFLIGHT_PASS` requires an actually executed cold-state sequence using only already-existing unmodified QA assets:

`no active session -> existing launcher/action -> fresh validation browser/profile -> exact reconstructed Ozon candidate installed -> version 0.1.19 enumerated -> exact candidate worker acquired -> direct worker Runtime/Network available -> reusable browser/CDP control surface confirmed`

No historical PASS alone is sufficient.

## BLOCKED condition

Return `SESSION_ACQUISITION_PREFLIGHT_BLOCKED` if the existing assets are missing, fixed to the dummy harness extension, self-terminating without reusable control, incompatible with the exact candidate, or otherwise require source/test-infrastructure modification.

A BLOCKED result is an environment/process result, not a production failure.

## Safety

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `REAL_CHATGPT_REQUESTS=0`
- production modifications=0
- candidate modifications=0
- test infrastructure modifications=0
- ZIP=NOT_BUILT

## Final-gate status

Until an environment-only preflight returns a reviewed PASS:

`FINAL_B01_B15_CODEX_GATE = STOPPED`

After a reviewed PASS, ChatGPT must re-audit all B01–B15 before issuing a final consolidated prompt.