# Ozon Seller / Performance API bridge

Status as of 2026-08-17: active read-only Ozon LLM↔API Bridge development with separate canonical release lineage, operator development baseline, and independent Codex browser-QA gates.

This directory contains research/provenance artifacts, immutable version snapshots, active development documentation, validation plans/reports, and operator-baseline reconstruction artifacts.

## Read this first

For current work, use these documents in this order:

1. `OZON_BRIDGE_CURRENT_HANDOFF_2026-08-17.md` — exact continuation state and immediate next action.
2. `OZON_BRIDGE_ROADMAP_2026-08-17.md` — current target architecture, latest agreed provider/planner changes, major-step roadmap and status.
3. `OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md` — fixed development method: major step -> frozen SHA -> standalone Codex validation plan -> report-only validation branch -> review -> next step.
4. `OZON_BRIDGE_CODEX_QA_HARNESS_ACCEPTANCE_2026-08-17.md` — accepted Windows/Puppeteer/Chrome for Testing intermediate QA harness.
5. `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` — historical append-only release/incident log. Historical entries must not be rewritten.
6. matching immutable `reference-*` snapshot for release-specific evidence.

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

Current active development starts from the exact operator v0.1.19 package pinned on:

`dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Operator baseline ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

This baseline is explicitly development-only and does not advance the canonical release lineage.

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

Therefore the operator does not need to download/reinstall an intermediate ZIP after every engineering step.

This does not replace final acceptance in the operator's real logged-in browser/profile.

### Step 1 — Contract + Capability layer — IMPLEMENTED, INDEPENDENT VALIDATION RUNNING

Frozen implementation SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Only three production files differ from the operator v0.1.19 baseline:

- `service_worker.js`;
- `shared/ozon_contract.js`;
- `shared/ozon_provider.js`.

The standalone validation plan is:

`validation/plans/OZON_STEP1_CONTRACT_CAPABILITY_CODEX_VALIDATION_2026-08-17.md`

The operator has already dispatched that prompt to Codex. Step 2 must not start until the full validation report is reviewed.

## Major roadmap

The active provider-side target pipeline is:

`clicked batch -> strict validation -> 0/1 Seller capability probe -> entitlement planning -> query planner/coalescer -> cache/prefetch -> provider quota scheduler -> Ozon -> response verifier -> safe error normalization -> logical result projection -> existing delivery engine`

Remaining major steps after Step 1 acceptance:

- **Step 2:** query planner + safe coalescing;
- **Step 3:** global provider quota scheduler + response verifier + safe errors;
- **Step 4:** cache/prefetch + semantic acquisition profiles + integrated multi-AI/live acceptance.

The roadmap is intentionally coarse. Do not create dozens of micro-gates unless a concrete defect requires a bounded repair inside the current step.

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

`/v1/analytics/data` has a documented one-request-per-minute method limit. Temporal quota enforcement is planned for Step 3 and must be global for the same Seller account/quota family across tabs/AIs.

## Standing code-block / AI invariants

- native Copy structurally anchors the exact code block;
- the extension Ozon button appears for every code block regardless of its text;
- parser/worker alone decides whether an `OZON_API_V1` command is present/valid;
- block identity is never content/text-fingerprint based;
- one extension-owned top-level Shadow DOM overlay;
- many tabs/conversations must remain independently owned; no global current conversation;
- ChatGPT and Alice adapters stay separable;
- provider/planner work must not casually rewrite the proven ChatGPT delivery FSM.

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

Research-era state/contract artifacts remain provenance and contract-discovery evidence, but old lifecycle/status wording must not override current implementation/roadmap documents or immutable release snapshots.

The historical append-only log remains append-only. If older entries are stale or incomplete, correct current authority through new documents/entries rather than rewriting historical text.
