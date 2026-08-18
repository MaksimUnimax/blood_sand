# Ozon Bridge — isolated Puppeteer extension environment preflight

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ENVIRONMENT_PREFLIGHT_ONLY`

# STANDALONE CODEX PREFLIGHT PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This task is ONLY a validation-environment preflight.
It is NOT the full pre-operator gate.
Do NOT execute functional blocks 01-14, browser behavior assertions, provider behavior, packaging, or operator handoff validation.
Do NOT modify production.

## Exact production candidate authority

Production candidate checkpoint remains exactly:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Reconstruct the exact candidate exactly as already defined by the authoritative composer-wait candidate documents at that checkpoint.

Expected immutable final hashes:

- `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Reject any production drift.

## Environment preflight authority

Read COMPLETELY from commit:
`b9d759476de9e6e9f9929a686f5cdb97e278b71f`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT_2026-08-18.md`

Execute that preflight exactly.

## Exact environment

Use only the already-qualified installed environment:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- Chrome for Testing `151.0.7922.47`
- existing QA project `D:\codex\Test\qa-harness\puppeteer-extension-qa`
- fresh temporary browser profile
- exact CFT executable already present in that QA project

No npm install/update.
No Chrome install/update.
No operator Chrome profile.
No real Seller/Performance credentials.
No real provider requests.

## Mandatory architecture

Launch CFT using Puppeteer itself:

- `puppeteer.launch(...)`
- `headless:false`
- `enableExtensions:true`
- exact `executablePath`
- fresh `userDataDir`
- background-network blocking args from the authority document

Do NOT use:

- manual `spawn()` + `DevToolsActivePort` + `puppeteer.connect()`;
- `--load-extension`;
- previous synthetic ChatGPT wake bootstrap;
- previous popup-only bootstrap;
- repeated wake attempts;
- one opaque timeout around the whole sequence.

Runtime install must use:
`browser.installExtension(candidateDir)`.

## Required diagnostics

Every async stage must print its required BEFORE and AFTER marker exactly as specified in the authority document.

If a stage fails, preserve the exact last completed stage and classify THAT operation. Do not relabel an earlier-stage timeout as worker discovery.

Especially:

- if `ENV_PREFLIGHT_04_AFTER_INSTALL_EXTENSION` is absent, do not claim the extension installed;
- if `ENV_PREFLIGHT_07_CANDIDATE_ENUMERATED` is absent, do not classify worker discovery;
- only after candidate enumeration may worker/background-context discovery be tested.

Do not retry a failed stage inside the same preflight.

## Hard counters

Required totals:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications by validator `0`

## Report

Create report-only branch:
`validation/ozon-puppeteer-extension-environment-preflight-2026-08-18`

Create exactly one report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Suggested filename:
`OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT_2026-08-18.md`

The report must include:

- exact candidate hashes;
- Node/Puppeteer/CFT versions;
- every emitted stage marker in order;
- exact stdout/stderr for the failing stage if any;
- browser process diagnostics if launch succeeded;
- extension inventory if listing succeeded;
- target inventory if browser exists;
- worker inventory if candidate enumeration succeeded;
- hard network/operator counters;
- exact final classification.

Do not commit candidate production files, temporary profile, or temporary runner.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

preflight_authority_commit:
  b9d759476de9e6e9f9929a686f5cdb97e278b71f

candidate:
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>

environment:
  node: <version>
  puppeteer: <version>
  cft: <version>

last_completed_stage:
  <exact marker>

preflight:
  launch: PASS|FAIL|NOT_RUN
  install_extension: PASS|FAIL|NOT_RUN
  list_extensions: PASS|FAIL|NOT_RUN
  candidate_enumeration: PASS|FAIL|NOT_RUN
  worker_discovery: PASS|FAIL|NOT_RUN
  terminal: PASS|FAIL

network:
  real_ozon_requests: <integer>
  real_performance_requests: <integer>
  operator_browser_actions: <integer>

production_modifications_by_validator:
  <integer>

classification:
  PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT_PASS|ENVIRONMENT_LAUNCH_FAILURE|ENVIRONMENT_INSTALL_EXTENSION_FAILURE|ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE|ENVIRONMENT_WORKER_DISCOVERY_FAILURE|<other exact environment classification>

report_branch:
  <branch>

report_commit:
  <sha>
```
