# Roadmap — от стратегии до релиза

Версия: **2.1**  
Дата: **2026-09-08**  
Статус: **рабочий управляющий roadmap проекта / SEMANTIC-IA HANDOFF ACTIVE**

Этот каталог задаёт последовательность работы от маркетингового исследования до production-релиза сайта.

Он дополняет `marketing/RESEARCH_ROADMAP.md`: тот документ описывает исследовательские направления, а этот roadmap управляет всем проектом целиком — исследованиями, продуктовыми решениями, контентом, разработкой, аналитикой, QA, запуском и пострелизным измерением.

## Scope текущей рабочей линии

Browser/API extensions/bridges — инструменты получения evidence, а не самостоятельная цель сайта.

Исходная рабочая линия:

`цель сайта → human demand → Yandex Search/SERP → Alice → opportunity map → customer/product evidence → competitors → economics → commercial model → IA → Page Jobs/content → ТЗ → UX/UI → разработка → измерение`

Owner decision 2026-09-08 временно меняет исполнение середины цепочки:

```text
Stage 07 competitor work COMPLETE
→ Stage 08 economics DEFERRED until site/SEO is substantially ready
→ production semantic core / clustering / query→page / IA work temporarily executes in Yandex_direct as KW-002 greenfield Kwork rehearsal
→ accepted KW-002 result returns to blood_sand
→ reconcile/accept IA + Page Jobs authorities
→ continue product/content/design/development roadmap
```

Cross-repo authority:

`marketing/roadmap/KW002_YANDEX_DIRECT_SEMANTIC_HANDOFF_2026-09-08.md`

---

# Жёсткое правило структуры

Roadmap имеет ровно два уровня:

1. **Пункт** — крупный этап проекта.
2. **Шаг** — непосредственно выполняемая часть этого пункта.

До начала нового пункта обязательно:

- записать конечный список его шагов;
- оценить примерное число рабочих ранов;
- определить ожидаемый результат каждого шага;
- определить критерий завершения;
- определить зависимости и блокеры.

## Статусы

- `[ ]` — не начато;
- `[~]` — в работе;
- `[x]` — выполнено;
- `[!]` — заблокировано/обязательная пауза;
- `[>]` — временно выполняется во внешнем связанном workspace/repository.

Обсуждение в чате **не считается завершением**. Нужен зафиксированный результат/артефакт/измерение в GitHub.

Continuity rule:

> каждый завершённый исследовательский проход и каждый decision-grade набор результатов сохраняется в репозитории до перехода к следующему шагу.

---

# Общий roadmap

## Исследование и стратегия

- [x] **01. Зафиксировать стратегию и правила принятия решений** — [`01_STRATEGY_AND_DECISION_RULES.md`](01_STRATEGY_AND_DECISION_RULES.md).
- [x] **02. Завершить архитектуру исследовательских данных** — [`02_RESEARCH_DATA_ARCHITECTURE.md`](02_RESEARCH_DATA_ARCHITECTURE.md).
- [x] **03. Полностью измерить поисковый спрос / Wordstat** — [`03_WORDSTAT_DEMAND_MEASUREMENT.md`](03_WORDSTAT_DEMAND_MEASUREMENT.md); final R1: `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`.
- [~] **03A. Marketplace/API tooling и assortment master** — параллельная инфраструктурная ветка; не является текущей SEO-задачей. [`03A_MARKETPLACE_API_TOOLING_AND_ASSORTMENT.md`](03A_MARKETPLACE_API_TOOLING_AND_ASSORTMENT.md).
- [x] **04. Исследовать реальный Yandex Search/SERP и Alice AI** — [`04_YANDEX_SERP_ALICE_RESEARCH.md`](04_YANDEX_SERP_ALICE_RESEARCH.md); final R2: `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`.
- [x] **05. Свести Wordstat + Search/SERP + Alice в единую карту возможностей** — [`05_OPPORTUNITY_MAP.md`](05_OPPORTUNITY_MAP.md); final R3: `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`.
- [x] **06. Завершить исследование покупателей и полный паспорт SKU** — [`06_BUYER_EVIDENCE_AND_SKU_PASSPORT.md`](06_BUYER_EVIDENCE_AND_SKU_PASSPORT.md); final R4: `marketing/research/R4_STAGE06_BUYER_SKU_EVIDENCE_FINAL_2026-09-08.md`.
- [x] **07. Завершить конкурентную разведку и определить реальные конкурентные преимущества** — final R5: `marketing/research/R5_STAGE07_COMPETITIVE_ADVANTAGE_FINAL_2026-09-08.md`.
- [!] **08. Посчитать экономику каналов и direct-commerce** — **DEFERRED BY OWNER**; вернуться после существенной готовности SEO/site, не блокирует текущую semantic/IA работу.
- [ ] **09. Принять окончательную коммерческую модель сайта** — остаётся отдельным решением; не подменяется KW-002.

