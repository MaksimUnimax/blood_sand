# Ozon Puppeteer Extension Environment Preflight3

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ENVIRONMENT_PREFLIGHT3`

# STANDALONE CODEX PREFLIGHT3 PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is environment preflight ONLY. Do not run the full 01–16 gate. Do not modify production.

## Immutable candidate authority

Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Expected candidate hashes:

- final service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Reject production drift. Candidate bytes may be used only as the extension under environment preflight.

## Read authority completely

Read this validation-only correction completely from commit:
`e782c38a6cd681e45fc722a075bb067e48b4f597`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_WINDOWS_GPU_CRASH_PREFLIGHT_CORRECTION_2026-08-19.md`

Also read the previous preflight2 report completely:
`f830003051a454ea5ee94a786351fb0f2771a44b`

## Exact environment

Use exactly:

- Node `v24.12.0`;
- Puppeteer `25.4.0` from existing QA project;
- Chrome for Testing `151.0.7922.47` exact executable already used by preflight2;
- `headless:false`;
- `enableExtensions:true`;
- fresh temporary `userDataDir`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- same Ozon/Performance network-blocking args used by preflight2;
- add exactly one environment correction launch switch: `--disable-gpu`.

Do not install/update dependencies. Do not use operator Chrome profile.

Do NOT add:

- `--disable-gpu-sandbox`;
- `--disable-gpu-process-crash-limit`;
- `--disable-software-compositing-fallback`;
- `--no-sandbox`;
- any other GPU/sandbox/crash-bypass switch.

## Execute once with staged diagnostics

Create one temporary preflight runner and execute it once.

Required markers:

1. `ENV3_01_BEFORE_LAUNCH`
2. `ENV3_02_AFTER_LAUNCH pid=<pid> version=<version> ws=<endpoint>`
3. `ENV3_03_BEFORE_INSTALL_EXTENSION`
4. `ENV3_04_AFTER_INSTALL_EXTENSION id=<extensionId>`
5. `ENV3_05_BEFORE_LIST_EXTENSIONS`
6. `ENV3_06_AFTER_LIST_EXTENSIONS ...candidate diagnostics...`
7. `ENV3_07_BEFORE_INITIAL_WORKERS`
8. `ENV3_08_AFTER_INITIAL_WORKERS count=<integer> urls=<...>`
9. `ENV3_PREFLIGHT_PASS`

Bound every async stage. On failure, do not retry or change flags. Capture:

- last completed stage;
- exact failed operation;
- error name/message/stack;
- Chrome dumpio tail;
- browser process exit status if available.

A zero initial worker count is allowed and must not fail this preflight. Do not wake the extension worker. Do not open synthetic ChatGPT/Alice pages. Do not click extension action/popup. Do not execute functional browser assertions.

## Hard counters

Require:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`

## Report only

Create report-only branch:
`validation/ozon-puppeteer-extension-environment-preflight3-2026-08-19`

Create exactly one new report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit candidate bytes, temporary runner, browser profile, package, credentials, or production edits.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT3_RESULT

gate_input_checkpoint:
  013aeec19fe44f6c15aaa39d0d70388f1d2029

preflight3_authority_commit:
  e782c38a6cd681e45fc722a075bb067e48b4f597

candidate:
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>

environment:
  node: <version>
  puppeteer: <version>
  cft: <version>
  disable_gpu: true

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
  NONE|ENVIRONMENT_LAUNCH_FAILURE|ENVIRONMENT_EXTENSION_INSTALL_FAILURE|ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE|<exact other>

report_branch:
  <branch>

report_commit:
  <sha>
```