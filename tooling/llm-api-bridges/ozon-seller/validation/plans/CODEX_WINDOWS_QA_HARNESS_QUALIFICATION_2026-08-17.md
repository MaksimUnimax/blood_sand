# Codex Windows QA Harness Qualification — 2026-08-17

Repository: `MaksimUnimax/blood_sand`
Canonical working branch: `work/ozon-data-collection-2026-08-11`
Production-code baseline before this QA setup document: `dee546afdbf72a4232ae948152e4431e52a8b81f`
Local Windows workspace root: `D:\codex\Test`
Status: **QA environment qualification only. Do not modify Ozon Bridge production code.**

## Purpose

Qualify whether the Windows Codex desktop environment can become the standing test harness for Ozon Bridge development so that the operator does not need to download/reinstall every intermediate extension build manually.

This qualification must establish, with evidence, which of these are actually usable in the current Windows installation:

- local repository checkout;
- local PowerShell/terminal execution;
- Node/npm test execution;
- built-in browser;
- Chrome integration;
- Developer Mode / full CDP access;
- console/network/page-state inspection;
- access to `chrome://extensions` or equivalent extension management surface;
- loading an unpacked MV3 extension;
- reloading the same unpacked extension after source changes;
- proving the changed extension executes after reload;
- GitHub report publication from the Windows machine.

The qualification uses a disposable synthetic extension. **Do not install or test Ozon Bridge itself in this step.**

---

# FULL STANDALONE PROMPT FOR CODEX

You are qualifying a Windows Codex desktop environment that will later be used as an independent QA harness for a browser extension project.

This is a VALIDATION/ENVIRONMENT task, not a production-development task.

## Fixed environment facts already measured

Workspace root:

`D:\codex\Test`

Observed tools:

- PowerShell 7.6.4
- Git 2.40.1.windows.1 at `C:\Program Files\Git\cmd\git.exe`
- Node v24.12.0 at `C:\Program Files\nodejs\node.exe`
- npm 11.6.2 at `C:\Program Files\nodejs\npm.cmd`
- workspace write test already passed
- built-in browser was reported AVAILABLE
- Chrome integration was reported AVAILABLE
- Computer Use was reported NOT_AVAILABLE
- Developer Mode / full CDP status was UNKNOWN

Repository:

`https://github.com/MaksimUnimax/blood_sand.git`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Production-code baseline before the QA setup document:

`dee546afdbf72a4232ae948152e4431e52a8b81f`

## Safety / scope constraints

1. DO NOT modify any Ozon Bridge production source file.
2. DO NOT change any file under existing `reference-*` immutable evidence directories.
3. DO NOT use real Ozon credentials.
4. DO NOT call any Ozon API endpoint.
5. DO NOT enter passwords, API keys, tokens, cookies or secrets into chat/report files.
6. DO NOT install system-wide software.
7. DO NOT modify PATH or Windows system settings.
8. DO NOT use WSL.
9. DO NOT repair production code if you discover anything unrelated.
10. You MAY create disposable files only under `D:\codex\Test\qa-harness\` and a validation report under the repository validation/report path described below.
11. You MAY clone the repository into `D:\codex\Test\blood_sand` if it is not already present.
12. You MAY create a dedicated Git validation branch if local Git authentication permits it.
13. If Chrome or Codex asks for an explicit browser/CDP permission, stop and ask the human operator to approve that permission. Do not bypass permission dialogs.
14. Do not claim PASS from a simulated browser if the test requirement explicitly says REAL CHROME or REAL IN-APP BROWSER.

## Human prerequisite before browser/CDP tests

Ask the operator to verify this setting in the ChatGPT desktop application:

`Settings > Browser > Developer mode > Enable full CDP access = ON`

If the setting is absent, disabled by policy, or cannot be turned on, record that exactly and continue with tests that do not require full CDP.

Do not invent the setting state. Verify it through the available application/browser capability or ask the operator for confirmation.

---

## Phase A — workspace and repository qualification

1. Confirm current working directory.
2. Ensure `D:\codex\Test\qa-harness` exists.
3. If `D:\codex\Test\blood_sand\.git` does not exist, clone:

`https://github.com/MaksimUnimax/blood_sand.git`

