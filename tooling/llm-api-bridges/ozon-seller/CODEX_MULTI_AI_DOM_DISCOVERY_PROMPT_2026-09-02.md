# Codex task — Ozon Bridge Multi-AI DOM discovery, baseline + Tier A only

Date: 2026-09-02  
Task type: browser research and sanitized evidence collection  
Production code changes: forbidden  
Active scope: existing baseline + Tier A only

## 0. Read this before doing anything

Work in repository:

`MaksimUnimax/blood_sand`

Use the exact design commit supplied by the operator from branch:

`design/ozon-multi-ai-autodetect-multichannel-2026-09-02`

Before opening any AI provider page, verify that these exact files exist at this exact ref:

1. `tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md`
2. `tooling/llm-api-bridges/ozon-seller/CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md`
3. `tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_AUTODETECT_MULTICHANNEL_PATCH_2026-09-02.md`
4. `tooling/llm-api-bridges/ozon-seller/CODEX_MULTI_AI_TIER_A_SCOPE_CORRECTION_2026-09-02.md`

Read all four. The first three are the active authority set. The fourth records the historical scope correction and agrees with them.

If an older document, roadmap, previous branch, chat message or local note mentions Tier B/C, ignore that older scope. The active scope is explicitly baseline + Tier A only.

If any required file is missing from the exact operator-supplied commit, stop before browser discovery and report the exact missing path and ref. Do not reconstruct a missing prompt from memory.

## 1. Objective

Collect enough live browser and DOM evidence to determine whether Ozon Bridge can safely support each approved web-AI provider for:

- automatic provider detection without normal-path operator selection;
- deterministic exact-conversation binding;
- safe start-prompt insertion and exactly-once Send;
- Manual Ozon code-block discovery and result delivery;
- Ozon Autorun where the provider evidence is sufficient;
- new empty chat bootstrap;
- multiple independent conversations/providers operating in parallel;
- same-conversation ownership across duplicate tabs;
- SPA conversation switching without stale DOM or cross-channel delivery.

This is a research-only pass. Do not implement adapters, provider registry, identity code, storage migrations, popup changes or manifest permissions.

## 2. Approved provider list

### Existing baseline adapters

1. ChatGPT — `https://chatgpt.com/`
2. Yandex Alice — `https://alice.yandex.ru/`

### Tier A — mandatory discovery targets

3. Claude — `https://claude.ai/`
4. Google Gemini — `https://gemini.google.com/`
5. DeepSeek — `https://chat.deepseek.com/`
6. Qwen — `https://chat.qwen.ai/`
7. Kimi — `https://www.kimi.com/`
8. Grok — `https://grok.com/`
9. Mistral Vibe / Le Chat — `https://chat.mistral.ai/`
10. Microsoft Copilot — `https://copilot.com/`
11. Perplexity — `https://www.perplexity.ai/`
12. Meta AI — start at `https://meta.ai/` and record the actual redirect/origin
13. GigaChat — `https://giga.chat/`
14. Duck.ai — `https://duck.ai/`
15. OpenRouter Chat — `https://openrouter.ai/chat`
16. Poe — `https://poe.com/`
17. Proton Lumo — `https://lumo.proton.me/`
18. T3 Chat — `https://t3.chat/`

Do not begin or continue Tier B/C browser discovery. Preserve already committed valid Tier B/C evidence only as `OUT_OF_CURRENT_SCOPE`; spend no additional browser actions on it.

## 3. Branch and write boundaries

Create or reuse this research branch from the exact operator-supplied design commit:

`research/ozon-multi-ai-tier-a-dom-2026-09-02`

All new research files must be written under:

`tooling/llm-api-bridges/ozon-seller/research/multi-ai/`

Allowed repository changes during this task:

- sanitized Markdown research notes;
- sanitized JSON structural evidence;
- progress and support-matrix files;
- harmless local research helper scripts under the research directory, if needed.

Forbidden changes:

- accepted production extension files;
- `manifest.json` or host permissions;
- production `shared/` modules;
- `content_script.js`;
- `service_worker.js`;
- popup files;
- Ozon provider/contract/entitlement code;
- release artifacts or candidate builds;
- production tests changed to make unsupported behavior appear supported.

Before each commit, verify that the diff contains research files only.

## 4. Safety and privacy rules

Do not collect or commit:

