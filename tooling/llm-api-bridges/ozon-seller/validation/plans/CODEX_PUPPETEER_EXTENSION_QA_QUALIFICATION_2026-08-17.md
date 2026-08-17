# Codex Puppeteer / Chrome for Testing extension QA qualification — 2026-08-17

Repository: `MaksimUnimax/blood_sand`
Canonical working branch: `work/ozon-data-collection-2026-08-11`
Canonical HEAD before this document: `7fe723f43a7c1355cea724e124c380286c1f1fe3`
Prior validation report branch: `validation/codex-windows-harness-2026-08-17`
Prior validation report commit: `ad1b746adb174f8128be5c38e44c4f4c1bd2f2fd`
Local Windows workspace root: `D:\codex\Test`
Status: **QA harness qualification only. Do not modify Ozon Bridge production code.**

## Why this second qualification exists

The first Windows qualification proved local Git/Node/npm, the Codex in-app browser, and full in-app CDP, but the Codex-to-existing-Chrome integration was unavailable in that session. That blocked `chrome://extensions`, `Load unpacked`, and same-extension UI Reload automation.

This does **not** imply that automated MV3 extension testing is unavailable.

Current Chrome guidance removed the ordinary `--load-extension` command-line path from regular Chrome beginning with Chrome 137 and directs extension-testing use cases toward automation tooling. Current Puppeteer supports loading unpacked extensions through `enableExtensions`, inspecting MV3 service workers/content-script realms, and launching Chrome for Testing, a Chrome build intended specifically for automation.

This qualification determines whether Codex can use that supported path as the standing extension QA browser without requiring the operator to repeatedly download/install ZIP files.

The target development loop is:

`fixed extension source directory -> Codex runs tests -> Puppeteer launches Chrome for Testing with that directory -> extension executes -> evidence -> browser closes -> source changes -> relaunch -> new source executes`.

A full browser restart is acceptable for this QA harness. The requirement is **zero operator reinstall/download**, not preservation of one continuously-running browser process.

---

# FULL STANDALONE PROMPT FOR CODEX

You are performing the second qualification of a Windows QA harness for the Ozon Bridge browser-extension project.

This is a VALIDATION / ENVIRONMENT task.

DO NOT begin Ozon Bridge development.
DO NOT modify Ozon Bridge production code.
DO NOT use real Ozon credentials.
DO NOT call Ozon APIs.

## Fixed environment

Workspace root:

`D:\codex\Test`

Repository checkout:

`D:\codex\Test\blood_sand`

Repository:

`MaksimUnimax/blood_sand`

Canonical branch:

`work/ozon-data-collection-2026-08-11`

Canonical HEAD before this qualification-plan document was created:

`7fe723f43a7c1355cea724e124c380286c1f1fe3`

Prior Windows qualification report:

- branch: `validation/codex-windows-harness-2026-08-17`
- commit: `ad1b746adb174f8128be5c38e44c4f4c1bd2f2fd`
- result: `QA_HARNESS_PARTIALLY_QUALIFIED`
- in-app browser navigation: PASS
- in-app full CDP: PASS
- real Chrome integration: unavailable
- unpacked extension load/reload through existing Chrome: unproven/manual boundary

Previously measured tools:

- PowerShell 7.6.4
- Git 2.40.1.windows.1
- Node v24.12.0
- npm 11.6.2

## Technical route being tested

Use Puppeteer 25.4.0 and its Chrome for Testing automation browser.

The extension must be loaded through Puppeteer's supported extension API (`enableExtensions`), not by relying on the removed regular-Chrome `--load-extension` workflow.

The harness must remain entirely under:

`D:\codex\Test\qa-harness\puppeteer-extension-qa`

No npm dependency or generated browser binary may be added to the `blood_sand` repository.

## Safety rules

1. Do not modify any Ozon Bridge production source.
2. Do not modify `reference-*` evidence directories.
3. Do not use Seller or Performance API credentials.
4. Do not call `api-seller.ozon.ru` or `api-performance.ozon.ru`.
5. Do not sign in to ChatGPT/Alice/Yandex/OpenAI/Ozon during this qualification.
6. Do not expose cookies, tokens, passwords or auth headers.
7. Do not install system-wide software.
8. Do not modify PATH.
9. Do not use WSL.
10. Do not use destructive Git commands.
11. Puppeteer/npm dependencies are allowed only locally under the disposable harness directory.
12. Chrome for Testing downloaded by Puppeteer is allowed only as a local QA dependency under the normal Puppeteer cache/harness setup. Do not make it the system default browser.
13. Do not call a simulated DOM or unit test a browser PASS.
14. A Puppeteer browser PASS must come from an actual launched Chrome for Testing browser instance.
15. Do not claim this qualification proves the operator's ordinary Google Chrome profile. It proves the dedicated automated QA browser path only.

