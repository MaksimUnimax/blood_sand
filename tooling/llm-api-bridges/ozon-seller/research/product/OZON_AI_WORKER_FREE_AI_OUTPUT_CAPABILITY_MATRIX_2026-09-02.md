# Ozon AI Worker — Free Authenticated AI Output Capability Matrix

Date: 2026-09-02
Status: PUBLIC-DOCUMENTATION PASS; LIVE VERIFICATION STILL REQUIRED
Authority: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`

## 1. Baseline being evaluated

Default target:

- user is signed in to the provider's consumer web AI;
- no paid AI subscription is assumed;
- provider free-tier limits are acceptable;
- Ozon Premium/Premium Plus/Premium Pro is a separate seller-data entitlement and is not the same as an AI subscription;
- only publicly documented free capabilities count as pre-test product evidence;
- every capability still requires a live provider benchmark before it can be marked product PASS.

## 2. Capability vocabulary

- `NATIVE_FREE_SUPPORTED` — public provider evidence says the capability is available to free/no-subscription users.
- `FREE_WITH_LIMITS` — free baseline exists but usage/availability limits apply.
- `TEXT_ONLY_SUPPORTED` — structured content can reasonably be returned in chat, but no native downloadable office artifact is proven.
- `SEPARATE_FREE_SURFACE` — capability exists in another free provider surface, but not proven inside the exact chat surface Ozon Bridge targets.
- `PAID_OR_CREDIT_GATED` — provider documentation ties the capability to a paid plan/credit pool; do not count in baseline.
- `UNVERIFIED` — current public evidence is insufficient; live browser test is mandatory.

## 3. Matrix

| Provider | Free authenticated baseline | File input/analysis | Tables / structured text | Data charts / visualizations | Downloadable CSV/XLSX | PDF/DOCX/PPTX | JSON/XML | Pre-test output verdict |
|---|---|---|---|---|---|---|---|---|
| **ChatGPT** | Free plan exists | `FREE_WITH_LIMITS`: OpenAI documents file uploads on Free plans; spreadsheets/PDF/docs supported subject to limits | `NATIVE_FREE_SUPPORTED` in chat | `FREE_WITH_LIMITS`: data-analysis docs support tables/charts; Go is described as giving *more* advanced data-analysis access than Free | `FREE_WITH_LIMITS / LIVE_VERIFY`: OpenAI documents downloadable generated outputs such as updated spreadsheets/PDFs and Library is available on Free; exact XLSX/CSV generation needs benchmark confirmation | `PARTIAL/UNVERIFIED`: normal generated files exist, but ChatGPT Work native document/spreadsheet/presentation workflow is not the Free baseline | `TEXT_ONLY_SUPPORTED`; downloadable file needs live test | **STRONG FREE CANDIDATE** |
| **Alice AI** | `NATIVE_FREE_SUPPORTED`: Yandex states chat is free | `FREE_WITH_LIMITS`: documents can be uploaded/analyzed; under high load some free features may be unavailable | `NATIVE_FREE_SUPPORTED` for text/report/table-like responses | `UNVERIFIED` for trustworthy numeric chart generation in the target chat; image generation is free but must not be confused with data visualization | `UNVERIFIED` in the target chat | `UNVERIFIED` in target chat; Alice can create document content based on a sample, but direct office-file download is not proven in current help | `TEXT_ONLY_SUPPORTED / LIVE_VERIFY` | **BUSINESS ANSWER STRONG; ARTIFACT LAYER NEEDS LIVE TEST** |
| **Alice Pro in Yandex Sheets** | no paid Yandex 360 plan still gets 50 Alice Pro function requests/month after sign-in | works directly with spreadsheet cells | `SEPARATE_FREE_SURFACE` | Yandex Sheets itself supports charts, but automatic AI chart insertion is not documented in the cited Alice Pro function page | works inside Yandex Sheets, not the target Alice chat | not target chat | formulas/text possible | **SECONDARY FREE SURFACE; DO NOT COUNT AS CHAT BASELINE** |
| **Gemini** | Gemini app has free consumer access; 2026 file generation announced for all Gemini app users globally | supported in Gemini app | `NATIVE_FREE_SUPPORTED` | `NATIVE_FREE_SUPPORTED`: Gemini help gives chart-generation examples; generated Sheets can carry structured analysis | `NATIVE_FREE_SUPPORTED`: Google explicitly lists `.xlsx` and `.csv`, plus native Sheets | `NATIVE_FREE_SUPPORTED`: PDF, DOCX and native Docs/Slides; Google announcement says all Gemini app users globally | `NATIVE_FREE_SUPPORTED` as text/file formats such as TXT/MD; JSON/XML still live-test for exact formatting | **VERY STRONG FREE DELIVERABLE CANDIDATE** |
| **Claude** | Free plan $0 | supports multiple document types; XLSX depends on analysis tool availability | `NATIVE_FREE_SUPPORTED` | `NATIVE_FREE_SUPPORTED`: Free pricing explicitly includes “visualize data”; Artifacts can create SVG, diagrams, interactive dashboards | `PARTIAL`: Artifact download is free; native XLSX creation on free tier is not proven by current free-plan evidence | `PARTIAL`: free Artifacts support Markdown/plain documents and downloads; direct native Excel/PDF/PPT file creation was historically introduced on paid preview and is not counted here | `TEXT_ONLY_SUPPORTED`; downloadable text Artifact possible | **STRONG VISUAL/ARTIFACT FREE CANDIDATE; OFFICE FILES UNVERIFIED** |
| **Qwen Studio** | `NATIVE_FREE_SUPPORTED`: Qwen describes Studio as free/open to all | Deep Research supports local PDF/Excel/image input | `NATIVE_FREE_SUPPORTED` reports | `PARTIAL`: Qwen-Image supports professional infographics; this is not yet proof of numeric analytical chart workflow in chat | `UNVERIFIED` | `UNVERIFIED` native office-file download on free Studio | `TEXT_ONLY_SUPPORTED / LIVE_VERIFY` | **FREE ANALYSIS/REPORT CANDIDATE; OFFICE OUTPUT UNVERIFIED** |
| **Grok** | `FREE_WITH_LIMITS`: current xAI docs say Grok is free to start; paid plans raise limits | Grok docs support PDFs, spreadsheets, code and more | `NATIVE_FREE_SUPPORTED` | `NATIVE_FREE_SUPPORTED`: Grok use cases and office integrations explicitly support visual charts | `NATIVE_FREE_SUPPORTED` pre-test: xAI says every Grok account ships with built-in Spreadsheet skill and can generate Excel files | `NATIVE_FREE_SUPPORTED` pre-test: every account gets built-in Word Documents, Presentations, Spreadsheets and PDFs Skills | `TEXT_ONLY_SUPPORTED / LIVE_VERIFY` | **VERY STRONG FREE DELIVERABLE CANDIDATE, SUBJECT TO USAGE LIMITS** |
| **Kimi** | consumer chat exists, but current membership/credit model must be respected | supports PDF/Word/Excel inputs | normal chat/report capability exists | Kimi Sheets can present spreadsheet analysis, but baseline entitlement matters | `PAID_OR_CREDIT_GATED / NOT GUARANTEED FREE`: membership docs classify Office file processing / Sheets / Docs as credit-using membership features | `PAID_OR_CREDIT_GATED / NOT GUARANTEED FREE`: PPT/Docs/Office processing consume membership credits | `TEXT_ONLY_SUPPORTED / LIVE_VERIFY` | **DO NOT COUNT OFFICE ARTIFACTS IN ZERO-COST BASELINE UNTIL LIVE PROVEN** |
| **DeepSeek Chat** | basic consumer service exists, but dedicated browser discovery currently requires auth | current official evidence found in this pass is API/image-file oriented, not enough for consumer office-artifact claims | text expected but must live-test | `UNVERIFIED` | `UNVERIFIED` | `UNVERIFIED` | `TEXT_ONLY_UNVERIFIED` | **OUTPUT CAPABILITY UNVERIFIED** |
| **Meta AI** | guest/basic surface exists in prior discovery; signed-in free output baseline still needs dedicated test | `UNVERIFIED` | text response expected | `UNVERIFIED` analytical charts | `UNVERIFIED` | `UNVERIFIED` | `TEXT_ONLY_UNVERIFIED` | **OUTPUT CAPABILITY UNVERIFIED** |
| **OpenRouter Chat** | free models and `openrouter/free` router are documented | model-dependent | `TEXT_ONLY_SUPPORTED` depending on selected free model | model/UI-dependent; no native chart artifact layer documented in this pass | `UNVERIFIED` native downloadable office artifact | `UNVERIFIED` | structured outputs can be model-selected by router, but exact web-chat behavior must be tested | **FREE INFERENCE EXISTS; DELIVERABLES MODEL/UI DEPENDENT** |

## 4. Public evidence

### ChatGPT / OpenAI

- File uploads available on Free and paid plans, plan-specific limits:
  https://help.openai.com/en/articles/8555545-file-uploads-faq
- Data analysis can create tables/charts:
  https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt
- Working with files; downloadable generated outputs such as updated spreadsheets/PDFs:
  https://openai.com/academy/working-with-files/
- Library available on Free and stores uploaded/created files:
  https://help.openai.com/en/articles/20001052
- Go gives *expanded* file/data-analysis access compared with Free, confirming a lower free allowance exists:
  https://help.openai.com/en/articles/11989085

Important product note:
ChatGPT Work is not the assumed Free baseline. Test normal ChatGPT Free chat separately.

### Alice AI / Yandex

- Free chat; high-load limitations can affect reasoning/image/file-analysis for users without Alice Plus:
  https://alice.yandex.ru/support/ru/assistant/chat-alice
- File/document analysis:
  https://alice.yandex.ru/support/ru/assistant/chat/files
- Document work / create content based on sample:
  https://alice.yandex.ru/skills/work-with-documents
- Research agent available to all; paid Alice Plus increases limits:
  https://yandex.ru/company/news/02-04-2026-02
- Alice Pro in Yandex Sheets: signed-in users without a paid Yandex 360 plan get 50 requests/month:
  https://yandex.ru/support/yandex-360/customers/documents/sheets/ru/alicepro
- Yandex Sheets charts are supported as a spreadsheet feature:
  https://yandex.ru/support/yandex-360/customers/documents/sheets/ru/cells/charts/configure

### Gemini / Google

- File generation in Gemini announced globally for all Gemini app users; formats include Docs, Sheets, Slides, PDF, DOCX, XLSX, CSV, LaTeX, TXT, RTF and MD:
  https://blog.google/innovation-and-ai/products/gemini-app/generate-files-in-gemini/
- Gemini Apps help lists generated files and chart example prompts:
  https://support.google.com/gemini/answer/13275745

### Claude / Anthropic

- Free pricing includes code, data visualization, content creation, text/image analysis and web search:
  https://www.anthropic.com/pricing
- Artifacts are available on Free; examples include documents, SVG, diagrams, flowcharts and interactive dashboards; artifacts can be downloaded:
  https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- Document upload formats:
  https://support.anthropic.com/ru/articles/8241126-

Do not count native Excel/PPT/PDF creation as free solely from the 2025 upgraded-file-creation announcement; that announcement originally scoped preview access to paid tiers.

### Qwen

- Qwen Studio described as free/open to all:
  https://qwen.ai/blog/wher-to-buy-cooling-unit/
- Deep Research local file integration supports PDF, Excel and images plus controlled report writing:
  https://qwen.ai/blog?id=qwen-deepresearch
- Qwen Image 2.0 supports professional infographics:
  https://qwen.ai/blog?id=qwen-image-2.0

### Grok / xAI

- Grok is free to start; file uploads include spreadsheets and documents; paid plans raise limits:
  https://docs.x.ai/grok/overview
- xAI Skills: every Grok account ships with built-in Word Documents, Presentations, Spreadsheets and PDFs skills; production-ready files are generated:
  https://x.ai/news/grok-skills
- Financial analysis use case includes spreadsheets and visual charts:
  https://x.ai/grok/use-cases/financial-analysis

### Kimi

- Kimi web/app supports chat plus document/spreadsheet/PPT creation in the product family:
  https://www.kimi.com/en/help/others/product-comparison
- Current membership documentation says Office file processing, Deep Research, PPT, Kimi Work, etc. consume membership credits and membership plans start paid:
  https://www.kimi.com/en/help/membership/membership-pricing
  https://www.kimi.com/en/help/agent/agent-quota-and-billing

Therefore native office artifacts must not be marketed as zero-cost Kimi baseline without live no-subscription evidence.

### OpenRouter

- Free models router in Chat Playground:
  https://openrouter.ai/docs/cookbook/get-started/free-models-router-playground
- Free variants and their limits:
  https://openrouter.ai/docs/guides/routing/model-variants/free

## 5. Provider benchmark additions

Each provider must now be tested on TWO independent axes.

### A. Business answer quality

`PASS / PARTIAL / FAIL / BLOCKED`

### B. Requested deliverable

For representative commercial questions test:

- `OUT-01` — sorted table in chat;
- `OUT-02` — data chart/graph;
- `OUT-03` — downloadable CSV;
- `OUT-04` — downloadable XLSX with at least two sheets and formulas where requested;
- `OUT-05` — PDF report;
- `OUT-06` — DOCX or equivalent editable document;
- `OUT-07` — PPTX/client deck;
- `OUT-08` — exact JSON;
- `OUT-09` — exact XML.

Record separately:

- format created at all;
- numerical correctness;
- row/column completeness;
- whether the artifact is truly downloadable or just a code block;
- whether formulas/charts survive download;
- whether Free tier is sufficient;
- usage/rate-limit blocker;
- adapter/delivery issues.

## 6. Commercial implication

Free-tier artifact support can materially differentiate AI providers for the same Ozon worker.

A seller may value:

`Сделай разбор` → useful chat answer.

An agency may value much more:

`Сделай недельный отчёт клиенту в Excel и PDF, приложи графики, а исходные данные положи на отдельный лист.`

The provider matrix therefore belongs in the product benchmark and must not be postponed as a cosmetic UI question.