- cookies;
- authorization headers or tokens;
- localStorage/sessionStorage values;
- account IDs, email addresses, phone numbers or other personal data;
- complete conversation histories;
- complete raw page HTML;
- network request/response bodies containing private data;
- Ozon credentials or Ozon API results;
- hidden system prompts;
- private uploaded files.

Use structural, bounded and sanitized evidence only:

- origin, pathname pattern and redirect chain without secret query parameters;
- tag names and stable attributes relevant to adapter design;
- bounded DOM ancestor/descendant shape;
- selector candidates with stability notes;
- role/message/composer/Send/Stop state classifications;
- hashes or non-sensitive generated probe nonces;
- sanitized screenshots only when necessary and only after checking visible personal data.

Do not execute Ozon business requests during discovery.

Do not create paid subscriptions, purchase anything, change account settings, publish content, share chats or perform destructive actions.

Use existing authenticated sessions when already available. If authentication or a paywall blocks access, do not create an account without explicit operator instruction. Record `AUTH_REQUIRED / NOT TESTED` with the exact public state reached.

## 5. Harmless probe prompts

Use harmless, unique probe nonces per provider and test case. Never reuse a nonce between providers.

Recommended text-generation probe:

```text
Reply with exactly this plain sentence and nothing else:
OZON_BRIDGE_DOM_PROBE_<PROVIDER>_<NONCE>
```

Recommended code-block probe:

```text
Return exactly one fenced code block and no explanation. The block must contain exactly these two lines:
OZON_API_V1
{"operation":"__dom_probe_only__","params":{"nonce":"<NONCE>"}}

This is inert text for DOM research. Do not execute tools or external actions.
```

Recommended multi-turn probe:

```text
Reply with exactly:
TURN_TWO_<PROVIDER>_<NONCE>
```

The `__dom_probe_only__` operation is intentionally invalid and must never be sent to Ozon. It exists only to inspect code-block DOM and exact raw-text extraction.

Send every browser probe at most once unless the procedure explicitly creates a separate test conversation with a new nonce.

## 6. Required top-level files

Create:

```text
tooling/llm-api-bridges/ozon-seller/research/multi-ai/
  PROGRESS.md
  SUPPORT_MATRIX.md
  EVIDENCE_INDEX.md
  OPEN_BLOCKERS.md
```

### `PROGRESS.md`

Maintain a durable chronological work log. Before or together with every chat update, record:

- exact commit/ref used;
- current provider;
- pages/actions completed;
- evidence files created;
- preliminary verdict;
- blocker or next action;
- commit SHA after each checkpoint.

### `SUPPORT_MATRIX.md`

One row per in-scope provider with at least:

- provider ID and label;
- actual origin/surface;
- authentication state;
- autodetection verdict;
- conversation identity verdict;
- Work/Manual verdict;
- existing-chat Autorun verdict;
- new-chat Autorun verdict;
- multichannel verdict;
- delivery-confirmation verdict;
- final support recommendation;
- evidence package path.

### `EVIDENCE_INDEX.md`

List every sanitized evidence file and what question it supports.

### `OPEN_BLOCKERS.md`

Record unresolved issues without silently filling gaps.

## 7. Required per-provider package

For each provider create:

```text
tooling/llm-api-bridges/ozon-seller/research/multi-ai/<provider_id>/
  PROGRESS.md
  URL_AND_SURFACE.md
  PROVIDER_DETECTION.md
  CONVERSATION_IDENTITY.md
  DOM_CONTRACT.md
  START_SEND_LIFECYCLE.md
  TURN_AND_CODE_EXTRACTION.md
  DELIVERY_CONFIRMATION.md
  MULTICHANNEL_AND_SPA.md
  SUPPORT_RECOMMENDATION.md
  evidence/
    sanitized-*.json
    sanitized-*.md
```

Use stable lowercase provider IDs such as:

```text
chatgpt
alice
claude
gemini
deepseek
qwen
kimi
grok
mistral_chat
copilot
perplexity
meta_ai
gigachat
duck_ai
openrouter_chat
poe
proton_lumo
t3_chat
```

## 8. Calibration pass: ChatGPT and Alice first

Before researching new providers, inspect the accepted ChatGPT and Alice behavior as calibration.

For each baseline provider:

1. Record the current trusted origin and route forms.
2. Confirm existing conversation identity evidence.
3. Record current assistant/user turn selectors and message IDs.
4. Record composer, Send, Stop/generating and post-send-ready evidence.
5. Record exact code-block and raw-code extraction evidence.
6. Record existing Work/Manual and Autorun assumptions.
7. Record same-conversation duplicate-tab behavior and SPA switch behavior.
8. Identify which parts are genuinely provider-generic and which are ChatGPT/Alice-specific.

