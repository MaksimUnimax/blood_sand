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
