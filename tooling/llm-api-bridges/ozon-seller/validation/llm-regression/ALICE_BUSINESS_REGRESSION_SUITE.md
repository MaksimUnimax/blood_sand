# Alice — Ozon Seller Bridge business regression suite

Status: TEST DEFINITION COMPLETE / ALICE EXECUTION NOT YET ACCOUNTED
Date: 2026-09-12
Target: ordinary Alice chat + Ozon Seller Bridge
Canonical baseline: final Sol/GPT 44-row business gate

## Current accounting

- Canonical tests defined: **44/44**
- STD tests: **20/20 defined**
- CAP tests: **24/24 defined**
- Alice transcript-backed executions recorded in this document: **0/44**
- Alice live certification: **NOT CLAIMED**
- Raw Alice dialogue imports: **0**

`NOT_RUN` means exactly that: the canonical test exists, but no supplied Alice transcript has yet been admitted as evidence for that row.

## What constitutes a correct Alice result

These invariants apply to every row unless a row adds stricter requirements:

1. Use actual seller/provider evidence. Do not invent seller values, search positions, competitors, stock, orders, finance, or advertising attribution.
2. Missing provider row is not zero.
3. `null` is not zero, absence, or failure unless the provider contract proves that meaning.
4. State provider/API/queryability/coverage limits explicitly.
5. Preserve attribution boundaries: CPC vs CPO, finance rows, supplies, competitor discovery, historical advertising, and warehouse semantics.
6. Validate a user premise before explaining it; if evidence disproves it, say so.
7. If a complete list is claimed, terminal pagination/completeness must be established where relevant.
8. Do not rely on hidden retry, pagination, polling, fan-out, refetch, resend, or silent provider calls.
9. Keep private seller evidence separate from public/external evidence.
10. Arithmetic must reconcile.
11. Dynamic values may differ from the historical Sol/GPT run. Passing means matching the required business semantics and evidence rules, not reproducing stale numbers.
12. The answer must solve the business question. A raw API payload alone is not sufficient.

## Canonical tests

### STD-01 — Sales for one day
**Prompt:** `Покажи продажи за [день]: выручку и количество заказанных единиц.`

**Required result:** Return the requested day's actual revenue and ordered-unit count, identify the period/date and evidence source, and never fabricate values if the provider fails or omits data.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-02 — Daily sales with best/worst days
**Prompt:** `Покажи продажи по дням за [период] и назови 3 лучших и 3 худших дня по выручке.`

**Required result:** Return daily rows for the requested period and an exact revenue-sorted top 3 and bottom 3. Ties/order and arithmetic must be defensible from the returned rows.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-03 — Top 20 products by revenue
**Prompt:** `Покажи топ-20 товаров по выручке за [период].`

**Required result:** Return exactly the top 20 by revenue when at least 20 supported rows exist; if fewer exist, return all supported rows and explicitly state that the source contains fewer than 20.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-04 — Period comparison
**Prompt:** `Сравни [период A] и [период B]: выручка, заказанные единицы и процент изменения.`

**Required result:** Show A and B revenue and ordered units plus absolute/percentage changes. Verify arithmetic and make zero-denominator cases explicit rather than inventing a percentage.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-05 — Explain a sharp sales decline
**Prompt:** `Объясни, почему продажи резко упали в [период/день].`

**Required result:** Produce an evidence-led diagnosis. Clearly separate proven contributing factors from hypotheses and from unavailable search/market evidence. Do not turn correlation into causation.

**Sol/GPT baseline:** `PASS_WITH_LIMITS`

**Alice latest:** `NOT_RUN`

### STD-06 — Manager priority audit
**Prompt:** `Что сегодня в моём Ozon-магазине требует внимания в первую очередь?`

**Required result:** Produce a prioritized action list grounded in current catalog, stock, orders, advertising and finance evidence where available. Each priority needs a reason/severity, not a generic checklist.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-07 — Stockout, slow stock, replenishment
**Prompt:** `Какие товары скоро закончатся, какие лежат медленно и что нужно пополнить?`

