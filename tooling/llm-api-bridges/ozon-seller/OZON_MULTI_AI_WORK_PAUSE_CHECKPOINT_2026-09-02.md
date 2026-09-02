# Ozon Bridge — Multi-AI work pause checkpoint

Date: 2026-09-02
Status: PAUSED_BY_OPERATOR
Branch: `design/ozon-multi-ai-autodetect-multichannel-2026-09-02`

## 1. Why this checkpoint exists

The operator explicitly paused the Multi-AI expansion work to switch to another task and return later.

This document is the authoritative resumption checkpoint. Do not restart broad provider discovery and do not begin implementation from an older roadmap state.

## 2. Exact stopping point

The scoped first-pass discovery collection is COMPLETE for the currently selected provider set.

The final discovery target, OpenRouter Chat, has been recorded and reviewed.

The next planned project action has NOT started yet.

Next mandatory action on return:

**CREATE THE PRE-PATCH EVIDENCE AND GAP MATRIX.**

Do not patch production before that matrix is created and reviewed with the operator.

## 3. Current selected provider evidence set

### Existing baseline adapters

- ChatGPT — accepted existing baseline adapter.
- Yandex Alice — accepted existing baseline adapter.

These are not re-discovered in the paused phase.

### Google Gemini

Current status: `ENVIRONMENT_BLOCKED_NOT_TESTED`.

Observed:
- Codex Browser Use failed before a Gemini document loaded;
- blocker `BROWSER_POLICY_UNVERIFIED`;
- no Gemini-specific provider/auth/DOM conclusion is valid from that run.

GitHub review:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/gemini/GEMINI_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Next work later:
- retry from the beginning in a browser environment that can actually load Gemini;
- then obtain full identity/composer/turn/lifecycle/code/delivery/SPA/tab evidence.

Patch readiness: `NEEDS_ENVIRONMENT_RETRY`.

### Qwen

Current status: guest flow studied; authenticated closure required.

Proven in guest flow:
- positive Qwen chat signature;
- textarea composer and scoped Send;
- one-shot plain Send;
- user/assistant structural turn roots;
- ordered DOM turns;
- Stop/generation state;
- completion with stability window.

Failed/blocked in guest flow:
- no durable exact conversation identity;
- `/c/guest` rejected as durable identity;
- reload of guest route led to `/auth`;
- no stable native message IDs observed;
- raw code/delivery/SPA/tab ownership not closed.

Operator later supplied authenticated route example:
`https://chat.qwen.ai/c/<UUID>`

This is a candidate exact identity source and must be verified in an authenticated pass.

GitHub review:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/qwen/QWEN_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Authenticated route note:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/qwen/QWEN_AUTHENTICATED_ROUTE_OBSERVATION_2026-09-02.md`

Patch readiness: `NEEDS_AUTHENTICATED_DISCOVERY`.

### DeepSeek

Current status: `AUTH_REQUIRED_FOR_BASIC_CHAT`.

Observed:
- trusted provider origin reached normally;
- `https://chat.deepseek.com/` redirected to `/sign_in`;
- real sign-in DOM rendered;
- no composer/Send/chat before authentication.

Raw evidence:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/deepseek/DEEPSEEK_BROWSER_DISCOVERY_RAW_2026-09-02.md`

Review:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/deepseek/DEEPSEEK_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Patch readiness: `NEEDS_AUTHENTICATED_DISCOVERY`.

### Grok

Current status: `ENVIRONMENT_BLOCKED_NOT_TESTED` / incomplete provider DOM.

Observed:
- `https://grok.com/` document reached;
- title Grok;
- only skip-link style body content available;
- zero usable composer/chat controls;
- no auth page, CAPTCHA or explicit provider challenge observed.

Raw evidence:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/grok/GROK_BROWSER_DISCOVERY_RAW_2026-09-02.md`

Review:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/grok/GROK_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Patch readiness: `NEEDS_ENVIRONMENT_RETRY`.

### Meta AI

Current status: `PROVIDER_SPECIAL_COMPOSER_BLOCKED`.

Observed:
- guest Meta AI surface available without immediate login redirect;
- positive composer/Send candidate DOM;
- one native text input;
- Send disabled when empty and enabled after text;
- required multiline probe collapsed to one line;
- exact read-back failed;
- no Send was clicked.

Therefore post-Send auth, identity, turns, completion, code, delivery, SPA and tabs remain unproven.

Raw evidence commit:
`26d71c85058f19ffc2fcb28b507ec7306afb63cd`

Raw file:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/meta_ai/META_AI_BROWSER_DISCOVERY_RAW_2026-09-02.md`

Review:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/meta_ai/META_AI_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Review commit:
`8bfe658e9a5da74e85bb95020097ca0aabf7882e`

Patch readiness: `NEEDS_PROVIDER_SPECIAL_COMPOSER_RESEARCH`.

### Claude

Current status: `AUTH_REQUIRED_FOR_BASIC_CHAT`.

Observed:
- `https://claude.ai/` redirected to `https://claude.ai/login`;
- real Claude login document rendered;
- Google/Apple/email/SSO login options;
- no chat/composer/Send/turn DOM before authentication.

Raw evidence commit:
`55ed1e1dbf227f9d5ef35495953a1e3e65836eb4`

Review commit:
`208f04fd824d5174dfa583701807d515e358c29c`