into:

`D:\codex\Test\blood_sand`

4. Fetch refs.
5. Checkout `work/ozon-data-collection-2026-08-11`.
6. Record:
   - `git status --short --branch`
   - `git rev-parse HEAD`
   - `git log -1 --format=fuller`
   - `git remote -v`
7. Confirm that the history contains baseline commit `dee546afdbf72a4232ae948152e4431e52a8b81f`.
8. Do not reset, force checkout over user changes, clean, or delete unknown files.
9. If the checkout already contains local modifications, record them and do not overwrite them.

### GitHub write qualification

Determine whether the local Windows Git environment can publish a dedicated validation branch without exposing credentials.

Use safe commands only. Do not print tokens or credential-store contents.

If authentication is available:

- later create/push `validation/codex-windows-harness-2026-08-17` containing only the final report;
- never push production-code modifications.

If authentication is not available:

- record `GITHUB_PUSH_NOT_CONFIGURED`;
- do not ask the operator to paste a PAT into chat;
- leave the report locally and state the exact blocker.

---

## Phase B — create a disposable MV3 test extension

Create only under:

`D:\codex\Test\qa-harness\mv3-reload-test`

Create a minimal Manifest V3 extension with:

- `manifest.json`;
- `content.js`;
- `service_worker.js`.

Required behavior version 1:

1. It matches only `http://127.0.0.1:8765/*`.
2. On page load, `content.js` sets:

`document.documentElement.dataset.codexHarness = "v1"`

and appends a visible fixed element with exact text:

`CODEX_MV3_HARNESS_V1`

3. `content.js` logs:

`CODEX_MV3_CONTENT_V1`

4. The service worker logs on startup/installation:

`CODEX_MV3_SW_V1`

5. No external hosts, credentials, storage, clipboard, downloads, webRequest or broad permissions are needed.

Run `node --check` on both JavaScript files.

Record SHA-256 hashes of all three extension files.

---

## Phase C — create a deterministic local test page/server

Under:

`D:\codex\Test\qa-harness\site`

create a simple `index.html` containing exact visible marker:

`CODEX_LOCAL_SITE_READY`

Start a local HTTP server bound only to loopback on port 8765.

Preferred implementation: a tiny Node HTTP server in the harness directory so no package installation is needed.

Verify from PowerShell that:

`http://127.0.0.1:8765/`

returns HTTP 200 and contains `CODEX_LOCAL_SITE_READY`.

Record server process details needed for cleanup.

---

## Phase D — built-in browser qualification

This phase must use the actual Codex/ChatGPT in-app browser, not curl and not a DOM simulator.

1. Open the built-in browser.
2. Navigate to `http://127.0.0.1:8765/`.
3. Verify visibly that `CODEX_LOCAL_SITE_READY` is present.
4. If full CDP is enabled and permitted, use it to inspect the page and record:
   - current URL;
   - document title;
   - console visibility/access status;
   - network visibility/access status;
   - whether DOM/page-state inspection is available.
5. If a CDP permission prompt appears, ask the operator to approve it.
6. Do not claim CDP PASS merely because browser navigation works.

Expected qualification output:

- `IN_APP_BROWSER_NAVIGATION = PASS|FAIL`
- `IN_APP_BROWSER_CDP = PASS|FAIL|BLOCKED|NOT_AVAILABLE`

---

## Phase E — real Chrome integration qualification

This phase must use the actual Chrome integration, not the in-app browser.

1. Confirm that Codex can address/control the real Chrome integration.
2. Open or attach to Chrome and navigate a normal tab to:

`http://127.0.0.1:8765/`

