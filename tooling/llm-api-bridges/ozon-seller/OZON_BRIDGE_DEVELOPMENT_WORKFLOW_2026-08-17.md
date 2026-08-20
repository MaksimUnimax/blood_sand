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
