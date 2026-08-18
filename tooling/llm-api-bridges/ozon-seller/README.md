# Ozon Seller / Performance API bridge

Status as of 2026-08-18: active read-only Ozon LLM↔API Bridge development with separate canonical release lineage, operator development baseline, targeted development tests, and a mandatory consolidated Codex regression gate immediately before operator handoff.

This directory contains research/provenance artifacts, immutable version snapshots, active development documentation, validation plans/reports, operator-baseline reconstruction artifacts, and the permanent pre-operator full regression gate.

## Read this first

For current work, use these documents in this order:

1. `OZON_BRIDGE_CURRENT_HANDOFF_2026-08-17.md` — exact continuation state and immediate next action.
2. `OZON_BRIDGE_ROADMAP_2026-08-17.md` — current target architecture, latest agreed provider/planner changes, major-step roadmap and status.
3. `OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md` — fixed development method and separation between targeted development tests and final handoff validation.
4. `OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md` — **mandatory living full-functional regression contract. Before any installable/testable build is handed to the operator, one exact frozen candidate must pass this entire gate in one consolidated Codex run.**
5. `OZON_BRIDGE_CODEX_QA_HARNESS_ACCEPTANCE_2026-08-17.md` — accepted Windows/Puppeteer/Chrome for Testing QA harness.
6. `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` — historical append-only release/incident log. Historical entries must not be rewritten.
7. matching immutable `reference-*` snapshot for release-specific evidence.

## Source-of-truth boundaries

Repository:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Always read the live GitHub branch ref before assuming a HEAD SHA.

### Canonical release lineage

The canonical GitHub version/evidence lineage currently reaches:

`reference-0.1.11/`

`reference-0.1.11/OZON_BRIDGE_V0.1.11_ACCEPTANCE.md` is the version-specific authority for the canonical v0.1.11 DOM-binding correction candidate.

Operator/local candidates v0.1.12+ are **not canonical releases** simply because they exist, have been used live, or are used as a development baseline.

### Current operator development baseline

Current active development started from the exact operator v0.1.19 package pinned on:

`dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Operator baseline ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

This baseline is explicitly development-only and does not advance the canonical release lineage.

The later v0.1.19 Step1→Step4/live-repair work remains development/frozen-candidate lineage until the required acceptance/promotion steps are completed. The complete v0.1.19 logged-in live suite must not be claimed as passed unless that suite is actually completed.

## Development testing vs operator handoff testing

These are two different stages and must not be conflated.

### While code is being changed

Run only tests appropriate to the code being changed and dependencies directly traversed by that change:

- syntax/static checks for affected files;
- targeted unit/VM/integration/browser assertions for changed behavior;
- targeted dependency regressions;
- defect reproduction tests when practical;
- security/invariant checks directly exposed by the changed path.

Do **not** repeatedly run the entire historical project suite after every edit.

### Immediately before handing a build to the operator

The exact completed candidate must pass `OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`.

Hard rule:

`freeze exact candidate -> one consolidated full Codex run -> full GitHub report review -> exact package from tested tree -> fresh extraction/hash verification -> operator handoff`

Codex is the final independent validator for this automated gate and must not modify production during validation. If production changes after the full gate, that PASS is invalidated and the entire consolidated gate must be rerun before handoff.

The gate is a living contract: new functionality adds new applicable tests; intentionally removed functionality removes its obsolete tests while retaining neighboring regressions and documenting the removal.

## Current engineering status

### Step 0 — Codex/Puppeteer QA harness — ACCEPTED

Intermediate browser-extension QA is automated through:

`fixed unpacked source -> Node launcher -> Chrome for Testing -> dynamic DevTools endpoint -> Puppeteer -> browser.installExtension() -> assertions -> report`

Qualified environment:

- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`;
- Node `child_process.spawn()` launcher;
- `--remote-debugging-port=0` + `DevToolsActivePort` discovery;
- runtime unpacked extension install;
- content script, MV3 service worker, console, network, multi-tab and persistent-profile tests;
- zero operator browser actions in the accepted three-revision qualification.

