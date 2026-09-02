# Ozon Bridge — Multi-AI research priority roadmap

Date: 2026-09-02
Status: **PAUSED_BY_OPERATOR**
Branch: `design/ozon-multi-ai-autodetect-multichannel-2026-09-02`

## 1. Freeze notice — authoritative

The operator explicitly paused this roadmap to switch to other work and return later.

Do not continue this roadmap until the operator explicitly resumes the Multi-AI project.

While paused:

- do not start another provider discovery;
- do not add substitute providers;
- do not start the pre-patch matrix unless the operator resumes this work;
- do not implement new provider adapters;
- do not modify production provider routing/manifest for this expansion;
- do not start generic-core refactoring under authority of this roadmap;
- do not perform authenticated closure or environment retries for the collected providers.

The durable work-history/resumption authority is:

`tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_WORK_PAUSE_CHECKPOINT_2026-09-02.md`

Resume marker:

`MULTI_AI_DISCOVERY_SCOPE_COMPLETE_PAUSED_BEFORE_PRE_PATCH_MATRIX`

## 2. Discovery progress at freeze

The currently selected discovery scope is COMPLETE.

Collected/reviewed provider set affecting the future pre-patch matrix:

- [x] Google Gemini — environment/browser-policy blocked before provider DOM; not provider-tested.
- [x] Qwen — guest flow evidence; guest durable identity failed; authenticated `/c/<UUID>` candidate supplied for future verification.
- [x] DeepSeek — `AUTH_REQUIRED_FOR_BASIC_CHAT`; `/sign_in` observed.
- [x] Grok — provider document reached; executable chat DOM blank/incomplete.
- [x] Meta AI — guest composer/autodetection candidate; provider-specific multiline composer blocker; no Send performed.
- [x] Claude — `AUTH_REQUIRED_FOR_BASIC_CHAT`; `/login` observed.
- [x] Kimi — public editor candidate; deterministic enabled Send unresolved; no probe sent.
- [x] OpenRouter Chat — `/chat` playground/navigation shell rendered; no composer/model/chat execution state; provider remains `openrouter_chat` regardless of underlying model.

Existing accepted baselines remain:

- ChatGPT;
- Yandex Alice.

Providers explicitly removed from the current discovery scope remain out of scope unless operator reopens them:

- Perplexity;
- Microsoft Copilot;
- Poe;
- Mistral Vibe / Le Chat;
- GigaChat;
- Duck.ai;
- Proton Lumo;
- T3 Chat;
- any other not explicitly re-authorized provider.

## 3. Last completed discovery checkpoint

OpenRouter Chat was the final requested discovery target.

Raw evidence:

`tooling/llm-api-bridges/ozon-seller/research/multi-ai/openrouter/OPENROUTER_CHAT_BROWSER_DISCOVERY_RAW_2026-09-02.md`

Review:

`tooling/llm-api-bridges/ozon-seller/research/multi-ai/openrouter/OPENROUTER_CHAT_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Raw commit:

`d154afc1ec04feabc3947ffce061c5c5534f7a54`

Review commit:

`e28c339a8ee379455a2a7f6c57ce49b19ab1cb9b`

## 4. Next step when operator resumes

Do NOT resume with another browser provider prompt.

The next mandatory artifact is:

`tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_PRE_PATCH_EVIDENCE_GAP_MATRIX_2026-09-02.md`

It must be created from the already collected evidence and must separate, for each relevant provider:

1. proven evidence;
2. evidence never collected;
3. exact blocker;
4. exact browser tests still required;
5. unresolved architecture/design decisions;
6. patch-readiness status.

Required matrix columns include at least:

| Provider | Evidence collected | Evidence missing | Auth requirement | Environment/provider blocker | Identity status | Composer/Send status | Turn/completion status | Code extraction status | Delivery status | SPA/tabs status | Manual status | Autorun status | Decisions still required | Exact next work |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Patch-readiness values:

- `READY_FOR_PROVIDER_CLOSURE`
- `NEEDS_AUTHENTICATED_DISCOVERY`
- `NEEDS_ENVIRONMENT_RETRY`
- `NEEDS_PROVIDER_SPECIAL_COMPOSER_RESEARCH`
- `NEEDS_PROVIDER_SEND_CONTROL_RESEARCH`
- `EVIDENCE_INCOMPLETE`
- `READY_FOR_IMPLEMENTATION_DESIGN`

No provider is implementation-ready merely because a URL or selector exists.

## 5. Work after matrix review

Only after the operator reviews the pre-patch matrix:

1. operator chooses one provider;
2. close that provider's missing browser evidence;
3. resolve auth/environment/editor/send blockers;
4. freeze its adapter contract;
5. only then design/implement its patch;
6. run provider-specific regressions;
7. record raw/review/checkpoint in GitHub;
8. move to another provider only after current provider closure.

Do not patch all providers in one batch.

## 6. Non-negotiable safety invariant

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

No provider adapter may introduce:

- hidden retry;
- hidden pagination;
- polling;
- provider/model fan-out;
- implicit provider chaining;
- duplicate result Send;
- cross-chat prompt/result leakage.

Provider autodetection remains independent from Ozon Autorun.

For aggregator web products, provider identity is the actual web surface, not the underlying selected model.

## 7. Resume authority

On return, read these two files first:

1. `OZON_MULTI_AI_WORK_PAUSE_CHECKPOINT_2026-09-02.md`
2. `OZON_MULTI_AI_RESEARCH_PRIORITY_ROADMAP_2026-09-02.md`

Then resume from:

**PRE-PATCH EVIDENCE AND GAP MATRIX**

Do not resume from an older provider-discovery queue.
