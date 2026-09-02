# Ozon Bridge — Multi-AI research priority roadmap

Date: 2026-09-02
Status: ACTIVE_RESEARCH_ROADMAP
Scope: Tier A new providers only. ChatGPT and Yandex Alice remain accepted baseline adapters and are not re-ranked for new-provider discovery.

## 1. Governing workflow

The project uses two provider passes.

### PASS 1 — breadth first

Research every Tier A provider once before provider-specific implementation or deep authenticated closure.

For every provider the first pass records:

- browser/environment reachability;
- public/basic chat access;
- whether authentication is required for basic chat;
- whether authentication is required only for durable history/identity;
- positive chat-DOM evidence or exact blocker;
- conversation identity candidate or blocker;
- composer/Send candidate or blocker;
- unresolved evidence required for Pass 2.

A provider that hits authentication, browser-environment, provider challenge, or blank/incomplete product DOM is recorded and skipped for the rest of Pass 1.

Classification rules:

- `AUTH_REQUIRED` requires actual provider authentication evidence;
- `ENVIRONMENT_BLOCKED / NOT TESTED` is used when Codex Browser Use or the effective browser/render path prevents a usable product DOM without proving auth or product incompatibility;
- `PROVIDER_CHALLENGE_BLOCKED / NOT TESTED` is reserved for actual CAPTCHA/anti-bot/geo/provider challenge evidence;
- missing/blank product DOM is never silently converted into `UNSAFE / UNSUPPORTED`;
- `UNSAFE / UNSUPPORTED` requires observed provider behavior demonstrating an actual incompatibility.

### PASS 2 — depth after all providers have Pass-1 records

Only after every Tier A provider has a Pass-1 record, return by the same audience-priority order and close missing items, including authenticated and environment-retry passes.

Pass 2 closes:

- exact durable conversation identity;
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

Only after evidence is closed do we implement/refine that provider adapter.

## 2. Audience-ranking methodology

Priority uses the best current public product-level active-user figure available as of 2026-09-02.

Preference order:

1. official product MAU;
2. standardized third-party App MAU;
3. official product user/community count where MAU is unavailable;
4. older/partial public user count as a low-confidence fallback.

Parent ecosystem audience is not silently substituted for the browser chat product.

## 3. Tier A priority order and Pass-1 status

| Priority | Provider | Audience figure used | Metric quality | Pass-1 status | Authentication / access classification | Next action |
|---:|---|---:|---|---|---|---|
| 1 | Google Gemini | >1.0B monthly users | official product MAU, Aug 2026 | COMPLETE AS BLOCKED RECORD | `ENVIRONMENT_BLOCKED / NOT TESTED`: Browser Use returned `BROWSER_POLICY_UNVERIFIED` before Gemini document load; auth state not observed | Retry in Pass 2 after browser policy/access fixed |
| 2 | Qwen | 251.13M | standardized App MAU, Jun 2026 | COMPLETE for guest surface | Basic guest chat works without auth; guest `/c/guest` is not durable. Operator later observed authenticated `/c/<UUID>` candidate | Authenticated closure in Pass 2 |
| 3 | DeepSeek | 139.08M | standardized App MAU, Jun 2026 | COMPLETE AS AUTH-BLOCKED RECORD | `AUTH_REQUIRED_FOR_BASIC_CHAT`: provider reached normally and redirected to `/sign_in`; no chat/composer/Send before login | Authenticated closure in Pass 2 |
| 4 | Grok | 117M Grok-AI-feature MAU Mar 2026; 67.88M standardized App MAU Jun 2026 | high, boundaries differ | COMPLETE AS BLOCKED RECORD | Provider document reached at `https://grok.com/`, but usable chat DOM did not render; only `Skip to main content`; no auth/CAPTCHA/redirect observed | Environment/render retry in Pass 2 |
| 5 | Meta AI | 73.06M standalone App MAU, Jun 2026 | standardized standalone App MAU | NOT COMPLETE | Broad pass observed login control and disabled Send; auth likely but dedicated pass required | **NEXT PROVIDER** |
| 6 | Claude | 39.81M | standardized App MAU, Jun 2026 | NOT COMPLETE | Broad pass redirected to `/login` | After Meta AI |
| 7 | Perplexity | 27.54M | standardized App MAU, Jun 2026 | PARTIAL | Composer visible; login dialog appeared before Send | Finish Pass-1 classification |
| 8 | Kimi | 22.69M | standardized App MAU, Jun 2026 | NOT COMPLETE | Broad pass reached landing surface only | First-pass discovery |
| 9 | GigaChat | >20M monthly audience | official Sber monthly audience statement | NOT COMPLETE | Broad pass found no safe composer | First-pass discovery |
| 10 | Microsoft Copilot | 17.64M standalone App MAU | standardized standalone App MAU, Jun 2026 | NOT COMPLETE | Broad pass reached landing/marketing surface | First-pass discovery |
| 11 | OpenRouter Chat | 10M+ global users | official total users/community, not MAU/chat-only | NOT COMPLETE | Playground visible; active chat/model context unverified | First-pass discovery |
| 12 | Poe | 1.43M | standardized App MAU, Jun 2026 | NOT COMPLETE | Broad pass redirected to login | Record auth blocker in Pass 1 |
| 13 | Mistral Vibe / Le Chat | 1.19M | standardized App MAU, Jun 2026 | PARTIAL | Basic chat accessible; generic ProseMirror insertion did not round-trip exactly | Finish Pass-1 classification; editor special case in Pass 2 |
| 14 | Duck.ai | UNKNOWN_PRODUCT_MAU | no defensible current Duck.ai-specific MAU found | NOT COMPLETE | Official docs say basic Duck.ai works without account; live evidence pending | First-pass discovery |
| 15 | Proton Lumo | UNKNOWN_PRODUCT_MAU | Proton ecosystem audience not substituted | NOT COMPLETE | Official docs say guest access exists; saved history requires account | First-pass discovery |
| 16 | T3 Chat | >=100K historical users in first 16 days | low-confidence historical floor | PARTIAL broad evidence | Basic chat reached and one Send observed; durable identity/lifecycle incomplete | Last in Pass 1 |

