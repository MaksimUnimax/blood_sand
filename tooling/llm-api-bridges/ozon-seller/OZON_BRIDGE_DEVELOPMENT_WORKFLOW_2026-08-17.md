# Ozon Bridge — incremental development and Codex validation workflow

Status: active project workflow.  
Scope: `tooling/llm-api-bridges/ozon-seller/`

## Purpose

Development is performed in coherent stages with independent Codex validation available after each completed stage.

The working loop is:

`understand baseline -> implement one coherent stage -> run targeted engineering tests -> run independent Codex validation for that stage -> fix and revalidate if needed -> continue to the next stage`

## Roles

1. **ChatGPT engineering/review** — architecture, implementation, targeted testing, documentation, Git work, analysis of Codex evidence, fixes and preparation of the next coherent stage.
2. **Codex Windows QA** — independent validation of completed development stages using the available Windows/Puppeteer/Chrome for Testing environment. Codex may be invoked repeatedly across development milestones and may be rerun after a production, harness, fixture or environment correction.
3. **Operator** — receives installable builds when the current development objective has sufficient engineering and independent validation. Operator-only live/profile facts remain operator tests.

## Source of truth

Live GitHub repository is the source of truth:

`MaksimUnimax/blood_sand`

- `reference-*` directories remain immutable version/evidence snapshots.
- Development work is performed on dedicated `dev/...` branches.
- Test evidence must identify the exact code it exercised.
- Do not treat a report against one SHA as evidence for later production changes.

## Incremental development workflow

### 1. Reconstruct the exact baseline

Before changing production:

- read the live GitHub authority;
- identify the exact candidate being changed;
- identify the defect/feature and direct dependencies;
- note protected behavior that must remain unchanged.

### 2. Define one coherent change

State the intended behavior and what must remain unchanged. Prefer a bounded correction over unrelated refactoring. When practical, reproduce a bug before changing production.

### 3. Implement the stage

Make the smallest coherent production change required for the current stage. Keep ownership, lifecycle, quota/cache, provider and delivery semantics inside their existing authorities unless the feature explicitly requires an architectural change.

### 4. Run targeted engineering tests

Run the tests appropriate to the changed path, including as applicable:

- JavaScript syntax checks;
- worker/state-machine tests;
- contract and planner tests;
- quota/cache tests;
- owner/isolation tests;
- browser/Puppeteer tests;
- composer/delivery/recovery tests;
- security and provider-boundary assertions.

A bug fix should have RED/GREEN evidence when practical.

### 5. Run independent Codex validation for the completed stage

After a coherent development stage is ready, Codex may independently validate that stage before further development continues.

A Codex task should:

- identify the exact candidate/SHA or exact reconstructed candidate under test;
- state the behavior being validated and the regressions relevant to that stage;
- use existing QA tools where useful;
- block or mock provider traffic for synthetic tests;
- avoid real Seller/Performance credentials unless the operator explicitly authorizes a live test;
- record concrete PASS/FAIL/BLOCKED evidence.

### 5a. Mandatory Codex prompt preparation rules

Before sending any Codex validation or rerun prompt, ChatGPT engineering/review must prepare an executable validation route rather than merely describe the desired result.

The following rules are mandatory:

1. **Verify the already-working route before writing the prompt.** Search the live GitHub history and current project evidence for the latest relevant successful validation path. Identify and verify the exact target SHA/candidate, commands, launcher, harness, dependencies, environment assumptions and previous PASS evidence. Do not make Codex rediscover or redesign infrastructure that has already been proven to work.

2. **Limit the prompt to the current milestone and its direct dependencies.** Do not import unrelated historical fixtures, gates, quota scenarios, browser experiments or validation layers merely because they exist. A completed stage should be validated by the smallest independent route that proves that stage and its relevant regressions.

3. **If no proven route exists, resolve the validation infrastructure first.** ChatGPT engineering/review must investigate the environment and repository evidence until there is a concrete executable route, or until a genuine external boundary is identified. Do not hand Codex an underspecified infrastructure problem and call it a validation prompt.

4. **Do not automatically issue another prompt after `BLOCKED` or `HARNESS_ERROR`.** First inspect the exact blocker, determine whether it is production, harness, fixture or environment related, and search existing project history for an already-known solution. Only then prepare a corrected rerun for the same stage when appropriate.

5. **Pre-authorize foreseeable validation-owned test operations narrowly.** Before sending the prompt, identify safe local operations that the proven route may require and that Codex could otherwise stop to request authorization for. Include explicit authorization in the original prompt when appropriate, including:
   - create, edit and delete temporary validation harness/fixture files outside production;
   - restart the accepted test launcher;
   - clean stale validation-owned QA session state;
   - terminate a validation-owned Chrome for Testing process tree when required for a clean rerun.

