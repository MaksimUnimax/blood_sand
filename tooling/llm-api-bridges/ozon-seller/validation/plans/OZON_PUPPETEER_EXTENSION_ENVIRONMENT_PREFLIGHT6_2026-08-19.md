# Ozon Puppeteer Extension Environment Preflight6

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ENVIRONMENT_PREFLIGHT6`

# STANDALONE CODEX PREFLIGHT6 PROMPT

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

Reject production or candidate drift.

## Read authority completely

Read this validation-only correction completely from commit:
`6677ec9656720416a1ed66386b86732776903d98`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_CFT_OWNED_COPY_SANDBOX_PROVISIONING_CORRECTION_2026-08-19.md`

Read previous preflight5 report completely:
`0cd007fad80de450848f9c2e2cfaef08072d2d2b`

Do not reinterpret setup exit code 79 as a generic installer code. For this Chromium operation:

- `78 = CONFIGURE_APP_CONTAINER_SANDBOX_SUCCESS`
- `79 = CONFIGURE_APP_CONTAINER_SANDBOX_FAILED`

## Exact environment

Use exactly:

- Node `v24.12.0`;
- Puppeteer `25.4.0` from the existing QA project;
- source Chrome for Testing `151.0.7922.47` tree currently at:
  `D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64`
- no dependency install/update;
- no operator Chrome profile;
- no browser download/replacement;
- no manual ACL grant;
- no elevation;
- no new Chrome flags.

## Stage A — source inventory and owned byte-identical copy

1. Emit `ENV6_01_BEFORE_SOURCE_INVENTORY`.
2. Recursively enumerate every regular file in the source CFT browser tree. For each record normalized relative path, byte size and SHA-256. Sort deterministically by normalized relative path. Compute a deterministic SHA-256 of the complete inventory serialization.
3. Record source root owner/ACL plus `chrome.exe`, `chrome_elf.dll`, `setup.exe` owner/ACL.
4. Emit `ENV6_02_SOURCE_INVENTORY_COMPLETE files=<count> inventory_sha256=<sha>`.
5. Create a fresh temporary browser-copy root as the current validation process identity. Do not intentionally preserve source ACLs. Record current `whoami`, SID, the new root owner and ACL.
6. Require the new root to be owned by the current validation identity, or otherwise prove the current identity can open the root with DACL-write access. If not, fail without setup.
7. Byte-copy the complete source CFT tree into the new root.
8. Recompute the complete file inventory and require identical relative-path set, byte sizes and SHA-256s.
9. Emit `ENV6_03_COPY_BYTE_IDENTITY_PASS files=<count> inventory_sha256=<sha>`.

Do not modify the source CFT tree.

## Stage B — exact Chromium/Puppeteer sandbox provisioning on the copied tree

10. Emit `ENV6_04_BEFORE_SETUP`.
11. Run copied `setup.exe` exactly once, without elevation and with `shell:false`:

`<copiedBrowserDir>\setup.exe --configure-browser-in-directory=<copiedBrowserDir>`

12. Capture exact exit code, stdout and stderr.
13. Require exit code exactly `78`. Code `79` is FAIL. Do not retry.
14. Emit `ENV6_05_AFTER_SETUP exit=78` only on that exact success result.
15. Recompute complete copied-tree inventory and require every source regular file path/size/SHA-256 remains byte-identical and no extra regular file has appeared inside the copied browser tree.
16. Record post-setup owner/ACL for copied root, `chrome.exe`, `chrome_elf.dll`, `setup.exe`.
17. Require the two Chromium install-files capability SIDs to have inherited/read-execute-compatible access on the copied root:

- `S-1-15-3-1024-3424233489-972189580-2057154623-747635277-1604371224-316187997-3786583170-1043257646`
- `S-1-15-3-1024-2302894289-466761758-1166120688-1039016420-2430351297-4240214049-4028510897-3317428798`

18. Emit `ENV6_06_POST_SETUP_BYTE_AND_ACL_PASS`.

No `icacls /grant`, Set-Acl, chmod-equivalent, ownership takeover or sandbox bypass is authorized.

## Stage C — one browser install/list probe on provisioned copy

