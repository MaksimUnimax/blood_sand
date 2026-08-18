# Ozon Bridge v0.1.19 — Puppeteer extension environment preflight 2

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ENVIRONMENT_PREFLIGHT2_ONLY`

# STANDALONE CODEX PREFLIGHT2 PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This task is environment preflight ONLY.

Do NOT run the full 01–16 gate.
Do NOT run targeted production behavior tests.
Do NOT package an extension.
Do NOT modify production.
Do NOT use the operator Chrome profile.
Do NOT make real Ozon or Performance requests.

## Immutable candidate authority

Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Expected exact candidate hashes:

- final `service_worker.js` SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js` SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Reconstruct the exact candidate only as much as necessary to obtain these exact extension bytes and verify the hashes. Do not execute functional harnesses.

## Previous evidence

Read completely:

Report commit:
`34239cb57c6710599a16eda9cc77f4262d6abc62`

It proves only that the prior `puppeteer.launch()` promise did not resolve before the stage timeout. It did not capture a post-launch PID/version or Chrome stderr and therefore does not prove that `chrome.exe` itself failed to spawn.

## Preflight2 authority

Read completely from commit:
`4959c2c07bcf65e312f925266ea6a481a2f5e557`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_LAUNCH_INITIAL_PAGE_PREFLIGHT_CORRECTION_2026-08-18.md`

Use exact environment:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- Chrome for Testing `151.0.7922.47`
- existing QA project only; no dependency install/update
- exact already-qualified CFT executable from the previous report

## Exact diagnostic launch contract

Launch through Puppeteer itself, not manual `spawn()`/`connect()`.

Required launch properties:

- `executablePath`: exact CFT 151 executable
- `headless:false`
- `enableExtensions:true`
- fresh temporary `userDataDir`
- existing background-network blocking args for Ozon/Performance hosts
- `waitForInitialPage:false`
- `dumpio:true`
- explicit bounded Puppeteer launch timeout

Do not add synthetic pages, popup bootstraps, `triggerAction()`, extension clicks, or functional UI assertions.

## Required markers and diagnostics

Print each marker immediately before or after the operation named by it. Flush stdout.

1. `ENV2_01_BEFORE_LAUNCH`
2. call `puppeteer.launch(...)`
3. `ENV2_02_AFTER_LAUNCH`
   - browser process PID
   - `browser.version()`
   - `browser.wsEndpoint()` if available
4. `ENV2_03_BEFORE_INSTALL_EXTENSION`
5. call `browser.installExtension(candidateDir)`
6. `ENV2_04_AFTER_INSTALL_EXTENSION`
   - returned extension id
7. `ENV2_05_BEFORE_LIST_EXTENSIONS`
8. call `browser.extensions()`
9. `ENV2_06_AFTER_LIST_EXTENSIONS`
   - every returned extension id/name/version/enabled/path available from the public API
   - prove exact returned candidate extension id is present
10. `ENV2_07_BEFORE_INITIAL_WORKERS`
11. call candidate `extension.workers()` once
12. `ENV2_08_AFTER_INITIAL_WORKERS`
   - count and URLs if any

A zero worker count is NOT a failure in this preflight2. Do not wake the worker in this run. This run is only to prove launch, runtime install, and extension enumeration independently of initial-page waiting and worker lifecycle.

If launch succeeds and the exact candidate is installed/enumerated, emit:

`OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT2_PASS`

## Failure evidence

On failure:

- print exact last completed marker;
- print exact failing operation;
- print error name/message/stack;
- preserve all Chrome stdout/stderr produced through `dumpio:true` in the report;
- if a browser process PID exists, record it and clean up only that temporary process/profile;
- do not retry the failed operation;
- do not change launch flags after failure in the same run.

Classify one of:

- `ENVIRONMENT_LAUNCH_FAILURE`
- `ENVIRONMENT_EXTENSION_INSTALL_FAILURE`
- `ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE`
- `NONE`

Do not classify zero initial workers as failure in this run.

Hard counters:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- `production_modifications_by_validator=0`

## Report

Create report-only branch:

`validation/ozon-puppeteer-extension-environment-preflight2-2026-08-18`

Create exactly one new report:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT2_2026-08-18.md`

Do not commit the temporary candidate, browser profile, temporary script, or production files.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT2_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

preflight2_authority_commit:
  4959c2c07bcf65e312f925266ea6a481a2f5e557

candidate:
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>

environment:
  node: <version>
  puppeteer: <version>
  cft: <version>

last_completed_stage:
  <marker>

preflight:
  launch: PASS|FAIL
  install_extension: PASS|FAIL|NOT_RUN
  list_extensions: PASS|FAIL|NOT_RUN
  candidate_enumeration: PASS|FAIL|NOT_RUN
  initial_worker_count: <integer|NOT_RUN>
  terminal: PASS|FAIL

network:
  real_ozon_requests: <integer>
  real_performance_requests: <integer>
  operator_browser_actions: <integer>

production_modifications_by_validator:
  <integer>

classification:
  NONE|ENVIRONMENT_LAUNCH_FAILURE|ENVIRONMENT_EXTENSION_INSTALL_FAILURE|ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE

report_branch:
  <branch>

report_commit:
  <sha>
```
