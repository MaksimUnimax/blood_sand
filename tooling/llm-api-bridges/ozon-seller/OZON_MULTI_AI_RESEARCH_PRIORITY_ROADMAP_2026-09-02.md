# Ozon Bridge — Multi-AI research priority roadmap

Date: 2026-09-02
Status: SCOPE_FROZEN_FOR_DISCOVERY_THEN_PROVIDER_CLOSURE
Scope: selected browser AI providers only. ChatGPT and Yandex Alice remain accepted baseline adapters.

## 1. Operator scope freeze — authoritative

The broad Tier A expansion is intentionally stopped.

Do NOT continue first-pass discovery for:

- Perplexity;
- Microsoft Copilot;
- Poe;
- Mistral Vibe / Le Chat;
- GigaChat;
- Duck.ai;
- Proton Lumo;
- T3 Chat;
- any other previously listed Tier A provider unless the operator explicitly re-opens scope later.

The only remaining providers to collect before discovery stops are, in this exact order:

1. **Kimi** — `https://www.kimi.com/`
2. **OpenRouter Chat** — `https://openrouter.ai/chat`

Claude first-pass collection is complete and must not be repeated before the final pre-patch matrix.

After OpenRouter first-pass evidence is recorded, broad discovery STOPS.

No additional provider is to be substituted automatically.

## 2. Providers already carrying evidence/checkpoints

Keep all evidence already collected, including providers that are no longer part of the remaining discovery queue.

Current collected set:

1. Google Gemini — environment-blocked first-pass record.
2. Qwen — guest first-pass record plus operator-supplied authenticated `/c/<UUID>` route candidate.
3. DeepSeek — authentication-required first-pass record.
4. Grok — blank/incomplete provider-DOM first-pass record.
5. Meta AI — guest composer/autodetection evidence; multiline exact-write blocker prevented Send.
6. Claude — provider reached `/login`; `AUTH_REQUIRED_FOR_BASIC_CHAT`; authenticated closure required.
7. ChatGPT — existing accepted baseline adapter.
8. Yandex Alice — existing accepted baseline adapter.

Remaining collection set:

9. Kimi.
10. OpenRouter Chat.

The fact that Meta AI was researched before this scope freeze is not discarded. Its evidence remains part of the final pre-patch matrix.

## 3. Current phase — finish evidence collection only

Until Kimi and OpenRouter first-pass reports are collected:

- do not implement new provider adapters;
- do not modify production provider routing;
- do not expand manifest host permissions for new providers;
- do not start generic-core refactoring;
- do not try to finish authenticated/provider-specific closure for Qwen, DeepSeek, Claude, Meta AI or any other provider yet;
- do not restart Gemini/Grok environment retries yet.

For each of Kimi and OpenRouter:

1. run one provider-specific Codex browser discovery prompt;
2. Codex performs browser discovery only, not Git/GitHub/repository work;
3. every safe click/send authorization is stated in the prompt;
4. `/goal` is mandatory at the start of every Codex prompt;
5. every checklist item terminates as PASS / FAIL / BLOCKED / NOT_APPLICABLE;
6. Codex returns one Markdown report;
7. the assistant immediately stores raw evidence and a separate review in GitHub;
8. update this roadmap before moving to the next provider.

## 4. Discovery stop condition

Discovery is complete when both remaining reports exist and have been reviewed:

- Kimi first-pass report + GitHub review;
- OpenRouter Chat first-pass report + GitHub review.

Claude first-pass report + review are already complete.

At that point do NOT immediately patch anything.

The next mandatory artifact is the **PRE-PATCH EVIDENCE AND GAP MATRIX**.

## 5. Mandatory pre-patch matrix

Before any implementation patch, produce one consolidated GitHub document covering every provider that remains relevant to this project scope and every already-collected provider whose evidence may affect architecture.

At minimum include:

| Provider | Evidence collected | Evidence missing | Auth requirement | Environment/provider blocker | Identity status | Composer/Send status | Turn/completion status | Code extraction status | Delivery status | SPA/tabs status | Manual status | Autorun status | Decisions still required | Exact next work |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

For every provider explicitly separate:

### A. What is already proven

Only facts with observed evidence.

### B. What is not collected

Tests never executed or evidence absent.

### C. What is blocked

Distinguish exact blocker classes:

- `AUTH_REQUIRED_FOR_BASIC_CHAT`;
- `AUTH_REQUIRED_FOR_HISTORY_OR_DURABLE_IDENTITY`;
- `NO_AUTH_FOR_EPHEMERAL_CHAT_BUT_AUTH_REQUIRED_FOR_DURABLE_CHAT`;
- `ENVIRONMENT_BLOCKED_NOT_TESTED`;
- `PROVIDER_CHALLENGE_BLOCKED_NOT_TESTED`;
- `PROVIDER_SPECIAL_COMPOSER_BLOCKED`;
- other exact evidence-backed blocker.

### D. What still has to be tested

List exact browser tests, not vague statements.

