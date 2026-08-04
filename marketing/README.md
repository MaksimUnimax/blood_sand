# Marketing Workspace

Это постоянная рабочая область по маркетингу, SEO, GEO/AEO, AI-поиску, товарной выдаче, воронке продаж и экономике собственного сайта бренда «Кровь и Песок».

## Зачем существует этот раздел

Чтобы решения по будущему интернет-ресурсу не зависели от памяти, отдельных чатов или разовых советов. Здесь хранятся цели, подтверждённые факты, гипотезы, принятые решения, исследования, KPI, измерения и требования к будущей разработке.

## Жёсткое разделение `marketing/` и будущего сайта

`marketing/` и код будущего сайта — разные рабочие области.

В `marketing/` находятся исследования, семантика, конкурентная разведка, источники, экономика, KPI, решения и требования.

В `marketing/` не помещаются frontend/backend-код, компоненты, CSS/JS, production-конфиги и runtime-данные сайта.

Когда начнётся разработка, она живёт в отдельной верхнеуровневой директории, предварительно `site/`.

## Основная стратегия

- [`STRATEGY_AI_NATIVE_HYBRID_SEARCH_COMMERCE.md`](STRATEGY_AI_NATIVE_HYBRID_SEARCH_COMMERCE.md) — принятая основная стратегия SEO/маркетинга: Hybrid Search Commerce + Search-first Alice/AI.

Ключевой принцип: обычный поиск — фундамент, Alice AI — обязательная вторая поверхность discovery/выбора, конечный критерий — пользовательская ценность и дополнительный коммерческий результат напрямую или через marketplace.

## Управляющий roadmap

- [`roadmap/README.md`](roadmap/README.md) — end-to-end roadmap до production release.

Правила:

- только два уровня: **пункт → шаг**;
- каждый новый пункт перед началом один раз разбивается на конечный список шагов;
- шаги дальше не дробятся;
- фиксируется оценка ранов;
- после выполнения каждого шага обновляется его статус;
- после всех шагов закрывается сам пункт;
- обсуждение без артефакта/измерения/решения не считается выполнением.

Закрыты:

- [`roadmap/01_STRATEGY_AND_DECISION_RULES.md`](roadmap/01_STRATEGY_AND_DECISION_RULES.md);
- [`roadmap/02_RESEARCH_DATA_ARCHITECTURE.md`](roadmap/02_RESEARCH_DATA_ARCHITECTURE.md).

Следующий пункт: **03 — полный Wordstat measurement**; пока не начат.

## Ключевые документы

- [`MARKETING_CHARTER.md`](MARKETING_CHARTER.md) — зачем создаётся сайт и его границы.
- [`STRATEGY_AI_NATIVE_HYBRID_SEARCH_COMMERCE.md`](STRATEGY_AI_NATIVE_HYBRID_SEARCH_COMMERCE.md) — стратегия маркетинга, SEO и AI-поиска.
- [`roadmap/README.md`](roadmap/README.md) — управляющий delivery roadmap.
- [`RESEARCH_BASELINE_2026-08-01.md`](RESEARCH_BASELINE_2026-08-01.md) — исследовательская база.
- [`RESEARCH_ROADMAP.md`](RESEARCH_ROADMAP.md) — supporting roadmap исследовательских направлений.
- [`DECISIONS.md`](DECISIONS.md) — журнал решений/гипотез/open questions.
- [`SOURCES.md`](SOURCES.md) — реестр источников.

## Текущие исследования

