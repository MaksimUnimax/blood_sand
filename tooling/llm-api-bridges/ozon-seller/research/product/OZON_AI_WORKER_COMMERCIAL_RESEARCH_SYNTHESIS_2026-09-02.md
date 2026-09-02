# Ozon AI Worker — Commercial Research Synthesis

Date: 2026-09-02
Status: RESEARCH V2 READY FOR OPERATOR REVIEW / LIVE VALIDATION NOT STARTED

## 1. Product-gate question

The project must answer:

> Is there a real, sellable nucleus of recurring Ozon seller/manager jobs, and can the AI-worker product solve them reliably enough on free authenticated AI tiers to justify continued development and sale?

Product under evaluation:

`user's preferred AI + Ozon Bridge + private Ozon cabinet data + public/current context + AI reasoning + requested deliverable`

The extension alone is not the product. The endpoint catalog alone is not the value proposition.

## 2. Research result: real demand exists

Public seller discussions, official Ozon materials, agencies and analytics products consistently expose paid/high-value work around:

- sales/revenue monitoring and anomaly diagnosis;
- FBO/FBS stock and supply control;
- warehouse allocation and replenishment;
- advertising efficiency/DRR;
- finance/payout reconciliation;
- unit economics/profit by SKU;
- prices/actions/promotions;
- returns/cancellations/ratings/reviews;
- search queries/positions/funnel analytics;
- daily/weekly client reporting;
- multi-factor professional diagnostics.

The demand corpus also shows a second pain that is commercially important on its own: Ozon information is split across different analytics, finance, stock, advertising and report surfaces, so sellers/managers often download XLS/XLSX/CSV files, align SKU/article identifiers and accounting dates, and join data manually.

Removing this report/navigation/Excel work is itself a product value, not merely an implementation detail.

## 3. Product value is now modeled in three layers

### A. Decision / investigation

Examples:

- `Почему вчера продажи резко просели?`
- `После пожара на складе мой товар пострадал?`
- `Почему вырос ДРР?`
- `Что сегодня требует внимания?`

The AI decides what evidence is needed and may combine Bridge reads with public/current context.

### B. Instant BI / ad-hoc analytics

Examples:

- `Дай продажи за вчера: выручка, единицы и топ-10 SKU.`
- `Дай рекламные расходы за неделю по кампаниям от большего к меньшему.`
- `Покажи остатки FBO по складам и SKU.`
- `Разложи начисления и удержания по типам.`

The value is immediate access to a requested analytical cut without navigating Ozon reports or downloading files.

### C. Cross-report BI / correlation

Examples:

- `Дай продажи по складам/кластерам и рядом текущие остатки. Где спрос высокий, а запаса мало?`
- `Какие товары рекламируются, хотя заканчиваются на складах?`
- `Почему продажи не сходятся с выплатой? Сопоставь заказы, начисления и даты.`
- `После акции продажи выросли, но прибыль выросла или упала?`
- `Посчитай реальную прибыль по SKU после комиссии, логистики, рекламы, возвратов и себестоимости.`

This is the strongest “remove manual Excel/report joining” proposition.

## 4. Evidence for cross-report value

The preserved Instant-BI/correlation research documents real examples where sellers/tools work with separate:

- sales/finance dates and payout reports;
- Seller API vs Performance/advertising API;
- direct vs associated advertising orders;
- seller COGS files;
- storage costs;
- stock/in-transit data;
- turnover data;
- SKU/article identifier reconciliation.

Existing commercial tools explicitly sell “без Excel / без ручной склейки” stock planning, unit economics and joined marketplace analytics. This validates convenience and correlation as willingness-to-pay value.

Full evidence: `OZON_AI_WORKER_INSTANT_BI_CORRELATION_RESEARCH_2026-09-02.md`.

## 5. Commercial Query Core V2

Current benchmark composition:

- **33** original investigation/decision questions;
- **14** Instant-BI questions;
- **10** Cross-Report BI questions;
- total: **57 business rows**.

V2 preserves the four segments:

1. SELLER_STANDARD;
2. SELLER_PREMIUM;
3. SERVICE_STANDARD;
4. SERVICE_PREMIUM.

No pre-test classification is a PASS.

Important intentionally unresolved rows include:

- exact complete `sales by warehouse` — commercially valid, but current Bridge completeness/path must be proven;
- direct vs associated advertising-order breakdown — demand is proven, exact available Bridge fields must be proven;
- multi-client portfolio triage — remains a current architectural gap;
- true profit/working-capital rows — require seller-owned COGS/tax or other non-Ozon inputs;
- historical stock forensic reconstruction — may remain partial depending on available historical evidence.

## 6. Output format is part of the product

A correct chat answer is not the only useful outcome.

Nine output tests are now part of provider validation:

