# Ozon Bridge — multi-AI completion and migration roadmap

Date: 2026-08-13
Repository: `MaksimUnimax/blood_sand`
Working branch: `work/ozon-data-collection-2026-08-11`
Companion decision document: `OZON_BRIDGE_PRODUCT_DIRECTION_2026-08-13.md`

## Goal

Produce one migration-ready Ozon extension that proves the full product concept before a separate commercial repository is created.

The current branch is the laboratory. The future repository will be the commercial product.

The migration-ready extension must prove this user story:

> Install extension -> choose supported web AI -> connect Ozon -> click Start -> AI receives bridge rules and becomes ready -> ask a normal business question -> AI emits one or more commands -> user executes -> bridge returns one final factual batch report -> AI answers in the requested form.

The current branch does **not** need the final subscription server, payment system or admin panel. Those belong to the new repository after the technical proof is accepted.

---

## Baseline

Current accepted line before this roadmap:

- v0.1.10 hardening/acceptance work exists on the branch;
- command discovery supports arbitrary surrounding text and hardened Unicode cases;
- batch execution exists;
- commands execute strictly sequentially;
- one final `OZON_BATCH_RESULT_V1` is delivered;
- single-command behavior is the same architecture as a batch of one;
- recovery/no-replay behavior has been tested;
- delivery readiness and Microphone-based completion behavior has been hardened for the current ChatGPT adapter.

The roadmap must preserve these properties while generalizing the AI side.

---

# Phase 1 — Freeze the bridge core contract

## Objective

Separate invariant bridge behavior from ChatGPT-specific DOM behavior.

## Required work

1. Identify and document the common core interfaces for:
   - command discovery;
   - command validation;
   - queue creation;
   - sequential execution;
   - batch result construction;
   - recovery/no-replay state;
   - delivery lifecycle;
   - diagnostics/logging.
2. Ensure no core execution rule depends on a ChatGPT selector or ChatGPT-specific UI state.
3. Treat one command as a batch of one everywhere.
4. Preserve strict parsing: accept valid protocol commands in arbitrary text, but do not repair malformed JSON.
5. Preserve exactly-once external request semantics for accepted queue items.
6. Preserve one final batch report per completed batch.

## Exit gate

Core tests pass without needing a real ChatGPT DOM fixture except in the adapter-specific test suite.

---

# Phase 2 — Define the AI adapter contract

## Objective

Create a generic AI adapter layer so each web AI supplies site-specific interaction while the bridge core remains unchanged.

## Adapter responsibilities

Each adapter should expose the equivalent of:

- match supported domain/page;
- detect conversation readiness;
- locate composer/input surface;
- insert text safely;
- detect/send current message when required by the chosen mode;
- detect busy/generating state;
- detect completion/ready-for-next-input state;
- identify AI response/message surface for command discovery;
- insert/paste bridge result using the common delivery lifecycle;
- expose diagnostic state;
- provide adapter/version metadata.

The adapter must not own Ozon request logic or batch semantics.

## Configuration direction

Design the adapter so ordinary DOM changes can eventually be expressed through declarative profile data such as:

- domains;
- selectors;
- selector fallbacks;
- readiness/completion markers;
- timeouts;
- feature flags.

For the current branch, profiles may remain packaged/local while the architecture is proven.

Remote profile delivery belongs to the future commercial repository.

## Exit gate

The existing ChatGPT behavior runs through the adapter interface without changing bridge-core semantics.

---

# Phase 3 — Rebuild ChatGPT as adapter #1

## Objective

Make current ChatGPT support the reference implementation of the generic adapter contract rather than a special case.

## Required acceptance

- command discovery unchanged;
- batch sizes 1 / 2 / 5 / 15 / 30 / 60 remain supported;
- strict sequential external execution remains proven;
- no dedupe of legitimate repeated commands;
- readiness/button state remains correct;
- before bridge readiness, execution control remains non-executing/Copy-only as designed;
- delivery watcher exists only for the active bridge delivery;
- report Send is clicked at most once where the mode requires it;
- later ordinary user Send states are not acted on;
- completion marker is adapter-defined and reliable;
- watcher is destroyed after successful completion;
- recovery does not replay already-executed external requests;
- provider/security/credential/privacy tests remain green.

## Exit gate

Current ChatGPT acceptance behavior passes through the new adapter abstraction with no regression.

---

# Phase 4 — Handshake / Start workflow

## Objective

Make the extension usable by a nontechnical seller without manually teaching each AI how the bridge works.

## User flow

1. Extension shows supported AI list.
2. User selects current AI.
3. User has valid Ozon credentials configured.
4. User clicks `Start`.
5. Extension inserts the adapter/model-specific bridge instruction prompt.
6. AI responds with a recognizable readiness result/marker.
7. Extension marks that conversation as bridge-ready.
8. User asks normal questions after that point.

## Handshake prompt must define

