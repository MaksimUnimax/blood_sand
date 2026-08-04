# 02 — Архитектура исследовательских данных

Статус: **[~] В РАБОТЕ**  
Дата начала: 2026-08-04  
Оценка: **5 ранов**  
Фактически выполнено: **3/5 ранов**

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

Зафиксированы сущности `Query`, `Measurement`, `Observation`, `Ledger record` и их роли.

Зафиксированы ID:

- `query_id = q_<12hex>` из canonical query string;
- `measurement_id = m_<source>_<UTC timestamp>_<8hex>`;
- `observation_id` — уникальная normalized-запись внутри measurement.

Зафиксированы:

- общая envelope-схема normalized observations;
- canonical provenance/source types;
- `OBSERVED / INFERRED / DERIVED`;
- status semantics `MEASURED / NOT_MEASURED / NOT_AVAILABLE / NOT_APPLICABLE / INVALID`;
- правило, что измеренный `0` не равен отсутствию данных;
- отдельные схемы Wordstat, Yandex SERP, Alice, customer evidence, marketplace evidence;
- будущие схемы Webmaster Search, Webmaster Alice, Metrika Human/Robot и Commerce;
- связи `normalized → measurement → raw` и `ledger → measurements/observations`;
- запрет смешивать Alice observed/inferred;
- правило, что legacy `yandex_serp_alice_capture_template.csv` не используется как каноническая объединённая модель для будущего массового сбора.

Обновлён:

- `marketing/data/query_evidence_ledger_template.csv`

В Ledger добавлены технические поля трассировки:

- `schema_version`;
- `latest_wordstat_measurement_id`;
- `latest_serp_measurement_id`;
- `latest_alice_measurement_id`;
- `evidence_observation_ids`.

**Артефакты шага:** `marketing/data/DATA_SCHEMA_CONTRACT.md` и обновлённый `query_evidence_ledger_template.csv`.

## [ ] 02.4 — Описать поток обновления Query Evidence Ledger и проверки качества

**Оценка:** 1 ран.

Ожидаемый результат: понятный процесс `получили наблюдение → сохранили raw → нормализовали → обновили Ledger → пересмотрели H/A/C/O → приняли или не приняли решение`, без потери истории и без смешивания источников, плюс quality gates.

## [ ] 02.5 — Проверить архитектуру на реальном Wordstat-примере и готовность к пунктам 03–05

**Оценка:** 1 ран.

Ожидаемый результат: прогнать уже имеющийся `getTop("печать велеса")` через принятую схему, устранить найденные несостыковки, проверить критерии завершения пункта и либо закрыть 02, либо зафиксировать блокер.

---

# Текущее состояние

- [x] 02.1 — аудит существующих данных;
- [x] 02.2 — слои/каталоги/имена;
- [x] 02.3 — схемы/ID/provenance;
- [ ] 02.4 — workflow/quality checks;
- [ ] 02.5 — реальная проверка и закрытие.

Следующий шаг: **02.4**.
