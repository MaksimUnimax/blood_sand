# Ozon Seller / Performance API bridge

Status as of 2026-08-29: active read-only Ozon LLM↔API Bridge repair and completion work. The current objective is full supported read coverage across Seller API and Performance API, with deterministic classification of every current API operation and preservation of the accepted runtime safety/lifecycle invariants.

## Read this first

For current work, use these documents in this order:

1. `OZON_BRIDGE_FULL_READ_COMPLETION_ROADMAP_2026-08-29.md` — **active implementation roadmap and current step; this is the first document for all further full-read work.**
2. `OZON_BRIDGE_FULL_READ_DYNAMIC_ENTITLEMENTS_AND_CLUSTERS_SPEC_2026-08-25.md` — authoritative full Seller API design and fixed implementation rules.
3. `OZON_BRIDGE_CURRENT_HANDOFF_2026-08-17.md` — continuation state and milestone handoff pattern.
4. `OZON_BRIDGE_ROADMAP_2026-08-17.md` — target architecture, provider/planner roadmap and accepted milestone evidence.
5. `OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md` — active incremental development/Codex workflow.
6. `OZON_BRIDGE_CODEX_QA_HARNESS_ACCEPTANCE_2026-08-17.md` — accepted Windows/Puppeteer/Chrome for Testing QA capability.
7. `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` — release/incident log.
8. matching immutable `reference-*` snapshot for release-specific evidence.

## Source of truth

Repository: `MaksimUnimax/blood_sand`.

Canonical release/evidence snapshots remain under `reference-*`. Development versions and operator candidates do not become canonical merely because they exist or were tested.

Current full-read repair/completion work follows the active roadmap above. New endpoint work must not be selected ad hoc outside that roadmap.

## Active full-read completion rule

The product target includes both API contours:

- complete safe read coverage of the current Seller API contract;
- complete safe read coverage of the current Performance API contract.

Personal-data-capable reads use the accepted operator Personal Data setting: OFF blocks the provider request and returns a setting-required result; enabling the setting never replays the blocked command; an explicit resubmit while ON may execute the read.

Multi-step report/document workflows are driven by the AI through sequential explicit Bridge commands according to the exact provider contract. The operator does not have to manually manage technical create/status/result steps. Bridge itself must not perform hidden polling, retry, pagination, fan-out or chained provider work inside one command.

## Active development method

The normal loop is:

`roadmap step -> coherent implementation -> targeted engineering tests -> independent validation -> correction/revalidation if needed -> mark step complete -> next roadmap step`

At every working step the chat status must show the roadmap with:

- `✅` completed;
- `🔄` current;
- `⬜` not started.

The current step and the next allowed step must always be stated explicitly.

### Engineering tests

Use the tests appropriate to the changed path, including syntax, worker/state-machine, contract/planner, quota/cache, owner/isolation, browser/Puppeteer, composer/delivery/recovery and security/provider-boundary tests as applicable.

Do not rerun unrelated historical suites merely because one small implementation detail changed.

### Independent validation

After a coherent step is ready, it may be independently tested on Windows using the available QA environment. A failed production assertion is fixed in production and the affected step is revalidated. A harness/fixture/environment failure is fixed in the test environment and the affected validation is rerun.

## Current engineering status

The accepted Full Read Core B0 remains the protected base authority for the canonical repair. The current canonical repair branch has rebuilt the stocks/warehouse Seller block from that base.

Current repaired B1 facts:

- 30 Seller read operations in the stocks/warehouse scope;
- Linux CI PASS;
- Windows CI PASS;
- CI artifact published and independently downloaded;
- 21 production files / 18 JavaScript files;
- verified production tree: `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`.

The remaining action for roadmap Step 1 is formal acceptance evidence. After that, Step 2 is the mandatory complete master-checklist for all 463 Seller operations and all 48 Performance operations.

## Packaging and operator checks

When the current development objective is ready for an installable build:

1. identify the exact intended production tree;
2. ensure the latest relevant engineering and independent validations cover it;
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
- one explicit Bridge command produces at most one physical business provider request;
- no hidden provider retry/pagination/fan-out/report polling;
- provider quota/cache state is not reset by unrelated UI/delivery cleanup;
- delivery recovery does not replay provider work.

## DEFECT_015_ACTIVE_DATE_CONTRACT_POLICY_V1

Date/time/period requests are validated against the effective provider contract, including documented prose/business constraints, rather than mechanical OpenAPI `format` alone. Dynamic provider-derived selectors and current/future-only date requests are not published as permanent runnable templates. Retired operations are fail-closed and hidden from ordinary guidance. The 2026-09-04 DEFECT-015 repair gate is mandatory for any future change that can alter these invariants.
