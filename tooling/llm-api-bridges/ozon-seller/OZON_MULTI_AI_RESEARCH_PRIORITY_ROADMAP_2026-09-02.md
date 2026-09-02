# Ozon Bridge — Multi-AI research priority roadmap

Date: 2026-09-02
Status: SCOPE_FROZEN_FINAL_DISCOVERY_TARGET
Scope: selected browser AI providers only. ChatGPT and Yandex Alice remain accepted baseline adapters.

## 1. Operator scope freeze — authoritative

The broad Tier A expansion is intentionally stopped.

Do NOT continue first-pass discovery for Perplexity, Microsoft Copilot, Poe, Mistral Vibe / Le Chat, GigaChat, Duck.ai, Proton Lumo, T3 Chat, or any other provider unless the operator explicitly re-opens scope.

The only remaining first-pass provider is:

1. **OpenRouter Chat** — `https://openrouter.ai/chat`

Claude and Kimi first-pass collection are complete and must not be repeated before the mandatory pre-patch matrix.

After OpenRouter raw evidence + review are recorded, broad discovery STOPS. No substitute provider is added automatically.

## 2. Collected provider set

Keep all evidence already collected because it affects later architecture and provider closure.

1. Google Gemini — environment-blocked first-pass record.
2. Qwen — guest first-pass record plus operator-supplied authenticated `/c/<UUID>` route candidate.
3. DeepSeek — `AUTH_REQUIRED_FOR_BASIC_CHAT` first-pass record.
4. Grok — provider document reached, usable chat DOM blank/incomplete.
5. Meta AI — guest composer/autodetection evidence; exact multiline write blocker prevented Send.
6. Claude — provider reached `/login`; `AUTH_REQUIRED_FOR_BASIC_CHAT`.
7. Kimi — public Kimi product DOM and editor candidate observed; deterministic enabled Send not resolved.
8. ChatGPT — accepted baseline adapter.
9. Yandex Alice — accepted baseline adapter.

Remaining collection target:

10. OpenRouter Chat.

## 3. Kimi first-pass checkpoint

Observed:

- final URL/origin remained `https://www.kimi.com/` / `https://www.kimi.com`;
- Kimi product DOM rendered normally;
- editor candidate: `div.chat-input-editor[role="textbox"]`;
- login/history-sync controls were visible;
- deterministic enabled Send was not resolved;
- no probe was sent;
- therefore conversation identity, turns, completion, code extraction, delivery, SPA, tabs, Manual and Autorun remain untested.

Auth interpretation:

- public/editor surface is available without immediate login redirect;
- login is visibly connected to history synchronization;
- basic Send authentication requirement is UNRESOLVED because no deterministic Send was reached.

Current Kimi blocker:

`PROVIDER_SEND_CONTROL_UNRESOLVED`

Do not treat the editor selector alone as executable Kimi support.

Raw-report quality note:

The source report contains a checklist contradiction: KIMI-01..05 are `BLOCKED` in the table but described as `PASS` in terminal closure prose. The raw evidence is preserved unchanged. The project review records the contradiction and uses the observed facts rather than silently rewriting the source.

Kimi patch readiness:

`NEEDS_PROVIDER_SEND_CONTROL_RESEARCH`

## 4. Current phase — OpenRouter evidence collection only

Until OpenRouter first-pass report is collected:

- do not implement any new provider adapter;
- do not modify production provider routing;
- do not expand production manifest host permissions;
- do not start generic-core refactoring;
- do not return to authenticated closure for Qwen, DeepSeek, Claude or other providers;
- do not retry Gemini/Grok environment blockers;
- do not start Kimi Send-control closure.

OpenRouter discovery rules:

1. Codex performs browser discovery only, not Git/GitHub/repository work.
2. `/goal` is mandatory at the start.
3. Safe browser clicks must be explicitly authorized in the prompt.
4. Every checklist item ends PASS / FAIL / BLOCKED / NOT_APPLICABLE.
5. Underlying model selected inside OpenRouter is NOT provider identity.
6. Codex returns one Markdown report.
7. Assistant immediately stores raw evidence and separate review in GitHub.
8. Then discovery stops and the pre-patch matrix is created.

## 5. Discovery stop condition

Discovery is complete when OpenRouter first-pass report + GitHub review exist.

At that exact point:

**STOP browser-provider breadth discovery. Do not immediately patch anything.**

The next mandatory artifact is the **PRE-PATCH EVIDENCE AND GAP MATRIX**.

## 6. Mandatory pre-patch evidence and gap matrix

Before any implementation patch, create one consolidated GitHub document covering every provider whose collected evidence affects the project.

Required top-level table:

| Provider | Evidence collected | Evidence missing | Auth requirement | Environment/provider blocker | Identity status | Composer/Send status | Turn/completion status | Code extraction status | Delivery status | SPA/tabs status | Manual status | Autorun status | Decisions still required | Exact next work |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

For every provider include these sections:

### A. Proven evidence
Only actually observed facts.

