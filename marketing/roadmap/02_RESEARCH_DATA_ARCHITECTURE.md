# 02 — Архитектура исследовательских данных

Статус: **[x] ВЫПОЛНЕНО**  
Дата начала: 2026-08-04  
Дата закрытия: 2026-08-04  
Оценка: **5 ранов**  
Фактически выполнено: **5/5 ранов**

## Цель пункта

До массового Wordstat-съёма, Yandex SERP/Alice исследования и последующего сведения результатов создать единую архитектуру данных, чтобы каждый новый результат сохранялся с понятным происхождением, не смешивал raw-данные с интерпретацией и был трассируем до Query Evidence Ledger.

## Критерий завершения пункта

Пункт считается завершённым, когда:

- определены канонические слои данных и их назначение;
- определены каталоги, naming и история измерений;
- определены обязательные ID и provenance;
- определены форматы Wordstat, Yandex SERP, Alice, customer/marketplace evidence;
- определён workflow обновления Ledger;
- определены null/zero/status semantics;
- определены quality gates;
- архитектура проверена на реальном measurement и пригодна для roadmap 03–05.

---

# Шаги

## [x] 02.1 — Провести аудит существующих файлов и найти архитектурные пробелы

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Проверены strategy/data/Wordstat/SERP-Alice файлы. Подтверждено, что основа пригодна, но требовались формальные правила слоёв, ID, повторных измерений, null/status semantics, связей с Ledger и quality checks.

## [x] 02.2 — Зафиксировать канонические слои данных, каталоги и правила имён

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Артефакт:

- `marketing/data/DATA_ARCHITECTURE.md`

Канонический поток:

`registry/input → raw evidence → normalized observations → Query Evidence Ledger → derived analysis / decisions`

Зафиксированы append-only raw history, UTC для новых captures, naming, роли `registry/raw/normalized/ledger/derived` и запрет secrets в data layer.

## [x] 02.3 — Зафиксировать канонические схемы, идентификаторы и provenance

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Артефакты:

- `marketing/data/DATA_SCHEMA_CONTRACT.md`;
- `marketing/data/query_evidence_ledger_template.csv`.

Зафиксированы Query / Measurement / Observation / Ledger record, `query_id`, `measurement_id`, `observation_id`, source types, `OBSERVED/INFERRED/DERIVED`, null/status semantics и отдельные схемы источников.

После acceptance test контракт обновлён до **1.1**: добавлен `observed_at_precision` и поддержка historical date-only measurements без выдумывания времени.

## [x] 02.4 — Описать workflow обновления Ledger и quality gates

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Артефакт:

- `marketing/data/DATA_WORKFLOW_AND_QUALITY.md`

Workflow:

`capture/measurement → raw → normalized → validation → Ledger → H/A/C/O → derived/decision`

Определены gates RAW / NORMALIZED / LEDGER / H-A-C-O / DECISION и специальные проверки Wordstat, SERP, Alice, customer и marketplace evidence.

## [x] 02.5 — Проверить архитектуру на реальном Wordstat measurement и готовность к 03–05

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Проверен live raw:

- `marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json`

Реальный measurement:

- root query: `печать велеса`;
- `query_id = q_e624da6cb26d`;
- `measurement_id = m_wordstat_20260804_8448d708`;
- `totalCount = 3350`;
- 100 RESULT observations;
- 6 ASSOCIATION observations.

Acceptance test выявил и устранил две архитектурные неоднозначности:

- historical raw содержит только дату, поэтому schema 1.1 хранит `observed_at_precision=DATE` вместо выдуманного времени;
- Ledger template получил explicit status fields, чтобы empty не означал одновременно 0 и not measured.

Созданы:

- `marketing/data/normalized/wordstat/20260804__wordstat__gettop__pechat-velesa__225__all__acceptance.csv`;
- `marketing/data/ledger/query_evidence_ledger.csv`;
- `marketing/data/derived/reports/2026-08-04_wordstat_data_architecture_acceptance.md`.

Решено не переносить historical raw физически: он остаётся на исходном пути и связывается через `raw_ref`, поэтому Git history и существующие ссылки не ломаются.

Quality gates: **RAW PASS / NORMALIZED PASS / LEDGER PASS / H-A-C-O PASS / DECISION PASS**.

---

# Итог пункта

- [x] 02.1 — аудит;
- [x] 02.2 — layers/catalogs/naming;
- [x] 02.3 — schemas/IDs/provenance;
- [x] 02.4 — workflow/quality gates;
- [x] 02.5 — live acceptance test.

**Пункт 02 закрыт. Архитектура исследовательских данных готова к массовому Wordstat-съёму и последующим Yandex SERP/Alice измерениям.**

Следующий пункт roadmap:

> **03 — Полностью измерить поисковый спрос / Wordstat.**

Пункт 03 пока не начат. Перед началом он должен быть один раз разбит на конечный список шагов уровня `03.1`, `03.2`, ... без дальнейшего вложения.