3. Verify visibly that `CODEX_LOCAL_SITE_READY` is present.
4. If full CDP is enabled and permitted, record whether Codex can inspect:
   - console output;
   - network traffic;
   - DOM/page state;
   - JavaScript execution/performance surface as available.
5. Record whether Chrome is using the operator's normal profile or another profile, but do not dump cookies/profile secrets.

Expected output:

- `REAL_CHROME_CONTROL = PASS|FAIL|BLOCKED`
- `REAL_CHROME_CDP = PASS|FAIL|BLOCKED|NOT_AVAILABLE`

---

## Phase F — extension-management qualification

The main objective is to determine whether the future QA loop can reload an unpacked extension without the human reinstalling a ZIP.

### F1 — access extension management

Using real Chrome integration, attempt to navigate to:

`chrome://extensions/`

Record one of:

- `ACCESSIBLE`
- `BLOCKED_BY_CHROME`
- `BLOCKED_BY_CODEX`
- `NOT_SUPPORTED_BY_INTEGRATION`
- `OTHER_FAILURE` with exact non-secret reason.

Do not guess.

### F2 — load the disposable unpacked extension

If extension management is accessible:

1. Enable Chrome Developer mode if not already enabled.
2. Use `Load unpacked`.
3. Select exactly:

`D:\codex\Test\qa-harness\mv3-reload-test`

4. Record the extension name/id if visible. The id is not secret.
5. Do not load any Ozon Bridge build.

If this cannot be automated through Codex/Chrome integration, stop this subtest and record the exact manual boundary. Do not ask the operator to complete it yet unless required to continue qualification.

Expected output:

`UNPACKED_EXTENSION_LOAD = PASS|FAIL|MANUAL_BOUNDARY`

### F3 — prove version 1 executes

If the extension loaded:

1. Navigate/reload `http://127.0.0.1:8765/`.
2. Verify visible marker `CODEX_MV3_HARNESS_V1`.
3. Verify DOM property:

`document.documentElement.dataset.codexHarness === "v1"`

4. Through CDP/console if available, verify `CODEX_MV3_CONTENT_V1`.
5. If extension service-worker inspection is accessible, verify `CODEX_MV3_SW_V1`; otherwise record service-worker-console inspection as a separate unsupported/blocked capability rather than failing the entire extension-load test.

### F4 — prove source edit + extension Reload works

Edit only the disposable harness extension:

- change visible marker to `CODEX_MV3_HARNESS_V2`;
- change dataset value to `v2`;
- change content log to `CODEX_MV3_CONTENT_V2`;
- change service-worker log to `CODEX_MV3_SW_V2`.

Run `node --check` again and record new hashes.

Then, without uninstalling/reinstalling the extension:

1. use the Chrome extension-management `Reload` action for this unpacked extension;
2. refresh the localhost test page;
3. prove `CODEX_MV3_HARNESS_V1` is absent;
4. prove `CODEX_MV3_HARNESS_V2` is visible;
5. prove dataset value is exactly `v2`;
6. verify v2 console log through CDP if available.

Expected output:

`UNPACKED_EXTENSION_RELOAD = PASS|FAIL|MANUAL_BOUNDARY`

This is the most important qualification result for avoiding repeated manual installs.

---

## Phase G — multi-tab/browser inspection sanity check

If real Chrome control is available:

1. Open two localhost tabs to the same test page.
2. Confirm Codex can distinguish and switch between them.
3. Record tab URLs/titles only.
4. Do not infer that this proves Ozon Bridge conversation ownership; it proves only that the QA harness can manage multiple browser tabs.

Expected output:

`REAL_CHROME_MULTITAB_CONTROL = PASS|FAIL|BLOCKED`

---

## Phase H — cleanup

