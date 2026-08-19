# Ozon Puppeteer Extension Environment Preflight5

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ENVIRONMENT_PREFLIGHT5`

# STANDALONE CODEX PREFLIGHT5 PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is environment preflight ONLY. Do not run the full 01–16 gate. Do not modify production.

## Immutable candidate

Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Expected candidate hashes:

- final service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Reject any candidate/production drift.

## Read exact authority first

Read completely from commit:
`a99d59d4251c12741d586ffa7598e0bbf2ce9763`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_WINDOWS_CFT_SANDBOX_PERMISSION_PROVISIONING_2026-08-19.md`

Also read the complete preflight4 report from commit:
`959794ff00293f4621423649700098d225f67df2`

Do not continue from summaries alone.

## Exact environment

Use exactly:

- Node `v24.12.0`;
- Puppeteer `25.4.0` from the existing QA project;
- Chrome for Testing `151.0.7922.47`;
- exact existing executable:
  `D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64\chrome.exe`;
- exact candidate directory reconstructed from the immutable checkpoint;
- no dependency install/update;
- no browser version replacement;
- no operator Chrome profile.

## Stage A — permission/setup evidence

Let `browserDir = dirname(chrome.exe)`.

Emit these markers in order:

1. `ENV5_01_BEFORE_PERMISSION_INSPECTION`
2. `ENV5_02_PERMISSION_INSPECTION_COMPLETE`
3. `ENV5_03_BEFORE_SETUP`
4. `ENV5_04_AFTER_SETUP exit=<code>`
5. `ENV5_05_POST_SETUP_BYTE_IDENTITY_PASS`

Before setup, record in the report and runner output:

- SHA-256 of `chrome.exe`;
- whether `setup.exe` exists;
- if it exists, absolute path and SHA-256 of `setup.exe`;
- `icacls` output for `browserDir`;
- `icacls` output for `chrome.exe`;
- `icacls` output for `chrome_elf.dll` if present;
- current user identity;
- stat/read/execute accessibility of `chrome.exe` and `setup.exe`.

If `setup.exe` is absent, STOP immediately with classification:
`ENVIRONMENT_CFT_SETUP_TOOL_MISSING`.

Do not manually grant ACLs in this run.

If present, execute exactly once, using `shell:false` and without elevation:

`<browserDir>\setup.exe --configure-browser-in-directory=<browserDir>`

Capture exact exit code, stdout, stderr.

After setup, record the same `icacls` diagnostics again.

Require SHA-256 of `chrome.exe` and `setup.exe` after provisioning to equal their pre-provision SHA-256 exactly. If bytes changed, STOP with classification `ENVIRONMENT_CFT_SETUP_BYTE_DRIFT`.

The setup tool may change filesystem security metadata only. Do not modify candidate/production bytes.

If setup execution itself cannot be started or terminates abnormally, STOP with exact classification/evidence. Do not retry and do not substitute `icacls` grants or sandbox-bypass flags.

## Stage B — one browser/install preflight

Only after Stage A completes and binary identity passes, run exactly one browser preflight.

Use the exact preflight4 minimal Chrome argument sequence, with a fresh temporary user-data-dir:

1. `--user-data-dir=<fresh-profile>`
2. `--remote-debugging-port=0`
3. `--no-first-run`
4. `--no-default-browser-check`
5. `--disable-background-networking`
6. `--disable-component-update`
7. `--disable-sync`
8. `--metrics-recording-only`
9. `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
10. `about:blank`

Use Puppeteer native launch with:

- exact executablePath above;
- `headless:false`;
- `enableExtensions:true`;
- `ignoreDefaultArgs:true`;
- `waitForInitialPage:false`;
- `dumpio:true`.

Do NOT add `--disable-gpu` or any other Chrome flag.

Required Stage B markers:

6. `ENV5_06_BEFORE_LAUNCH`
7. `ENV5_07_AFTER_LAUNCH pid=<pid> version=<version> ws=<endpoint>`
8. `ENV5_08_ACTUAL_SPAWN_ARGS_MATCH_PASS`
9. `ENV5_09_BEFORE_INSTALL_EXTENSION`
10. `ENV5_10_AFTER_INSTALL_EXTENSION id=<extensionId>`
11. `ENV5_11_BEFORE_LIST_EXTENSIONS`
12. `ENV5_12_AFTER_LIST_EXTENSIONS candidate=<diagnostics>`
13. `ENV5_13_BEFORE_INITIAL_WORKERS`
14. `ENV5_14_AFTER_INITIAL_WORKERS count=<integer> urls=<...>`
15. `ENV5_PREFLIGHT_PASS`

Require actual Chrome `spawnargs` after executable to match the authorized minimal list exactly, with only the generated user-data-dir value varying.

Call `browser.installExtension(candidateDir)` exactly once.

If install succeeds:

- call `browser.extensions()` exactly once;
- require the returned extension id from install to be present;
- record candidate id/name/version/enabled/path;
- call `extension.workers()` exactly once;
- record count and URLs.

A zero initial worker count is PASS for this environment preflight. Do not wake the worker.

## Prohibited actions

Do NOT:

- run full gate blocks 01–16;
- run targeted production behavior tests;
- add/remove/change Chrome flags;
- use `--no-sandbox`, `--disable-gpu-sandbox`, `--disable-gpu-process-crash-limit`, or `--disable-gpu`;
- manually broaden ACLs with `icacls`;
- install/update Puppeteer or Chrome;
- open synthetic ChatGPT/Alice pages;
- trigger extension action/popup;
- wake the MV3 worker;
- make real Ozon/Performance requests;
- package anything;
- retry a failed stage.

## Hard counters

Require:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`

## Report

Create report-only branch:
`validation/ozon-puppeteer-extension-environment-preflight5-2026-08-19`

Create exactly one new report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit candidate bytes, CFT binaries, temporary runner, browser profile, credentials, or production edits.

Report exact pre/post ACL evidence, setup executable hashes, setup exit/output, Chrome dumpio tail on any browser failure, every marker reached, and exact failure classification.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT5_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

preflight5_authority_commit:
  a99d59d4251c12741d586ffa7598e0bbf2ce9763

candidate:
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>

environment:
  node: <version>
  puppeteer: <version>
  cft: <version>
  setup_exe_present: true|false
  setup_exit_code: <integer|NOT_RUN>

permissions:
  pre_setup_acl_captured: PASS|FAIL
  post_setup_acl_captured: PASS|FAIL|NOT_RUN
  chrome_bytes_identical_after_setup: PASS|FAIL|NOT_RUN
  setup_bytes_identical_after_setup: PASS|FAIL|NOT_RUN

last_completed_stage:
  <marker>

preflight:
  permission_inspection: PASS|FAIL
  setup_provisioning: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
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
  NONE|ENVIRONMENT_CFT_SETUP_TOOL_MISSING|ENVIRONMENT_CFT_SETUP_BYTE_DRIFT|ENVIRONMENT_CFT_SETUP_FAILURE|ENVIRONMENT_LAUNCH_FAILURE|ENVIRONMENT_EXTENSION_INSTALL_FAILURE|ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE|<exact other>

report_branch:
  <branch>

report_commit:
  <sha>
```