Examples:

- authenticated conversation ID;
- reload identity durability;
- message IDs;
- code-block raw extraction;
- result-delivery confirmation;
- SPA A→B→A;
- different-chat parallel tabs;
- same-chat duplicate tabs;
- Manual;
- established Autorun;
- new-chat Autorun.

### E. What still has to be designed/decided

List unresolved architectural decisions separately from missing evidence.

Examples:

- provider-specific conversation identity source;
- case/normalization policy;
- synthetic message identity fallback when native IDs are absent;
- provider-specific composer write strategy;
- completion stability window;
- exact delivery confirmation policy;
- duplicate-tab ownership evidence;
- provider surface split versus one adapter;
- guest versus authenticated capability split.

### F. Patch readiness

Each provider receives one status:

- `READY_FOR_PROVIDER_CLOSURE`
- `NEEDS_AUTHENTICATED_DISCOVERY`
- `NEEDS_ENVIRONMENT_RETRY`
- `NEEDS_PROVIDER_SPECIAL_COMPOSER_RESEARCH`
- `EVIDENCE_INCOMPLETE`
- `READY_FOR_IMPLEMENTATION_DESIGN`

No provider is marked ready for implementation merely because a composer selector exists.

## 6. Provider-by-provider closure phase after the matrix

After the consolidated matrix is reviewed, work on providers ONE AT A TIME.

Do not patch all providers in one batch.

For each provider:

1. choose that provider from the matrix;
2. close its remaining evidence gaps first;
3. resolve auth/environment/composer blockers;
4. freeze its adapter contract;
5. only then design/implement its patch;
6. run provider-specific regressions;
7. record results/checkpoint in GitHub;
8. move to the next provider only after the current provider is closed.

The operator will control which provider is taken first once the matrix exists.

## 7. Non-negotiable Ozon Bridge safety invariant

Across all provider work:

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

No provider adapter may introduce:

- hidden retry;
- hidden pagination;
- polling;
- provider fan-out;
- implicit model/provider chaining;
- duplicate result Send;
- cross-chat command/result leakage.

Provider autodetection is independent from Ozon Autorun.

The web provider is determined by the actual web surface, not by the underlying model selected inside an aggregator.

## 8. Current execution queue

### Collection phase

- [x] Claude — first-pass complete: `AUTH_REQUIRED_FOR_BASIC_CHAT`
- [ ] Kimi — NEXT
- [ ] OpenRouter Chat

### Then STOP and create pre-patch matrix

- [ ] Consolidate all collected evidence.
- [ ] List all missing evidence.
- [ ] List all blockers.
- [ ] List all required follow-up tests.
- [ ] List all unresolved architecture decisions.
- [ ] Assign patch-readiness status per provider.
- [ ] Review matrix with operator.

### Only after matrix review

- [ ] Start provider-by-provider closure.
- [ ] No production patch before closure/design readiness of the selected provider.

## 9. Current provider snapshot

### Gemini

Collected: environment attempt.
Current status: `ENVIRONMENT_BLOCKED_NOT_TESTED` because Codex Browser Use blocked before provider DOM was available.
Patch status: not ready.

### Qwen

Collected: guest DOM, composer, one-shot Send, ordered turns, completion; guest durable identity failed. Operator later supplied authenticated `/c/<UUID>` candidate.
Current status: authenticated closure required.
Patch status: not ready.

### DeepSeek

Collected: provider origin and `/sign_in` authentication boundary.
Current status: `AUTH_REQUIRED_FOR_BASIC_CHAT`.
Patch status: not ready.

### Grok

Collected: provider document/origin reached; usable product chat DOM remained blank/incomplete.
Current status: environment/render retry required.
Patch status: not ready.

### Meta AI

Collected: guest chat positive signature, writable native input candidate, enabled/disabled Send behavior.
Blocker: multiline probe exact read-back failed because native text input collapsed the newline; no Send was made.
Current status: `PROVIDER_SPECIAL_COMPOSER_BLOCKED` plus post-Send/auth/durable identity unresolved.
Patch status: not ready.

### Claude

Collected: provider rendered and redirected to `https://claude.ai/login`; login surface offers Google/Apple/email/SSO and exposes no chat/composer/Send/turn DOM.
Current status: `AUTH_REQUIRED_FOR_BASIC_CHAT`.
Evidence note: source report has a `CLAUDE-27` table/narrative mismatch (`BLOCKED` vs `NOT_APPLICABLE`); artifact evidence is treated as not obtained and must be re-evaluated in authenticated closure.
Patch status: not ready; authenticated discovery required.

### Kimi

Collection status: pending — NEXT.

### OpenRouter Chat

Collection status: pending.

## 10. Authority rule

This scope freeze supersedes earlier roadmap sections that instructed continued breadth research across all Tier A providers.

Unless the operator explicitly changes scope again:

**Kimi → OpenRouter → STOP → pre-patch evidence/gap matrix → provider-by-provider closure → only then implementation patch.**
