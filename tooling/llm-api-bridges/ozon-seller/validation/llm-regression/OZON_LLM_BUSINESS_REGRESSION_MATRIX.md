# Ozon Seller Bridge — cross-LLM business regression matrix

Status: CURRENT 44-ROW AUTHORITY
Date: 2026-09-12
Canonical baseline marker: `AUTHORITATIVE_TERMINAL_SOL_RESULTS__44_OF_44_ROWS_COMPLETE`

This matrix is the compact cross-LLM view. Detailed prompts, required results, transcript evidence, and run history belong in the dedicated document for each target LLM.

Historical `OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md` is a 43-row snapshot and remains historical evidence only.

## Accounting

| Measure | Sol/GPT baseline | Alice |
|---|---:|---:|
| Defined canonical tests | 44 | 44 |
| Transcript-backed executed tests in this cross-LLM harness | 44 baseline rows | 0 |
| Current target status | COMPLETE BASELINE | NOT_RUN |
| Live certification implied by this table | No | No |

## Matrix

| ID | Business objective | Sol/GPT terminal baseline | Alice latest | Alice evidence | Regression delta |
|---|---|---|---|---|---|
| STD-01 | Продажи за день: выручка + заказанные единицы | PASS | NOT_RUN | — | — |
| STD-02 | Продажи по дням; 3 лучших и 3 худших дня | PASS | NOT_RUN | — | — |
| STD-03 | Топ-20 товаров по выручке | PASS | NOT_RUN | — | — |
| STD-04 | Сравнение двух периодов: выручка, штуки, % изменения | PASS | NOT_RUN | — | — |
| STD-05 | Объяснение резкого падения продаж | PASS_WITH_LIMITS | NOT_RUN | — | — |
| STD-06 | Что сегодня требует внимания в первую очередь | PASS | NOT_RUN | — | — |
| STD-07 | Скоро закончится / медленно лежит / что пополнять | PASS | NOT_RUN | — | — |
| STD-08 | Текущий остаток по складам | PASS | NOT_RUN | — | — |
| STD-09 | Вчерашние продажи по складам | PASS | NOT_RUN | — | — |
| STD-10 | Складская история по конкретному товару | PASS_REAL_EXTERNAL_INCIDENT | NOT_RUN | — | — |
| STD-11 | Куда делась FBO-единица без продажи | PASS | NOT_RUN | — | — |
| STD-12 | Все активные поставки и стадии | PASS | NOT_RUN | — | — |
| STD-13 | Поставка приехала, но товар не принят / не продаётся | PASS_WITH_EXPLICIT_PROVENANCE_LIMIT | NOT_RUN | — | — |
| STD-14 | Остаток есть, но товар невидим / доставка недоступна | PASS_NO_CURRENT_CASE_FOUND | NOT_RUN | — | — |
| STD-15 | Товары/склады с ограничениями доставки | PASS_CURRENT_ZERO | NOT_RUN | — | — |
| STD-16 | Расход рекламы за 7 дней; самые дорогие кампании | PASS | NOT_RUN | — | — |
| STD-17 | Кампании/товары, впустую тратящие бюджет | PASS | NOT_RUN | — | — |
| STD-18 | Реклама на товар, который заканчивается / отсутствует | PASS | NOT_RUN | — | — |
| STD-19 | Реклама на слабые/невидимые карточки | PASS_WITH_TWO_ADVERTISED_FAILED_UPDATE_WARNINGS_AND_UNIFORM_RICH_CONTENT_GAP | NOT_RUN | — | — |
| STD-20 | Почему вырос ДРР | PASS_WITH_RECORDED_TRANSIENT_ANALYTICS_429_RECOVERY | NOT_RUN | — | — |
| CAP-01 | Product/catalog inventory | PASS | NOT_RUN | — | — |
| CAP-02 | Offer/product visibility | PASS | NOT_RUN | — | — |
| CAP-03 | Card/content quality | PASS | NOT_RUN | — | — |
| CAP-04 | Stock by warehouses | PASS | NOT_RUN | — | — |
| CAP-05 | Turnover/stock analytics | PASS_WITH_PROVIDER_OMISSION_LIMIT | NOT_RUN | — | — |
| CAP-06 | FBO orders | PASS_WITH_EXPLICIT_RECONCILIATION_LIMIT | NOT_RUN | — | — |
| CAP-07 | FBS orders | PASS | NOT_RUN | — | — |
| CAP-08 | Supplies | PASS_WITH_PROVIDER_DATA_GAP | NOT_RUN | — | — |
| CAP-09 | Returns/cancellations | PASS_WITH_EXPLICIT_NO_RECENT_ROWS_BOUNDARY | NOT_RUN | — | — |
| CAP-10 | Finance/accruals | PASS | NOT_RUN | — | — |
| CAP-11 | Commissions/services/logistics | PASS_WITH_CURRENT_DATA_BOUNDARY | NOT_RUN | — | — |
| CAP-12 | Advertising campaigns | PASS | NOT_RUN | — | — |
| CAP-13 | Ad spend | PASS_WITH_EXPLICIT_ATTRIBUTION_RULE | NOT_RUN | — | — |
| CAP-14 | SKU inside campaigns | PASS_WITH_EXPLICIT_ATTRIBUTION_RULE | NOT_RUN | — | — |
| CAP-15 | Search queries/analytics | PASS_WITH_SEARCH_CONTRACT_LIMIT | NOT_RUN | — | — |
| CAP-16 | Categories/taxonomy | PASS_WITH_QUERYABILITY_BOUNDARY | NOT_RUN | — | — |
| CAP-17 | Category attributes | PASS_WITH_RUNTIME_SCOPE_BOUNDARY | NOT_RUN | — | — |
| CAP-18 | Tariffs/limits/quotas | PASS_WITH_DOCUMENTED_BOUNDARIES | NOT_RUN | — | — |
| CAP-19 | Help/operation discovery | PASS | NOT_RUN | — | — |
| CAP-20 | Bridge + external-world investigation | PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY | NOT_RUN | — | — |
| CAP-21 | SEO/semantic core own card | PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP | NOT_RUN | — | — |
| CAP-22 | SEO competitor positioning | PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY | NOT_RUN | — | — |
| CAP-23 | Category/search position | PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES | NOT_RUN | — | — |
| CAP-24 | Monthly unit economics SKU | PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY | NOT_RUN | — | — |

## Update policy

For every target LLM:

1. add/update its compact result column here only from transcript-backed evidence;
2. maintain a dedicated per-LLM regression suite containing the test prompt, required result, detailed verdict, and raw dialogue evidence;
3. never erase an earlier run — append a new run record and update `latest` in this matrix;
4. record regressions as semantic deltas, not merely HTTP status changes;
5. do not treat a Bridge/provider failure as an LLM reasoning failure unless evidence proves that classification.

Current Alice authority: `ALICE_BUSINESS_REGRESSION_SUITE.md`.