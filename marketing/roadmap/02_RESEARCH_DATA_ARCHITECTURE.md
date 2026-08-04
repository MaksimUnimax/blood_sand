# 02 — Архитектура исследовательских данных

Статус: **[~] В РАБОТЕ**  
Дата начала: 2026-08-04  
Оценка: **5 ранов**  
Фактически выполнено: **4/5 ранов**

## Цель пункта

До массового Wordstat-съёма, Yandex SERP/Alice исследования и последующего сведения результатов создать единую архитектуру данных, чтобы каждый новый результат сохранялся один раз, с понятным происхождением, не смешивал raw-данные с интерпретацией и мог быть связан с Query Evidence Ledger.

## Критерий завершения пункта

Пункт считается завершённым, когда:

- определены канонические слои данных и их назначение;
- определены каталоги, имена файлов и правила версионирования/датирования;
- определены обязательные идентификаторы и provenance;
- определены отдельные форматы хранения Wordstat, Yandex SERP, Alice и customer/marketplace evidence;
- определено, как данные попадают в Query Evidence Ledger;
- определены правила обновления без потери истории;
- определены проверки качества/полноты перед переходом к массовому сбору;
- архитектура проверена на пригодность для пунктов 03–05 roadmap.

---

# Шаги

## [x] 02.1 — Провести аудит уже существующих файлов и найти архитектурные пробелы

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Проверены существующие strategy/data/Wordstat/SERP-Alice файлы. Подтверждено, что основа пригодна, но требовались формальные правила слоёв данных, идентификаторов, повторных измерений, null/status semantics, связей с Ledger и quality checks.

**Артефакт шага:** аудит зафиксирован в истории этого файла и является основанием для 02.2–02.5.

## [x] 02.2 — Зафиксировать канонические слои данных, каталоги и правила имён

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Создан канонический документ:

- `marketing/data/DATA_ARCHITECTURE.md`

Зафиксирован поток:

`registry/input → raw evidence → normalized observations → Query Evidence Ledger → derived analysis / decisions`

Зафиксированы роли `registry`, `raw`, `normalized`, `ledger`, `derived`, целевая структура каталогов, UTC timestamps, append-only raw history, naming pattern и запрет secrets в data layer.

**Артефакт шага:** `marketing/data/DATA_ARCHITECTURE.md`.

## [x] 02.3 — Зафиксировать канонические схемы, идентификаторы и provenance для всех источников

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Создан канонический контракт:

- `marketing/data/DATA_SCHEMA_CONTRACT.md`

Зафиксированы сущности `Query`, `Measurement`, `Observation`, `Ledger record`, стабильные ID, schema envelope, provenance/source types, `OBSERVED / INFERRED / DERIVED`, status/null semantics, отдельные схемы Wordstat/SERP/Alice/customer/marketplace/post-launch и трассировка `normalized → raw → ledger`.

Обновлён:

- `marketing/data/query_evidence_ledger_template.csv`

В Ledger добавлены технические поля трассировки measurement/observation IDs.

**Артефакты шага:** `marketing/data/DATA_SCHEMA_CONTRACT.md` и обновлённый `query_evidence_ledger_template.csv`.

## [x] 02.4 — Описать поток обновления Query Evidence Ledger и проверки качества

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Создан канонический документ:

- `marketing/data/DATA_WORKFLOW_AND_QUALITY.md`

Зафиксирован workflow:

`capture/measurement → raw evidence → normalized observations → validation → Ledger update → H/A/C/O review → derived analysis / decision`

Определены quality gates:

- RAW — наличие primary evidence, timestamp, source, scope, отсутствие secrets и технической негодности;
- NORMALIZED — schema/IDs/provenance/raw_ref/null semantics/observed-vs-inferred;
- LEDGER — каждое сводное поле должно быть трассируемо до validated observation;
- H/A/C/O — изменение оценки требует явной причины и evidence;
- DECISION — решение не должно опираться только на frequency и обязано учитывать принятую стратегическую иерархию.

Зафиксированы отдельные проверки для Wordstat, Yandex SERP, Alice, customer и marketplace evidence, правила повторных измерений, invalid/superseded records и случаи, когда Ledger запрещено обновлять как факт.

Определён минимальный acceptance checklist evidence перед использованием в решениях.

**Артефакт шага:** `marketing/data/DATA_WORKFLOW_AND_QUALITY.md`.

## [ ] 02.5 — Проверить архитектуру на реальном Wordstat-примере и готовность к пунктам 03–05

**Оценка:** 1 ран.

Ожидаемый результат: прогнать уже имеющийся `getTop("печать велеса")` через принятую схему, устранить найденные несостыковки, проверить критерии завершения пункта и либо закрыть 02, либо зафиксировать блокер.

---

# Текущее состояние

- [x] 02.1 — аудит существующих данных;
- [x] 02.2 — слои/каталоги/имена;
- [x] 02.3 — схемы/ID/provenance;
- [x] 02.4 — workflow/quality checks;
- [ ] 02.5 — реальная проверка и закрытие.

Следующий шаг: **02.5**.
