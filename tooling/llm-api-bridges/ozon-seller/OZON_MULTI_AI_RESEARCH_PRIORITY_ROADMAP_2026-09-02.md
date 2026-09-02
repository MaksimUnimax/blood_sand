# Ozon Bridge — Multi-AI research priority roadmap

Date: 2026-09-02
Status: ACTIVE_RESEARCH_ROADMAP
Scope: Tier A new providers only; ChatGPT and Yandex Alice remain accepted baseline adapters and are not re-ranked for new-provider discovery.

## 1. Governing workflow

The project uses two provider passes.

### PASS 1 — breadth first

Research every Tier A provider once before doing any provider-specific implementation or deep authenticated closure.

For every provider the first pass must establish at minimum:

- public/basic browser access state;
- whether authentication is required for basic chat;
- whether authentication is required specifically for durable conversation identity/history;
- positive provider/chat DOM candidate;
- conversation identity candidate or blocker;
- composer/Send candidate or blocker;
- exact unresolved evidence needed later.

A provider that hits an authentication barrier is recorded and skipped for the remainder of Pass 1. Do not stop the whole Tier A program to finish it immediately.

### PASS 2 — depth after all providers have first-pass records

Only after every Tier A provider has a Pass-1 record, return to providers one by one and close their missing items in the same audience-priority order, including authenticated passes where required.

Pass 2 closes:

- exact durable identity;
- reload stability;
- stable turn/message identity;
- code block/raw extraction;
- delivery confirmation;
- SPA A→B→A;
- different conversations in parallel;
- same-conversation duplicate tabs;
- Manual;
- established-chat Autorun;
- new-chat Autorun.

Only after provider evidence is closed do we implement/finish that provider adapter.

## 2. Audience-ranking methodology

Priority is by the best current public product-level active-user figure available as of 2026-09-02.

Preference order:

1. official product MAU;
2. standardized third-party App MAU;
3. official product user/community count where MAU is unavailable;
4. older/partial public user count as a low-confidence fallback.

Metrics are explicitly labeled because they are not perfectly interchangeable. Parent-company/ecosystem audience is NOT silently substituted for the browser chat product.

Examples:

- Microsoft reports 150M MAU for the whole first-party Copilot family, but the standalone Microsoft Copilot app is measured at 17.64M App MAU. The standalone figure is used for `copilot.com` priority.
- Proton reports 100M+ users across the Proton ecosystem, but that is not Lumo MAU; Lumo remains `UNKNOWN_PRODUCT_MAU`.
- DuckDuckGo has a large ecosystem, but no current product-specific Duck.ai MAU was found; Duck.ai remains `UNKNOWN_PRODUCT_MAU`.

## 3. Tier A priority order