---

## Phase A — repository identity and clean-source guard

1. In `D:\codex\Test\blood_sand`, run:

   - `git fetch --all --prune`
   - `git status --short --branch`
   - `git rev-parse HEAD`
   - `git log -1 --format=fuller`

2. Checkout/follow `work/ozon-data-collection-2026-08-11` without destroying local changes.
3. Record the exact canonical HEAD actually used.
4. Confirm the prior base `7fe723f43a7c1355cea724e124c380286c1f1fe3` is an ancestor.
5. Record a production-tree fingerprint or at minimum `git status --short` before testing.
6. Production source must remain unchanged throughout this qualification.

---

## Phase B — create isolated Puppeteer harness

Create:

`D:\codex\Test\qa-harness\puppeteer-extension-qa`

Inside this directory only:

1. Initialize a local npm project.
2. Install exactly:

   `puppeteer@25.4.0`

   as a local dev dependency.

3. Do not install Jest or other packages unless Puppeteer itself requires them.
4. Record:
   - `npm ls puppeteer`
   - installed Puppeteer version;
   - downloaded/selected browser version;
   - actual browser executable path used by Puppeteer.
5. Do not add `node_modules`, package files, or Puppeteer cache files to the Git repository.

If installation/download is blocked, stop browser phases and report exact non-secret blocker.

---

## Phase C — deterministic local site

Create under the harness:

`site\index.html`

Visible exact marker:

`CODEX_PUPPETEER_LOCAL_SITE_READY`

Create a minimal Node HTTP server bound only to:

`127.0.0.1:8766`

No external bind.

The page must additionally expose a small script that lets the test set/read:

- `document.cookie` on localhost;
- `localStorage` marker.

Verify HTTP 200 from PowerShell before browser testing.

---

## Phase D — synthetic MV3 extension V1

Create only under:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\mv3-extension`

Files:

- `manifest.json`
- `content.js`
- `service_worker.js`

Manifest V3.

Match only:

`http://127.0.0.1:8766/*`

No unrelated permissions.

V1 required behavior:

- set `document.documentElement.dataset.codexPuppeteerHarness = "v1"`;
- add visible fixed element exact text `CODEX_PUPPETEER_MV3_V1`;
- content log exact text `CODEX_PUPPETEER_CONTENT_V1`;
- service-worker install/start log exact text `CODEX_PUPPETEER_SW_V1`.

Run:

- `node --check content.js`
- `node --check service_worker.js`

Record SHA-256 of all three files.

---

## Phase E — write one executable QA script

Create a Node script, for example:

`run-extension-qa.mjs`

Use Node's built-in `assert` plus Puppeteer; no test framework is required.

### E1 launch requirements

Launch a real Chrome for Testing instance using Puppeteer with:

- `headless: false` for the qualification so the browser is visibly real;
- `enableExtensions: [absoluteExtensionPath]`;
- a fixed persistent QA profile directory, e.g. `D:\codex\Test\qa-harness\puppeteer-extension-qa\browser-profile`.

Do not use the operator's normal Chrome profile.

Record:

- `browser.version()`;
- executable path/configuration used;
- whether the browser launched successfully.

### E2 extension inventory

Use current Puppeteer extension APIs if available to enumerate installed extensions.

Record:

- synthetic extension ID;
- name;
- version;
- whether an MV3 service-worker target exists.

Do not treat extension enumeration failure as PASS.

### E3 V1 content-script proof

Open:

`http://127.0.0.1:8766/`

Assert all of the following from the real browser:

1. base site marker `CODEX_PUPPETEER_LOCAL_SITE_READY` exists;
2. visible extension marker `CODEX_PUPPETEER_MV3_V1` exists;
3. `document.documentElement.dataset.codexPuppeteerHarness === "v1"`;
4. capture page console and prove `CODEX_PUPPETEER_CONTENT_V1` occurred, if current Puppeteer event timing allows it; if console capture attaches too late, reload and prove it after listener setup;
5. locate the MV3 service-worker target and prove it is associated with the extension;
6. evaluate a harmless value in the worker if supported, or capture its startup log through an appropriate target/session mechanism.

The visible marker + dataset assertion are mandatory. Service-worker existence is mandatory. Exact SW console capture is desirable but may be separately marked unsupported if target inspection proves the worker exists.

### E4 content-script realm inspection

If Puppeteer 25.4.0 exposes `page.extensionRealms()`, inspect the realm belonging to the synthetic extension and prove the extension ID matches the installed extension.

