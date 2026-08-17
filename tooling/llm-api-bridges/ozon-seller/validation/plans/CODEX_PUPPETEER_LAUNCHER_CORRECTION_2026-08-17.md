# Codex Puppeteer launcher correction — one-shot acceptance repair

Date: 2026-08-17
Repository: `MaksimUnimax/blood_sand`
Canonical working branch: `work/ozon-data-collection-2026-08-11`
Canonical HEAD before this document: `8c6669d3c8266c49bd26429f7e8f67614df0630e`
Failed final-acceptance report branch: `validation/codex-puppeteer-final-acceptance-2026-08-17`
Failed report commit: `e3fbe42ba99fcee2a8697068e2dde8502b96e97d`
Status: **one-shot QA harness correction only; no Ozon Bridge production changes**.

## Decision

The final acceptance failure is scoped to the reusable launcher: Chrome for Testing did not expose the expected DevTools endpoint within 30 seconds, so R1 never began and R2/R3 were correctly not attempted. This does not erase the previous qualification that successfully automated unpacked extension load, MV3 content script/service-worker inspection, V1→V2 fixed-path relaunch, console, network and multitabs.

Do not create an open-ended setup loop. Perform one targeted correction with a different launcher architecture. If this one-shot correction fails, stop and report the exact blocker; do not invent further harness redesigns without review.

## Technical correction direction

1. Do not wrap the previously successful command in `Start-Process` again.
2. Use Node `child_process.spawn()` as the launcher so executable path and every Chrome argument are passed as an argument array, avoiding PowerShell quoting/argument-flattening differences.
3. Use a non-default dedicated `--user-data-dir`.
4. Use `--remote-debugging-port=0` and discover Chrome's chosen port from `<user-data-dir>\DevToolsActivePort` instead of reserving a fixed port such as 9238. This removes fixed-port collision/race risk.
5. Connect Puppeteer using the discovered browser WebSocket endpoint or `browserURL` derived from the selected port.
6. Prefer the Chrome for Testing version supported by Puppeteer 25.4.0 (`151.0.7922.47`) for this acceptance. Do not silently mix Puppeteer 25.4.0 with the previously used Chrome for Testing 152 if the supported build can be installed locally.
7. Prefer Puppeteer's runtime extension API after connection (`browser.installExtension(extensionPath)`) so the fixed unpacked directory is installed under Puppeteer control. If this exact runtime route is unavailable after an external connect, one fallback is allowed: reproduce the exact extension-loading command-line route that passed the prior qualification, but still launch it through Node `spawn()` and dynamic DevTools port discovery.
8. No operator browser actions, ZIP installs, `chrome://extensions`, manual Load unpacked or manual Reload.

---

# FULL STANDALONE PROMPT FOR CODEX

You are performing ONE targeted correction of the Windows Puppeteer / Chrome for Testing QA harness for the Ozon Bridge project.

This is not Ozon Bridge development.

DO NOT modify Ozon Bridge production code.
DO NOT modify immutable `reference-*` evidence.
DO NOT use real Ozon credentials or accounts.
DO NOT call Ozon APIs.
DO NOT enter an open-ended retry/setup loop.

## Context already proven

Workspace: `D:\codex\Test`

Repository checkout: `D:\codex\Test\blood_sand`

Repository: `MaksimUnimax/blood_sand`

Canonical branch: `work/ozon-data-collection-2026-08-11`

Canonical HEAD before this correction-plan commit: `8c6669d3c8266c49bd26429f7e8f67614df0630e`

Previous successful Puppeteer qualification report:
- branch `validation/codex-puppeteer-extension-qa-2026-08-17`
- commit `2fa748ed6ec5b4d18c360570111dbe25a5f54da5`
- Puppeteer 25.4.0
- Chrome for Testing 152.0.7977.42
- automated unpacked extension load PASS
- MV3 content script PASS
- MV3 service worker target PASS
- extension realm PASS
- fixed-path V1→V2 automated relaunch PASS
- extension ID stable PASS
- multitabs PASS
- console PASS
- network PASS

