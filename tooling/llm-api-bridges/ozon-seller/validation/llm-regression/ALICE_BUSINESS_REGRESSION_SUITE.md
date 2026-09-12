# Alice — Ozon Seller Bridge business regression suite

Status: TEST DEFINITION COMPLETE / ALICE 44-ROW EXECUTION NOT YET ACCOUNTED
Date: 2026-09-12
Target: ordinary Alice chat + Ozon Seller Bridge
Canonical source: `research/product/OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`
Canonical source state: `Updated: 2026-09-06` / `AUTHORITATIVE_TERMINAL_SOL_RESULTS__44_OF_44_ROWS_COMPLETE`
Supporting source: `research/product/OZON_AI_WORKER_SOL_44_CONSOLIDATED_ROOT_CAUSE_GAP_LEDGER_2026-09-06.md`

## Current accounting

- Canonical tests defined: **44/44**
- STD tests: **20/20 defined**
- CAP tests: **24/24 defined**
- Alice transcript-backed canonical executions recorded here: **0/44**
- Raw Alice dialogue imports: **0**
- Alice live certification: **NOT CLAIMED**

`NOT_RUN` means the test definition exists but no supplied Alice dialogue has yet been admitted as evidence for that row.

## How this suite is used

For each row Alice receives the canonical business prompt. The required result is semantic: current seller values may differ from the historical Sol/GPT run, but the answer must preserve the same evidence, provenance, completeness, arithmetic, attribution and safety boundaries.

These prompts are canonical regression prompts derived from the terminal 44 business questions. They are not claimed to be byte-for-byte historical user wording unless a preserved transcript proves exact wording.

## Global pass invariants

1. Use real seller/provider evidence; never invent seller values, positions, competitors, stock, orders, finance or advertising attribution.
2. Missing provider row is **not zero**.
3. `null` is **not** zero, absence, rank 0 or failure unless the provider contract proves that meaning.
4. State provider/API/queryability/entitlement/data-readiness/coverage limits explicitly.
5. Preserve FBO/FBS, warehouse-ID, CPC/CPO, finance, supply-provenance and historical-attribution semantics.
6. Check the user's premise before explaining it; reject a premise when evidence disproves it.
7. A complete list requires terminal pagination/completeness evidence where applicable.
8. No hidden retry, pagination, polling, fan-out, refetch or resend.
9. Keep private seller evidence separate from public/external evidence.
10. Arithmetic/reconciliation must be internally consistent.
11. A raw API dump without solving the business question is not a PASS.
12. Provider/Bridge/UI failures must be classified separately from Alice reasoning failures.

## Canonical 44 tests for Alice