**Required result:** Separate near-stockout, slow-moving and replenishment candidates using the necessary stock/turnover surfaces. Do not pretend a single stock endpoint proves all three classifications.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-08 — Current stock by warehouse
**Prompt:** `Покажи текущие остатки по складам.`

**Required result:** Return current warehouse-level stock with FBO/FBS semantics preserved and completeness/pagination made explicit. Do not mix warehouse IDs from incompatible domains.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-09 — Yesterday sales by warehouse
**Prompt:** `Покажи вчерашние продажи по складам и сведи FBO и FBS в общий итог.`

**Required result:** Return warehouse-level yesterday sales, separate FBO and FBS subtotals, and a reconciled combined total. Respect privacy/personal-data constraints for buyer-sensitive FBS detail.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-10 — SKU warehouse history
**Prompt:** `Покажи складскую историю по товару [SKU] и объясни, что с ним происходило.`

**Required result:** Build an evidence-backed chronology/history for the requested SKU and distinguish observed events/states from unsupported causal explanations.

**Sol/GPT baseline:** `PASS_REAL_EXTERNAL_INCIDENT`

**Alice latest:** `NOT_RUN`

### STD-11 — Missing FBO unit without sale
**Prompt:** `Куда делась конкретная FBO-единица товара [SKU], если продажи по ней не было?`

**Required result:** Locate the unit/state as far as evidence permits (for example reserved, if actually proven). Distinguish what FBO evidence proves from what FBS or provider data cannot prove.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-12 — All active supplies
**Prompt:** `Покажи все активные поставки и их текущие стадии.`

**Required result:** Return all active supplies and current stages. If the source is paginated, prove terminal pagination before claiming completeness.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-13 — Supply arrived but goods not accepted/selling
**Prompt:** `Поставка приехала, но товар не принят или не продаётся. Что происходит?`

**Required result:** Diagnose using supply status plus current stock/product state. Do not attribute current inventory to a specific supply unless the evidence contains that provenance link.

**Sol/GPT baseline:** `PASS_WITH_EXPLICIT_PROVENANCE_LIMIT`

**Alice latest:** `NOT_RUN`

### STD-14 — Stock exists but item invisible/undeliverable
**Prompt:** `Найди товары, у которых есть остаток, но они невидимы или доставка недоступна.`

**Required result:** Return concrete evidence-backed cases. If no current case is found, explicitly state that none was found in the checked scope instead of manufacturing an example.

**Sol/GPT baseline:** `PASS_NO_CURRENT_CASE_FOUND`

**Alice latest:** `NOT_RUN`

### STD-15 — Delivery restrictions
**Prompt:** `Покажи товары или склады, где сейчас есть ограничения доставки.`

**Required result:** Return current restrictions and their scope. If the relevant provider surface returns no restricted warehouses/items, report current zero within that scope, not a universal claim.

**Sol/GPT baseline:** `PASS_CURRENT_ZERO`

**Alice latest:** `NOT_RUN`

### STD-16 — Advertising spend for seven days
**Prompt:** `Сколько потрачено на рекламу за последние 7 дней и какие кампании самые дорогие?`

**Required result:** Return total advertising spend for the requested seven-day window and rank campaigns by spend using consistent units/semantics.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-17 — Wasted advertising budget
**Prompt:** `Какие кампании или товары впустую тратят рекламный бюджет?`

**Required result:** Identify waste only from available advertising/sales evidence. Preserve CPC/CPO semantics and do not distribute campaign-level CPO spend to SKU without proven attribution.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-18 — Advertising on low/out-of-stock products
**Prompt:** `Есть ли реклама на товары, которые заканчиваются или отсутствуют на нужных складах?`

**Required result:** Intersect active advertising with stock. Distinguish FBO/Ozon low or zero stock from a true total FBO+FBS stockout.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### STD-19 — Advertising on weak/invisible cards
**Prompt:** `Есть ли реклама на слабые, проблемные или невидимые карточки?`

