# Codex Puppeteer final QA harness acceptance — 2026-08-17

Repository: `MaksimUnimax/blood_sand`
Canonical working branch: `work/ozon-data-collection-2026-08-11`
Canonical HEAD before this document: `52371a8432939928185b0950d52f5f0aa852c392`
Prior Puppeteer qualification report branch: `validation/codex-puppeteer-extension-qa-2026-08-17`
Prior report commit: `2fa748ed6ec5b4d18c360570111dbe25a5f54da5`
Local Windows workspace root: `D:\codex\Test`
Status: **final QA harness acceptance only; do not modify Ozon Bridge production code**.

## Purpose

Close the two remaining uncertainties from the first Puppeteer qualification without creating another open-ended setup cycle:

1. replace the flawed session-cookie persistence check with a real persistent cookie (`Max-Age`/`Expires`);
2. turn the already-proven automated `Start-Process Chrome for Testing -> puppeteer.connect()` workaround into a reusable launcher and prove it succeeds repeatedly across three consecutive source revisions.

The prior qualification already proved automated unpacked-extension loading, MV3 content scripts, service-worker target inspection, extension realms, fixed-path V1→V2 relaunch, stable extension ID, multitabs, console and network observation without ZIP installation or operator browser actions. This final acceptance does not re-open existing-Chrome integration work.

The QA harness is accepted for development if the fixed-path automated browser-extension loop is stable for three consecutive revisions with zero operator intervention. Persistent-cookie failure alone does not invalidate the core development loop; it only blocks treating the test profile as proven for long-lived authenticated web sessions.

---

# FULL STANDALONE PROMPT FOR CODEX

You are performing the FINAL acceptance of the Windows Puppeteer / Chrome for Testing QA harness for the Ozon Bridge browser-extension project.

This is a VALIDATION / ENVIRONMENT task.

DO NOT begin Ozon Bridge implementation.
DO NOT modify Ozon Bridge production code.
DO NOT modify immutable `reference-*` evidence.
DO NOT use real Ozon credentials.
DO NOT call Ozon APIs.
DO NOT log into real ChatGPT, Alice, Yandex, Ozon or other accounts in this task.

## Fixed environment

Workspace root:

`D:\codex\Test`

Repository checkout:

`D:\codex\Test\blood_sand`

Repository:

`MaksimUnimax/blood_sand`

Canonical branch:

`work/ozon-data-collection-2026-08-11`

Canonical HEAD before this final-plan document was created:

`52371a8432939928185b0950d52f5f0aa852c392`

Prior Puppeteer qualification:

- report branch: `validation/codex-puppeteer-extension-qa-2026-08-17`
- report commit: `2fa748ed6ec5b4d18c360570111dbe25a5f54da5`
- Puppeteer: `25.4.0`
- Chrome for Testing: `152.0.7977.42`
- Chrome executable observed: `C:\Users\unyma\.cache\puppeteer\chrome\win64-152.0.7977.42\chrome-win64\chrome.exe`
- automated unpacked extension load: PASS
- V1 content script: PASS
- MV3 service-worker target: PASS
- extension realm: PASS
- fixed-path V1→V2 automated relaunch: PASS
- same extension ID V1/V2: `jedjofmmofghjnpnaadkkogifhkeaefn`
- multitabs: PASS
- console capture: PASS
- network observation: PASS
- direct `puppeteer.launch()` failed due Windows Crashpad startup;
- fully automated workaround succeeded using local `Start-Process` followed by `puppeteer.connect()`;
- localStorage persistence passed;
- prior cookie persistence test failed because the cookie was created as a session cookie without `Max-Age` or `Expires`, so that old test is not valid evidence against persistent profile storage.

Previously measured tools:

- PowerShell 7.6.4
- Git 2.40.1.windows.1
- Node v24.12.0
- npm 11.6.2

## Hard scope / safety rules