### B. Not collected
Tests that never ran or evidence that does not exist.

### C. Blockers
Use precise classes where applicable:

- `AUTH_REQUIRED_FOR_BASIC_CHAT`
- `AUTH_REQUIRED_FOR_HISTORY_OR_DURABLE_IDENTITY`
- `NO_AUTH_FOR_EPHEMERAL_CHAT_BUT_AUTH_REQUIRED_FOR_DURABLE_CHAT`
- `ENVIRONMENT_BLOCKED_NOT_TESTED`
- `PROVIDER_CHALLENGE_BLOCKED_NOT_TESTED`
- `PROVIDER_SPECIAL_COMPOSER_BLOCKED`
- `PROVIDER_SEND_CONTROL_UNRESOLVED`
- other exact evidence-backed blocker.

### D. Exact browser tests still required
Examples: authenticated conversation ID, reload durability, message IDs, exact code extraction, result-delivery confirmation, SPA A→B→A, different-chat tabs, same-chat duplicate tabs, Manual, established Autorun, new-chat Autorun.

### E. Architectural decisions still required
Keep design uncertainty separate from missing evidence. Include provider identity source, normalization/case policy, synthetic message identity if needed, composer write strategy, completion policy, delivery confirmation, duplicate-tab lease evidence, provider surface split, guest/auth capability split.

### F. Patch readiness
One of:

- `READY_FOR_PROVIDER_CLOSURE`
- `NEEDS_AUTHENTICATED_DISCOVERY`
- `NEEDS_ENVIRONMENT_RETRY`
- `NEEDS_PROVIDER_SPECIAL_COMPOSER_RESEARCH`
- `NEEDS_PROVIDER_SEND_CONTROL_RESEARCH`
- `EVIDENCE_INCOMPLETE`
- `READY_FOR_IMPLEMENTATION_DESIGN`

No provider becomes implementation-ready merely because a selector exists.

## 7. Provider-by-provider closure after matrix review

After operator review of the matrix, work ONE provider at a time.

For the selected provider:

1. close missing browser evidence;
2. resolve auth/environment/editor/send blockers;
3. freeze the provider adapter contract;
4. only then design/implement its patch;
5. run provider-specific regressions;
6. save checkpoint/results in GitHub;
7. move to another provider only when the current provider is closed.

The operator chooses provider order after the matrix exists.

## 8. Non-negotiable Ozon Bridge invariant

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

No provider adapter may introduce hidden retry, hidden pagination, polling, fan-out, implicit provider/model chaining, duplicate result Send, or cross-chat leakage.

Provider autodetection is independent from Ozon Autorun.

The web provider is determined by the actual web surface, not by the model selected inside an aggregator such as OpenRouter.

## 9. Current execution queue

### Collection phase

- [x] Claude — `AUTH_REQUIRED_FOR_BASIC_CHAT`
- [x] Kimi — public editor candidate; `PROVIDER_SEND_CONTROL_UNRESOLVED`
- [ ] **OpenRouter Chat — NEXT AND FINAL DISCOVERY TARGET**

### Immediately after OpenRouter

- [ ] STOP breadth discovery.
- [ ] Consolidate all raw/review evidence.
- [ ] Create pre-patch evidence/gap matrix.
- [ ] List missing evidence per provider.
- [ ] List blockers per provider.
- [ ] List exact follow-up browser tests.
- [ ] List unresolved architecture decisions.
- [ ] Assign patch-readiness status.
- [ ] Review matrix with operator.

### Only after matrix review

- [ ] Begin provider-by-provider closure.
- [ ] No production patch before selected provider reaches design readiness.

## 10. Current provider snapshot

### Gemini
`ENVIRONMENT_BLOCKED_NOT_TESTED`; provider DOM unavailable in Codex run. Not ready.

### Qwen
Guest DOM/composer/one-shot Send/ordered turns/completion observed; guest durable identity failed; authenticated `/c/<UUID>` candidate supplied by operator. Needs authenticated closure.

### DeepSeek
Provider reached `/sign_in`; `AUTH_REQUIRED_FOR_BASIC_CHAT`. Needs authenticated closure.

### Grok
Provider origin reached; usable chat DOM blank/incomplete. Needs environment/render retry.

### Meta AI
Guest positive signature and Send state observed; exact multiline composer read-back failed and no Send was made. Needs provider-specific composer research.

### Claude
Provider reached `/login`; `AUTH_REQUIRED_FOR_BASIC_CHAT`. Needs authenticated closure. Source report has CLAUDE-27 table/narrative mismatch preserved in review.

### Kimi
Public product DOM/editor candidate observed; deterministic enabled Send unresolved; basic Send auth boundary unresolved. Needs provider-specific Send-control research.

### OpenRouter Chat
Collection pending — NEXT and FINAL discovery target.

## 11. Authority rule

This document supersedes earlier breadth queues.

Unless the operator explicitly changes scope:

**OpenRouter → STOP discovery → pre-patch evidence/gap matrix → operator review → provider-by-provider closure → only then implementation patch.**