- [`research/R1_SEMANTIC_MAP_PECHAT_VELESA_2026-08-01.md`](research/R1_SEMANTIC_MAP_PECHAT_VELESA_2026-08-01.md)
- [`research/R1_WORDSTAT_MEASUREMENT_SPEC_2026-08-04.md`](research/R1_WORDSTAT_MEASUREMENT_SPEC_2026-08-04.md)
- [`research/R2_COMPETITIVE_LANDSCAPE_PECHAT_VELESA_2026-08-01.md`](research/R2_COMPETITIVE_LANDSCAPE_PECHAT_VELESA_2026-08-01.md)
- [`research/R2_PUBLIC_SEARCH_SNAPSHOT_2026-08-04.md`](research/R2_PUBLIC_SEARCH_SNAPSHOT_2026-08-04.md)
- [`research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`](research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md)
- [`research/R3_MARKETING_PAGE_JOBS_2026-08-04.md`](research/R3_MARKETING_PAGE_JOBS_2026-08-04.md)
- [`research/R5_LOGISTICS_DIRECT_CHECKOUT_2026-08-04.md`](research/R5_LOGISTICS_DIRECT_CHECKOUT_2026-08-04.md)

## Каноническая архитектура данных

Основной pipeline:

`registry/input → raw evidence → normalized observations → Query Evidence Ledger → derived analysis / decisions`

Документы:

- [`data/DATA_ARCHITECTURE.md`](data/DATA_ARCHITECTURE.md) — слои, каталоги, naming и история измерений;
- [`data/DATA_SCHEMA_CONTRACT.md`](data/DATA_SCHEMA_CONTRACT.md) — schema 1.1, IDs, provenance, `observed_at_precision`, null/status semantics;
- [`data/DATA_WORKFLOW_AND_QUALITY.md`](data/DATA_WORKFLOW_AND_QUALITY.md) — workflow и quality gates;
- [`data/query_evidence_ledger_template.csv`](data/query_evidence_ledger_template.csv) — шаблон Ledger;
- [`data/ledger/query_evidence_ledger.csv`](data/ledger/query_evidence_ledger.csv) — текущий канонический Ledger;
- [`data/derived/reports/2026-08-04_wordstat_data_architecture_acceptance.md`](data/derived/reports/2026-08-04_wordstat_data_architecture_acceptance.md) — acceptance test на live Wordstat.

Существующие рабочие/legacy данные:

- `data/wordstat_seed_queries.csv` — registry/input queue по смыслу;
- `data/yandex_serp_alice_capture_template.csv` — legacy capture template, не каноническая объединённая схема будущего массового SERP/Alice сбора;
- `data/wordstat/*.json` — historical raw Wordstat evidence.

## Правила работы

1. **Факт, гипотеза и решение не смешиваются.** Факт имеет evidence; гипотеза маркируется; решение имеет основание.
2. **Приоритет источников:** официальная документация → независимые измерения → отраслевые отчёты → пользовательские наблюдения → собственная аналитика.
3. **Динамические факты имеют дату проверки.**
4. **Никаких SEO/GEO «магических правил» без evidence.**
5. **Сайт строится после маркетинговой модели.**
6. **Главная коммерческая метрика — не трафик сам по себе.**
7. **Не смешивать исследования с кодом сайта.**
8. **Не подменять закрытый/авторизованный источник proxy-данными.**
9. **Не смешивать provenance.** Wordstat, SERP, Alice, Webmaster, customer, Metrika и commerce — разные измерения.
10. **Стратегическая последовательность:** Wordstat → direct Yandex SERP → Alice AI → customer/marketplace evidence → H/A/C/O → Page Job → решение.
11. **Исполнение проекта ведётся через `roadmap/`.**
12. **Исследовательские данные проходят канонический pipeline.** Registry не факт; raw неизменяем; normalized связан с raw; Ledger — сводное состояние; derived — воспроизводимые выводы.
13. **Не придумывать отсутствующее время измерения.** Schema 1.1 хранит `observed_at_precision`; historical date-only evidence остаётся date-only.
14. **Empty не равен zero.** Для измеряемых полей используются explicit status values.

## Текущий стоп-критерий

Пока не завершены исследования первого этапа, окончательный дизайн и техническая архитектура сайта не фиксируются как неизменяемые. Следующий рабочий этап — roadmap 03, полный Wordstat measurement по принятой AI-Native Hybrid Search Commerce стратегии.