Do not modify the existing adapter. Baseline evidence is used to compare Tier A and prevent accidental regression.

## 9. Provider discovery procedure

Perform the following procedure for every Tier A provider where the available account state permits it.

### Phase A — URL, redirect and surface

1. Open the exact start URL from section 2.
2. Record the final origin and pathname after redirects.
3. Record whether a login, marketing, home, chat or workbench page is shown.
4. Remove or redact secret/sensitive query parameters.
5. Determine whether the origin hosts one chat surface or several materially different surfaces.
6. Record safe candidate manifest match patterns, but do not modify the manifest.
7. Record whether hostname/path alone uniquely identifies the provider or only creates a candidate.

Output: `URL_AND_SURFACE.md` plus sanitized URL evidence.

### Phase B — positive provider DOM detection

Find stable positive evidence that the actual chat application is loaded. Do not rely on localized text alone.

Inspect:

- application/chat root;
- composer root;
- message list/thread root;
- stable data/test/role attributes;
- provider-specific structural landmarks;
- new-chat versus established-chat differences;
- loading states and delayed hydration;
- iframe/shadow-DOM/top-frame behavior.

Define what content should return for:

- `CONFIRMED`;
- `PENDING_PAGE_READY`;
- `AMBIGUOUS`;
- `CONFLICT`;
- `UNSUPPORTED`;
- `CONTENT_UNAVAILABLE`.

Record whether an operator fallback could ever be necessary and the exact constrained candidate set.

Output: `PROVIDER_DETECTION.md` and sanitized DOM-structure evidence.

### Phase C — existing conversation identity

Open or create an established conversation and determine:

- route/path/canonical format;
- exact conversation ID source;
- whether the ID is UUID, slug, numeric, opaque or composite;
- case sensitivity;
- normalization rules that are safe;
- whether canonical URL agrees with route;
- whether an active sidebar/history item supplies corroboration;
- whether router state or DOM attributes provide safer evidence;
- whether several conversations remain mounted/hidden;
- identity behavior on reload and back/forward navigation;
- conflict behavior if route and active DOM disagree.

Observe the ID over several events/intervals and record stability. Do not guess case-insensitivity.

Output: `CONVERSATION_IDENTITY.md`.

### Phase D — new empty chat identity timing

Start a genuinely new empty chat where safe.

Before sending:

- record current route and identity state;
- record existing ordered user/assistant message IDs;
- record composer/Send readiness.

Send one harmless probe prompt with a unique nonce.

Observe and timestamp relative ordering of:

- click/submit;
- composer clear/change;
- new user turn appearance;
- URL/path/canonical change;
- conversation ID appearance;
- assistant placeholder appearance;
- generation start;
- generation completion;
- final stable route/ID.

Determine the earliest safe identity-freeze boundary and whether direct new-chat Autorun can bind early enough not to miss the first assistant turn.

Output: relevant sections in `CONVERSATION_IDENTITY.md` and `START_SEND_LIFECYCLE.md`.

### Phase E — ordered turns and stable IDs

Using at least two harmless turns, determine:

- one ordered turn traversal in semantic/document order;
- user versus assistant role classification;
- stable message ID source;
- exact text extraction;
- visibility/current-conversation filters;
- whether virtualized/unmounted turns occur;
- whether message nodes/IDs change during streaming;
- generation-complete evidence;
- behavior when regenerating/editing/branching, if visible and safe to inspect without destructive actions.

Never reconstruct chronology by concatenating separate assistant and user arrays.

Output: `TURN_AND_CODE_EXTRACTION.md` and sanitized turn records.

### Phase F — code block and exact raw text

Send the inert code-block probe exactly once in a dedicated or disposable test conversation.

Determine:

- code block container;
- language/header UI separation;
- copy button location;
- exact raw-code node or extraction method;
- whether markdown fences are present in DOM text;
- whether line numbers or UI labels contaminate text;
- how to bind a Manual Ozon button to the correct completed assistant message/code block;
- how to exclude hidden/stale/other-conversation code blocks;
- whether Copy is available before generation completes;
- stable geometry/anchor behavior after re-render.

Output: `TURN_AND_CODE_EXTRACTION.md` and bounded sanitized code-block DOM evidence.

### Phase G — composer and exactly-once Send

Determine:

- current composer root and editable node;
- textarea/contenteditable/framework-controlled behavior;
- compatible text insertion strategy and required events;
- how to read canonical composer text;
- how to detect non-empty conflicting operator text;
- one unique active Send control;
- disabled Send state;
- Stop/generating control;
- composer replacement/detachment behavior;
- post-click evidence;
- exactly-one new user-turn evidence;
- whether composer-empty alone is reliable;
- how to reconcile unknown click outcome without a second click.

Do not perform repeated clicks to “see what happens.” Every send test uses a new nonce and one intentional click.

Output: `START_SEND_LIFECYCLE.md` and `DOM_CONTRACT.md`.

### Phase H — result-delivery confirmation

Using harmless plain text that represents a result, determine the strongest deterministic confirmation policy available after a committed insertion/click.

Consider combinations of:

- composer cleared after committed click;
- one new user turn matching exact text or hash;
- Send-to-Stop transition;
- Stop-to-ready transition;
- stable provider-specific ready state;
- generation started/finished evidence;
- active conversation unchanged;
- composer remains attached/current.

Classify duplicate-click risk. Do not assume ChatGPT microphone or Alice-ready semantics apply.

Output: `DELIVERY_CONFIRMATION.md`.

### Phase I — SPA conversation switch A → B → A

Create/use two harmless conversations A and B in the same provider.

Record:

1. identity and current DOM anchors in A;
2. navigation to B through the normal UI;
3. route epoch/URL/active-sidebar changes;
4. whether A message/composer nodes remain connected, hidden or cached;
5. current DOM anchors in B;
6. navigation back to A;
7. whether node identities are reused/replaced;
8. which evidence must invalidate a stale provider grant/channel lease before insertion or click.

Determine how a generic observer can distinguish current-channel nodes from stale mounted nodes.

Output: `MULTICHANNEL_AND_SPA.md`.

### Phase J — two different conversations in parallel

Open A and B in separate tabs. Determine:

- whether both tabs expose independent page/runtime instances;
- whether each tab keeps its own route and composer;
- which exact evidence binds each tab to one channel;
- whether background/inactive-tab DOM or generation behavior changes;
- whether a result prepared for A could accidentally match B selectors;
- what worker/content checks prevent cross-channel action.

Output: `MULTICHANNEL_AND_SPA.md`.

### Phase K — same conversation in two tabs

Open the exact same conversation in two tabs where safe.

Determine:

- whether the exact same conversation ID is visible in both;
- whether both tabs can render active composers;
- what evidence proves the original owner still displays the channel;
- how a second tab should remain passive;
- what changes after closing or navigating the owner tab away;
- whether the second tab can safely take a new lease epoch without recreating the logical run/delivery;
- any provider-specific synchronization or duplicate-message behavior.

Output: `MULTICHANNEL_AND_SPA.md`.

### Phase L — support recommendation

Give an evidence-based verdict. Do not call a provider supported from selectors alone.

Allowed final verdict taxonomy:

- `SUPPORTED_NOW`;
- `SUPPORTED_AFTER_ADAPTER_SPECIAL_CASE`;
- `MANUAL_ONLY`;
- `AUTORUN_ONLY`;
- `UNSAFE/UNSUPPORTED`;
- `AUTH_REQUIRED / NOT TESTED`;
- `CLOSED / NOT TARGETED` only when applicable to an in-scope surface.

Also provide capability-specific fields:

```text
provider_autodetect
existing_chat_identity
new_chat_identity
manual_work
existing_chat_autorun
new_chat_autorun
exact_code_extraction
safe_delivery
spa_isolation
same_chat_duplicate_tab
```

Use `SUPPORTED`, `LIMITED`, `UNSAFE`, `UNKNOWN` or `NOT_TESTED` for each capability and cite the local evidence file/section.

Output: `SUPPORT_RECOMMENDATION.md` and top-level matrix update.

## 10. Evidence schema

For every meaningful DOM observation, store a sanitized JSON record similar to:

```json
{
  "schema_version": 1,
  "provider_id": "deepseek",
  "captured_at": "2026-09-02T00:00:00Z",
  "test_case": "new_chat_identity_timing",
  "origin": "https://chat.deepseek.com",
  "pathname_pattern": "/a/chat/s/<opaque-id>",
  "page_state": "established_chat",
  "probe_nonce_hash": "sha256:...",
  "observations": [
    {
      "event": "conversation_identity_observed",
      "relative_ms": 420,
      "source": "pathname",
      "value_shape": "opaque-lowercase-token",
      "stable_samples": 5
    }
  ],
  "dom_evidence": {
    "chat_root": {
      "tag": "main",
      "stable_attributes": ["..."],
      "selector_candidate": "...",
      "localization_independent": true
    }
  },
  "sensitive_data_removed": true
}
```