| # | ID | Canonical Alice test prompt | Required result / acceptance target | Sol/GPT terminal baseline | Alice latest |
|---:|---|---|---|---|---|
| 1 | STD-01 | **Покажи продажи за вчера: выручку и количество заказанных единиц.** | Return actual day revenue + ordered units for the requested date. If analytics transiently fails, do not invent/zero the result and do not hide retry. | `PASS` | `NOT_RUN` |
| 2 | STD-02 | **Покажи продажи по дням за последние 7 дней и назови 3 лучших и 3 худших дня по выручке.** | Return day rows for the period and exact top-3/bottom-3 by revenue; totals/order must be derivable from evidence. | `PASS` | `NOT_RUN` |
| 3 | STD-03 | **Покажи топ-20 товаров по выручке за последние 30 дней.** | Rank supported products by revenue; return 20 if at least 20 exist, otherwise explicitly state the smaller supported set. | `PASS` | `NOT_RUN` |
| 4 | STD-04 | **Сравни последние 7 дней с предыдущими 7 днями: выручка, заказанные единицы и процент изменения.** | Show both periods, absolute values and percentage changes; handle zero denominator explicitly. | `PASS` | `NOT_RUN` |
| 5 | STD-05 | **Продажи резко упали. Проверь, действительно ли это так, и объясни возможные причины по доступным данным.** | First verify the drop; then produce evidence-led multi-factor diagnosis. Separate proven contributors from hypotheses and search/query freshness limits. | `PASS_WITH_LIMITS` | `NOT_RUN` |
| 6 | STD-06 | **Что сегодня в моём магазине Ozon требует внимания в первую очередь?** | Produce a prioritized manager audit from relevant current surfaces; every priority needs evidence/reason/severity, not generic advice. | `PASS` | `NOT_RUN` |
| 7 | STD-07 | **Какие товары скоро закончатся, какие лежат медленно и что нужно пополнить?** | Distinguish near-stockout, slow stock and replenishment candidates using the necessary stock/turnover evidence; no one-surface shortcut. | `PASS` | `NOT_RUN` |
| 8 | STD-08 | **Покажи текущие остатки по складам.** | Return current warehouse-level stock with correct warehouse/channel semantics and explicit completeness/pagination status. | `PASS` | `NOT_RUN` |
| 9 | STD-09 | **Покажи вчерашние продажи по складам и сведи FBO и FBS, не смешивая их семантику.** | Return warehouse sales with FBO/FBS provenance and reconciled total where valid; preserve privacy boundaries. | `PASS` | `NOT_RUN` |
| 10 | STD-10 | **На складе был инцидент/пожар. Проверь, был ли там мой товар и что можно доказать по доступным данным.** | Establish seller-stock exposure only from evidence. Do not claim incident causality or a historical snapshot that the data cannot prove; preserve selector/contract limitations. | `PASS_WITH_EXPLICIT_INCIDENT_CAUSALITY_AND_HISTORICAL_SNAPSHOT_LIMITS` | `NOT_RUN` |
| 11 | STD-11 | **FBO-единица товара исчезла без продажи. Куда она делась?** | Explain the disappearance only to the level supported by FBO evidence (e.g. reservation if proven); do not invent loss/sale/movement. | `PASS` | `NOT_RUN` |
| 12 | STD-12 | **Какие поставки сейчас активны и что происходит с каждой?** | Return the complete active set with lifecycle/status for each; prove terminal pagination such as terminal `last_id` before claiming all. | `PASS` | `NOT_RUN` |
| 13 | STD-13 | **Поставка приехала, но товар не принят или не продаётся. Разбери, что происходит.** | Diagnose supply status plus current sellability/stock; do not attribute current stock to a specific supply without provenance evidence. | `PASS_WITH_EXPLICIT_PROVENANCE_LIMIT` | `NOT_RUN` |
| 14 | STD-14 | **Найди товары, у которых есть остаток, но карточка невидима или доставка недоступна.** | Return concrete current cases if found; if none are found, say so within the checked scope. Do not manufacture an example. | `PASS_NO_CURRENT_CASE_FOUND` | `NOT_RUN` |
| 15 | STD-15 | **Покажи товары или склады, где сейчас есть ограничения доставки.** | Return current affected warehouses/items. A zero result is only a current scoped zero, not a universal historical claim. | `PASS_CURRENT_ZERO` | `NOT_RUN` |
| 16 | STD-16 | **Сколько потрачено на рекламу за последние 7 дней и какие кампании самые дорогие?** | Return exact supported spend for the 7-day window and rank campaigns by spend with consistent units. | `PASS` | `NOT_RUN` |
| 17 | STD-17 | **Какие кампании или товары впустую тратят рекламный бюджет?** | Identify waste from advertising + sales evidence. Preserve CPC/CPO semantics; never smear campaign-level CPO spend across SKU without attribution. | `PASS` | `NOT_RUN` |
| 18 | STD-18 | **Есть ли реклама на товары, которые заканчиваются или отсутствуют на нужных складах?** | Intersect paid advertising with stock; distinguish FBO/Ozon low/zero from a true total FBO+FBS stockout. | `PASS` | `NOT_RUN` |
| 19 | STD-19 | **Есть ли реклама на слабые, проблемные или невидимые карточки?** | Join paid ads with visibility/update/content-quality evidence; separate item-specific failures from common content gaps and do not fabricate invisibility. | `PASS_WITH_TWO_ADVERTISED_FAILED_UPDATE_WARNINGS_AND_UNIFORM_RICH_CONTENT_GAP` | `NOT_RUN` |
| 20 | STD-20 | **Почему вырос ДРР? Сопоставь рекламные расходы и продажи и сначала проверь, действительно ли ДРР вырос.** | Compare compatible periods/metrics and compute DRR. If evidence disproves the claimed rise, explicitly reject the premise instead of inventing causes. | `PASS_WITH_RECORDED_TRANSIENT_ANALYTICS_429_RECOVERY` | `NOT_RUN` |
| 21 | CAP-01 | **Покажи, какие товары сейчас есть в моём каталоге Ozon.** | Discover current catalog/product inventory without operator enumeration; include usable IDs/statuses and completeness boundary. | `PASS` | `NOT_RUN` |
| 22 | CAP-02 | **Какие товары сейчас видимы и невидимы на Ozon?** | Use the dedicated visibility evidence for the current catalog; never infer visibility from unrelated missing rows. | `PASS` | `NOT_RUN` |
| 23 | CAP-03 | **Оцени качество контента моих карточек и найди самые проблемные.** | Use actual content/card-quality evidence; identify deterministic worst-card/content gaps without inventing uninspected fields. | `PASS` | `NOT_RUN` |
| 24 | CAP-04 | **Покажи текущие остатки по складам с корректным разделением FBO и FBS.** | Return current stock while preserving FBO/FBS identifiers and warehouse-stock semantics; transport normalization must not corrupt provenance. | `PASS` | `NOT_RUN` |
| 25 | CAP-05 | **Оцени оборачиваемость и stock analytics по ассортименту. Если провайдер не вернул отдельные SKU, покажи это как unknown/omitted, а не как ноль.** | Return supported turnover analytics and explicitly classify omitted SKUs as not returned/unknown. | `PASS_WITH_PROVIDER_OMISSION_LIMIT` | `NOT_RUN` |
| 26 | CAP-06 | **Покажи склады, кластеры и логистическую географию, доступную по моим товарам/заказам.** | Return supported geography and keep FBO fulfillment warehouse IDs distinct from seller-warehouse IDs; no false ID reconciliation. | `PASS` | `NOT_RUN` |
| 27 | CAP-07 | **Покажи список поставок и их текущие статусы.** | Return current supply-order inventory/status and preserve lifecycle progression/completeness. | `PASS` | `NOT_RUN` |
| 28 | CAP-08 | **Возьми конкретную поставку и покажи детали приёмки и вложенные статусы.** | Drill into supply details; distinguish nested supply/acceptance state from broader parent-order state. | `PASS` | `NOT_RUN` |
| 29 | CAP-09 | **Покажи FBO postings/orders и, где нужно, дополни их доступной аналитикой склада.** | Return posting evidence; enrich warehouse fields only from a supported analytics source and preserve provenance. | `PASS` | `NOT_RUN` |
| 30 | CAP-10 | **Покажи цены и доступные детали цен по товарам.** | Return all-account price evidence available to the seller; if Premium/Pro detail is unavailable, mark entitlement boundary instead of fabricating details. | `PASS_WITH_ENTITLEMENT_BOUNDARY` | `NOT_RUN` |
| 31 | CAP-11 | **Покажи акции/promotions и участие моих товаров в них.** | Use dedicated action + product-participation evidence rather than assuming promotions solely from price metadata. | `PASS` | `NOT_RUN` |
| 32 | CAP-12 | **Покажи возвраты и отмены; отдельно фактические события и справочник причин.** | Return actual return/cancellation rows with explicit continuation to completeness where needed; keep event rows distinct from reason dictionary. | `PASS` | `NOT_RUN` |
| 33 | CAP-13 | **Покажи финансовый баланс и начисления и сверь, сходится ли баланс.** | Reconcile the supported balance identity; do not mislabel sales flow as payout/balance and do not double-count. | `PASS` | `NOT_RUN` |
| 34 | CAP-14 | **Покажи финансовые транзакции и сделай reconciliation по типам начислений/операций.** | Return transaction evidence with correct type semantics; provider rate-limit/transient failures must remain explicit and no hidden retry is allowed. | `PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY` | `NOT_RUN` |
| 35 | CAP-15 | **Покажи рейтинг/индекс ошибок FBS и связанные проблемные отправления.** | Separate aggregate/current index from historical affected postings; do not present historical postings as current index state. | `PASS` | `NOT_RUN` |
| 36 | CAP-16 | **Покажи aggregate по отзывам/вопросам. Если доступ запрещён, не превращай 403 в нулевое количество.** | Return supported aggregate if accessible; otherwise preserve entitlement/permission boundary and classify 403 honestly, never as zero reviews/questions. | `PASS_WITH_ENTITLEMENT_BOUNDARIES_AND_REVIEW_ENTITLEMENT_GUIDANCE_GAP` | `NOT_RUN` |
| 37 | CAP-17 | **Покажи все рекламные кампании и их текущие состояния.** | Return campaign inventory with explicit pagination until terminal completeness; no hidden autopagination. Dynamic campaign count need not equal the historical 1128. | `PASS` | `NOT_RUN` |
| 38 | CAP-18 | **Покажи рекламную статистику и объясни границы product-level покрытия.** | Return supported Performance metrics and explicitly state product-level/attribution/guidance coverage limits; no metric substitution. | `PASS_WITH_PRODUCT_LEVEL_COVERAGE_AND_GUIDANCE_GAP` | `NOT_RUN` |
| 39 | CAP-19 | **Свяжи рекламу и остатки и найди проблемные сочетания.** | Perform cross-surface ad→stock join; an absent stock row remains omitted/unknown, never stock=0. | `PASS_WITH_STOCK_PROVIDER_OMISSION_LIMIT` | `NOT_RUN` |
| 40 | CAP-20 | **Расследуй бизнес-проблему, используя мои private seller-данные и внешний публичный контекст; раздели источники.** | Combine private Seller evidence and public context with explicit provenance; never launder public inference into private fact or vice versa. | `PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY` | `NOT_RUN` |
| 41 | CAP-21 | **Собери SEO/семантическое ядро для моей карточки [SKU] на основе доступных данных. Не выдумывай рыночные запросы или позиции.** | Use factual own-card/query evidence; missing current search/query readiness remains a boundary, not invented market demand/rank. | `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP` | `NOT_RUN` |
| 42 | CAP-22 | **Сравни SEO/позиционирование моей карточки [SKU] с конкурентами. Используй только доказанно найденных конкурентов.** | If a defensibly linked target-specific competitor set is unavailable, keep the result partial and state the discovery coverage boundary; never hand-pick a competitor and call it provider-discovered. | `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` | `NOT_RUN` |
| 43 | CAP-23 | **Покажи позицию товара [SKU] в категории/поиске и границы покрытия. `position=null` не превращай в 0 или «товара нет».** | Return supported category/search-position evidence and explicit Premium/Bridge/category coverage boundary; preserve null as unknown/not supplied. | `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES` | `NOT_RUN` |
| 44 | CAP-24 | **Рассчитай месячную unit economics по SKU [SKU]: продажи/выручка, финансы/начисления, реклама и итог; отдельно покажи неполную историческую атрибуцию.** | Reconcile exact supported finance/sales core. Historical Performance SKU membership and placement/ad attribution stay explicit coverage boundaries; do not allocate unproven account/campaign costs to SKU. | `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` | `NOT_RUN` |

