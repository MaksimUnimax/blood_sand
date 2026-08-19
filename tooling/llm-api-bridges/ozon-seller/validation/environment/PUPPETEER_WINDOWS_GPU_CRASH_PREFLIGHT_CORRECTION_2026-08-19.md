# Ozon Bridge — Windows CFT GPU-crash environment correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit and no full functional gate execution.

## Evidence

Preflight2 report commit:
`f830003051a454ea5ee94a786351fb0f2771a44b`

Preflight2 proved:

- `puppeteer.launch()` PASS;
- exact CFT `151.0.7922.47` started and exposed a DevTools endpoint;
- failure occurred only after `ENV2_03_BEFORE_INSTALL_EXTENSION`;
- Chrome dumpio showed repeated GPU process exits with `exit_code=-1073741790`, followed by fatal `GPU process isn't usable. Goodbye.`;
- `browser.installExtension()` then failed with `Protocol error (Extensions.loadUnpacked): Target closed` because the browser process had terminated;
- no extension install success, enumeration, workers, functional assertions, provider requests, or production writes occurred.

This is therefore an environment crash before extension behavior can be evaluated.

## Authorized preflight-only correction

Run one further environment preflight using the same exact environment and candidate bytes as preflight2, preserving:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- exact CFT `151.0.7922.47` executable;
- `headless:false`;
- `enableExtensions:true`;
- fresh temporary `userDataDir`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- existing Ozon/Performance network-blocking arguments;
- zero operator profile/actions;
- zero real provider requests.

Add exactly one Chromium launch switch:

`--disable-gpu`

Do not add `--disable-gpu-sandbox`, `--disable-gpu-process-crash-limit`, `--disable-software-compositing-fallback`, `--no-sandbox`, or any other GPU/sandbox/crash-bypass switch.

The purpose is only to determine whether the accepted Windows CFT environment can remain alive long enough to complete runtime extension installation and enumeration without the fatal GPU crash observed in preflight2.

## Required staged evidence

Emit markers before and after each async operation:

1. `ENV3_01_BEFORE_LAUNCH`
2. `ENV3_02_AFTER_LAUNCH` with PID/version/ws endpoint
3. `ENV3_03_BEFORE_INSTALL_EXTENSION`
4. `ENV3_04_AFTER_INSTALL_EXTENSION` with returned extension id
5. `ENV3_05_BEFORE_LIST_EXTENSIONS`
6. `ENV3_06_AFTER_LIST_EXTENSIONS` with candidate id/name/version/enabled/path
7. `ENV3_07_BEFORE_INITIAL_WORKERS`
8. `ENV3_08_AFTER_INITIAL_WORKERS` with count/URLs
9. `ENV3_PREFLIGHT_PASS`

A zero initial worker count is allowed and is not a failure in this preflight. Do not wake the worker and do not execute browser behavior assertions.

Every stage must remain bounded. On failure, report the last completed marker, exact operation, exception, Chrome dumpio tail, and exit code. Do not retry with changed flags.

## Hard safety counters

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`

Do not run the full 01–16 gate from this correction. Full-gate execution remains blocked until this environment preflight reaches terminal PASS.