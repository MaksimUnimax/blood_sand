# Roadmap — от стратегии до релиза

Версия: **1.8**  
Дата: **2026-08-26**  
Статус: **рабочий управляющий roadmap проекта**

Этот каталог задаёт последовательность работы от маркетингового исследования до production-релиза сайта.

Он дополняет `marketing/RESEARCH_ROADMAP.md`: тот документ описывает исследовательские направления, а этот roadmap управляет всем проектом целиком — исследованиями, продуктовыми решениями, контентом, разработкой, аналитикой, QA, запуском и пострелизным измерением.

## Scope текущей рабочей линии

В текущем SEO/site research диалоге **не считаются самостоятельной работой проекта разработка и отладка browser/API extensions/bridges**. Такие инструменты могут быть техническим каналом получения evidence, но не должны подменять цель сайта и не определяют текущий SEO-этап.

Текущая рабочая линия:

`цель сайта → human demand → Yandex Search/SERP → Alice → opportunity map → customer/product evidence → competitors → economics → commercial model → IA → Page Jobs/content → ТЗ → UX/UI → разработка → измерение`

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
- `[!]` — заблокировано/обязательная пауза.

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
- [ ] **06. Завершить исследование покупателей и полный паспорт SKU** — **NEXT; detailed step plan must be written before work starts**.
- [ ] **07. Завершить конкурентную разведку и определить реальные конкурентные преимущества** — предварительно 3–6 ранов.
- [ ] **08. Посчитать экономику каналов и direct-commerce** — предварительно 3–6 ранов.
- [ ] **09. Принять окончательную коммерческую модель сайта** — предварительно 2–4 рана.

## Проектирование продукта и контента

- [ ] **10. Сформировать окончательную информационную архитектуру сайта** — предварительно 3–6 ранов.
- [ ] **11. Сформировать полный контент-план и Page Jobs** — предварительно 4–8 ранов.
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

# Главная последовательность SEO/site track

`Стратегия → research data architecture → Wordstat → Yandex Search/SERP → Alice → opportunity map → customer/product evidence → competitors → economics → commercial model → IA → Page Jobs/content → ТЗ → UX/UI → разработка → SEO/AI → analytics → QA → launch → measurement → correction → release`

---

# Текущая точка — 2026-08-26

Закрыто:

- **01 — strategy**;
- **02 — research data architecture**;
- **03 — Wordstat R1**;
- **04 — Yandex Search/SERP + Alice R2**;
- **05 — opportunity map R3**.

## 04 final state

- Search primary 10/10;
- desktop representative 5/5 + additional captures;
- Yandex touch/emulated-mobile 2/2;
- accepted Alice 10/10;
- secondary Search 5/5;
- paid secondary expansion stopped;
- 23-row canonical Ledger repaired/validated.

## 05 final state

Canonical opportunity tiers:

### KEEP
- Печать Велеса family;
- Slavic category;
- Automotive protection;
- Алатырь;
- Vegvisir.

### INVESTIGATE
- broader Veles family;
- Шлем Ужаса / Агисхьяльм;
- mirror-pendant form factor.

### REJECT_AS_PRIMARY
- broad zodiac;
- generic automotive gift.

Overlap/job boundaries resolved provisionally without assigning URLs.

Canonical Stage 05 artifacts:
- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`;
- `marketing/data/normalized/opportunity_map/20260826__opportunity_units_scored_v2.csv`;
- `marketing/data/normalized/opportunity_map/20260826__opportunity_overlap_v3.csv`;
- `marketing/data/ledger/query_evidence_ledger.csv`;
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_STAGE05_VALIDATION_2026-08-26.md`.

## Next stage

> **06 — buyer evidence + complete SKU passport.**

Before any 06 measurement/work, create the detailed `06` plan according to the roadmap rule above. Do not jump to final IA, Page Jobs or site development.