Do not store raw full HTML. Keep selector candidates and bounded ancestor/child descriptions sufficient to implement and test an adapter.

## 11. Provider-specific questions that must be answered

For every provider, answer all of these or explicitly mark `UNKNOWN/NOT_TESTED`:

1. What exact final origin and surface are used?
2. Does hostname/path uniquely select one provider adapter?
3. What stable positive DOM signature proves the chat app is loaded?
4. What are new-chat and established-chat routes?
5. When does conversation identity first appear?
6. Is the identity case-sensitive?
7. Which independent signals corroborate the active conversation?
8. Can hidden or previous conversations remain mounted?
9. What stable message IDs exist?
10. How are roles and ordered turns identified?
11. How is completion/generation state proven?
12. How is exact code extracted without UI contamination?
13. How is the current composer found and written safely?
14. How is one unique active Send found?
15. What is the exactly-once commit/reconciliation boundary?
16. How is result delivery deterministically confirmed?
17. What happens on A → B → A SPA navigation?
18. What happens for A and B in separate tabs?
19. What happens for the same conversation in two tabs?
20. Can direct new-chat Autorun bind early enough to capture the first response?
21. Which capabilities require provider-specific special cases?
22. Which capability is unsafe and why, if any?

## 12. Checkpoint and commit discipline

Commit after every 1–3 completed providers. Do not wait until all 18 are finished.

Each checkpoint must:

1. update top-level `PROGRESS.md`;
2. update each affected provider `PROGRESS.md`;
3. update `SUPPORT_MATRIX.md` with preliminary or final verdicts;
4. update `EVIDENCE_INDEX.md`;
5. verify the diff contains research files only;
6. use a descriptive commit message;
7. record the commit SHA in top-level `PROGRESS.md`.

Suggested order:

1. ChatGPT + Alice calibration;
2. Claude + Gemini;
3. DeepSeek + Qwen;
4. Kimi + Grok;
5. Mistral + Copilot;
6. Perplexity + Meta AI;
7. GigaChat + Duck.ai;
8. OpenRouter Chat + Poe;
9. Proton Lumo + T3 Chat;
10. final matrix and cross-provider comparison.

Do not claim completion for providers that were only opened but not behaviorally probed.

## 13. Handling blockers

### Authentication or paywall

Record:

- public/final URL reached;
- visible non-sensitive page state;
- whether provider detection can still be researched publicly;
- which required capabilities were not testable;
- verdict `AUTH_REQUIRED / NOT TESTED` where appropriate.

Do not sign up or pay without explicit operator instruction.

### Rate limit or temporary provider error

Record the exact visible non-sensitive condition and continue other providers. Do not repeatedly send probes.

### Ambiguous identity or unsafe Send

Stop that capability test before any duplicate-click risk. Record `UNSAFE` or `UNKNOWN`; do not invent a workaround.

### Site unavailable or redirected to a different product

Record actual redirect/origin and classify the actual surface. Do not silently substitute a different third-party site.

### Unexpected Tier B/C reference

Treat it as stale scope. Record it once in `PROGRESS.md` as ignored/superseded and continue baseline + Tier A only.

## 14. Final report

When all accessible providers are processed, produce:

1. completed `SUPPORT_MATRIX.md` for exactly 18 in-scope providers;
2. per-provider evidence packages;
3. cross-provider comparison of reusable generic contracts versus required special cases;
4. exact recommended implementation batch order;
5. list of providers/capabilities that must remain unsupported or limited;
6. manifest-host candidate list derived from evidence, without changing the manifest;
7. conversation identity policy table;
8. composer/Send/delivery policy table;
9. multichannel and duplicate-tab risk table;
10. open blockers requiring operator accounts or additional evidence.

Stop after the discovery report. Do not implement production code or build an extension candidate. Wait for architecture review and a separate implementation instruction.

## 15. Required first response to the operator

After verifying the exact ref and files, report only:

```text
Verified repository/ref: <exact commit SHA>
Authority files: PASS (4/4)
Active scope: baseline + Tier A only (18 providers total)
Research branch: <branch>
Production files changed: no
Next provider batch: ChatGPT + Alice calibration
```

Then begin the browser-discovery work and maintain durable progress in the repository.