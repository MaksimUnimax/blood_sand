# Ozon Bridge — Multi-AI research priority roadmap

Date: 2026-09-02
Status: ACTIVE_RESEARCH_ROADMAP
Scope: Tier A web-chat providers only. ChatGPT and Yandex Alice remain accepted baseline adapters.

## 1. Governing workflow

The project uses two provider passes.

### PASS 1 — breadth first

Research every Tier A web provider once before provider-specific implementation or authenticated closure.

For each provider record browser reachability, guest/auth boundary, positive chat DOM candidate, conversation identity candidate or blocker, composer/Send candidate or blocker, and exact Pass-2 gaps.

Authentication, browser-environment, provider challenge, blank/incomplete product DOM, or provider-specific composer blockers are terminal Pass-1 records and do not stop the whole breadth pass.

### PASS 2 — depth after all Pass-1 records

After every Tier A provider has a Pass-1 record, return by the same priority order and close exact durable identity, reload, message identity, code extraction, delivery, SPA, parallel chats, duplicate tabs, Manual, established Autorun and new-chat Autorun. Only then implement/refine that provider adapter.

## 2. CORRECTED audience-ranking methodology

The previous roadmap used App MAU for several products. That was the wrong prioritization metric for this project.

Ozon Bridge controls the **browser web surface**, so research priority is now based on the audience of the **exact target web product/domain**, not the mobile app and not the parent ecosystem.

Preferred ranking metric:

1. current Web MAU / monthly active web users for the target web product;
2. current monthly unique visitors for the exact target domain;
3. another current web-audience estimate for the exact target domain;
4. monthly visits only when no user/unique metric exists, clearly labelled and not silently treated as users.

Do NOT rank `meta.ai` by Meta AI usage inside WhatsApp/Instagram/Facebook. Do NOT rank a browser provider by its mobile-app MAU when web-specific usage is available.

### Why Meta/Kimi order changed

The old App-MAU comparison had Meta AI at 73.06M App MAU and Kimi at 22.69M App MAU. That is not the relevant metric for browser-adapter priority.

Current web evidence instead shows:

- Kimi `kimi.com`: 15.37M Web MAU in Jul 2026 (Feifan Research/Sina); 60.10M visits in that dataset; Semrush separately reports 51.81M July visits.
- Meta AI `meta.ai`: Semrush estimate surfaced via HypeStat gives ~8.99M monthly unique visitors for the exact domain; ~12.94M Similarweb monthly visits / ~16.05M Semrush visits in the compared snapshot.

Therefore **Kimi ranks ahead of standalone `meta.ai` for this browser-integration project**.

Meta AI's much larger cross-Meta embedded audience is real but irrelevant to the `meta.ai` DOM adapter priority.

## 3. Current web-audience evidence

Where comparable Web MAU is available, use it directly:

- Gemini: ~302M Web MAU, Jul 2026.
- Claude: ~108M Web MAU, Jul 2026.
- Grok: ~30.92M Web MAU, Jul 2026.
- Perplexity: ~18.71M Web MAU, Jul 2026.
- Microsoft Copilot web product: ~16.45M Web MAU, Jul 2026.
- Kimi: ~15.37M Web MAU, Jul 2026.
- OpenRouter: ~5.46M Web MAU, Jul 2026.

Exact-domain monthly unique-user estimates used only where a current Web-MAU figure has not been surfaced:

- Meta AI `meta.ai`: ~8.99M Semrush monthly unique visitors.
- Poe `poe.com`: ~5.55M Semrush monthly unique visitors.
- Mistral root `mistral.ai`: ~2.37M Semrush monthly unique visitors; exact `chat.mistral.ai` should be preferred if a separate current unique-user estimate becomes available.
- GigaChat `giga.chat`: ~0.91M Semrush monthly unique visitors in the surfaced estimate.
- Duck.ai `duck.ai`: ~0.85M Semrush monthly unique visitors in the surfaced estimate; third-party visit estimates are much higher, so confidence is low and metric disagreement is recorded.
- T3 `t3.chat`: ~0.11M Semrush monthly unique visitors in one surfaced estimate; current July visits ~0.44M from Semrush.

Qwen and DeepSeek already have Pass-1 records, so uncertainty in their exact web-audience rank does not change the remaining breadth queue. Their web-audience figures will be normalized before Pass 2 starts.

Proton Lumo exact web-audience rank remains unresolved.

## 4. Pass-1 records already completed

