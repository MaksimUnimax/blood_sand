# Ozon Seller / Performance API bridge

Status as of 2026-08-20: active read-only Ozon LLM↔API Bridge development using incremental engineering and independent Codex validation by completed development stage.

Development follows the milestone workflow: implement a coherent stage, run targeted engineering regression, independently validate that stage with Codex, fix/revalidate when needed, then continue.

## Read this first

For current work, use these documents in this order:

1. `OZON_BRIDGE_CURRENT_HANDOFF_2026-08-17.md` — continuation state and milestone handoff pattern.
2. `OZON_BRIDGE_ROADMAP_2026-08-17.md` — target architecture, provider/planner roadmap and accepted milestone evidence.
3. `OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md` — active incremental development/Codex workflow.
4. `OZON_BRIDGE_CODEX_QA_HARNESS_ACCEPTANCE_2026-08-17.md` — accepted Windows/Puppeteer/Chrome for Testing QA capability.
5. `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` — release/incident log.
6. matching immutable `reference-*` snapshot for release-specific evidence.

## Source of truth

Repository: `MaksimUnimax/blood_sand`.

Canonical release/evidence snapshots remain under `reference-*`. Development versions and operator candidates do not become canonical merely because they exist or were tested.

Major work is performed on dedicated `dev/...` branches. Every validation report must identify the exact code/candidate it exercised.

## Active development method

The normal loop is:

`baseline -> coherent implementation stage -> targeted engineering tests -> independent Codex validation of that stage -> correction/revalidation if needed -> next stage`

Codex validation is allowed at intermediate milestones and may be repeated after a production, harness, fixture or environment correction.

### Engineering tests

Use the tests appropriate to the changed path, including syntax, worker/state-machine, contract/planner, quota/cache, owner/isolation, browser/Puppeteer, composer/delivery/recovery and security/provider-boundary tests as applicable.

Do not rerun unrelated historical suites merely because one small implementation detail changed.

### Codex validation

After a coherent stage is ready, Codex may independently test it on Windows using the available QA environment. A failed production assertion is fixed in production and the affected stage is revalidated. A harness/fixture/environment failure is fixed in the test environment and the affected validation is rerun.

Step 1, Step 2 and later development stages may each be independently accepted before moving to subsequent stages.

## Current engineering status

The active v0.1.19 line includes Contract + Capability, query planner/coalescing, global Seller analytics quota/response verification, verified cache/prefetch, live-repair quota behavior and the current Manual delivery composer-wait repair.

The current composer-wait repair must preserve operator text when the composer is occupied, insert once when it becomes available, recover correctly after restart, and allow Manual OFF cancellation without resetting unrelated provider quota/cache state.

Ordinary regression for this repair is kept under:

`development/manual-delivery-composer-wait/`

Reusable functional browser/worker regression harnesses are kept under:

`validation/regression/`

## Packaging and operator checks

When the current development objective is ready for an installable build:

1. identify the exact intended production tree;
2. ensure the latest relevant engineering and Codex milestone validations cover it;
3. package only production files;
4. verify package contents/hashes against that candidate;
5. hand it to the operator for any live/profile-dependent checks.

Synthetic QA does not prove facts that require the operator's real logged-in browser/profile or real credentials.

## Standing invariants

Unless explicitly changed by a reviewed feature:

- native Copy structurally anchors the correct code block;
- one extension-owned top-level Shadow DOM overlay;
- fail-closed conversation/binding ownership;
- independent tabs/conversations and ChatGPT/Alice ownership isolation;
- fixed provider hosts and operation registries;
- no assistant-controlled arbitrary URL/host/method/headers/auth;
- credentials isolated from page/content output;
- read-only Ozon operation surface unless mutations are explicitly designed later;
- no hidden provider retry/pagination/fan-out/report polling;
- provider quota/cache state is not reset by unrelated UI/delivery cleanup;
- delivery recovery does not replay provider work.