## 4. Ranking source notes

- Gemini official >1B monthly users: https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/
- Standardized App MAU source for Qwen, DeepSeek, Meta AI, Grok, Claude, Perplexity, Kimi, Microsoft Copilot: https://www.aicpb.com/en/ai-rankings/products/global-ai-rankings/apps
- Grok 117M monthly active users for Grok AI features as of Mar 2026, reported from SpaceX filing: https://techcrunch.com/2026/05/20/xai-burned-6-4b-last-year-spacexs-ipo-filing-shows-why-the-spending-is-far-from-over/
- GigaChat >20M monthly audience: https://t.me/s/SberForInvestors/350
- OpenRouter 10M+ global users: https://openrouter.ai/about
- Poe App MAU: https://www.aicpb.com/ai-rankings/products/ai-global-slowdown-rankings/apps
- Mistral Le Chat App MAU: https://www.aicpb.com/en/product/Le-Chat-by-Mistral-AI/appid1D6F320E1
- Duck.ai account/access docs: https://duckduckgo.com/duckduckgo-help-pages/duckai/approach-to-ai
- Proton Lumo account/history docs: https://proton.me/support/lumo-getting-started

## 5. Authentication/access taxonomy

Final matrix distinguishes:

- `NO_AUTH_FOR_BASIC_CHAT`
- `AUTH_REQUIRED_FOR_BASIC_CHAT`
- `NO_AUTH_FOR_EPHEMERAL_CHAT_BUT_AUTH_REQUIRED_FOR_DURABLE_CHAT`
- `AUTH_REQUIRED_FOR_HISTORY_OR_DURABLE_IDENTITY`
- `AUTH_STATE_UNRESOLVED`
- `ENVIRONMENT_BLOCKED_NOT_TESTED`
- `PROVIDER_CHALLENGE_BLOCKED_NOT_TESTED`

## 6. Current authentication/access matrix

| Provider | Basic chat without auth | Durable conversation without auth | Current Pass-1 status |
|---|---|---|---|
| Gemini | UNRESOLVED | UNRESOLVED | `ENVIRONMENT_BLOCKED / NOT TESTED`; pre-document Browser Use policy blocker |
| Qwen | YES, guest observed | NO in tested guest flow | Authenticated `/c/<UUID>` candidate must be verified in Pass 2 |
| DeepSeek | NO | NOT TESTED | `AUTH_REQUIRED_FOR_BASIC_CHAT`; `/sign_in` |
| Grok | UNRESOLVED | UNRESOLVED | `ENVIRONMENT_BLOCKED / NOT TESTED`; provider document reached but chat DOM blank/incomplete |
| Meta AI | Broad pass suggested NO | NOT TESTED | Dedicated first pass pending |
| Claude | NO in broad pass | NOT TESTED | Login barrier |
| Perplexity | Composer visible but Send caused login barrier | NOT TESTED | Dedicated first-pass closure pending |
| Kimi | UNRESOLVED | UNRESOLVED | Pending |
| GigaChat | UNRESOLVED | UNRESOLVED | Pending |
| Microsoft Copilot | UNRESOLVED | UNRESOLVED | Pending |
| OpenRouter Chat | UNRESOLVED | UNRESOLVED | Pending |
| Poe | NO in broad pass | NOT TESTED | Login barrier |
| Mistral Le Chat | YES in broad pass | UNRESOLVED | ProseMirror insertion special case |
| Duck.ai | YES per official docs | UNRESOLVED live | Pending live first pass |
| Proton Lumo | YES per official docs | saved history requires account | Pending live first pass |
| T3 Chat | Broad pass reached chat | UNRESOLVED | Dedicated first-pass closure pending |

## 7. Completed Pass-1 checkpoints

1. Google Gemini — `ENVIRONMENT_BLOCKED / NOT TESTED` (`BROWSER_POLICY_UNVERIFIED` before document load).
2. Qwen — guest flow classified; authenticated durable-ID closure deferred to Pass 2.
3. DeepSeek — `AUTH_REQUIRED_FOR_BASIC_CHAT`; provider reached `/sign_in` normally.
4. Grok — `ENVIRONMENT_BLOCKED / NOT TESTED`; provider document reached but usable Grok chat DOM did not render; no auth/challenge evidence.

## 8. Active Pass-1 execution queue

1. **Meta AI**
2. Claude
3. Perplexity
4. Kimi
5. GigaChat
6. Microsoft Copilot
7. OpenRouter Chat
8. Poe
9. Mistral Vibe / Le Chat
10. Duck.ai
11. Proton Lumo
12. T3 Chat

After item 12 is complete, freeze the breadth matrix and begin Pass 2 by original audience priority:

1. Gemini environment retry;
2. Qwen authenticated closure;
3. DeepSeek authenticated closure;
4. Grok environment/render retry;
5. Meta AI authenticated closure if required;
6. continue down the ranking.

## 9. Implementation rule

No new Tier A adapter is implemented during Pass 1.

After Pass 1:

1. freeze provider/access/auth matrix;
2. start Pass 2 by audience priority;
3. close one provider completely;
4. record evidence/review in GitHub;
5. implement/refine that provider adapter;
6. run local/browser regressions;
7. only then move to the next provider.
