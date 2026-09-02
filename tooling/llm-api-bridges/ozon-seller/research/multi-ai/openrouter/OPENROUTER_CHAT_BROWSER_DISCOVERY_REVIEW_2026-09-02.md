# OpenRouter Chat browser discovery review — 2026-09-02

Status: PASS1_COMPLETE_AS_CONTENT_UNAVAILABLE_RECORD
Provider: OpenRouter Chat
Provider ID: `openrouter_chat`
Source: operator-provided Codex browser discovery report dated 2026-09-02.

## Executive verdict

OpenRouter Chat first-pass discovery is complete only as a blocked access/surface record.

Observed facts:

- `https://openrouter.ai/chat` rendered successfully at the expected origin/path;
- the page title identified the surface as `AI Chat Playground - Compare AI Models Side by Side | OpenRouter`;
- navigation for Search, Models, Benchmarks, Chat, Rankings, Apps, Enterprise and Docs was visible;
- no textarea, input, contenteditable or other chat composer was present in the bounded DOM inspection;
- no model was selected;
- no message was inserted or sent;
- no auth boundary, model-selection lifecycle, conversation identity, turns, code extraction, delivery, SPA or duplicate-tab behavior was established;
- selected underlying model was correctly NOT treated as provider identity; the web provider remains `openrouter_chat`.

Therefore OpenRouter is NOT ready for implementation design.

Current blocker:

`CONTENT_UNAVAILABLE / /chat rendered navigation shell with zero composer elements`

Patch readiness:

`NEEDS_ENVIRONMENT_RETRY`

More precisely, the next OpenRouter closure pass must first determine why the expected chat surface is not rendering before it can decide whether the blocker is authentication, model selection, UI loading, account state, provider layout, or Codex/browser rendering behavior.

## Source-report consistency defect

The report's top checklist marks `OPENROUTER-01` and `OPENROUTER-02` as `BLOCKED`, while the narrative explicitly closes both as `PASS` for live URL and product-surface classification.

Review treatment:

- preserve the raw report unchanged;
- treat the narrative terminal closure as the evidence-backed interpretation:
  - OPENROUTER-01 = PASS;
  - OPENROUTER-02 = PASS;
  - OPENROUTER-03..40 = BLOCKED / CONTENT_UNAVAILABLE.

This inconsistency is a report-format defect, not OpenRouter product evidence.

## Proven evidence

### Origin/surface

- trusted observed origin: `https://openrouter.ai`;
- observed route: `/chat`;
- provider document rendered;
- observed page is a navigation/playground shell;
- no usable chat composer rendered in the bounded inspection.

### Provider identity

The web adapter identity must remain:

`openrouter_chat`

Underlying selected models, if later visible, are model configuration only and must not become provider identity or independently select another provider adapter.

## Missing evidence

All of the following remain unproven:

- authentication boundary;
- model picker and selected-model state;
- free/no-cost model path;
- whether model selection is required before composer rendering;
- empty/new-chat route;
- exact conversation identity;
- identity durability on reload;
- user/assistant turn roots and message IDs;
- ordered turns;
- generation start/completion;
- composer write/read-back;
- enabled/disabled Send contract;
- exactly-once Send;
- fenced code-block extraction;
- code ownership/action anchor;
- second-turn continuity;
- result-delivery confirmation;
- SPA A→B→A;
- different-chat parallel tabs;
- same-chat duplicate tabs;
- Manual;
- established Autorun;
- new-chat Autorun.

## Exact next OpenRouter work before any patch

1. Re-open `https://openrouter.ai/chat` in a browser context where the real chat surface renders.
2. Determine whether auth is required for the composer or only for Send/history.
3. Determine whether a model must be selected before the composer becomes available.
4. If a safe free/no-cost model path exists, establish model-selector state without any billing change.
5. Re-run positive chat-DOM detection and composer/Send discovery.
6. Only after an executable chat surface exists, perform the full identity/turn/lifecycle/code/delivery/SPA/tab matrix.
7. Freeze the adapter contract only after those observations.

## Final status

Provider: OpenRouter Chat
Access: provider document reachable; executable chat unavailable in observed surface
Auth requirement: UNRESOLVED
Model selection: UNRESOLVED
Conversation identity: UNRESOLVED
Composer/Send: BLOCKED
Turns/completion: BLOCKED
Code extraction: BLOCKED
Delivery: BLOCKED
SPA/tabs: BLOCKED
Manual: BLOCKED
Autorun: BLOCKED
Overall first-pass verdict: `CONTENT_UNAVAILABLE / NOT TESTED`
Patch readiness: `NEEDS_ENVIRONMENT_RETRY`
