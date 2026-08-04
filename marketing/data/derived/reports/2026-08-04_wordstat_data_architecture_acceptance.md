# Acceptance Test — Data Architecture на live Wordstat `getTop("печать велеса")`

Дата: 2026-08-04  
Статус: **PASS**

## Цель

Проверить пункт roadmap 02.5 на уже существующем реальном Wordstat measurement и убедиться, что pipeline

`raw → normalized → validation → Ledger → derived/decision`

работает без потери происхождения данных и без смешивания фактов с интерпретацией.

## Исходный raw evidence

`marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json`

Подтверждено из raw:

- источник: Wordstat Manual Bridge;
- метод: `getTop`;
- root phrase: `печать велеса`;
- регион: `225` (Россия);
- устройство: `DEVICE_ALL`;
- HTTP status: `200`;
- `totalCount = 3350`;
- `results`: 100 записей;
- `associations`: 6 записей;
- точное время capture в raw отсутствует, сохранена только дата `2026-08-04`.

## Найденные несостыковки и исправления

### 1. Исторический raw не содержит точного времени

Старая версия schema contract требовала timestamp до секунды и тем самым вынуждала бы либо придумать время, либо признать валидный historical evidence невалидным.

Исправление:

- `DATA_SCHEMA_CONTRACT.md` обновлён до версии 1.1;
- введено `observed_at_precision`;
- для этого measurement используется `observed_at=2026-08-04`, `observed_at_precision=DATE`;
- точное время искусственно не восстанавливается.

Канонический measurement ID:

`m_wordstat_20260804_8448d708`

Root query ID:

`q_e624da6cb26d`

### 2. Ledger template имел неоднозначные пустые числовые поля

В прежнем header отсутствие Wordstat phrase/exact/mobile/desktop могло читаться и как `0`, и как `not measured`.

Исправление:

- добавлены channel-level status fields;
- добавлены paired status fields для Wordstat numeric measurements;
- добавлены status fields для Alice/Webmaster/Commerce layers.

Теперь измеренный `0` и отсутствие измерения различаются явно.

## Normalized acceptance sample

Создан:

`marketing/data/normalized/wordstat/20260804__wordstat__gettop__pechat-velesa__225__all__acceptance.csv`

В acceptance sample сохранены:

- `wordstat_summary`;
- первый RESULT;
- второй RESULT;
- последний, 100-й RESULT;
- первая ASSOCIATION;
- последняя, 6-я ASSOCIATION.

Это проверяет обе ветки `RESULT / ASSOCIATION`, границы response и трассировку к одному measurement/raw.

Каноническая нумерация полного measurement зарезервирована как:

- summary: `...summary_0001`;
- results 1–100: `...phrase_0002` – `...phrase_0101`;
- associations 1–6: `...phrase_0102` – `...phrase_0107`.

Массовая материализация всех phrase observations выполняется уже как часть пункта 03 при полном Wordstat-съёме; acceptance test не создаёт лишний дублирующий dataset до начала этого этапа.

## Ledger acceptance

Создан первый канонический Ledger:

`marketing/data/ledger/query_evidence_ledger.csv`

В него внесён root query `печать велеса` с:

- `source_types = SEED;WORDSTAT`;
- `wordstat_broad_30d = 3350`;
- `wordstat_broad_30d_status = MEASURED`;
- phrase/exact/mobile/desktop = `NOT_MEASURED`;
- SERP/Alice = `NOT_MEASURED`;
- post-launch Webmaster/Commerce = `NOT_APPLICABLE`;
- `decision_status = PENDING_MORE_EVIDENCE`.

То есть acceptance test подтверждает, что один реальный факт можно провести до Ledger, не превращая отсутствующие измерения в нули и не принимая преждевременное решение о странице.

## H/A/C/O

Для root query установлен только предварительный сигнал:

`H = PROVISIONAL_HIGH`

потому что человеческий Wordstat demand фактически наблюдался. `A/C/O` оставлены `NOT_ASSESSED`, поскольку Alice/SERP/commerce evidence для этого решения ещё не собрано.

Это соответствует правилу не превращать один источник в «магическую итоговую оценку».

## Решение по legacy-файлам

Физическая миграция исторического raw не требуется.

- `marketing/data/wordstat/...json` остаётся на исходном пути и используется через `raw_ref`;
- старые ссылки/Git history не ломаются;
- новые measurements в пунктах 03–04 должны использовать целевую структуру `raw/normalized/ledger/derived`;
- `yandex_serp_alice_capture_template.csv` остаётся legacy template и не применяется как каноническая объединённая модель будущего массового сбора.

## Quality gates

### RAW — PASS

Raw существует, source/scope/request/result известны, secrets отсутствуют, HTTP 200.

### NORMALIZED — PASS

Schema 1.1, measurement/observation IDs, provenance, `OBSERVED`, `RESULT/ASSOCIATION`, raw_ref и date precision однозначны.

### LEDGER — PASS

Root query трассируется до validated observations; 3350 не получено из суммы child rows; отсутствующие поля имеют explicit status.

### H/A/C/O — PASS

Из Wordstat изменён только Human-demand signal; остальные оси не выдуманы.

### DECISION — PASS

Финальная страница/приоритет не утверждены до Wordstat/SERP/Alice evidence следующих пунктов.

## Итог

Архитектура пригодна для roadmap 03–05.

Пункт 02 может быть закрыт: слои данных, ID/provenance, status semantics, workflow, quality gates и реальный end-to-end acceptance test существуют и согласованы.