1. Stop the loopback HTTP server.
2. If the synthetic extension was successfully loaded, remove it from Chrome after all tests, unless removal itself is impossible; if impossible, state that clearly.
3. Keep the harness source directory and report files for reproducibility.
4. Do not delete the existing `D:\codex\Test\CODEX_WORKSPACE_WRITE_TEST.txt`.
5. Do not alter Ozon Bridge production files.

---

## Phase I — report

Create:

`D:\codex\Test\blood_sand\tooling\llm-api-bridges\ozon-seller\validation\reports\CODEX_WINDOWS_QA_HARNESS_QUALIFICATION_REPORT_2026-08-17.md`

The report must include:

### Identity

- date/time with timezone;
- Windows version/build;
- ChatGPT/Codex desktop app version if visible;
- PowerShell/Git/Node/npm versions;
- repository branch and exact HEAD tested;
- whether baseline commit `dee546afdbf72a4232ae948152e4431e52a8b81f` is an ancestor;

### Capability matrix

Exact statuses for:

- local workspace read/write;
- repository clone/fetch/checkout;
- GitHub push authentication;
- built-in browser navigation;
- built-in browser full CDP;
- real Chrome integration/control;
- real Chrome full CDP;
- `chrome://extensions` access;
- unpacked extension load;
- unpacked extension source-change reload;
- content-script console inspection;
- extension service-worker inspection;
- multi-tab Chrome control.

### Evidence

Include concise non-secret evidence:

- commands run and their relevant output;
- file hashes;
- exact visible markers observed;
- exact CDP/console/network observations;
- screenshots only if the environment supports saving them locally without exposing unrelated/private tabs or account data;
- no cookies, auth headers, tokens or account-private page content.

### Manual boundaries

List every action the operator would still have to perform manually during future Ozon Bridge test cycles.

The report must answer this exact question explicitly:

> Can Codex, after a source change in a fixed unpacked extension directory, reload that same extension and verify the new code in real Chrome without the operator downloading/reinstalling a ZIP?

Answer exactly one:

- `YES_FULLY_AUTOMATED`
- `YES_WITH_ONE_MANUAL_RELOAD_ACTION`
- `NO_EXTENSION_MANAGEMENT_BLOCKED`
- `INCONCLUSIVE`

### Verdict

Use one of:

- `QA_HARNESS_QUALIFIED`
- `QA_HARNESS_PARTIALLY_QUALIFIED`
- `QA_HARNESS_NOT_QUALIFIED`

Explain blockers precisely.

---

## Phase J — publish report to GitHub if authenticated

If Git push authentication is available:

1. Ensure production tree is unchanged except the new report.
2. Create/switch to branch:

`validation/codex-windows-harness-2026-08-17`

from the tested canonical branch HEAD.

3. Commit only:

`tooling/llm-api-bridges/ozon-seller/validation/reports/CODEX_WINDOWS_QA_HARNESS_QUALIFICATION_REPORT_2026-08-17.md`

4. Commit message:

`test: record Codex Windows QA harness qualification`

5. Push that validation branch.
6. Report the resulting commit SHA and GitHub branch URL.
7. Do NOT merge it.
8. Do NOT modify the canonical working branch.

If Git push authentication is unavailable, leave the report locally, mark `GITHUB_PUSH_NOT_CONFIGURED`, and tell the operator exactly what authentication capability is missing without requesting a secret in chat.

---

# Fail-closed rules

- Any browser test that could not actually use the requested browser surface is `BLOCKED`/`INCONCLUSIVE`, never PASS.
- A successful localhost HTTP response does not prove browser control.
- A successful real-Chrome page navigation does not prove extension-management access.
- Loading an unpacked extension once does not prove reload automation.
- Editing source files without proving V2 executes does not prove reload.
- Built-in browser results do not substitute for real Chrome results.
- Local Git commit does not prove GitHub push capability.
- Never expose credentials or browser secrets as evidence.

# End state

Do not begin Ozon Bridge implementation after this qualification. Stop after producing/publishing the report and wait for review.