Failed final acceptance report:
- branch `validation/codex-puppeteer-final-acceptance-2026-08-17`
- commit `e3fbe42ba99fcee2a8697068e2dde8502b96e97d`
- R1 never started because reusable PowerShell `.ps1` launcher failed to expose `/json/version` on fixed port 9238 within 30 seconds
- R2/R3 were not attempted by fail-closed policy
- operator browser actions remained 0

This correction must address only that launcher/reconnect reliability issue and then rerun the three-revision acceptance.

## External technical facts to respect

Puppeteer 25.4.0's supported Chrome for Testing build is `151.0.7922.47`.

Use that exact supported build for this acceptance if it is not already installed. A local harness-only browser install is allowed. Do not install system-wide Chrome.

Chrome remote debugging must use a non-default `--user-data-dir`. Use the dedicated QA profile only.

Use `--remote-debugging-port=0` so Chrome chooses a free port. Discover the selected port from the profile's `DevToolsActivePort` file. Do not hard-code 9222/9238/etc.

## Hard constraints

1. No production-code changes.
2. No Ozon network calls.
3. No real site logins.
4. No normal user Chrome profile.
5. No PowerShell `Start-Process` as the primary browser launcher.
6. No fixed remote-debugging port.
7. No `chrome://extensions`.
8. No manual Load unpacked.
9. No manual Reload.
10. No ZIP.
11. Operator browser actions must remain zero.
12. Maximum correction scope: one launcher implementation + one three-revision acceptance run.
13. If the new launcher cannot start R1, collect diagnostics and STOP. Do not design a third launcher architecture.

## Phase A — repository guard

In `D:\codex\Test\blood_sand`:

- `git fetch --all --prune`
- `git status --short --branch`
- `git rev-parse HEAD`
- record the exact tested canonical HEAD
- working tree must be clean before testing

If canonical HEAD moved after this plan was committed, test the actual current canonical HEAD only if it contains this plan and production tree is clean; record it exactly.

## Phase B — pin the supported test browser

Harness root:

`D:\codex\Test\qa-harness\puppeteer-extension-qa`

Keep Puppeteer exactly `25.4.0`.

Check installed browsers with the local Puppeteer/browser tooling.

Ensure Chrome for Testing `151.0.7922.47` exists locally for this harness. If absent, install only that Chrome for Testing build into the local Puppeteer cache using the installed Puppeteer/@puppeteer/browsers tooling. Do not change system Chrome.

Record:
- Puppeteer exact version
- exact Chrome for Testing version
- executable path

Do not use 152 for the acceptance if 151.0.7922.47 installed successfully.

## Phase C — replace the launcher architecture

Create:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`

Use Node built-ins plus Puppeteer as needed.

The browser process MUST be started with Node `child_process.spawn(executablePath, args, options)`.

Do not construct one giant command-line string.

Pass every Chrome argument as a separate array element.

Use dedicated profile:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\browser-profile-final-node`

Before R1 only, ensure no stale Chrome process is using this exact dedicated profile. Do not kill unrelated Chrome processes.

Use:

`--user-data-dir=<exact dedicated profile>`

and:

`--remote-debugging-port=0`

plus only the minimum existing harness flags needed to launch Chrome for Testing headful and avoid first-run UI.

Do not use a fixed debug port.

Before spawning, remove only a stale `DevToolsActivePort` file inside this dedicated test profile if it exists and no process is using that profile.

After spawning:

1. poll for `<profile>\DevToolsActivePort` with a finite timeout;
2. parse the first line as the selected port;
3. parse the second line as the browser WebSocket path if present;
4. verify the selected port is local-only and `/json/version` responds;
5. connect Puppeteer using the discovered endpoint;
6. record Chrome process PID, chosen port, and browser version.

Startup timeout may be up to 45 seconds for this correction. No infinite wait.

Capture browser stdout/stderr to harness-local files for failure diagnostics. Do not log secrets.

### Extension installation route A — preferred

After Puppeteer connects to the externally spawned Chrome for Testing, attempt:

`browser.installExtension(<fixed extension source path>)`

