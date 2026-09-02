# Codex scope correction — Multi-AI DOM discovery: baseline + Tier A only

Date: 2026-09-02
Status: AUTHORITATIVE SCOPE OVERRIDE

This file supersedes only the provider-list/scope portions of:

`tooling/llm-api-bridges/ozon-seller/CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md`

All safety, sanitization, DOM evidence, behavioral-probe, checkpointing, file-layout and no-production-change requirements from the original prompt remain in force.

## 1. Corrected provider scope

Continue discovery only for the existing baseline providers and Tier A.

### Existing baseline adapters

1. ChatGPT — `https://chatgpt.com/`
2. Yandex Alice — `https://alice.yandex.ru/`

### Tier A — mandatory

3. Claude — `https://claude.ai/`
4. Google Gemini — `https://gemini.google.com/`
5. DeepSeek — `https://chat.deepseek.com/`
6. Qwen — `https://chat.qwen.ai/`
7. Kimi — `https://www.kimi.com/`
8. Grok — `https://grok.com/`
9. Mistral Vibe — `https://chat.mistral.ai/`
10. Microsoft Copilot — `https://copilot.com/`
11. Perplexity — `https://www.perplexity.ai/`
12. Meta AI — start at `https://meta.ai/` and record actual redirect/origin
13. GigaChat — `https://giga.chat/`
14. Duck.ai — `https://duck.ai/`
15. OpenRouter Chat — `https://openrouter.ai/chat`
16. Poe — `https://poe.com/`
17. Proton Lumo — `https://lumo.proton.me/`
18. T3 Chat — `https://t3.chat/`

## 2. Tier B / Tier C handling

Do not begin or continue browser discovery for Tier B or Tier C providers.

If evidence for a Tier B/C provider was already collected before this correction:

- preserve already committed sanitized evidence;
- mark it `OUT_OF_CURRENT_SCOPE` in its local recommendation/progress entry;
- do not spend additional browser actions or implementation analysis on it;
- do not include it in the recommended production implementation batch;
- do not add production permissions, registry entries or adapters for it.

Do not delete already collected valid research merely to satisfy this correction.

## 3. Required output matrix

The authoritative support matrix for this phase contains only:

- ChatGPT;
- Yandex Alice;
- the sixteen Tier A candidates listed above.

Use the existing verdict taxonomy:

- `SUPPORTED_NOW`
- `SUPPORTED_AFTER_ADAPTER_SPECIAL_CASE`
- `MANUAL_ONLY`
- `AUTORUN_ONLY`
- `UNSAFE/UNSUPPORTED`
- `AUTH_REQUIRED / NOT TESTED`
- `CLOSED / NOT TARGETED` only where applicable to an in-scope provider

No provider may be called supported from selectors alone. Safe support still requires deterministic conversation ownership, stable turns, exact code extraction, safe composer insertion, unique one-shot Send, generation/completion evidence, SPA switching safety and deterministic delivery confirmation.

## 4. Additional evidence required for autodetection and multichannel patch

For every in-scope provider, add these fields/findings to the existing discovery package.

### Provider autodetection

- trusted exact origins and redirect origins;
- whether hostname alone uniquely identifies the provider surface;
- stable positive DOM signature proving the actual chat app is loaded;
- any shared/multi-surface origin ambiguity;
- result of worker URL candidate versus content DOM probe comparison;
- candidate status: `CONFIRMED`, `PENDING_PAGE_READY`, `AMBIGUOUS`, `CONFLICT`, `UNSUPPORTED`, or `CONTENT_UNAVAILABLE`;
- whether an operator fallback would ever be needed and what the constrained candidate set would be.

### Conversation identity

- provider-specific conversation ID case sensitivity;
- route/canonical/DOM/sidebar evidence combination needed for confirmation;
- when ID appears relative to first Send and first assistant response;
- whether ID can change during ordinary SPA navigation;
- whether multiple visible/hidden conversations coexist in DOM;
- whether a new ID remains stable across at least several observations/events;
- whether direct new-chat Autorun can bind early enough not to miss the first assistant response.

### Multichannel ownership

- behavior when the same conversation is opened in two tabs;
- behavior when two different conversations are opened in the same provider;
- SPA switch from conversation A to B and back;
- whether old composer/turn nodes remain connected after switching;
- whether each tab can be tied to a distinct page/runtime instance;
- what exact evidence can prove the original owner tab still displays the channel before denying/rebinding a second tab.

### Start and delivery lifecycle

- stable composer and Send before first conversation ID exists;
- exactly-one Send evidence for the start prompt;
- post-click evidence that is strong enough for commit-before-click recovery;
- whether composer clearing alone is reliable;
- exactly-one new user-turn evidence;
- provider-specific post-generation ready evidence;
- whether result delivery can be confirmed without a duplicate-click risk.

## 5. Architecture authority

Also read and follow:

`tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_AUTODETECT_MULTICHANNEL_PATCH_2026-09-02.md`

The discovery pass remains research-only. Do not implement the provider registry, autodetection handshake, v2 channel identity, channel lease, unified bootstrap or any production adapter during this pass.

## 6. Immediate continuation instruction

1. Update `PROGRESS.md` with this scope correction.
2. Stop any unstarted Tier B/C work.
3. Finish baseline + Tier A discovery packages.
4. Add autodetection, new-chat identity timing and multichannel evidence required above.
5. Commit after every 1–3 providers.
6. Stop after the baseline + Tier A discovery report; wait for architecture review before implementation.