Record PASS/NOT_AVAILABLE separately. Do not fail the whole browser qualification solely if this optional newer inspection API is unavailable in the actual runtime, provided content-script execution is independently proven.

---

## Phase F — browser profile persistence proof

This phase determines whether we can later keep a dedicated QA login profile without asking the operator to sign in every test cycle.

Do not use any real account.

While V1 browser is running:

1. On localhost set:
   - cookie marker `codex_qa_cookie=persist_v1`;
   - localStorage key `codex_qa_storage` = `persist_v1`.
2. Verify both values.
3. Close the browser cleanly.
4. Relaunch with the exact same persistent `userDataDir` and same extension directory.
5. Return to localhost.
6. Assert both cookie and localStorage marker persisted.

Record:

`PERSISTENT_QA_PROFILE = PASS|FAIL`

This does not prove third-party account sessions, but it does prove the browser profile itself persists state across controlled relaunches.

---

## Phase G — source V2 + automated relaunch

This is the critical test.

Close the browser before modifying source.

Edit only the disposable synthetic extension in the same fixed directory.

Change:

- dataset `v1` -> `v2`;
- visible marker `CODEX_PUPPETEER_MV3_V1` -> `CODEX_PUPPETEER_MV3_V2`;
- content log `CODEX_PUPPETEER_CONTENT_V1` -> `CODEX_PUPPETEER_CONTENT_V2`;
- worker log `CODEX_PUPPETEER_SW_V1` -> `CODEX_PUPPETEER_SW_V2`.

Run `node --check` again and record V2 SHA-256 hashes.

Then run the QA browser again using:

- the SAME extension source directory;
- the SAME persistent QA browser profile;
- no ZIP;
- no `chrome://extensions` UI;
- no operator action;
- no manual installation.

Assert from the new browser run:

1. `CODEX_PUPPETEER_MV3_V1` is absent;
2. `CODEX_PUPPETEER_MV3_V2` is visible;
3. dataset is exactly `v2`;
4. V2 content log occurs;
5. MV3 service worker exists for the extension;
6. if extension ID was recorded in V1, record whether the ID remains the same in V2;
7. persistent cookie/localStorage markers from Phase F still exist unless the test intentionally cleared them.

Critical status:

`FIXED_PATH_SOURCE_CHANGE_RELAUNCH = PASS|FAIL`

PASS means future development steps can be tested with no operator ZIP download/reinstall: Codex updates a fixed unpacked source tree and relaunches the dedicated automation browser.

---

## Phase H — multi-tab and browser observation

Using the Puppeteer-driven Chrome for Testing instance:

1. Open at least two localhost tabs.
2. Confirm the script can distinguish and switch/control them independently.
3. Record URLs/titles.
4. Confirm browser page console capture works independently per page.
5. If practical, record network requests for the localhost document through Puppeteer/CDP.

Statuses:

- `PUPPETEER_MULTITAB = PASS|FAIL`
- `PUPPETEER_CONSOLE_CAPTURE = PASS|FAIL`
- `PUPPETEER_NETWORK_OBSERVATION = PASS|FAIL`

Do not claim this proves ChatGPT/Alice conversation identity. It only qualifies the browser harness.

---

## Phase I — cleanup

1. Stop localhost server.
2. Close Chrome for Testing cleanly.
3. Keep harness, local npm project, browser profile, and synthetic extension for reproducibility.
4. Do not add them to Git.
5. Do not modify Ozon Bridge production files.

---

## Phase J — report

Create:

`D:\codex\Test\blood_sand\tooling\llm-api-bridges\ozon-seller\validation\reports\CODEX_PUPPETEER_EXTENSION_QA_QUALIFICATION_REPORT_2026-08-17.md`

Report must include:

### Identity

- date/time/timezone;
- Windows version;
- Node/npm versions;
- Puppeteer exact version;
- Chrome for Testing exact version;
- browser executable path;
- repository branch and exact canonical HEAD used;
- production tree clean before/after.

### Capability matrix

Exact statuses:

- `PUPPETEER_LOCAL_INSTALL`
- `CHROME_FOR_TESTING_LAUNCH`
- `UNPACKED_EXTENSION_AUTOMATED_LOAD`
- `MV3_CONTENT_SCRIPT_V1`
- `MV3_SERVICE_WORKER_TARGET`
- `EXTENSION_REALM_INSPECTION`
- `PERSISTENT_QA_PROFILE`
- `FIXED_PATH_SOURCE_CHANGE_RELAUNCH`
- `MV3_CONTENT_SCRIPT_V2`
- `EXTENSION_ID_STABILITY`
- `PUPPETEER_MULTITAB`
- `PUPPETEER_CONSOLE_CAPTURE`
- `PUPPETEER_NETWORK_OBSERVATION`
- `GITHUB_PUSH_AUTHENTICATION`