1. Do not modify any Ozon Bridge production source.
2. Do not modify existing `reference-*` directories.
3. Do not call `api-seller.ozon.ru` or `api-performance.ozon.ru`.
4. Do not use or expose passwords, tokens, cookies from real sites, Client-Id, Api-Key, Authorization or Client Secret.
5. Do not use the operator's normal Chrome profile.
6. Do not install system-wide software or modify PATH.
7. Do not use WSL.
8. Do not use `git reset --hard`, `git clean`, destructive checkout, or force push.
9. Do not repair production code if anything unrelated is discovered.
10. Reuse or create QA files only below `D:\codex\Test\qa-harness\puppeteer-extension-qa`.
11. QA harness files must not be committed into the repository.
12. The only repository file you may add is the final validation report described below.
13. No human browser action is allowed during the automated acceptance runs. If a browser permission or UI action unexpectedly requires the operator, record a failure/manual boundary and stop the affected run; do not ask the operator to click through it for the purpose of claiming automation.
14. Do not retry a failed acceptance run indefinitely. Each of the three defined runs gets one normal execution. One immediate diagnostic rerun is allowed only if the first failure is clearly caused by a harness race and you document both attempts. Otherwise stop and report FAIL.

---

## Phase A — repository guard

In `D:\codex\Test\blood_sand` run:

`git fetch --all --prune`

`git status --short --branch`

`git rev-parse HEAD`

Record the exact canonical HEAD actually tested. If remote HEAD has advanced after the plan document was created, do not reset or guess; record the actual SHA and continue only if the working tree is clean and the changes are documentation/expected project changes that do not invalidate this environment test.

Before touching the QA harness, record:

`git status --short`

Production tree must be clean.

---

## Phase B — preserve the proven harness and create a reusable launcher

Harness root:

`D:\codex\Test\qa-harness\puppeteer-extension-qa`

Reuse Puppeteer 25.4.0 and the already downloaded Chrome for Testing 152.0.7977.42 if still available. Do not upgrade versions during this final acceptance unless the exact prior browser has disappeared; if a version change is unavoidable, record it and use one consistent version for all three runs.

Create or normalize one reusable launcher under the harness root, for example:

`launch-cft.ps1`

Its responsibility is to automate the already-proven route:

1. start Chrome for Testing headful with a dedicated QA profile;
2. enable remote debugging on a loopback-only port;
3. ensure the unpacked MV3 extension is loaded from the fixed source directory;
4. wait deterministically for the DevTools endpoint to become available, with a finite timeout;
5. expose the browser endpoint to the Node/Puppeteer test process without printing secrets;
6. require zero human actions.

Use the same fixed extension source directory for all revisions:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\mv3-extension`

Use one dedicated profile directory for all three runs:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\browser-profile-final`

Do not use the user's normal Chrome profile.

Create/normalize one Node acceptance runner, for example:

`run-final-acceptance.mjs`

It must connect through Puppeteer to the browser started by the launcher and assert the expected revision marker, extension inventory/ID, MV3 service-worker target, content marker/dataset, console marker, network document observation, and two-tab control.

Do not use fake DOM or a non-Chrome browser.

---

## Phase C — persistent profile test corrected

Use only the localhost test site on loopback. Start a deterministic local Node HTTP server bound only to `127.0.0.1` on a free fixed test port. Reuse port 8766 if available.

Before the first browser shutdown, set:

`localStorage.setItem("codex_qa_storage_final", "persist_final")`

Set a genuinely persistent cookie, not a session cookie. Use either browser/CDP cookie APIs or JavaScript with attributes equivalent to:

`codex_qa_cookie_final=persist_final; Max-Age=86400; Path=/; SameSite=Lax`

Verify during run 1 that both values are present.

After closing run 1 cleanly and relaunching with the exact same `browser-profile-final`, verify during run 2 that:

- localStorage value is still `persist_final`;
- persistent cookie value is still `persist_final`.

Verify again during run 3.

Statuses:

- `PERSISTENT_LOCALSTORAGE = PASS|FAIL`
- `PERSISTENT_COOKIE = PASS|FAIL`
- `PERSISTENT_QA_PROFILE = PASS` only if both survive through runs 2 and 3.

If the cookie still fails, capture only non-secret localhost evidence and do not attempt endless browser-profile fixes. The development-loop acceptance can still succeed with an explicit authenticated-session persistence limitation.

---

## Phase D — three consecutive automated source revisions

The browser must be cleanly closed between runs. No ZIP, `chrome://extensions`, Load unpacked UI, Reload UI, or operator clicks are allowed.

Use the SAME:

- extension source directory;
- browser profile directory;
- reusable launcher;
- Puppeteer runner.

### Revision R1

Set extension content behavior to exact markers:

- visible marker: `CODEX_FINAL_QA_R1`
- dataset: `document.documentElement.dataset.codexFinalQa = "r1"`
- content console: `CODEX_FINAL_CONTENT_R1`
- service-worker marker/log/source revision constant: `CODEX_FINAL_SW_R1`

Run `node --check` on extension JS files.

Record SHA-256 of manifest/content/service-worker files.

Launch via the reusable automated launcher and connect with Puppeteer.

Assert:

- actual Chrome for Testing process/browser version;
- extension appears in extension inventory;
- extension ID;
- MV3 service-worker target exists for that ID;
- localhost base marker exists;
- `CODEX_FINAL_QA_R1` is visible;
- dataset equals `r1`;
- content console marker `CODEX_FINAL_CONTENT_R1` is observed;
- document network request is observed;
- two separate tabs can each independently expose the R1 marker/dataset.

Then set the persistent storage/cookie values from Phase C.

Close browser cleanly.

Result: `R1_AUTOMATED_RUN = PASS|FAIL`.

### Revision R2

Edit only the fixed extension source directory. Change exact markers to:

- visible marker: `CODEX_FINAL_QA_R2`
- dataset: `r2`
- content console: `CODEX_FINAL_CONTENT_R2`
- service-worker revision marker/log: `CODEX_FINAL_SW_R2`

Run syntax checks and record new SHA-256 hashes.

Do NOT reinstall or use a different extension directory.

Launch again using the same reusable launcher and same profile.

Assert:

- R1 visible marker is absent;
- R2 visible marker is present;
- dataset equals `r2`;
- R2 content console marker is observed;
- service-worker target exists;
- extension ID equals the R1 extension ID;
- persistent localStorage from R1 is present;
- persistent cookie from R1 is present, or record cookie FAIL without hiding it;
- two-tab and network assertions still pass.

Close browser cleanly.

Result: `R2_AUTOMATED_RUN = PASS|FAIL`.

### Revision R3

Repeat once more in the SAME extension source directory with exact markers:

- visible marker: `CODEX_FINAL_QA_R3`
- dataset: `r3`
- content console: `CODEX_FINAL_CONTENT_R3`
- service-worker revision marker/log: `CODEX_FINAL_SW_R3`

Run syntax checks and record hashes.

Launch through the same reusable launcher and same profile.

Assert:

- R1 and R2 visible markers are absent;
- R3 visible marker is present;
- dataset equals `r3`;
- R3 content console marker is observed;
- service-worker target exists;
- extension ID equals R1 and R2 extension IDs;
- localStorage persistence survives;
- persistent cookie survives, or record cookie FAIL;
- multitabs and network observation pass.

Close browser cleanly.

Result: `R3_AUTOMATED_RUN = PASS|FAIL`.

---

## Phase E — stability verdict

Core automated-development-loop acceptance requires ALL of:

- R1 automated run PASS;
- R2 automated run PASS;
- R3 automated run PASS;
- zero operator browser actions during all three runs;
- same fixed extension source directory across R1/R2/R3;
- same extension ID across R1/R2/R3;
- each newer revision visibly/structurally replaces the prior revision;
- MV3 service-worker target proven on all three runs;
- content script proven on all three runs;
- console capture proven;
- network observation proven;
- multitabs proven;
- production repository unchanged except final report.

Persistent-cookie status is tracked separately:

- if persistent cookie + localStorage both pass: authenticated-session persistence capability is `PROVISIONALLY_SUPPORTED_FOR_LOCALHOST_PROFILE_STORAGE`;
- if localStorage passes but persistent cookie fails: capability is `AUTH_SESSION_PERSISTENCE_NOT_PROVEN`; do not block the core automated extension-development loop solely for this reason.

Use exactly one core verdict:

- `QA_HARNESS_ACCEPTED_FOR_DEV`
- `QA_HARNESS_REJECTED_FOR_DEV`

Use exactly one session-persistence verdict:

- `PROFILE_PERSISTENCE_ACCEPTED`
- `PROFILE_PERSISTENCE_LIMITED`

Do not create another setup/test iteration automatically after this report. This task closes Step 0. Any remaining persistence limitation is documented and handled later only if real authenticated test sessions require it.