- protocol/version;
- available Ozon capability surface or how capability discovery works;
- command syntax;
- batch behavior;
- strict factual-use rule;
- result syntax;
- error handling;
- no invention of missing Ozon facts;
- read-only baseline;
- readiness marker.

## Required robustness

- Start cannot accidentally execute an Ozon command;
- repeated Start is safe/idempotent for the active conversation where feasible;
- readiness is scoped to the correct conversation/page lifecycle;
- stale readiness after navigation/reload is handled deliberately;
- weak-model prompt variants can be shorter and stricter than strong-model variants.

## Exit gate

A new conversation can be initialized from the extension with no manual prompt copying by the user.

---

# Phase 5 — AI adapter #2: Alice

## Objective

Prove that the architecture works with a materially different non-OpenAI web AI, including a free consumer-facing model path.

## Minimum functional acceptance

A user can:

1. select Alice;
2. click Start;
3. receive successful bridge readiness;
4. ask: "Compare my Ozon sales for June and July" or equivalent;
5. Alice emits valid bridge command(s);
6. extension discovers them;
7. user executes once;
8. Ozon batch completes;
9. final result is delivered to Alice;
10. Alice produces a factual comparison.

## Additional checks

- multi-command batch from Alice;
- arbitrary prose around commands;
- command formatting variations that remain protocol-valid;
- weak-model failure handling;
- retry/recovery behavior;
- no accidental execution from ordinary user messages.

## Exit gate

At least the simple period-comparison scenario works end-to-end reliably enough to demonstrate to a seller.

---

# Phase 6 — AI adapter #3: DeepSeek

## Objective

Prove that support is not a two-site coincidence and that the adapter/core split generalizes.

## Minimum functional acceptance

Repeat the same end-to-end acceptance as Alice, plus at least one more complex multi-command question requiring several Ozon data surfaces.

Candidate scenario:

> "Compare June and July, identify the products with the largest sales decline, and use advertising data if available to explain which declines coincide with worsening ad efficiency."

The exact question may be adjusted to the available Ozon methods, but it must force a real multi-command batch.

## Exit gate

Three materially different web AI services work through the same common bridge core.

---

# Phase 7 — Additional AI adapters before migration

## Objective

Decide how much extra proof is needed before repository split.

Preferred targets, in no fixed order:

- Grok;
- Claude;
- Gemini.

These are not all mandatory for the first migration gate if ChatGPT + Alice + DeepSeek already prove the abstraction cleanly. However, adding one or more before migration is valuable if it exposes missing adapter capabilities.

## Rule

Do not add special-case core logic just to support one AI. If a site requires a new generic adapter capability, add it explicitly to the adapter contract and regression-test all existing adapters.

---

# Phase 8 — Chrome + Yandex Browser compatibility

## Objective

Prove one Chromium extension core can support the intended initial browser distribution.

## Required matrix

At minimum test each required launch AI on:

- Google Chrome;
- Yandex Browser.

If an AI has browser-specific UI behavior, capture it as adapter/profile variation rather than a forked extension whenever possible.

## Acceptance scenarios

For every required AI/browser pair:

- extension loads;
- permissions work;
- settings persist;
- credentials path works;
- Start/handshake works;
- command discovery works;
- batch execution works;
- final result delivery works;
- ordinary user chat after completion is not hijacked;
- reload/navigation recovery behavior is acceptable.

## Exit gate

No separate Yandex product codebase is required for the accepted launch set, unless a concrete tested limitation proves otherwise.

---

# Phase 9 — Security and privacy hardening for migration build

## Objective

Ensure the laboratory extension is safe enough to become the code basis of a commercial product.

## Required decisions/tests

- document credential storage behavior;
- document which origins the extension can access;
- minimize permissions;
- never place Ozon credentials into AI chat;
- never include credentials in logs/diagnostic export;
- validate read-only operation allowlist;
- reject unknown/unapproved operations;
- confirm no arbitrary URL fetch can be induced by AI output;
- confirm no arbitrary JavaScript/code execution can be induced by AI output;
- validate result sanitization where needed;
- test provider failures and partial batch failures;
- define safe diagnostic fields.

## Exit gate

A security/privacy checklist is part of the final acceptance package.

---

# Phase 10 — Result-size and continuation behavior

## Objective

Prevent the bridge from failing on questions whose factual result is too large for a target AI conversation.

## Required behavior

- define practical per-result limits;
- ensure server/provider pagination is not confused with AI-context pagination;
- allow bounded aggregation/selection where the Ozon API already supports it;
- support an explicit "need another batch" continuation path;
- do not silently truncate factual data without declaring truncation/continuation metadata;
- keep ordinary seller questions optimized for one batch/one final report.

## Exit gate

Large-result tests fail safely or continue explicitly rather than producing misleading partial answers.

---

# Phase 11 — Diagnostics suitable for low-cost support

## Objective

Make the final extension diagnosable without reading raw console logs from every user.

## Minimum diagnostic surface