Fixed extension source path:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\mv3-extension`

Then verify `browser.extensions()` contains the installed extension and record its ID.

If route A works, use it for R1/R2/R3.

### Extension installation route B — single allowed fallback

If `browser.installExtension()` is explicitly unsupported/fails because the externally connected browser lacks the required extension-debug capability, do not redesign the harness again.

You are allowed exactly one fallback: reproduce the exact command-line extension-loading route that succeeded in the prior qualification, but launch it through the new Node `spawn()` launcher and still use `--remote-debugging-port=0` + `DevToolsActivePort` discovery.

Document why route A failed and the exact safe fallback used. No other fallback.

## Phase D — local deterministic site

Use the existing harness local site or recreate it as needed on loopback only.

Bind `127.0.0.1` only, preferably port 8766 if available.

Required base marker:

`CODEX_FINAL_LOCAL_SITE_READY`

Verify HTTP 200 before browser assertions.

## Phase E — correct persistent state

During R1 set:

`localStorage.setItem('codex_qa_storage_final','persist_final')`

Set a real persistent cookie, not a session cookie:

`codex_qa_cookie_final=persist_final; Max-Age=86400; Path=/; SameSite=Lax`

Use Puppeteer/CDP cookie API if that is more deterministic than `document.cookie`.

Verify both during R1, after clean restart in R2, and after clean restart in R3.

Cookie persistence is reported separately and does not invalidate the extension loop if the extension loop passes.

## Phase F — three consecutive revisions

Use the SAME extension source directory for all runs:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\mv3-extension`