1. Google Gemini — `ENVIRONMENT_BLOCKED / NOT TESTED`; Browser Use policy failed before document load.
2. Qwen — guest surface researched; durable guest identity fails; authenticated `/c/<UUID>` candidate supplied by operator for Pass 2.
3. DeepSeek — `AUTH_REQUIRED_FOR_BASIC_CHAT`; reached `/sign_in` normally.
4. Grok — provider document reached but usable chat DOM remained blank/incomplete; no auth/challenge observed.
5. Meta AI — researched **out of corrected priority order** before metric correction. Keep evidence; do not repeat in Pass 1. Guest composer is visible without auth; native `<input>` collapsed the multiline test payload, so provider-specific composer-write strategy is unresolved and no Send was made.

## 5. Corrected remaining Pass-1 execution queue

Proceed from the largest known audience of the exact browser surface. Providers already completed are not repeated merely to restore numerical order.

1. **Claude** — ~108M Web MAU
2. Perplexity — ~18.71M Web MAU
3. Microsoft Copilot — ~16.45M Web MAU
4. Kimi — ~15.37M Web MAU
5. Poe — ~5.55M exact-domain monthly unique visitors
6. OpenRouter Chat — ~5.46M Web MAU
7. Mistral Vibe / Le Chat — ~2.37M root-domain monthly unique visitors; chat-subdomain figure pending
8. GigaChat — ~0.91M exact-domain monthly unique visitors in surfaced estimate
9. Duck.ai — ~0.85M exact-domain monthly unique visitors in surfaced estimate; low confidence because traffic-source estimates diverge
10. Proton Lumo — exact web-user figure unresolved; keep near the tail until a defensible web-user metric is found
11. T3 Chat — ~0.11M exact-domain monthly unique visitors in surfaced estimate / ~0.44M July visits

Meta AI would fall between Kimi and Poe on the current exact-domain user evidence, but its Pass-1 research is already complete, so it is not re-run now.

## 6. Authentication/access taxonomy

Use precise statuses:

- `NO_AUTH_FOR_BASIC_CHAT`
- `AUTH_REQUIRED_FOR_BASIC_CHAT`
- `NO_AUTH_FOR_EPHEMERAL_CHAT_BUT_AUTH_REQUIRED_FOR_DURABLE_CHAT`
- `AUTH_REQUIRED_FOR_HISTORY_OR_DURABLE_IDENTITY`
- `AUTH_STATE_UNRESOLVED`
- `ENVIRONMENT_BLOCKED_NOT_TESTED`
- `PROVIDER_CHALLENGE_BLOCKED_NOT_TESTED`
- `PROVIDER_SPECIAL_COMPOSER_BLOCKED`

Current facts:

- Qwen: guest basic chat works; tested guest identity not durable; authenticated `/c/<UUID>` candidate to verify in Pass 2.
- DeepSeek: auth required before basic chat.
- Gemini: auth state unresolved because browser environment blocked before document load.
- Grok: auth state unresolved because product DOM did not render.
- Meta AI: guest composer visible; post-Send/durable identity auth boundary unresolved; multiline write strategy blocked the send test.

## 7. Ranking sources currently controlling the corrected order

- Feifan Research July 2026 AI Web data as republished by Sina Finance: Gemini 302M Web MAU; Claude 108M; Grok 30.92M; Perplexity 18.71M; Kimi 15.37M; Microsoft Copilot 16.45M; OpenRouter 5.46M. https://finance.sina.com.cn/roll/2026-08-12/doc-ininarri3830802.shtml
- Kimi exact web traffic corroboration: Semrush `kimi.com`, Jul 2026, 51.81M visits. https://www.semrush.com/website/kimi.com/overview/
- Meta exact-domain estimate: HypeStat surface showing Semrush ~8.99M monthly unique visitors for `meta.ai`. https://hypestat.com/info/meta.ai
- Poe exact-domain estimate: HypeStat surface showing Semrush ~5.55M monthly unique visitors for `poe.com`. https://hypestat.com/info/poe.com
- GigaChat exact-domain estimate: HypeStat surface showing Semrush ~0.91M monthly unique visitors for `giga.chat`. https://hypestat.com/info/giga.chat
- Duck.ai exact-domain estimate: HypeStat surface showing Semrush ~0.85M monthly unique visitors for `duck.ai`. https://hypestat.com/info/duck.ai
- T3 current traffic: Semrush `t3.chat`, Jul 2026, ~443.88K visits. https://www.semrush.com/website/t3.chat/overview/

## 8. Implementation rule

No new Tier A adapter is implemented during Pass 1.

After Pass 1:

1. normalize the final web-audience ranking using exact-domain web metrics;
2. freeze provider/access/auth matrix;
3. begin Pass 2 in that corrected web-audience order;
4. close one provider completely;
5. record raw evidence + review in GitHub;
6. implement/refine that adapter;
7. run local/browser regressions;
8. then move to the next provider.