- extension version;
- bridge protocol version;
- selected AI;
- adapter/profile version;
- page/domain match state;
- conversation readiness state;
- Ozon credential presence/validation state without secret values;
- last batch state;
- last delivery state;
- last normalized error code;
- safe copy/export diagnostics action.

The commercial repository may later add server-side health aggregation, but the extension should already expose enough local state to troubleshoot itself.

## Exit gate

A failed common scenario produces an actionable diagnostic state rather than only "does not work".

---

# Phase 12 — Full regression and release candidate

## Objective

Produce the final extension build that will become the migration baseline.

## Required regression groups

### Core protocol

- command discovery variants;
- Unicode/whitespace variants;
- property-order/formatting variants;
- malformed JSON rejection;
- arbitrary surrounding prose/Markdown;
- concatenated valid commands;
- batch sizes including stress cases;
- duplicate legitimate commands preserved;
- sequential concurrency = 1;
- partial failure reporting.

### Recovery

- interruption before external request;
- interruption during queue processing;
- interruption after some successful requests;
- result delivery interruption;
- restart/reload handling;
- no replay of confirmed external requests.

### AI adapters

For every migration-required AI:

- Start/handshake;
- ready state;
- simple command;
- multi-command batch;
- completion detection;
- delivery watcher lifecycle;
- normal post-completion user chat unaffected.

### Browsers

- Chrome;
- Yandex Browser.

### Security/privacy

- credential non-disclosure;
- operation allowlist;
- origin restrictions;
- logs/diagnostics redaction;
- provider error handling.

### Packaging

- clean production file set;
- package/install test;
- fresh extraction/install equivalence;
- deterministic or otherwise verified package integrity where the chosen build process supports it;
- final hash recorded.

## Exit gate

One explicit release candidate is accepted and frozen as the **migration build**.

---

# Migration gate — when to create the new repository

Create the separate commercial repository only when all mandatory conditions below are true:

1. Ozon data bridge is stable enough for normal seller questions.
2. Common bridge core no longer depends on ChatGPT DOM details.
3. ChatGPT adapter passes full regression.
4. Alice adapter passes end-to-end user flow.
5. DeepSeek adapter passes end-to-end user flow.
6. Start/handshake flow is user-ready.
7. Batch/recovery/no-replay guarantees remain intact across adapters.
8. Chrome and Yandex Browser are accepted for the required launch adapters.
9. Security/privacy migration checklist is complete.
10. Diagnostics are sufficient for basic self-service troubleshooting.
11. A frozen extension package and acceptance evidence exist.
12. The migration package clearly distinguishes production code from laboratory evidence/history.

Do not create the new repository merely because the concept is attractive. Create it when the extension core is proven and worth productizing.

---

# What moves into the new commercial repository

Move/copy the clean product assets, not the entire experimental branch history.

Expected migration set:

- production extension core;
- Ozon data adapter;
- common bridge protocol implementation;
- AI adapter engine;
- accepted AI adapters/profiles;
- handshake prompts/templates;
- production tests;
- security/privacy design docs;
- final migration acceptance report;
- protocol schemas/contracts;
- required fixtures that are safe and useful for regression.

Keep old investigation logs, obsolete experiments and superseded prototypes in `blood_sand` unless they are still genuinely useful to the commercial project.

---

# Work that starts only in the new commercial repository

After migration, add the business/operations layer:

1. product name/branding;
2. website/onboarding;
3. account/subscription model;
4. intended initial price: 190 RUB / 30 days, subject to real sales validation;
5. payment integration;
6. license/control-plane server;
7. admin panel;
8. remote supported-AI registry;
9. remote declarative adapter/profile delivery;
10. adapter health monitoring and alerts;
11. production diagnostics/support tooling;
12. release/update pipeline;
13. Chrome/Yandex distribution process;
14. privacy policy/store disclosures;
15. real-user telemetry only if later chosen and only with an explicit privacy design.

The commercial server should remain a control plane. It should not become an analytics warehouse or LLM inference backend by default.

---

# Post-Ozon source expansion in the new repository

Only after the Ozon commercial path works, add business data sources behind the same bridge protocol.

Recommended order to evaluate:

1. Wildberries;
2. Yandex Direct;
3. Yandex Wordstat;
4. Yandex Metrica;
5. Yandex Webmaster;
6. own-site/CRM/CMS/order sources as demand proves useful.

Architecture rule:

`data adapters -> common bridge protocol -> AI adapters`

Never build direct pairwise integrations such as `WB -> ChatGPT`, `WB -> Alice`, `Direct -> ChatGPT`, etc. Each data source and each AI should integrate once with the common core.

---

# Product outcome the roadmap is trying to preserve

The final product should still feel smaller than a conventional SaaS even after several data sources are added.

The user should experience:

> Choose AI -> ask business question -> approve data request -> receive factual answer.

The product should not require the user to learn another analytics dashboard.

The bridge is the product.