6. **Process termination authorization must be ownership-scoped, never executable-scoped.** If cleanup is required, Codex may identify the root process created by the current validation session, record that root PID, and terminate only that root process and its descendants. It must not kill processes merely because they share the same `chrome.exe`/CFT executable path, and must not touch unrelated QA sessions, operator/user browsers or other process trees.

7. **Do not require a second authorization for a foreseeable validation-owned cleanup action.** If the exact PID is not known before the run, the prompt should authorize Codex to determine the validation-owned root PID from the current launcher/session evidence and, if necessary, terminate only that owned process tree before rerunning the same accepted launcher.

8. **Permit repair of the test layer, not silent repair of production.** Codex may correct temporary local harness, fixture, module-resolution, synthetic-page, browser-connection or timing problems needed to reach the product assertions, provided those changes are not committed as production. A product failure may be declared only when an actual product assertion executes and fails. Production must not be modified during independent validation unless a later engineering stage explicitly begins after the failure has been analyzed.

9. **Validate the prompt itself as an executable command.** Before sending it, verify that it unambiguously states the target, branch/report destination when relevant, exact launcher/harness or proven route, permitted temporary operations, required authorization boundaries, prohibited actions, PASS/FAIL/BLOCKED classification and required output. A logically plausible prompt is not sufficient if its execution path has not been checked against known project evidence.

10. **Preserve the lifecycle of a proven PASS route.** If the relevant successful evidence used one fresh browser session, one runtime extension installation and one connected harness, a rerun must keep that lifecycle unless the milestone itself explicitly requires a different lifecycle. Do not add reinstall, unload/reinstall, repeated MV3 target reacquisition, alternate CDP service-worker control, custom browser spawning or another launcher merely to continue a test matrix.

11. **Carry forward exact-target PASS evidence and rerun only missing evidence when safe.** If an earlier rerun already executed and passed product assertions against the same exact candidate and production has not changed, preserve those PASS results in the same report. A later rerun should focus on the still-unproven assertions instead of replaying already-proven cases and re-exposing unrelated environment failure modes. The final stage verdict may aggregate exact-target evidence across reruns when the report clearly records provenance and no intervening production change invalidates it.

12. **Do not let a later unrelated harness timeout erase earlier product PASS assertions.** Record independent assertions as soon as they are reached. If cancellation, cleanup, late-commit rejection, owner isolation or another assertion has already executed successfully, preserve that result even if a later step in the same physical harness times out. Do not bundle unrelated assertions behind one final marker when doing so can convert proven PASS evidence into `BLOCKED`.

13. **Run non-browser validation independently before browser work when it does not require CFT.** Focused worker/state validation must not be left unfinished merely because a later browser harness is unstable. Complete deterministic worker/state checks first, persist their evidence, then use browser sessions only for assertions that genuinely require browser behavior.

### 5b. Composer-wait validation incident — mandatory lessons for future Codex testing

This section records the 2026-08-20 Manual delivery composer-wait validation incident as a permanent process case study. Its purpose is not historical blame; it defines concrete anti-regression rules for how future Codex test prompts must be prepared and executed.

Authoritative production target for the incident:

`14829f418068e40d76c5d992ff9158c4faebbbd0`

Validation branch:

`validation/ozon-manual-delivery-composer-wait-2026-08-20`

Validation report:

`validation/reports/OZON_MANUAL_DELIVERY_COMPOSER_WAIT_VALIDATION_2026-08-20.md`

Final accepted report commit:

`3c779f20520a8c2e1dca4a7af5cb65b031d85324`

Final verdict:

`COMPOSER_WAIT_STAGE_ACCEPTED`

#### What was done incorrectly

1. **The first Codex prompt described the desired validation more than it specified the already-proven executable route.** A previously accepted Windows/Puppeteer launcher already existed, but the prompt left enough freedom for Codex to attempt manual Chrome spawning, alternate launch modes and ad-hoc service-worker discovery. That created environment blockers before the intended product assertions.

2. **An unrelated historical V3 quota/countdown worker fixture was included as if it were a mandatory completion condition for composer-wait.** That fixture timed out in guarded-due quota timing even though no composer-wait product assertion had failed. Historical tests must not be promoted into a current milestone gate merely because they are available.

3. **The browser lifecycle was allowed to drift away from the previously accepted PASS lifecycle.** The known-good route was one fresh CFT session, one Puppeteer connection and one `browser.installExtension()` call. Later reruns attempted reinstall/reacquire behavior and MV3 target manipulation inside the same session. This introduced stale-target races unrelated to the product.

