# Ozon Bridge — Puppeteer launch initial-page preflight correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit and no full functional gate.

## Evidence

Environment preflight report commit:
`34239cb57c6710599a16eda9cc77f4262d6abc62`

The preflight emitted only `ENV_PREFLIGHT_01_BEFORE_LAUNCH` and then its external stage timeout fired. No browser PID/version or browser process stderr was captured. Therefore the report proves only that the `puppeteer.launch()` promise did not resolve within the stage timeout; it does NOT prove that `chrome.exe` itself failed to spawn.

## Puppeteer 25.4.0 launch semantics relevant to this preflight

`LaunchOptions.waitForInitialPage` defaults to `true`. `LaunchOptions.dumpio` defaults to `false`.

For diagnostic preflight only, launch the same exact qualified CFT through Puppeteer with:

- `headless:false`;
- `enableExtensions:true`;
- exact CFT executable `151.0.7922.47`;
- fresh temporary `userDataDir`;
- existing provider host-blocking arguments;
- `waitForInitialPage:false`;
- `dumpio:true`;
- explicit Puppeteer launch `timeout` bounded by the preflight;
- no operator Chrome profile;
- no dependency changes.

`waitForInitialPage:false` is diagnostic isolation only: it prevents launch completion from being coupled to creation of an initial page target. It does not weaken any extension behavior assertion because this preflight runs no functional assertions.

`dumpio:true` is required so any Chrome process launch/sandbox/profile error is visible in the preflight report instead of being hidden behind a generic stage timeout.

## Required stage markers

Print each marker immediately before/after its operation:

1. `ENV2_01_BEFORE_LAUNCH`
2. `ENV2_02_AFTER_LAUNCH` — include browser process PID and `browser.version()`
3. `ENV2_03_BEFORE_INSTALL_EXTENSION`
4. `ENV2_04_AFTER_INSTALL_EXTENSION` — include returned extension id
5. `ENV2_05_BEFORE_LIST_EXTENSIONS`
6. `ENV2_06_AFTER_LIST_EXTENSIONS` — include ids/names/enabled/path
7. `ENV2_07_BEFORE_INITIAL_WORKERS`
8. `ENV2_08_AFTER_INITIAL_WORKERS` — include count/URLs
9. terminal `OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT2_PASS` only if all stages complete and the exact candidate extension is enumerated. Worker count may be zero at this preflight stage; do not invent a wake mechanism in this run.

Do NOT call `extension.triggerAction()`, open popup pages, synthesize ChatGPT pages, or run production behavior assertions in this diagnostic preflight. The purpose is to determine whether native launch + runtime installation + enumeration works once initial-page waiting is removed from launch completion.

## Failure classification

Report the exact last completed marker and the exact failing operation.

- launch promise still fails before `ENV2_02_AFTER_LAUNCH` with Chrome diagnostics showing a process/sandbox/profile failure: `ENVIRONMENT_LAUNCH_FAILURE`;
- launch succeeds but runtime install fails: `ENVIRONMENT_EXTENSION_INSTALL_FAILURE`;
- install succeeds but extension enumeration fails: `ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE`;
- all three succeed: preflight PASS; worker lifecycle is a separate next diagnostic only if needed.

Hard counters remain:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`