Use the SAME dedicated profile for all runs:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\browser-profile-final-node`

Cleanly close only the test browser between runs.

No operator actions.

### R1

Set source markers:
- visible `CODEX_NODE_QA_R1`
- dataset `document.documentElement.dataset.codexNodeQa = 'r1'`
- content console `CODEX_NODE_CONTENT_R1`
- service-worker revision/log `CODEX_NODE_SW_R1`

Run `node --check` on JS files and record hashes.

Launch via `launch-cft.mjs`, connect, install/load extension through the selected route, and assert:
- real Chrome for Testing version is the pinned 151 build
- extension inventory contains the fixed-path extension
- extension ID recorded
- MV3 service-worker target exists for this extension
- localhost base marker exists
- R1 visible marker exists
- dataset is `r1`
- R1 console marker observed
- document network request observed
- two independent tabs both show R1 extension state
- persistent localStorage and persistent cookie are created and visible

Clean browser shutdown.

R1 = PASS only if all core extension assertions pass.

### R2

Edit the SAME extension source directory:
- visible `CODEX_NODE_QA_R2`
- dataset `r2`
- console `CODEX_NODE_CONTENT_R2`
- service worker `CODEX_NODE_SW_R2`

Syntax checks + new hashes.

Relaunch via the SAME Node launcher and SAME profile.

Assert:
- R1 marker absent
- R2 marker present
- dataset `r2`
- R2 console observed
- service-worker target exists
- extension ID equals R1
- localStorage persisted
- persistent cookie persisted (record separately if not)
- multitabs PASS
- network PASS

Clean shutdown.

### R3

Same directory again:
- visible `CODEX_NODE_QA_R3`
- dataset `r3`
- console `CODEX_NODE_CONTENT_R3`
- service worker `CODEX_NODE_SW_R3`

Syntax checks + hashes.

Relaunch same launcher/profile.

Assert:
- R1 absent
- R2 absent
- R3 present
- dataset `r3`
- R3 console observed
- service-worker target exists
- extension ID equals R1/R2
- localStorage persisted
- persistent cookie persisted (record separately)
- multitabs PASS
- network PASS

Clean shutdown.

## Core verdict

Return `QA_HARNESS_ACCEPTED_FOR_DEV` only if R1, R2 and R3 all PASS with zero operator browser actions, same fixed extension source directory, stable extension ID, MV3 service-worker target, content script, console, network and multitabs all proven.

Persistent-cookie failure alone produces `PROFILE_PERSISTENCE_LIMITED` but does not reject the core harness.

If R1 cannot begin because the Node launcher cannot expose/discover DevTools, core verdict is rejected and this task STOPS. Do not create another launcher architecture.

## Required diagnostics on launcher failure

If the Node launcher fails before R1:
- record child process exit code/signal
- record whether process remained alive
- record sanitized stdout/stderr
- record whether `DevToolsActivePort` was created
- record profile path
- record exact argument array with only non-secret harness flags
- record whether Chrome process created any child processes
- do not rerun more than one immediate diagnostic attempt

## Report

Create only:

`D:\codex\Test\blood_sand\tooling\llm-api-bridges\ozon-seller\validation\reports\CODEX_PUPPETEER_LAUNCHER_CORRECTION_REPORT_2026-08-17.md`

Include:
- exact repository HEAD
- Puppeteer version
- Chrome for Testing version/path
- launcher implementation and dynamic selected ports
- extension installation route A or B
- R1/R2/R3 result matrix
- file hashes and markers
- extension IDs
- service-worker evidence
- console/network/multitab evidence
- localStorage/cookie persistence separately
- operator browser action count
- production tree status before/after

Required exact answers:

`NODE_SPAWN_DYNAMIC_DEVTOOLS = PASS|FAIL`

`EXTENSION_INSTALL_ROUTE = RUNTIME_INSTALL|COMMAND_LINE_FALLBACK|FAIL`

`R1 = PASS|FAIL`

`R2 = PASS|FAIL|NOT_RUN`

`R3 = PASS|FAIL|NOT_RUN`

`EXTENSION_ID_STABLE = PASS|FAIL|NOT_RUN`

`PERSISTENT_LOCALSTORAGE = PASS|FAIL|NOT_RUN`

`PERSISTENT_COOKIE = PASS|FAIL|NOT_RUN`

`ZERO_OPERATOR_EXTENSION_REINSTALL = YES|NO`

`QA_HARNESS_CORE_VERDICT = QA_HARNESS_ACCEPTED_FOR_DEV|QA_HARNESS_REJECTED_FOR_DEV`

`PROFILE_PERSISTENCE_VERDICT = PROFILE_PERSISTENCE_ACCEPTED|PROFILE_PERSISTENCE_LIMITED`

## Publish

If GitHub push authentication is available, create a validation branch from the exact canonical HEAD tested:

`validation/codex-puppeteer-launcher-correction-2026-08-17`

Commit only the report file.

Commit message:

`test: validate corrected Puppeteer launcher`

Push it. Do not merge. Do not modify canonical production branch.

If auth is unavailable, leave report locally and do not request a secret.

## Final response

Return exactly:

CODEX_PUPPETEER_LAUNCHER_CORRECTION_RESULT

tested_head:
  <sha>

puppeteer:
  25.4.0

chrome_for_testing:
  <exact version>

launcher:
  node_spawn_dynamic_devtools: PASS|FAIL
  operator_browser_actions: <number>

extension:
  install_route: RUNTIME_INSTALL|COMMAND_LINE_FALLBACK|FAIL
  r1: PASS|FAIL
  r2: PASS|FAIL|NOT_RUN
  r3: PASS|FAIL|NOT_RUN
  id_stable: PASS|FAIL|NOT_RUN
  mv3_service_worker: PASS|FAIL|NOT_RUN
  content_scripts: PASS|FAIL|NOT_RUN
  multitabs: PASS|FAIL|NOT_RUN
  console: PASS|FAIL|NOT_RUN
  network: PASS|FAIL|NOT_RUN

persistence:
  local_storage: PASS|FAIL|NOT_RUN
  persistent_cookie: PASS|FAIL|NOT_RUN

zero_operator_extension_reinstall:
  YES|NO

core_verdict:
  QA_HARNESS_ACCEPTED_FOR_DEV|QA_HARNESS_REJECTED_FOR_DEV

profile_persistence_verdict:
  PROFILE_PERSISTENCE_ACCEPTED|PROFILE_PERSISTENCE_LIMITED

report_branch:
  <branch or NONE>

report_commit:
  <sha or NONE>

report_url:
  <url or NONE>

Then STOP. Do not begin Ozon Bridge implementation.