4. **Foreseeable validation-owned process cleanup was not authorized in the original prompt.** Codex stopped to request permission to terminate a stale validation-owned CFT process tree. Future prompts must pre-authorize narrowly scoped cleanup of the current validation-owned root process and descendants when the accepted route can require a clean restart.

5. **Already-proven exact-target PASS evidence was replayed unnecessarily.** Repeating browser cases that had already passed against unchanged production exposed the run to new infrastructure failures without adding product evidence.

6. **Independent assertions were bundled behind later harness steps.** Manual OFF cancellation, visual cleanup and late-clear protection had actually executed successfully, but a later separate Manual ON fixture timeout prevented those successes from being retained as complete markers. A later harness timeout must never erase an earlier product PASS.

7. **Focused worker/state validation was initially left unfinished because browser work blocked.** The worker/state checks did not require CFT and therefore should have been completed independently before browser testing began.

8. **`BLOCKED` was initially treated too much like a reason to immediately generate another prompt.** The correct response to `BLOCKED` is first to inspect the report, classify the blocker, find the last proven route and identify exactly what evidence is still missing.

#### What was done correctly and must be preserved

1. **The exact production target was frozen and preserved.** All validation reruns referred back to `14829f418068e40d76c5d992ff9158c4faebbbd0`; production modifications stayed at zero during independent validation.

2. **Candidate integrity was verified by exact hashes before product assertions.** The frozen ZIP, combined patch and repaired `service_worker.js` / `content_script.js` hashes were checked, so later PASS evidence could be tied to a known exact candidate.

3. **The canonical targeted composer-wait regression was rerun and passed.** This provided a stable engineering baseline before independent browser completion work.

4. **The historical accepted launcher was eventually recovered and reused unchanged:**

`D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`

The successful lifecycle authority was:

`fresh CFT -> dynamic DevTools endpoint -> Puppeteer connect -> browser.installExtension() once -> browser assertions`

5. **Provider traffic remained mocked/blocked.** Final validation preserved:

`REAL_OZON_REQUESTS = 0`

`REAL_PERFORMANCE_REQUESTS = 0`

`OPERATOR_BROWSER_ACTIONS = 0`

`production_modifications = 0`

6. **Actual product assertions were distinguished from harness failures.** Browser-environment failures were correctly classified as `BLOCKED`, not as product `FAIL`, until actual product assertions executed.

7. **Exact-target PASS evidence was eventually carried forward across reruns.** Once production remained unchanged, successful assertions such as occupied-composer preservation, persistent wait plate, insert-once, missing-composer recovery and reload restoration were retained instead of being discarded.

8. **The final completion was narrowed to genuinely missing evidence.** The last successful run independently completed only the focused worker/state matrix and wrong-owner/two-owner browser isolation instead of rerunning the entire browser suite.

9. **The final two-owner browser run reused the accepted lifecycle exactly.** It used one fresh validation-owned CFT root, one Puppeteer connection, one extension installation and two synthetic ChatGPT tabs; there was no service-worker target reacquisition, reinstall or alternate Chrome launch route.

#### Correct Codex testing procedure derived from this incident

For every future stage, use the following order unless the stage itself requires something different:

1. **Freeze and name the exact production target.** Record commit SHA or deterministic reconstructed candidate hashes before independent validation starts.

2. **Inventory existing evidence before writing the prompt.** Search GitHub and current reports for:
   - relevant targeted PASS tests;
   - last accepted launcher/harness;
   - exact successful commands and environment versions;
   - already-proven product assertions on the same target;
   - known harness/environment failure modes and their resolved route.

3. **Build an evidence matrix with three buckets:**
   - already proven on this exact target;
   - still missing and deterministic/non-browser;
   - still missing and browser/live dependent.

4. **Run deterministic non-browser checks first.** Worker/state, quota/cache, ownership, contract and message-authority checks that do not require CFT must complete before browser work. Emit and persist independent markers immediately.

5. **Use the smallest browser matrix that proves only the remaining browser behavior.** Do not rerun the entire historical suite when exact-target evidence already covers part of it.

6. **Reuse the last accepted browser lifecycle without modification.** For the current Windows extension QA authority, the default proven pattern is:

`fresh validation-owned CFT -> one Puppeteer connection -> one browser.installExtension() -> complete bounded browser matrix -> terminate only that validation-owned process tree`

