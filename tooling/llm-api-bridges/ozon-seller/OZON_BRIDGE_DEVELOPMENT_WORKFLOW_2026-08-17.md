# Ozon Bridge — development workflow with Codex validation gates

Date adopted: 2026-08-17
Status: active project workflow
Scope: `tooling/llm-api-bridges/ozon-seller/`

## Purpose

This document fixes the working method for further Ozon Bridge development. The goal is to make each major engineering step independently reproducible and testable without forcing the operator to download/reinstall an intermediate extension build after every code change.

The workflow separates three roles:

1. **ChatGPT engineering/review role** — architecture, implementation, documentation, Git branch/commit management, review of Codex evidence and the decision to accept/reject a step.
2. **Codex Windows QA role** — independent execution of an exact validation plan against an exact frozen implementation SHA using the accepted Windows/Puppeteer/Chrome for Testing harness. Codex does not repair production code during a validation gate unless a later task explicitly assigns development work.
3. **Operator role** — transfers the full standalone validation prompt to Codex and performs only the final real-profile/live acceptance gates that cannot be replaced by the synthetic/dedicated QA browser.

## Source of truth and branch roles

Live GitHub repository is the source of truth:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

The canonical release lineage and development candidates must never be conflated.

- `reference-*` directories are immutable version/evidence snapshots.
- The canonical GitHub release lineage currently reaches `reference-0.1.11/`.
- Operator/local candidates v0.1.12+ are not made canonical merely because they exist or are used as a development baseline.
- Major new work is done on a dedicated `dev/...` branch.
- An independent validation branch must be created **from the exact implementation SHA under test**, not from a later moving branch HEAD.
- A validation branch must contain only the validation report unless the validation plan explicitly states otherwise.

## Major-step workflow

Development is divided into a small number of coherent major steps. Do not split one architectural objective into dozens of tiny gates.

For each major step, use this sequence:

### 1. Plan and freeze the scope

Before implementation:

- collect the latest agreed architecture/behavior changes;
- update the roadmap/specification;
- state explicit in-scope and out-of-scope behavior;
- identify protected production surfaces that must not change;
- define the acceptance matrix and fail-closed rules.

### 2. Implement one coherent step

Implement only the planned step on a dedicated development branch.

Before handing the step to Codex:

- reconstruct from the exact declared baseline;
- run local syntax/unit/VM/static checks appropriate to the changed path;
- record changed production files and byte-identical protected files where practical;
- freeze the implementation at an exact commit SHA.

The frozen implementation SHA is the validation authority. Later documentation commits on the development branch do not change the target under test.

### 3. Commit a standalone Codex validation plan

After implementation is frozen, create a GitHub validation-plan document that contains a **full standalone Codex prompt**.

The prompt must include all required context in one message:

- repository and paths;
- exact implementation SHA;
- exact baseline SHA/artifact hash where relevant;
- goal and scope;
- protected surfaces;
- test matrix;
- browser/harness instructions;
- security and no-network guards;
- acceptance criteria;
- report path/branch/commit rules;
- final response schema;
- explicit instruction to STOP after validation and not begin the next engineering step.

Never give Codex a delta such as “add this to the previous prompt”. Every Codex prompt must be independently copyable and executable.

### 4. Operator sends the prompt to Codex

The operator copies the full standalone prompt into the Windows Codex application.

Intermediate development validation must not require the operator to:

- download a new ZIP;
- install/reinstall the extension manually;
- use `chrome://extensions`;
- click `Load unpacked` or `Reload` for every revision.

### 5. Codex performs independent validation

The accepted Windows QA route is:

`fixed unpacked source -> Node child_process.spawn() launcher -> Chrome for Testing -> dynamic DevTools endpoint -> Puppeteer connect -> browser.installExtension() -> assertions -> report`

Qualified harness baseline:

- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`;
- `--remote-debugging-port=0`;
- `DevToolsActivePort` discovery;
- runtime extension install with Puppeteer `browser.installExtension()`;
- dedicated persistent QA profile;
- zero operator browser actions during the accepted R1/R2/R3 qualification;
- content-script, MV3 service-worker, console, network, multi-tab, localStorage and persistent-cookie checks proven.

Codex must test the exact target SHA, publish a report on a separate validation branch, not change production code, and stop.

### 6. ChatGPT reviews the report from GitHub

Do not accept a step from the short Codex summary alone when a report exists. Read the full validation report and check:

- the tested SHA is exact;
- branch base is correct;
- report-only branch discipline is preserved;
- provider/request counters match the intended invariant;
- evidence is not simulated or overstated;
- protected files/surfaces stayed unchanged;
- any FAIL/INCONCLUSIVE is treated as such.

Then choose exactly one path:

- **ACCEPT** — update roadmap/current handoff and move to the next major step;
- **REJECT** — fix the specific defect and issue a bounded retest for the same step.

Do not start the next step while the previous major step is unresolved.

## Anti-loop rule

A failing validation does not justify an endless environment/setup loop.

- Diagnose the first concrete blocker.
- Make one coherent correction to that blocker.
- Re-run a bounded validation.
- If the harness itself is the blocker and cannot be made reliable after the agreed bounded correction, change the development process instead of creating an infinite series of setup experiments.

This rule was used to converge the Windows harness from the blocked normal-Chrome integration path to the accepted Node/Puppeteer/Chrome for Testing route.

## Reporting cadence

The operator receives a clear report after each **major** engineering step, not after every tiny edit.

A step report must state:

- what changed;
- exact implementation SHA;
- validation status;
- important evidence/counters;
- unresolved limitations;
- what the next major step is.

## Protected release/live acceptance boundary

The Codex/Puppeteer harness is the default intermediate QA surface. It does **not** replace final release acceptance where the fact under test depends on the operator's real environment.

Use the operator's normal browser/profile only at major live gates such as:

- current logged-in ChatGPT behavior;
- current logged-in Alice behavior;
- real conversation identity/binding behavior;
- controlled real Ozon provider responses/rate-limit behavior;
- final release/package acceptance.

Do not call a local/synthetic/browser-harness test a logged-in live PASS.

## Standing implementation invariants

Unless a later reviewed step explicitly changes an invariant, preserve:

- native Copy structurally anchors the exact code block; no command discovery/binding by text content;
- one extension-owned top-level Shadow DOM overlay;
- fail-closed conversation/binding ownership;
- fixed provider hosts and operation registries;
- no assistant-supplied arbitrary URL/host/method/headers/auth;
- credentials isolated from page/content output;
- read-only Ozon operation surface; mutations remain blocked;
- no hidden provider retry/pagination/fan-out/report polling;
- no arbitrary generic bridge caps/silent result truncation reintroduced;
- proven ChatGPT delivery FSM is protected from unrelated provider/planner work;
- Alice lifecycle/adapter changes are isolated from proven ChatGPT delivery semantics;
- independent conversations/tabs remain independently owned; no global “current conversation”.

## Current gate

Step 0 (Windows Codex/Puppeteer QA harness qualification) is closed and accepted.

Step 1 (Contract + Capability layer) has an implementation frozen at:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Its independent Codex validation has been dispatched. Step 2 must not begin until the Step 1 validation report is reviewed and Step 1 is explicitly accepted.