**Required result:** Intersect advertising with card visibility/update/content-quality evidence and name only evidence-backed problems; separate item-specific failures from common content gaps.

**Sol/GPT baseline:** `PASS_WITH_TWO_ADVERTISED_FAILED_UPDATE_WARNINGS_AND_UNIFORM_RICH_CONTENT_GAP`

**Alice latest:** `NOT_RUN`

### STD-20 — Why DRR increased
**Prompt:** `Почему вырос ДРР? Сопоставь рекламные расходы и продажи и проверь, действительно ли ДРР вырос.`

**Required result:** First test the premise using comparable advertising-spend and sales periods, then compute/compare DRR. If DRR did not increase, explicitly reject the premise rather than explaining a nonexistent rise.

**Sol/GPT baseline:** `PASS_WITH_RECORDED_TRANSIENT_ANALYTICS_429_RECOVERY`

**Alice latest:** `NOT_RUN`

### CAP-01 — Catalog inventory
**Prompt:** `Покажи, какие товары сейчас есть в моём каталоге Ozon.`

**Required result:** Return the current assortment/catalog inventory within API scope with the IDs/statuses needed for seller work and explicit completeness limits.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-02 — Offer/product visibility
**Prompt:** `Какие мои товары сейчас видимы/невидимы или имеют проблемы с показом/предложением?`

**Required result:** Identify current visible, invisible or problematic offers using explicit status evidence; do not infer visibility from unrelated absence.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-03 — Card/content quality
**Prompt:** `Оцени качество контента моих карточек: названия, атрибуты, описания и заметные пробелы.`

**Required result:** Evaluate actual card information/attributes and report concrete per-card or common content gaps without inventing missing fields that were not inspected.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-04 — Stock by warehouses
**Prompt:** `Покажи остатки товаров по складам с корректным разделением FBO и FBS.`

**Required result:** Return current warehouse stock while preserving FBO/FBS identity and warehouse-ID semantics; do not merge incompatible identifiers.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-05 — Turnover/stock analytics
**Prompt:** `Оцени оборачиваемость и stock-analytics по ассортименту; отдельно укажи, если провайдер пропускает SKU.`

**Required result:** Return supported turnover/stock analytics and explicitly identify omitted SKUs as provider omissions/unknowns, never as zero metrics.

**Sol/GPT baseline:** `PASS_WITH_PROVIDER_OMISSION_LIMIT`

**Alice latest:** `NOT_RUN`

### CAP-06 — FBO orders
**Prompt:** `Покажи текущие FBO-заказы и сведи их с доступными идентификаторами без смешивания несовместимых ID.`

**Required result:** Return current FBO orders and perform only evidence-supported reconciliation across identifiers. Never merge IDs merely because values look similar.

**Sol/GPT baseline:** `PASS_WITH_EXPLICIT_RECONCILIATION_LIMIT`

**Alice latest:** `NOT_RUN`

### CAP-07 — FBS orders
**Prompt:** `Покажи текущие FBS-заказы/отправления.`

**Required result:** Return current FBS orders/postings available through the read-only Bridge with correct statuses and data/privacy boundaries.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-08 — Supplies
**Prompt:** `Покажи мои поставки и что по ним сейчас известно.`

**Required result:** Return supply list/status and explicitly call out provider irregularities or missing fields rather than silently filling them.

**Sol/GPT baseline:** `PASS_WITH_PROVIDER_DATA_GAP`

**Alice latest:** `NOT_RUN`

### CAP-09 — Returns and cancellations
**Prompt:** `Покажи возвраты и причины отмен/возвратов за актуальный период.`

**Required result:** Return supported return/cancellation evidence for the period. If no recent rows are available, say that no rows were returned within the checked scope rather than asserting zero lifetime returns.

**Sol/GPT baseline:** `PASS_WITH_EXPLICIT_NO_RECENT_ROWS_BOUNDARY`