## Временный cross-repo semantic/IA handoff

- [>] **KW-002 greenfield semantic-core rehearsal на Blood & Sand** — выполняется в `MaksimUnimax/Yandex_direct`, branch `roadmap/kwork-productization-2026-08-28`, path `extension/docs/kwork/KW002_SEMANTIC_CORE_FROM_SCRATCH/`.

Ожидаемый возврат:

```text
final semantic core
SERP-backed cluster master
query→page map
site IA
Page Jobs
internal-link model
competitor-derived semantic gaps
Search-vs-AI-search reconciliation
client/implementation-ready structure artifacts
```

Старые Blood & Sand research conclusions до финальной заморозки KW-002 в тест не подаются.

## Проектирование продукта и контента

- [>] **10. Сформировать окончательную информационную архитектуру сайта** — materially prepared inside KW-002, считается завершённым в blood_sand только после импорта и owner acceptance.
- [>] **11. Сформировать полный контент-план и Page Jobs** — Page Jobs/semantic page roles materially prepared inside KW-002; полный контент-план/тексты остаются последующей работой после импорта.
- [ ] **12. Сформировать продуктовое и техническое ТЗ** — предварительно 4–8 ранов.
- [ ] **13. Спроектировать UX/UI и ключевые пользовательские сценарии** — предварительно 4–10 ранов.
- [ ] **14. Подготовить контент и медиаматериалы к разработке** — предварительно 5–15 ранов.

## Разработка

- [ ] **15. Создать техническую основу сайта в отдельной `site/`** — предварительно 4–8 ранов.
- [ ] **16. Реализовать коммерческую часть: каталог, карточки, корзина, checkout и marketplace-пути** — предварительно 8–16 ранов.
- [ ] **17. Реализовать SEO + AI-ready слой** — предварительно 4–8 ранов.
- [ ] **18. Реализовать систему аналитики Search / Alice / Human / Robot / Commerce** — предварительно 4–8 ранов.
- [ ] **19. Загрузить и связать первоначальный контент** — предварительно 3–8 ранов.

## Проверка и запуск

- [ ] **20. Провести функциональный, мобильный, performance, security и commerce QA** — предварительно 5–10 ранов.
- [ ] **21. Провести предрелизный SEO / AI / structured-data аудит** — предварительно 3–6 ранов.
- [ ] **22. Выполнить ограниченный production launch** — предварительно 2–4 рана.
- [ ] **23. Накопить первую реальную Search / Alice / Commerce статистику** — ориентир 3–6 аналитических проходов.
- [ ] **24. Сопоставить прогнозы с реальными данными и выполнить корректировки** — предварительно 4–10 ранов.
- [ ] **25. Полноценный релиз и переход к циклу масштабирования** — предварительно 2–4 рана.

---

# Текущая точка — 2026-09-08

Закрыто:

```text
01 strategy
02 data architecture
03 Wordstat R1
04 Yandex Search/SERP + Alice R2
05 opportunity map R3
06 buyer/SKU evidence R4
07 competitor/defensible advantage R5
```

Текущее активное направление:

> **KW-002 in Yandex_direct — построить с нуля production semantic core + clustering + query→page + IA + Page Jobs для Blood & Sand как чистый тест коммерческого Kwork.**

## Next exact step in this repository

> **WAIT FOR KW-002 PREPARED ROADMAP OWNER APPROVAL AND EXECUTION; do not independently rebuild final semantic core/IA here in parallel.**

После принятия KW-002 результат импортируется и reconciles Stage 10/11 перед продолжением ТЗ/контента/UX/UI.