| Priority | Provider | Current audience figure used | Metric quality | Pass-1 status | Authentication classification so far | Next action |
|---:|---|---:|---|---|---|---|
| 1 | Google Gemini | >1.0B monthly users | OFFICIAL PRODUCT MAU, Aug 2026 | NOT COMPLETE | UNKNOWN; broad pass could not resolve safe chat surface | NEXT PROVIDER |
| 2 | Qwen | 251.13M | standardized App MAU, Jun 2026 | COMPLETE for guest surface | Basic guest chat: NO AUTH. Durable exact chat: AUTH currently required; authenticated `/c/<UUID>` candidate observed | DEFER authenticated closure to Pass 2 |
| 3 | DeepSeek | 139.08M | standardized App MAU, Jun 2026 | NOT COMPLETE | UNKNOWN; broad pass had content unavailable/no safe composer | After Gemini |
| 4 | Grok | 117M Grok-AI-feature MAU in Mar 2026; 67.88M standardized App MAU in Jun 2026 | high, but measurement boundaries differ | NOT COMPLETE | UNKNOWN; broad pass produced blank/no provider DOM | After DeepSeek |
| 5 | Meta AI | 73.06M standalone App MAU, Jun 2026 | standardized standalone app MAU; broader Meta-integrated AI audience is larger and intentionally not used | NOT COMPLETE | AUTH REQUIRED in broad pass | Record blocker in Pass 1, authenticated closure in Pass 2 |
| 6 | Claude | 39.81M | standardized App MAU, Jun 2026 | NOT COMPLETE | AUTH REQUIRED; broad pass reached `/login` | Record blocker in Pass 1, authenticated closure in Pass 2 |
| 7 | Perplexity | 27.54M | standardized App MAU, Jun 2026 | PARTIAL | Basic page/composer visible; login required before Send in broad pass | Finish read-only first pass; authenticated closure in Pass 2 |
| 8 | Kimi | 22.69M | standardized App MAU, Jun 2026 | NOT COMPLETE | UNKNOWN; landing surface only in broad pass | First-pass discovery |
| 9 | GigaChat | >20M monthly audience in current Sber investor communication | official monthly audience statement; older/other transcript figures conflict, so >20M is conservative authority | NOT COMPLETE | UNKNOWN; no safe composer in broad pass | First-pass discovery |
| 10 | Microsoft Copilot | 17.64M standalone app MAU | standardized standalone App MAU, Jun 2026; Microsoft also reports 150M MAU across all first-party Copilots, not used for standalone ranking | NOT COMPLETE | UNKNOWN; broad pass reached landing/marketing surface | First-pass discovery |
| 11 | OpenRouter Chat | 10M+ global users | official total community/users, not MAU and not chat-only | NOT COMPLETE | UNKNOWN; playground visible but active chat/model context unverified | First-pass discovery |
| 12 | Poe | 1.43M | standardized App MAU, Jun 2026 | NOT COMPLETE | AUTH REQUIRED; broad pass redirected to login | Record blocker in Pass 1, authenticated closure in Pass 2 |
| 13 | Mistral Vibe / Le Chat | 1.19M | standardized App MAU, Jun 2026 | PARTIAL | Basic chat surface accessible without login in broad pass; generic ProseMirror insertion failed exact read-back | Finish Pass-1 classification; editor-special-case closure in Pass 2 |
| 14 | Duck.ai | UNKNOWN_PRODUCT_MAU | no defensible current Duck.ai-specific user count found; DuckDuckGo ecosystem size intentionally not substituted | NOT COMPLETE | Official product docs say free Duck.ai can be used without an account; broad Codex pass had provider DOM unavailable | First-pass discovery |
| 15 | Proton Lumo | UNKNOWN_PRODUCT_MAU | Proton ecosystem has 100M+ users, but no defensible Lumo-specific MAU found | NOT COMPLETE | Official docs say guest access is available without account; durable saved history requires Proton account | First-pass discovery |
| 16 | T3 Chat | >=100K historical users who sent a message within first 16 days after launch; current MAU not found | LOW-CONFIDENCE HISTORICAL FLOOR | PARTIAL broad evidence only | Basic chat was reachable/sent once in broad pass; current account requirement must be rechecked | LAST in current audience-ranked Pass 1 unless newer usage evidence moves it upward |

## 4. Source notes for ranking

Primary current sources used to establish this order:

- Google Gemini official: >1B monthly Gemini app users, Aug 11 2026 — https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/
- AICPB Global AI App MAU, Jun 2026: Qwen 251.13M; DeepSeek 139.08M; Meta AI 73.06M; Grok 67.88M; Claude 39.81M; Perplexity 27.54M; Kimi 22.69M; Microsoft Copilot 17.64M — https://www.aicpb.com/en/ai-rankings/products/global-ai-rankings/apps
- Grok: 117M monthly active users for Grok AI features as of Mar 2026, reported from SpaceX filing — https://techcrunch.com/2026/05/20/xai-burned-6-4b-last-year-spacexs-ipo-filing-shows-why-the-spending-is-far-from-over/
- GigaChat: Sber investor communication reports monthly audience >20M and 800M prompts — https://t.me/s/SberForInvestors/350
- OpenRouter official: 10M+ global users — https://openrouter.ai/about
- Poe standardized App MAU: 1.43M, Jun 2026 — https://www.aicpb.com/ai-rankings/products/ai-global-slowdown-rankings/apps
- Mistral Le Chat standardized App MAU: 1.19M, Jun 2026 — https://www.aicpb.com/en/product/Le-Chat-by-Mistral-AI/appid1D6F320E1
- T3 historical floor: >100,000 users sent a message in first 16 days — Theo Browne public launch update.
- Duck.ai official access docs: no account required — https://duckduckgo.com/duckduckgo-help-pages/duckai/approach-to-ai
- Proton Lumo official docs: guest use without account; account required for saved chat history — https://proton.me/support/lumo-getting-started