**Alice latest:** `NOT_RUN`

### CAP-10 — Finance/accruals
**Prompt:** `Покажи финансовые начисления по магазину и, где возможно, привяжи их к отправлениям/операциям.`

**Required result:** Return finance/accrual rows and types and attribute them to shipments/operations only where source identifiers support the link.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-11 — Commissions, services, logistics
**Prompt:** `Покажи комиссии, услуги и логистические расходы; отдели фактические списания от справочных тарифов.`

**Required result:** Separate actual current charges from tariff/reference pricing and state the temporal/data boundary of the evidence.

**Sol/GPT baseline:** `PASS_WITH_CURRENT_DATA_BOUNDARY`

**Alice latest:** `NOT_RUN`

### CAP-12 — Advertising campaigns
**Prompt:** `Покажи рекламные кампании и их текущие состояния.`

**Required result:** Return current campaigns with evidence-backed states/statuses and relevant start/stop information where provided.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-13 — Advertising spend semantics
**Prompt:** `Покажи рекламные расходы и правильно раздели семантику CPC и CPO.`

**Required result:** Return advertising spend while preserving CPC/CPO semantic and attribution differences. Do not make unsupported cross-model allocations.

**Sol/GPT baseline:** `PASS_WITH_EXPLICIT_ATTRIBUTION_RULE`

**Alice latest:** `NOT_RUN`

### CAP-14 — SKU inside campaigns
**Prompt:** `Покажи, какие SKU входят в рекламные кампании; не приписывай CPO-расход конкретному SKU без доказанной атрибуции.`

**Required result:** Return evidenced campaign-SKU membership. SKU-level CPC membership may be shown where supported; campaign-level CPO spend must not be assigned to a SKU without evidence.

**Sol/GPT baseline:** `PASS_WITH_EXPLICIT_ATTRIBUTION_RULE`

**Alice latest:** `NOT_RUN`

### CAP-15 — Search queries/analytics
**Prompt:** `Покажи доступную аналитику по поисковым запросам; если каких-то search rows нет у продавца, скажи об этом прямо.`

**Required result:** Return available query/search analytics and explicitly state seller-side search-row/queryability limitations. Do not fabricate missing query rows.

**Sol/GPT baseline:** `PASS_WITH_SEARCH_CONTRACT_LIMIT`

**Alice latest:** `NOT_RUN`

### CAP-16 — Categories/taxonomy
**Prompt:** `Покажи доступную категорийную/taxonomy информацию по моим товарам и границы того, что реально можно запросить.`

**Required result:** Return available category/taxonomy evidence and its queryability boundary. Do not present a limited/root-category surface as a complete generic taxonomy crawl.

**Sol/GPT baseline:** `PASS_WITH_QUERYABILITY_BOUNDARY`

**Alice latest:** `NOT_RUN`

### CAP-17 — Category/product attributes
**Prompt:** `Покажи атрибуты категорий/товаров, доступные для текущих seller-задач, и не притворяйся, что есть полный generic category crawl, если его нет.`

**Required result:** Return usable current attributes for seller tasks and clearly state the runtime/generic-discovery scope boundary.

**Sol/GPT baseline:** `PASS_WITH_RUNTIME_SCOPE_BOUNDARY`

**Alice latest:** `NOT_RUN`

### CAP-18 — Tariffs, limits, quotas
**Prompt:** `Какие у API/Bridge есть тарифы, лимиты и квоты, важные для этой задачи?`

**Required result:** Return relevant limits/quotas only from documented Help/contract/provider evidence. Do not invent numerical limits or infer a rate limit solely from an error such as HTTP 403.

**Sol/GPT baseline:** `PASS_WITH_DOCUMENTED_BOUNDARIES`

**Alice latest:** `NOT_RUN`

### CAP-19 — Help/operation discovery
**Prompt:** `Какие операции Ozon Bridge доступны для решения [задачи] и как их найти через Help?`

**Required result:** Discover the appropriate operations through Help and provide an executable operation route/guidance for the task rather than hallucinating aliases.