Therefore the operator does not need to download/reinstall an intermediate ZIP after every engineering edit.

This does not replace final acceptance in the operator's real logged-in browser/profile.

### Current v0.1.19 development line

The provider/planner work added Contract + Capability, query planning/coalescing, global Seller analytics quota/response verification, verified cache/prefetch, and the live-repair quota countdown candidate. Those layers have their own implementation/validation evidence in the development and validation directories.

A real-browser delivery defect is currently being repaired: when a completed Manual report reaches an occupied ChatGPT composer, the report must wait without overwriting operator text; Manual OFF cancellation must release only that pending Manual operation while preserving quota/cache/timing state.

The complete v0.1.19 live suite is still pending and must be resumed after this defect is closed. Partial live observations must not be relabeled as a full v0.1.19 live PASS.

## Major roadmap

The active provider-side target pipeline is:

`clicked batch -> strict validation -> 0/1 Seller capability probe -> entitlement planning -> query planner/coalescer -> cache/prefetch -> provider quota scheduler -> Ozon -> response verifier -> safe error normalization -> logical result projection -> existing delivery engine`

Implemented/development layers include:

- **Step 1:** Contract + Capability;
- **Step 2:** query planner + safe coalescing;
- **Step 3:** global provider quota scheduler + response verifier + safe errors;
- **Step 4:** cache/prefetch + semantic acquisition profile;
- bounded live-repair work where concrete production defects are found.

The roadmap is intentionally coarse. Do not create dozens of micro-gates unless a concrete defect requires a bounded repair inside the current development line.

## Current provider/capability direction

One Ozon button click is one logical batch.

For Seller entitlement-sensitive batches:

- parse the whole batch first;
- run strict contract validation first;
- perform **0** `/v1/seller/info` probes if capability is not required;
- otherwise perform at most **1** internal capability probe for the whole batch;
- never probe once per logical command;
- never expose raw seller-info company/INN/OGRN/rating fields to AI;
- use operation/field entitlement rules rather than one global premium boolean;
- preserve original logical-command identity if the physical request is safely transformed;
- do not silently remove restricted dimensions/sort/filter semantics if that changes query meaning.

`/v1/analytics/data` uses the reviewed one-request-per-minute family plus the current bridge launch-safety guard recorded in the accepted development evidence. Temporal quota enforcement is global for the same Seller account/quota family across tabs/AIs and must not be reset by unrelated Manual delivery cancellation.

## Standing code-block / AI invariants

- native Copy structurally anchors the exact code block;
- the extension Ozon button appears for supported code blocks according to the current binding architecture regardless of command validity; parser/worker decides command validity;
- block identity is never content/text-fingerprint based where structural identity is available;
- one extension-owned top-level Shadow DOM overlay;
- many tabs/conversations must remain independently owned; no global current conversation;
- ChatGPT and Alice adapters stay separable;
- provider/planner work must not casually rewrite proven delivery semantics;
- delivery fixes must not casually rewrite provider quota/cache/planner semantics.

## Provider/security invariants

Unless explicitly changed by an accepted future step:

- read-only allowlist only;
- fixed Seller/Performance provider hosts;
- no assistant-controlled arbitrary URL/host/method/headers/auth;
- credentials isolated from content/page output;
- `posting_fbs_get` remains blocked because of customer PII;
- no hidden provider retry/pagination/fan-out/report polling;
- no invented generic request/result caps or silent truncation reintroduced;
- wrong conversation/binding/security failures fail closed.

## Historical research/provenance

Research-era state/contract artifacts remain provenance and contract-discovery evidence, but old lifecycle/status wording must not override current implementation/roadmap/workflow documents or immutable release snapshots.

The historical append-only log remains append-only. If older entries are stale or incomplete, correct current authority through new documents/entries rather than rewriting historical text.