## Alice run ledger

No transcript-backed Alice canonical runs have yet been imported into this document.

| Run | Date | Source MD | Source SHA-256 | Bridge build/version | Covered IDs | Verdict summary | Delta vs previous Alice run | Delta vs Sol/GPT |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — |

## Transcript import and regression-control protocol

Every MD dialogue supplied by the operator becomes append-only evidence. It is not replaced by a cleaned summary.

For every import:

- preserve source filename;
- calculate/preserve SHA-256 when original file bytes are available;
- record known Bridge build/version or `UNKNOWN`;
- map the dialogue to canonical IDs;
- assign a per-test verdict;
- classify failures as `LLM / BRIDGE / PROVIDER / TARGET_UI / INVALID_RUN` where applicable;
- record delta against the previous Alice run;
- record delta against the Sol/GPT terminal baseline;
- append the complete raw MD transcript verbatim.

A new run never overwrites an earlier run. `OZON_LLM_BUSINESS_REGRESSION_MATRIX.md` shows only the latest supported Alice state; this file preserves the regression history.

## Raw dialogue evidence — append-only template

### RUN-ALICE-XXXX

- Date: `YYYY-MM-DD`
- Source file: `<filename>.md`
- Source SHA-256: `<sha256 or UNKNOWN>`
- Bridge build/version: `<value or UNKNOWN>`
- Covered canonical IDs: `<STD/CAP IDs>`
- Per-test verdicts: `<verdicts>`
- Failure classification: `<LLM / BRIDGE / PROVIDER / TARGET_UI / INVALID_RUN>`
- Regression delta vs previous Alice run: `<delta>`
- Regression delta vs Sol/GPT: `<delta>`

#### Analyst notes

Evidence-backed interpretation only. Do not alter the transcript to make the run look cleaner.

#### Raw MD transcript — verbatim

```text
<full supplied MD dialogue verbatim>
```

## Current verdict

`ALICE_CANONICAL_44_DEFINED = 44/44`

`ALICE_CANONICAL_44_EVIDENCED = 0/44`

`ALICE_LIVE_CERTIFICATION = NOT_CLAIMED`