Raw/review files:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/claude/CLAUDE_BROWSER_DISCOVERY_RAW_2026-09-02.md`
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/claude/CLAUDE_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Evidence-quality note:
- source report contains a CLAUDE-27 table/narrative mismatch (`BLOCKED` versus `NOT_APPLICABLE`);
- review preserves this as a report-format inconsistency;
- artifact evidence itself was not obtained.

Patch readiness: `NEEDS_AUTHENTICATED_DISCOVERY`.

### Kimi

Current status: `PROVIDER_SEND_CONTROL_UNRESOLVED`.

Observed:
- Kimi document rendered at `https://www.kimi.com/`;
- public product/work surface visible;
- editor candidate `div.chat-input-editor[role="textbox"]`;
- login/history-sync controls visible;
- deterministic enabled Send was not resolved;
- no probe was inserted or sent;
- durable-history auth hint exists, but basic Send auth boundary remains unresolved.

Raw evidence commit:
`5c753a9e709888678219f4400b68e15d56558f34`

Review commit:
`5929de40af0e1460b45a26cc563ae4005d9c8879`

Raw/review files:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/kimi/KIMI_BROWSER_DISCOVERY_RAW_2026-09-02.md`
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/kimi/KIMI_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Evidence-quality note:
- source table marked KIMI-01..05 BLOCKED while terminal prose marked them PASS;
- review records this contradiction and relies on observed facts rather than silently rewriting raw evidence.

Patch readiness: `NEEDS_PROVIDER_SEND_CONTROL_RESEARCH`.

### OpenRouter Chat

Current status: `CONTENT_UNAVAILABLE / NOT TESTED` for executable chat.

Observed:
- provider document rendered at `https://openrouter.ai/chat`;
- title identified `AI Chat Playground`;
- navigation shell rendered;
- zero textarea/input/contenteditable composer elements;
- no model selected;
- no message sent;
- auth/model-selection/identity/turn/lifecycle evidence therefore unresolved;
- provider identity remains `openrouter_chat`, not the selected underlying model.

Raw evidence commit:
`d154afc1ec04feabc3947ffce061c5c5534f7a54`

Review commit:
`e28c339a8ee379455a2a7f6c57ce49b19ab1cb9b`

Raw/review files:
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/openrouter/OPENROUTER_CHAT_BROWSER_DISCOVERY_RAW_2026-09-02.md`
`tooling/llm-api-bridges/ozon-seller/research/multi-ai/openrouter/OPENROUTER_CHAT_BROWSER_DISCOVERY_REVIEW_2026-09-02.md`

Evidence-quality note:
- source checklist marks OPENROUTER-01/02 BLOCKED while narrative closes them PASS;
- review preserves the raw contradiction and treats live URL/surface classification as proven while OPENROUTER-03..40 remain blocked.

Patch readiness: `NEEDS_ENVIRONMENT_RETRY`.

## 4. Discovery phase final progress

Scoped discovery targets required before pause:

- [x] Gemini record
- [x] Qwen record
- [x] DeepSeek record
- [x] Grok record
- [x] Meta AI record
- [x] Claude record
- [x] Kimi record
- [x] OpenRouter Chat record

Additional providers previously discussed but explicitly removed from current scope are NOT pending work.

Do not restart Perplexity, Copilot, Poe, Mistral, GigaChat, Duck.ai, Lumo or T3 unless operator reopens scope.

## 5. Work that has NOT started

The consolidated PRE-PATCH EVIDENCE AND GAP MATRIX has not yet been created.

No implementation patch for the new providers has started.

No production provider registry/manifest expansion has started from this discovery phase.

No generic-core multi-provider refactor should be considered authorized merely by completion of discovery.

## 6. Exact resumption procedure

When the operator returns to this project:

1. read this pause checkpoint;
2. read the current frozen roadmap;
3. do NOT launch another broad provider discovery;
4. create `OZON_MULTI_AI_PRE_PATCH_EVIDENCE_GAP_MATRIX_2026-09-02.md` from the collected raw/review evidence;
5. for every provider separate:
   - proven evidence;
   - evidence never collected;
   - exact blocker;
   - exact browser tests still required;
   - architecture/design decisions still unresolved;
   - patch-readiness status;
6. review that matrix with the operator;
7. operator chooses which provider to close first;
8. close that provider's evidence gaps;
9. freeze its adapter contract;
10. only then design/implement that provider's patch;
11. run provider-specific regressions and save checkpoint;
12. move to another provider only after current provider closure.

## 7. Pre-patch matrix required statuses

Each provider must eventually receive one of:

- `READY_FOR_PROVIDER_CLOSURE`
- `NEEDS_AUTHENTICATED_DISCOVERY`
- `NEEDS_ENVIRONMENT_RETRY`
- `NEEDS_PROVIDER_SPECIAL_COMPOSER_RESEARCH`
- `NEEDS_PROVIDER_SEND_CONTROL_RESEARCH`
- `EVIDENCE_INCOMPLETE`
- `READY_FOR_IMPLEMENTATION_DESIGN`

No provider is implementation-ready merely because a composer selector or route was found.

## 8. Safety invariants preserved during pause

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

No future adapter may introduce hidden retry, hidden pagination, polling, provider/model fan-out, duplicate result Send or cross-chat leakage.

Provider autodetection remains independent from Ozon Autorun.

For aggregators such as OpenRouter, web provider identity is the web surface (`openrouter_chat`), not the underlying selected model.

## 9. Resume marker

`MULTI_AI_DISCOVERY_SCOPE_COMPLETE_PAUSED_BEFORE_PRE_PATCH_MATRIX`

On return, resume from this marker only.