- OUT-01 sorted table in chat;
- OUT-02 data chart/graph;
- OUT-03 downloadable CSV;
- OUT-04 downloadable XLSX;
- OUT-05 PDF report;
- OUT-06 DOCX/editable document;
- OUT-07 PPTX/client deck;
- OUT-08 exact JSON;
- OUT-09 exact XML.

A provider may PASS business reasoning but fail the requested deliverable.

This is especially important for service-provider/agency users who need client-ready Excel/PDF/PPT artifacts rather than only conversational answers.

## 7. Free authenticated AI baseline

The baseline commercial proposition does not assume that the buyer also purchases a paid AI subscription.

Research therefore evaluates the signed-in zero-cost/no-subscription web tier of each AI provider.

Current public-documentation findings are preliminary and must be live verified:

- **ChatGPT Free** — strong free candidate for file input/data analysis/tables/charts and generated files under limits; exact artifact workflow must be tested in normal Free chat, not ChatGPT Work.
- **Alice Free** — free chat and document analysis are established; native downloadable XLSX/PDF/PPT and numeric chart workflow in the target chat remain unverified. Alice Pro in Yandex Sheets is a separate surface and does not count as Alice chat baseline.
- **Gemini** — very strong free deliverable candidate; Google currently documents office-file generation for all Gemini app users.
- **Claude Free** — strong visualization/Artifact candidate; direct native Office-file creation on free tier is not pre-claimed.
- **Grok** — very strong free deliverable candidate under current xAI documentation, subject to usage limits.
- **Qwen** — free analysis/report candidate, Office artifacts unverified.
- **Kimi** — current membership/credit model means Office artifact generation must not be assumed zero-cost without live proof.
- **DeepSeek / Meta AI / OpenRouter Chat** — deliverable layer remains materially unverified or model/UI-dependent in this pass.

Full matrix: `OZON_AI_WORKER_FREE_AI_OUTPUT_CAPABILITY_MATRIX_2026-09-02.md`.

## 8. Current competitive implication

Direct AI-over-marketplace competition exists, so “chat with your Ozon data” is not sufficient differentiation.

The stronger proposition to validate is:

> Keep the AI you already use. Give it controlled Ozon hands through Bridge. Ask a business question or analytical cut in ordinary language. The worker decides which Ozon/private/public data it needs, joins what Ozon normally separates, performs calculations and returns the answer or reusable report in the format you requested.

Candidate differentiation:

1. native preferred-AI surface;
2. replaceable AI provider over the same Bridge;
3. private cabinet + current public context;
4. removal of Ozon navigation/export/manual-report joins;
5. controlled credential/allowlist boundary;
6. evidence-backed provider coverage on the same commercial benchmark;
7. provider-specific artifact/output capability transparency.

All remain hypotheses until live benchmark results exist.

## 9. Current Bridge/data assessment before live testing

Current accepted registry breadth remains `PROMISING` for V2 because it exposes major read families across Seller and Performance APIs.

However commercial support must not be inferred solely from endpoint presence. The AI must demonstrate that it can:

- discover the required evidence from a natural-language question;
- make safe explicit Bridge reads;
- perform multi-source joins correctly;
- normalize periods/identifiers;
- sort/calculate accurately;
- recognize entitlement/privacy/user-data gaps;
- use current external context when relevant;
- distinguish correlation from causation;
- produce the requested business output.

## 10. Current product-gate verdict

### Real demand
`PASS`

### Willingness to pay for underlying work
`PASS`

### Demand for automation / removal of Excel-report work
`PASS`

### Conversational AI category demand
`PASS`

### Current Bridge data breadth
`PROMISING`

### Preferred-AI / multi-model differentiation
`UNPROVEN`

### 57-row commercial core actually solved
`NOT YET PROVEN`

### Free-tier artifact/output coverage
`PUBLIC-DOC PROMISING / LIVE UNPROVEN`

## 11. Next hard gate

No broad multi-AI adapter work resumes now.

Next sequence:

1. operator reviews Commercial Query Core V2 — 57 business rows and 9 output tests;
2. freeze exact benchmark wording;
3. run GPT-5.6 Sol + Ozon Bridge on the frozen core first;
4. run representative OUT-01..OUT-09 free-tier output tests;
5. classify every failure as Bridge/data/model/adapter/entitlement/user-input/output/free-tier/safety;
6. make evidence-backed fixes where justified;
7. run the same frozen benchmark on Alice Free + Bridge;
8. compare row by row and decide what can truthfully be sold;
9. only after the commercial decision return to additional AI provider development.

Current checkpoint marker:

`COMMERCIAL_QUERY_CORE_V2_READY_57_BUSINESS_ROWS_PLUS_9_OUTPUT_TESTS_BEFORE_SOL_LIVE_BENCHMARK`