## 5. Authentication taxonomy

Do not use a single vague `AUTH_REQUIRED` flag. Final matrix must distinguish:

- `NO_AUTH_FOR_BASIC_CHAT`
- `AUTH_REQUIRED_FOR_BASIC_CHAT`
- `NO_AUTH_FOR_EPHEMERAL_CHAT_BUT_AUTH_REQUIRED_FOR_DURABLE_CHAT`
- `AUTH_REQUIRED_FOR_HISTORY_OR_DURABLE_IDENTITY`
- `AUTH_STATE_UNRESOLVED`

This matters because Ozon Bridge may be able to inspect/send in a guest chat while still being unable to create a safe durable channel.

## 6. Current authentication matrix

| Provider | Basic chat without auth | Durable conversation without auth | Current status |
|---|---|---|---|
| Qwen | YES, guest observed | NO in tested guest flow | Authenticated `/c/<UUID>` candidate observed by operator; verify in Pass 2 |
| Claude | NO in broad pass | NOT TESTED | Login barrier |
| Perplexity | Composer visible, but Send triggered login barrier | NOT TESTED | Auth required for usable tested flow |
| Meta AI | NO in broad pass | NOT TESTED | Login barrier |
| Poe | NO in broad pass | NOT TESTED | Login barrier |
| Mistral Le Chat | YES in broad pass | UNRESOLVED | ProseMirror insertion special case |
| Duck.ai | YES per official docs | likely not durable without optional synced history; must verify live | First-pass live evidence pending |
| Proton Lumo | YES per official docs | saved/history chat requires account | First-pass live evidence pending |
| T3 Chat | Broad pass reached chat and sent once | UNRESOLVED | Recheck in its ranked turn |
| Gemini | UNRESOLVED | UNRESOLVED | Next provider |
| DeepSeek | UNRESOLVED | UNRESOLVED | Pending |
| Grok | UNRESOLVED | UNRESOLVED | Pending |
| Kimi | UNRESOLVED | UNRESOLVED | Pending |
| GigaChat | UNRESOLVED | UNRESOLVED | Pending |
| Microsoft Copilot | UNRESOLVED | UNRESOLVED | Pending |
| OpenRouter Chat | UNRESOLVED | UNRESOLVED | Pending |

## 7. Active execution queue

Qwen Pass 1 is already complete enough to classify its guest/auth split and is not repeated now.

Therefore the active queue is:

1. Google Gemini
2. DeepSeek
3. Grok
4. Meta AI
5. Claude
6. Perplexity
7. Kimi
8. GigaChat
9. Microsoft Copilot
10. OpenRouter Chat
11. Poe
12. Mistral Vibe / Le Chat
13. Duck.ai
14. Proton Lumo
15. T3 Chat

After item 15 is complete, stop breadth discovery and begin Pass 2 from the highest-priority provider with unresolved/blocked evidence. Qwen returns in Pass 2 at its original audience priority position, using an authenticated session and `/c/<UUID>` as a candidate identity to verify.

## 8. Implementation rule

No new Tier A adapter is implemented during Pass 1.

After Pass 1 is complete:

1. freeze the full provider/access/auth matrix;
2. start Pass 2 by audience priority;
3. close one provider completely;
4. review and record evidence in GitHub;
5. implement/refine that provider adapter;
6. run its local/browser regressions;
7. only then move to the next provider.

This prevents low-traffic aggregator surfaces from consuming engineering time before high-audience providers such as Gemini, DeepSeek, Grok, Meta AI and Claude are understood.
