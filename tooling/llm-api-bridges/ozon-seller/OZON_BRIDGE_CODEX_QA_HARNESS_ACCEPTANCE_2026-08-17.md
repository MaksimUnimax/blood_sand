# Ozon Bridge — Codex/Puppeteer QA harness acceptance

Date: 2026-08-17
Repository: `MaksimUnimax/blood_sand`
Canonical working branch: `work/ozon-data-collection-2026-08-11`
Tested canonical HEAD: `b24cffa72d3ea1493537df5aacc483a430dd51e9`
Validation branch: `validation/codex-puppeteer-launcher-correction-2026-08-17`
Validation commit: `a5539c8663bb6b48dce197f59e0abfe2d388af93`
Status: **QA_HARNESS_ACCEPTED_FOR_DEV**

## Accepted development loop

The Windows Codex QA environment is accepted as the standing automated browser-extension test harness for major Ozon Bridge engineering steps.

Accepted loop:

`fixed unpacked extension source -> Node launcher -> Chrome for Testing -> Puppeteer runtime install -> browser assertions -> report`

No operator ZIP download, extension reinstall, `chrome://extensions`, manual `Load unpacked`, or manual extension `Reload` is required for intermediate development validation.

## Qualified environment

- Puppeteer: `25.4.0`
- Chrome for Testing: `151.0.7922.47`
- launcher: Node `child_process.spawn()`
- dynamic DevTools discovery: `--remote-debugging-port=0` + `DevToolsActivePort`
- operator browser actions during accepted run: `0`
- extension install route: Puppeteer `browser.installExtension()` from the fixed unpacked source path

Three consecutive source revisions R1 -> R2 -> R3 passed with:

- same fixed extension source directory;
- stable extension ID;
- MV3 service-worker target;
- content-script execution;
- exact revision replacement (old marker absent, new marker present);
- console capture;
- localhost network observation;
- two independent tabs;
- clean browser restart between revisions;
- persistent `localStorage`;
- persistent cookie with explicit `Max-Age`.

Required validation verdicts were:

- `NODE_SPAWN_DYNAMIC_DEVTOOLS = PASS`
- `EXTENSION_INSTALL_ROUTE = RUNTIME_INSTALL`
- `R1 = PASS`
- `R2 = PASS`
- `R3 = PASS`
- `EXTENSION_ID_STABLE = PASS`
- `PERSISTENT_LOCALSTORAGE = PASS`
- `PERSISTENT_COOKIE = PASS`
- `ZERO_OPERATOR_EXTENSION_REINSTALL = YES`
- `QA_HARNESS_CORE_VERDICT = QA_HARNESS_ACCEPTED_FOR_DEV`
- `PROFILE_PERSISTENCE_VERDICT = PROFILE_PERSISTENCE_ACCEPTED`

## Evidence boundary

The validation branch is exactly one commit ahead of the tested canonical HEAD and adds only the QA report. It does not modify Ozon Bridge production source.

The report contains one clerical inconsistency: the R1 service-worker URL text ends with an extension-id suffix that differs from the stable extension ID stated by the extension inventory and the explicit `EXTENSION_ID_STABLE = PASS` result. That single URL line is excluded as identity evidence. The accepted identity evidence is the runtime extension inventory plus the explicit cross-run stable-ID assertion.

This clerical discrepancy does not reopen the QA-harness setup cycle.

## Development policy

After each major Ozon Bridge engineering step:

1. implementation is frozen at an exact Git commit SHA;
2. a standalone Codex validation plan is committed to GitHub;
3. Codex tests that exact SHA using the accepted Puppeteer/Chrome for Testing harness;
4. Codex publishes a validation report on a separate validation branch without changing production code;
5. the report is reviewed before the next engineering step begins.

Codex is a validator during these gates and must not repair production code while executing a validation plan unless a later plan explicitly assigns development work.

The accepted harness does **not** replace final release acceptance in the operator's normal browser/profile, current logged-in ChatGPT/Alice sessions, or controlled real Ozon provider checks where live provider behavior is the fact under test.

## Next engineering step

Step 0 is closed.

Next: **Step 1 — Contract + Capability layer**, beginning from an exact reproducible operator v0.1.19 development baseline. The canonical release lineage must not be falsely advanced from v0.1.11 by this QA acceptance or by importing the operator baseline into a development branch.