Do not introduce a second install, extension reinstall, MV3 target reacquire loop, `Target.attachToTarget`, `ServiceWorker.enable`, `ServiceWorker.startWorker`, `/json/new`, native Puppeteer launch or custom Chrome spawn unless the current milestone specifically requires it and that route has first been independently proven.

7. **Pre-authorize validation-owned cleanup before execution.** The prompt must authorize Codex to identify the root PID created by the current validation launcher and terminate only that PID plus descendants if the session becomes stale/contaminated. Never authorize kill-by-executable-path.

8. **Allow temporary test-layer repair.** Codex may fix local temporary fixture state, module resolution, synthetic DOM, page persistence, browser connection glue and timing needed to reach assertions. These files remain outside production and are not committed.

9. **Emit assertions atomically.** Each independent product behavior should receive its own PASS marker immediately after it succeeds. A later timeout cannot revoke it. Avoid a single final marker that hides which assertions actually executed.

10. **Classify failures precisely:**
    - `PASS` = actual required assertion executed and succeeded;
    - `FAIL` = actual product assertion executed and failed;
    - `BLOCKED` = required product assertion could not be reached after bounded correction of temporary test/environment issues.

11. **After `BLOCKED`, do analysis before another prompt.** Read the exact report, compare it to the target, determine what already passed, identify the actual blocker and search the history for the proven solution. The next prompt must contain only the corrected route and remaining evidence.

12. **Aggregate exact-target evidence across reruns when production is unchanged.** A validation stage does not need every PASS in one physical browser session. It needs complete trustworthy evidence against the same production target with clear provenance.

13. **Do not reopen already accepted historical milestones without a concrete dependency reason.** Composer-wait validation did not require restarting Step 1–Step 4 or reintroducing retired full-gate infrastructure. Validate the current stage and its direct regressions only.

#### Pre-send checklist for a Codex test prompt

Before a future Codex prompt is sent, ChatGPT engineering/review must be able to answer `yes` to all of these:

- Is the exact target SHA/candidate fixed?
- Are the relevant existing PASS results known?
- Is the last known-good launcher/harness identified by exact path/command?
- Is the intended browser lifecycle identical to the known-good lifecycle unless there is a proven reason to change it?
- Have unrelated historical fixtures been excluded?
- Are non-browser checks separated from browser checks?
- Does the prompt authorize foreseeable validation-owned cleanup narrowly?
- Can Codex repair temporary test infrastructure without touching production?
- Are already-proven exact-target assertions explicitly carried forward?
- Are only genuinely missing assertions scheduled for rerun?
- Will each assertion be recorded independently as soon as it passes?
- Are `PASS`, `FAIL` and `BLOCKED` defined by product evidence rather than harness inconvenience?
- Does the report destination and exact output format already exist in the prompt?
- If this prompt fails with a harness error, is there enough information to diagnose it without inventing a new QA route?

If any answer is `no`, the Codex prompt is not ready to send.

### 6. Handle failures and continue the same stage

If Codex finds a production defect:

- analyze it;
- fix the production path;
- rerun the relevant targeted tests;
- rerun independent Codex validation for the affected stage.

If Codex finds a harness, fixture or environment defect:

- fix that test/environment problem without changing production merely to satisfy the harness;
- rerun the affected validation.

Intermediate reruns are allowed and are part of normal milestone development.

### 7. Continue to the next stage

Once the current stage has adequate engineering and independent evidence, continue development. Each later coherent milestone can receive its own Codex validation.

## Packaging and operator handoff

When an installable build is ready:

1. identify the exact production tree intended for packaging;
2. ensure the latest relevant engineering and independent validations cover that tree;
3. package only production files;
4. verify the package contents and hashes against the intended candidate;
5. hand the package to the operator for live/profile-dependent acceptance.

## Operator/live boundary

Synthetic QA does not prove facts that require the operator's real browser/profile or real credentials. Logged-in ChatGPT/Alice behavior and controlled real-provider acceptance remain operator/live checks when needed.

## Standing implementation invariants

Unless a later reviewed feature explicitly changes them, preserve:

- native Copy structurally anchors the correct code block/conversation surface;
- one extension-owned top-level Shadow DOM overlay;
- fail-closed conversation/binding ownership;
- fixed provider hosts and operation registries;
- no assistant-supplied arbitrary URL/host/method/headers/auth;
- credentials isolated from page/content output;
- read-only Ozon operation surface unless mutations are explicitly designed later;
- no hidden provider retry/pagination/fan-out/report polling;
- ChatGPT/Alice ownership isolation;
- independent conversation/tab ownership;
- provider quota/cache state is not reset by unrelated UI/delivery cleanup;
- delivery recovery does not replay provider work.
