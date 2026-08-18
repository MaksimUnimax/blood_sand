# Ozon Bridge — development workflow with targeted engineering tests and final Codex handoff gate

Date adopted: 2026-08-17
Workflow correction adopted: 2026-08-18
Status: active project workflow
Scope: `tooling/llm-api-bridges/ozon-seller/`

## Purpose

This document fixes the working method for further Ozon Bridge development.

The central rule is now explicit:

- **while implementation is in progress, test the code being changed and the dependencies directly affected by that change;**
- **only immediately before an installable/testable build is handed to the operator, freeze the complete candidate and run the permanent project-wide full regression gate in one consolidated Codex execution.**

The permanent full-handoff gate is:

`OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

It is a living acceptance contract and must evolve with production functionality.

## Roles

The workflow separates three roles:

1. **ChatGPT engineering/review role** — architecture, implementation, targeted development testing, documentation, Git branch/commit management, freeze/package preparation, review of Codex evidence and the decision to accept/reject the pre-operator handoff candidate.
2. **Codex Windows QA role** — final independent execution of the exact full pre-operator handoff validation plan against one exact frozen implementation SHA using the accepted Windows/Puppeteer/Chrome for Testing harness. Codex does not repair production code during this gate.
3. **Operator role** — receives a build only after the full consolidated Codex gate passes and performs the real-profile/live acceptance gates that cannot be replaced by synthetic/dedicated QA browser testing.

Historical development steps that used independent Codex validation at intermediate milestones remain valid evidence of those milestones. Going forward, the standing development rule is targeted testing during implementation and one complete Codex regression gate immediately before operator handoff.

## Source of truth and branch roles

Live GitHub repository is the source of truth:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

The canonical release lineage and development candidates must never be conflated.

- `reference-*` directories are immutable version/evidence snapshots.
- The canonical GitHub release lineage currently reaches `reference-0.1.11/` unless later authority explicitly advances it.
- Operator/local candidates v0.1.12+ are not made canonical merely because they exist or are used as a development baseline.
- Major new work is done on a dedicated `dev/...` branch.
- Final independent validation must be pinned to an exact frozen candidate SHA, not a moving branch HEAD.
- Final validation branch must be report-only unless the gate explicitly authorizes otherwise.

## Development / repair workflow

Do not split one coherent architectural objective into dozens of tiny governance gates. Work in bounded, understandable changes.

### 1. Reconstruct and understand the exact baseline

Before changing production:

- read live GitHub authority;
- identify the exact baseline/frozen candidate being changed;
- record relevant production hashes/inventory;
- identify the specific defect/feature and its direct dependencies;
- identify protected surfaces that must not change.

Do not patch a shortened proxy when the exact production file/tree is available or reconstructable.

### 2. Define the narrow behavior change

Before implementation:

- state the exact desired behavior;
- state what must remain unchanged;
- define failure/cleanup/recovery semantics;
- define security/provider boundaries that the change can affect;
- when practical, create a targeted reproduction test that fails on the current defect.

Avoid broad reset helpers, duplicated state machines, unbounded polling loops, magic retry behavior and unrelated refactors merely to close a bounded defect.

### 3. Implement one coherent change

Implement only the planned behavior on the dedicated development branch.

Production changes must be the smallest coherent architecture correction, not a pile of special-case patches.

When a new state is necessary, integrate it into the existing owner/lifecycle authority rather than creating parallel ownership or retry mechanisms without need.

### 4. Run targeted development tests only

During implementation, do **not** repeatedly run the entire project-wide historical suite.

Run the tests needed for the changed code and directly traversed dependencies, for example:

- `node --check` for changed JavaScript files;
- targeted unit/contract tests;
- targeted worker/VM state-machine tests;
- targeted browser/Puppeteer assertions when DOM/runtime behavior changed;
- targeted owner/isolation tests when ownership changed;
- targeted quota/cache tests when state transitions could affect quota/cache;
- targeted delivery tests when composer/Send/recovery changed;
- targeted security/network assertions for surfaces touched by the change.

A bug fix should, when practical, have a RED reproduction against the old candidate and a GREEN result against the corrected candidate.

The target is confidence in the change without wasting time rerunning every unrelated historical scenario after every edit.

### 5. Maintain the permanent full-handoff gate as functionality evolves

Whenever functionality is added or materially changed, update:

`OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Add the new Codex-testable behavior and regressions that must survive future work.

Whenever functionality is intentionally removed, remove tests that require the removed behavior while preserving neighboring/invariant tests and recording the feature removal in normal project documentation.

The gate must reflect actual current product behavior. Do not leave obsolete tests forever and do not weaken valid tests just to pass a candidate.

Updating the gate does not mean running it after every edit.

## Mandatory pre-operator handoff workflow

This sequence is required only when ChatGPT is ready to give the operator an installable/testable build.

### 6. Freeze one exact completed candidate

Before full validation:

- stop production edits;
- commit exact production changes;
- record exact candidate SHA;
- record exact production inventory and hashes;
- record authorized changed files and protected surfaces;
- confirm targeted development tests pass.

Any production change after this point invalidates the frozen candidate and requires a new final gate later.

### 7. Prepare one standalone full Codex prompt

The prompt must be independently copyable and executable and must point to:

- repository and exact candidate SHA;
- exact expected production inventory/hashes;
- `OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md` as the functional test authority;
- accepted QA harness/environment;
- one consolidated runner/command requirement;
- provider network blocking/mocking;
- zero-real-request counters;
- report-only branch/path;
- final PASS/FAIL schema;
- instruction that Codex must not edit production and must STOP after reporting.

Do not send a series of incremental prompt fragments such as “also test this”. The final handoff prompt must contain the whole gate in one standalone task.

### 8. Codex runs the complete gate once

The accepted Windows QA route remains:

`fixed exact source -> Node child_process.spawn() launcher -> Chrome for Testing -> dynamic DevTools endpoint -> Puppeteer connect -> browser.installExtension() -> consolidated assertions -> report`

Qualified harness baseline unless later superseded:

- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`;
- `--remote-debugging-port=0`;
- `DevToolsActivePort` discovery;
- runtime extension install with Puppeteer `browser.installExtension()`;
- dedicated QA profile;
- zero operator browser actions;
- content-script, MV3 service-worker, console, network, multi-tab and persistent-runtime assertions.

The full gate must be invoked through **one top-level consolidated runner/command**. It may contain multiple internal worker/browser/static/package blocks, but there is one umbrella terminal result.

Required umbrella marker:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Codex must:

- test the exact frozen candidate;
- make zero production edits;
- use no real Seller/Performance credentials;
- make zero real Ozon requests;
- make zero real Performance requests;
- run every currently applicable mandatory block in the permanent gate;
- not mark an existing behavior `NOT_APPLICABLE` merely because the harness failed to exercise it;
- distinguish production failure from harness fixture/environment failure;
- publish only the validation report on its validation branch;
- stop.

### 9. ChatGPT reviews the complete GitHub report

Never approve handoff from the short Codex terminal summary alone when a full report exists.

Read the full report and verify:

- tested candidate SHA is exact;
- expected production inventory/hashes matched;
- all currently applicable blocks passed;
- no mandatory block was skipped or weakened;
- provider request counters are exactly the required zero-real-network values;
- validator changed zero production files;
- owner/quota/cache/delivery/security invariants were genuinely asserted;
- any FAIL/INCONCLUSIVE is treated as a failed handoff gate until resolved.

If the failure is an actual production defect, return to the development workflow and fix the defect with targeted tests. After production changes, freeze a new candidate and rerun the entire final handoff gate.

If the failure is a genuine harness fixture/environment problem, fix the harness problem without casually changing production and rerun the final gate against the same exact candidate when still valid.

## Packaging after full gate PASS

Only after the full Codex gate is reviewed as PASS:

1. package exactly the tested production tree;
2. exclude tests/reports/dev artifacts/credentials;
3. record package SHA-256;
4. extract the package into a fresh directory;
5. compare every production file byte-for-byte with the independently tested candidate;
6. run package integrity/syntax/manifest checks on the fresh extraction;
7. confirm no production byte changed after validation;
8. hand that exact package to the operator.

If packaging changes production bytes or the packaged tree is not exactly the tested tree, handoff is forbidden until corrected and revalidated as required.

## Operator handoff and live acceptance boundary

The full Codex/Puppeteer gate is the final automated independent gate before operator handoff. It does **not** replace facts that depend on the operator's real environment.

After handoff, use the operator's normal browser/profile only for live gates such as:

- current logged-in ChatGPT behavior;
- current logged-in Alice behavior;
- real conversation identity/binding behavior;
- controlled real Ozon provider responses/rate-limit behavior;
- final field/package acceptance.

Do not call a local/synthetic/browser-harness test a logged-in live PASS.

Likewise, a partial live test does not retroactively mark the complete package live-tested.

## Anti-loop rule

A failing test does not justify an endless setup loop.

During development:

- diagnose the first concrete blocker;
- correct the changed production path or targeted test fixture as appropriate;
- rerun the bounded targeted tests.

During final handoff validation:

- preserve exact candidate identity;
- classify the failure correctly;
- do not alter production merely to make a harness failure disappear;
- rerun the full gate only after the blocker is coherently fixed.

## Reporting cadence

The operator should not be asked to install/download intermediate packages during ordinary implementation.

Engineering updates should report meaningful milestones, while the actual installable build is provided only after the mandatory full Codex handoff gate and packaging checks pass.

## Standing implementation invariants

Unless a later reviewed change explicitly changes an invariant, preserve:

- native Copy structurally anchors the correct code block/conversation surface;
- one extension-owned top-level Shadow DOM overlay;
- fail-closed conversation/binding ownership;
- fixed provider hosts and operation registries;
- no assistant-supplied arbitrary URL/host/method/headers/auth;
- credentials isolated from page/content output;
- read-only Ozon operation surface; mutations remain blocked unless explicitly designed and accepted later;
- no hidden provider retry/pagination/fan-out/report polling;
- no arbitrary generic bridge caps/silent result truncation reintroduced;
- ChatGPT/Alice ownership stays isolated;
- independent conversations/tabs remain independently owned; no global current conversation;
- provider quota/cache state is not reset by unrelated UI/delivery cleanup;
- delivery recovery does not replay provider work.

## Current handoff-gate authority

Permanent full gate:

`OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

The complete v0.1.19 logged-in live suite remains pending as of 2026-08-18. Current delivery repair work must be completed, targeted-tested, frozen, fully Codex-gated, packaged and then handed to the operator before the full live suite is resumed.