**Sol/GPT baseline:** `PASS`

**Alice latest:** `NOT_RUN`

### CAP-20 — Seller-private + external-world investigation
**Prompt:** `Расследуй [бизнес-проблему] с данными моего продавца и внешним публичным контекстом; чётко раздели private seller evidence и public evidence.`

**Required result:** Combine evidence only with provenance labels. Private seller facts and public/external context must remain distinguishable and conclusions must not launder one source into the other.

**Sol/GPT baseline:** `PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY`

**Alice latest:** `NOT_RUN`

### CAP-21 — SEO/semantic core for own card
**Prompt:** `Собери SEO/семантическое ядро для моей карточки [SKU] на основе доступных данных; не выдумывай рыночные запросы или позиции, которых нет в evidence.`

**Required result:** Produce semantic/SEO recommendations grounded in own-card/search evidence actually available. Missing market-query/rank evidence remains a data-readiness boundary, not invented keywords/positions presented as observed facts.

**Sol/GPT baseline:** `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP`

**Alice latest:** `NOT_RUN`

### CAP-22 — Competitor positioning
**Prompt:** `Сравни позиционирование моей карточки [SKU] с конкурентами; используй только доказанный набор конкурентов и явно укажи coverage boundary.`

**Required result:** Compare only a proven competitor set. If target-specific competitor discovery is incomplete, mark the analysis partial and state the coverage boundary rather than manufacturing competitors.

**Sol/GPT baseline:** `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY`

**Alice latest:** `NOT_RUN`

### CAP-23 — Category/search position
**Prompt:** `Покажи позицию товара [SKU] в категории/поиске и границы покрытия; null не превращай в ноль или “товара нет”.`

**Required result:** Return supported position/category/search evidence and coverage limits. Preserve `null`/unknown exactly as unknown/not supplied, never as rank 0 or confirmed absence.

**Sol/GPT baseline:** `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES`

**Alice latest:** `NOT_RUN`

### CAP-24 — Monthly SKU unit economics
**Prompt:** `Рассчитай месячную unit economics по SKU [SKU]: продажи/выручка, расходы/начисления, реклама и итог; отдельно укажи, где атрибуция исторической рекламы/placement неполна.`

**Required result:** Reconcile supported monthly SKU sales/revenue with finance charges and advertising where attribution is actually available. Quantify or clearly flag any non-attributable historical advertising/placement boundary rather than allocating it by assumption.

**Sol/GPT baseline:** `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY`

**Alice latest:** `NOT_RUN`

## Alice run ledger

No transcript-backed Alice runs have yet been imported into this document.

| Run | Date | Source MD | SHA-256 | Bridge build/version | Covered IDs | Verdict summary | Regression delta |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

## Raw dialogue evidence — append-only

When the operator supplies an Alice MD dialogue, append a new section in this form. The transcript is evidence and must be preserved verbatim; analysis goes outside the raw block.

### RUN-ALICE-XXXX

- Date: `YYYY-MM-DD`
- Source file: `<filename>.md`
- Source SHA-256: `<sha256>`
- Bridge build/version: `<known value or UNKNOWN>`
- Covered canonical IDs: `<STD/CAP IDs>`
- Per-test verdicts: `<verdicts>`
- Regression delta vs previous Alice run: `<delta>`
- Regression delta vs Sol/GPT baseline: `<delta>`
- Classification of failures: `LLM / BRIDGE / PROVIDER / TARGET_UI / INVALID_RUN`

#### Analyst notes

Add only evidence-backed interpretation here. Do not edit the transcript to make it cleaner.

#### Raw MD transcript — verbatim

```text
<full supplied MD dialogue verbatim>
```

## Regression-control rule

A later Alice dialogue never overwrites an earlier one. Each supplied dialogue becomes an append-only run. The compact cross-LLM matrix is updated to the latest supported verdict, while this document retains the history needed to detect both improvements and regressions.