---

## Phase F — cleanup and repository guard

Stop the localhost server and all Chrome for Testing processes started by this harness.

Retain the harness directory for future development QA.

In the repository run:

`git status --short`

Verify no Ozon Bridge production file changed.

---

## Phase G — report

Create exactly:

`D:\codex\Test\blood_sand\tooling\llm-api-bridges\ozon-seller\validation\reports\CODEX_PUPPETEER_FINAL_QA_ACCEPTANCE_REPORT_2026-08-17.md`

Report must include:

### Identity

- date/time/timezone;
- Windows version;
- PowerShell/Git/Node/npm;
- Puppeteer exact version;
- Chrome for Testing exact version and executable path;
- repository branch and exact tested HEAD;
- production status before/after.

### Launcher

- launcher path;
- finite startup timeout;
- remote debugging bound to loopback;
- whether any operator browser action occurred;
- any Crashpad workaround details necessary for reproducibility.

### Three-run matrix

For R1, R2, R3 record:

- PASS/FAIL;
- source hashes;
- visible marker;
- dataset;
- content console marker;
- extension ID;
- MV3 service-worker target;
- multitabs;
- network observation;
- clean browser shutdown.

### Persistence

Record localStorage and persistent-cookie evidence separately for R1→R2 and R2→R3.

Do not include unrelated/private cookies.

### Final explicit answers

Answer exactly:

`ZERO_OPERATOR_EXTENSION_REINSTALL = YES|NO`

`THREE_CONSECUTIVE_AUTOMATED_REVISIONS = PASS|FAIL`

`EXTENSION_ID_STABLE = PASS|FAIL`

`PERSISTENT_LOCALSTORAGE = PASS|FAIL`

`PERSISTENT_COOKIE = PASS|FAIL`

`QA_HARNESS_CORE_VERDICT = QA_HARNESS_ACCEPTED_FOR_DEV|QA_HARNESS_REJECTED_FOR_DEV`

`PROFILE_PERSISTENCE_VERDICT = PROFILE_PERSISTENCE_ACCEPTED|PROFILE_PERSISTENCE_LIMITED`

### Development policy if accepted

If and only if `QA_HARNESS_CORE_VERDICT = QA_HARNESS_ACCEPTED_FOR_DEV`, record that future Ozon Bridge development may use this Codex/Puppeteer/Chrome for Testing harness after each major engineering step without requiring the operator to download/reinstall intermediate ZIPs. Real user Chrome and real-account acceptance remain separate release gates and are not implied by this harness acceptance.

---

## Phase H — publish the report

If GitHub authentication remains available, create a validation branch from the exact canonical HEAD tested:

`validation/codex-puppeteer-final-acceptance-2026-08-17`

Commit ONLY:

`tooling/llm-api-bridges/ozon-seller/validation/reports/CODEX_PUPPETEER_FINAL_QA_ACCEPTANCE_REPORT_2026-08-17.md`

Before commit verify:

`git diff --cached --name-only`

shows exactly that one report file.

Commit message:

`test: accept Codex Puppeteer QA harness`

Push the validation branch. Do not merge it and do not modify the canonical branch.

If GitHub push authentication is unavailable, leave the report locally, mark `GITHUB_PUSH_NOT_CONFIGURED`, and do not request a token in chat.

---

# Final response format

Return exactly this compact structure after the report is created/published:

```text
CODEX_PUPPETEER_FINAL_QA_ACCEPTANCE_RESULT

tested_head:
  <exact SHA>

puppeteer:
  <exact version>

chrome_for_testing:
  <exact version>

launcher:
  consecutive_runs: 3
  passed: <0..3>
  operator_browser_actions: <0 or count>

extension:
  r1: PASS|FAIL
  r2: PASS|FAIL
  r3: PASS|FAIL
  id_stable: PASS|FAIL
  content_scripts: PASS|FAIL
  mv3_service_worker: PASS|FAIL
  multitabs: PASS|FAIL
  console: PASS|FAIL
  network: PASS|FAIL

persistence:
  local_storage: PASS|FAIL
  persistent_cookie: PASS|FAIL

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
```

Then STOP.

Do not begin Ozon Bridge implementation. Wait for review.
