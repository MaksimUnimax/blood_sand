# Ozon Puppeteer Extension Environment Preflight4

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ENVIRONMENT_PREFLIGHT4`

# STANDALONE CODEX PREFLIGHT4 PROMPT

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
`6f45314d6f4015508f1e148ce8ba2c5d69eb6054`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_NATIVE_MINIMAL_ARGS_PREFLIGHT_CORRECTION_2026-08-19.md`

Also read completely:

- historical browser source blob `841429741d5ff9144a8a40506e657dc4392fe37c`;
- preflight2 report commit `f830003051a454ea5ee94a786351fb0f2771a44b`;
- preflight3 report commit `bda57d53410a11373bfe41dbc89ed9adb0e3e745`.

## Exact environment

Use exactly:

- Node `v24.12.0`;
- Puppeteer `25.4.0` from the existing QA project;
- Chrome for Testing `151.0.7922.47` exact executable used by the previous preflights;
- `headless:false`;
- `enableExtensions:true`;
- `ignoreDefaultArgs:true`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- a fresh temporary profile;
- exactly the Chrome argument list authorized by commit `6f45314d6f4015508f1e148ce8ba2c5d69eb6054`.

Do not install/update dependencies. Do not use operator Chrome profile.

The preflight3 `--disable-gpu` flag is superseded and MUST NOT be present.

Do not add any other Chrome switch.

## Execute once with staged diagnostics

Create one temporary preflight runner and execute it once.

Required markers:

1. `ENV4_01_BEFORE_LAUNCH`
2. `ENV4_02_AFTER_LAUNCH pid=<pid> version=<version> ws=<endpoint>`
3. `ENV4_03_ACTUAL_SPAWN_ARGS_MATCH_PASS`
4. `ENV4_04_BEFORE_INSTALL_EXTENSION`
5. `ENV4_05_AFTER_INSTALL_EXTENSION id=<extensionId>`
6. `ENV4_06_BEFORE_LIST_EXTENSIONS`
7. `ENV4_07_AFTER_LIST_EXTENSIONS ...candidate diagnostics...`
8. `ENV4_08_BEFORE_INITIAL_WORKERS`
9. `ENV4_09_AFTER_INITIAL_WORKERS count=<integer> urls=<...>`
10. `ENV4_PREFLIGHT_PASS`

Before `browser.installExtension()`, inspect the actual Chrome process spawn arguments. Require exact equality, after the executable path, to the authorized argument sequence from commit `6f45314d6f4015508f1e148ce8ba2c5d69eb6054`.

If actual args differ, fail as `ENVIRONMENT_LAUNCH_ARGUMENT_MISMATCH`; do not continue and do not alter the args.

Bound every async stage. On failure, do not retry or change flags. Capture:

- last completed marker;
- exact failed operation;
- error name/message/stack;
- actual spawn args if launch completed;
- Chrome dumpio tail;
- browser process exit status if available.

A zero initial worker count is allowed and must not fail this preflight. Do not wake the extension worker. Do not call `extension.triggerAction`. Do not open popup. Do not create synthetic ChatGPT/Alice pages. Do not execute functional browser assertions.

## Hard counters

Require:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`

## Report only

Create report-only branch:
`validation/ozon-puppeteer-extension-environment-preflight4-2026-08-19`

Create exactly one new report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit candidate bytes, temporary runner, browser profile, package, credentials, or production edits.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT4_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

preflight4_authority_commit:
  6f45314d6f4015508f1e148ce8ba2c5d69eb6054

candidate:
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>

environment:
  node: <version>
  puppeteer: <version>
  cft: <version>
  ignore_default_args: true
  disable_gpu: false

last_completed_stage:
  <marker>

preflight:
  launch: PASS|FAIL
  spawn_args_exact_match: PASS|FAIL|NOT_RUN
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
  NONE|ENVIRONMENT_LAUNCH_FAILURE|ENVIRONMENT_LAUNCH_ARGUMENT_MISMATCH|ENVIRONMENT_EXTENSION_INSTALL_FAILURE|ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE|<exact other>

report_branch:
  <branch>

report_commit:
  <sha>
```