19. Create a separate fresh temporary Chrome profile.
20. Emit `ENV6_07_BEFORE_LAUNCH`.
21. Launch the copied `chrome.exe` through Puppeteer 25.4.0 with:

- `ignoreDefaultArgs:true`;
- `headless:false`;
- `enableExtensions:true`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- exact minimal Chrome argument sequence, after executable path:
  1. `--user-data-dir=<freshProfile>`
  2. `--remote-debugging-port=0`
  3. `--no-first-run`
  4. `--no-default-browser-check`
  5. `--disable-background-networking`
  6. `--disable-component-update`
  7. `--disable-sync`
  8. `--metrics-recording-only`
  9. `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
  10. `about:blank`

Do NOT add `--disable-gpu`, `--no-sandbox`, `--disable-gpu-sandbox`, crash-limit flags, or any other Chrome switch.

22. Emit `ENV6_08_AFTER_LAUNCH pid=<pid> version=<version> ws=<endpoint>`.
23. Inspect actual spawned arguments and require exact sequence match above. Emit `ENV6_09_ACTUAL_SPAWN_ARGS_MATCH_PASS`.
24. Emit `ENV6_10_BEFORE_INSTALL_EXTENSION`.
25. Call `browser.installExtension(candidateDir)` exactly once. No retry.
26. Emit `ENV6_11_AFTER_INSTALL_EXTENSION id=<extensionId>` on success.
27. Emit `ENV6_12_BEFORE_LIST_EXTENSIONS`.
28. Call `browser.extensions()` exactly once and require an Extension object matching the returned candidate id. Record id/name/version/enabled/path if exposed by Puppeteer 25.4.0.
29. Emit `ENV6_13_AFTER_LIST_EXTENSIONS candidate_id=<id>`.
30. Call `extension.workers()` exactly once and record count/URLs. Zero active workers is allowed and is not failure. Do not wake worker, do not trigger action, do not open popup/synthetic ChatGPT/Alice page.
31. Emit `ENV6_14_INITIAL_WORKERS count=<integer>`.
32. Require browser still alive after enumeration.
33. Emit `ENV6_PREFLIGHT_PASS`.
34. Close browser and delete only temporary browser-copy/profile files. Source CFT and candidate must remain unchanged.

## Bounded diagnostics

Bound every async stage. On failure:

- do not retry;
- do not change flags;
- record last completed marker;
- exact failed operation;
- error name/message/stack;
- setup stdout/stderr if applicable;
- Chrome dumpio tail if applicable;
- browser process exit status if available;
- source/copy inventory hashes and mismatch count;
- current identity/SID and relevant owner/ACL evidence.

## Hard counters

Require:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`
`candidate_modifications_by_validator=0`
`source_cft_modifications_by_validator=0`

## Report only

Create report-only branch:
`validation/ozon-puppeteer-extension-environment-preflight6-2026-08-19`

Create exactly one new report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit source/copy browser bytes, candidate bytes, temporary runner, profile, package, credentials, or production edits.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT6_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

preflight6_authority_commit:
  6677ec9656720416a1ed66386b86732776903d98

candidate:
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>

environment:
  node: <version>
  puppeteer: <version>
  cft: <version>
  validation_identity: <identity>

cft_copy:
  source_inventory_sha256: <sha256>
  copied_inventory_sha256_pre_setup: <sha256|NOT_RUN>
  copied_inventory_sha256_post_setup: <sha256|NOT_RUN>
  byte_identical_source_to_copy: PASS|FAIL|NOT_RUN
  setup_exit_code: <integer|NOT_RUN>

last_completed_stage:
  <marker>

preflight:
  source_inventory: PASS|FAIL
  owned_copy: PASS|FAIL|NOT_RUN
  setup_provisioning: PASS|FAIL|NOT_RUN
  post_setup_byte_acl: PASS|FAIL|NOT_RUN
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
candidate_modifications_by_validator:
  <integer>
source_cft_modifications_by_validator:
  <integer>

classification:
  NONE|ENVIRONMENT_COPY_OWNERSHIP_FAILURE|ENVIRONMENT_CFT_SETUP_FAILURE|ENVIRONMENT_LAUNCH_FAILURE|ENVIRONMENT_EXTENSION_INSTALL_FAILURE|ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE|<exact other>

report_branch:
  <branch>

report_commit:
  <sha>
```