### Evidence

Include concise non-secret evidence:

- V1/V2 file hashes;
- browser version;
- extension ID(s);
- exact visible marker assertions;
- exact dataset assertions;
- service-worker target URL/type with no secrets;
- console markers;
- persistence markers;
- commands and relevant outputs;
- no cookies beyond the synthetic localhost marker value;
- no private browser/account data.

### Key question

Answer exactly one:

- `YES_AUTOMATED_BY_TEST_BROWSER_RELAUNCH`
- `PARTIAL_AUTOMATION`
- `NO_EXTENSION_AUTOMATION`
- `INCONCLUSIVE`

Question:

> Can Codex test each new extension source revision from a fixed unpacked directory in an actual Chrome testing browser, including content scripts and MV3 service worker behavior, without the operator downloading or reinstalling a ZIP?

### Product-development implication

State clearly which workflow is justified:

A. `AUTOMATED_DEV_LOOP_AVAILABLE` — use Puppeteer/Chrome for Testing after each development step, with operator manual real-Chrome acceptance only at larger release gates;

B. `AUTOMATED_DEV_LOOP_PARTIAL` — list exact remaining manual action;

C. `AUTOMATED_DEV_LOOP_UNAVAILABLE`.

Do not claim Chrome for Testing replaces final acceptance in the operator's ordinary browser. It is the automated development/QA browser.

### Verdict

Use exactly one:

- `PUPPETEER_EXTENSION_QA_QUALIFIED`
- `PUPPETEER_EXTENSION_QA_PARTIALLY_QUALIFIED`
- `PUPPETEER_EXTENSION_QA_NOT_QUALIFIED`

---

## Phase K — publish validation report

If GitHub push authentication remains available:

1. Start from the exact canonical HEAD tested.
2. Create branch:

`validation/codex-puppeteer-extension-qa-2026-08-17`

3. Commit only:

`tooling/llm-api-bridges/ozon-seller/validation/reports/CODEX_PUPPETEER_EXTENSION_QA_QUALIFICATION_REPORT_2026-08-17.md`

4. Confirm with `git diff --cached --name-only` that only that report is staged.
5. Commit message:

`test: qualify Puppeteer extension QA harness`

6. Push validation branch.
7. Do not merge.
8. Do not modify canonical branch.

If push auth is unavailable, leave the report locally and mark `GITHUB_PUSH_NOT_CONFIGURED` without requesting secrets in chat.

---

# Fail-closed rules

- A browser process must actually launch for browser PASS.
- A plain web page PASS does not prove extension load.
- Extension inventory alone does not prove content script execution.
- V1 execution does not prove source-update automation.
- V2 is valid only after source was changed in the same fixed directory and browser was relaunched automatically with no ZIP/manual install.
- Do not count old cached DOM from V1 as V2 evidence; open/reload a real page and assert exact markers.
- Do not expose account/private data.
- Do not use real Ozon/AI logins in this qualification.
- Do not modify production source.

# Final operator response

Return exactly this compact structure after report publication:

`CODEX_PUPPETEER_EXTENSION_QA_RESULT`

- tested_head: `<sha>`
- puppeteer: `<version>`
- chrome_for_testing: `<version>`
- extension_load: `PASS|FAIL`
- v1_content: `PASS|FAIL`
- mv3_service_worker: `PASS|FAIL|PARTIAL`
- persistent_profile: `PASS|FAIL`
- fixed_path_v2_relaunch: `PASS|FAIL`
- multitabs: `PASS|FAIL`
- console: `PASS|FAIL`
- network: `PASS|FAIL`
- key_question: `YES_AUTOMATED_BY_TEST_BROWSER_RELAUNCH|PARTIAL_AUTOMATION|NO_EXTENSION_AUTOMATION|INCONCLUSIVE`
- development_implication: `AUTOMATED_DEV_LOOP_AVAILABLE|AUTOMATED_DEV_LOOP_PARTIAL|AUTOMATED_DEV_LOOP_UNAVAILABLE`
- report_branch: `<branch or NONE>`
- report_commit: `<sha or NONE>`
- report_url: `<url or NONE>`
- verdict: `PUPPETEER_EXTENSION_QA_QUALIFIED|PUPPETEER_EXTENSION_QA_PARTIALLY_QUALIFIED|PUPPETEER_EXTENSION_QA_NOT_QUALIFIED`

Then STOP and wait for review. Do not start Ozon Bridge implementation.