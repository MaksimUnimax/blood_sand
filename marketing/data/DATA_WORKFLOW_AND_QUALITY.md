# Data Workflow & Quality Gates

Версия: 1.0  
Дата: 2026-08-04  
Статус: **канонический workflow обновления Query Evidence Ledger и quality gates**

Этот документ дополняет `DATA_ARCHITECTURE.md` и `DATA_SCHEMA_CONTRACT.md` и определяет, как новое наблюдение проходит путь от первичного evidence до сводного Ledger и аналитического решения.

## 1. Канонический workflow

Для любого нового источника действует одна последовательность:

`capture/measurement → raw evidence → normalized observations → validation → Ledger update → H/A/C/O review → derived analysis / decision`

Переход к следующей стадии разрешён только после прохождения quality gate предыдущей.

## 2. Measurement / capture

На этапе измерения фиксируются:

- источник;
- root query/topic, если применимо;
- операция/метод;
- дата и время;
- регион;
- устройство/scope;
- request metadata;
- технический результат измерения;
- raw snapshot/reference.

Measurement не должен сразу превращаться в вывод о приоритете страницы.

## 3. Raw evidence

Raw сохраняется как первичное доказательство.

Обязательные правила:

- append-only;
- не переписывать старое измерение новым;
- не исправлять payload вручную ради удобства анализа;
- не удалять неудобные/неожиданные результаты;
- secrets/API keys/tokens не сохранять;
- аналитические заметки отделять от source payload.

### Quality Gate RAW

Measurement допускается к нормализации, только если:

- raw evidence существует;
- есть timestamp;
- понятен source;
- понятен scope измерения;
- raw можно однозначно связать с measurement;
- snapshot не содержит секретов;
- measurement не является заведомо технически сломанным.

Если gate не пройден, запись получает `INVALID` или измерение повторяется; Ledger не обновляется как факт.

## 4. Normalization

Из raw создаются одна или несколько normalized observations по `DATA_SCHEMA_CONTRACT.md`.

Каждая observation обязана:

- иметь `schema_version`;
- иметь уникальный `measurement_id` и `observation_id`;
- иметь правильный `source_type`;
- иметь `evidence_mode`;
- содержать `raw_ref`;
- не менять смысл исходного evidence;
- отделять `OBSERVED`, `INFERRED` и `DERIVED`.

### Quality Gate NORMALIZED

Observation может использоваться дальше только если:

- schema обязательных полей заполнена;
- `observation_id` уникален;
- `measurement_id` существует;
- `raw_ref` разрешается в реальный evidence;
- query/topic связан через `query_id`, если это применимо;
- region/device/status не противоречат raw;
- null/zero semantics однозначны;
- `ALICE_FANOUT_INFERRED` не помечен как observed;
- association Wordstat не подменена обычным result;
- public web search не помечен как direct Yandex SERP.

## 5. Query Evidence Ledger update

Ledger — не журнал всех измерений, а текущее сводное состояние query/topic.

При обновлении записи:

- сохраняется стабильный `query_id`;
- обновляется `last_measured_at`;
- добавляются relevant provenance/source types;
- latest measurement IDs обновляются только для соответствующего источника;
- `evidence_observation_ids` дополняются/актуализируются;
- сводные числовые поля меняются только на основании validated observations;
- старый raw/normalized evidence не уничтожается;
- если новое measurement противоречит старому, Ledger отражает текущее состояние, а история остаётся трассируемой.

### Quality Gate LEDGER

Перед сохранением обновлённой строки проверяется:

- query ID не изменился без причины;
- обновляемое поле подтверждается конкретной observation;
- zero не возник из empty/null;
- источник не перепутан;
- последние measurement IDs соответствуют фактическим источникам;
- `evidence_observation_ids` содержат доказательства для значимых утверждений;
- derived/inferred данные не выданы за observed;
- клики на marketplace не записаны как продажи без атрибуции.

## 6. H/A/C/O review

После появления нового существенного evidence можно пересмотреть четыре независимые оценки:

- `H` — Human demand;
- `A` — Alice importance;
- `C` — Commercial value;
- `O` — Owned-asset value.

Правила:

- оценки не обязаны меняться после каждого measurement;
- изменение оценки должно иметь причину;
- один сильный сигнал не обязан автоматически менять все четыре оси;
- Wordstat влияет прежде всего на H, но может косвенно менять C;
- Alice source/fan-out влияет прежде всего на A;
- customer/marketplace evidence может влиять на C/O;
- никакой единой «магической суммы» H+A+C+O не вводится без отдельного решения.

### Quality Gate H/A/C/O

Если оценка меняется, в Ledger/derived note должна быть понятна причина и evidence, на котором изменение основано.

## 7. Derived analysis и решения

Derived analysis строится только поверх validated normalized observations и Ledger.

К derived относятся:

- opportunity maps;
- cluster prioritization;
- page candidate decisions;
- Page Jobs;
- сравнительные отчёты;
- scorecards;
- рекомендации по структуре сайта.

Решение должно быть трассируемо обратно до query/topic и evidence.

### Quality Gate DECISION

До принятия решения о странице/контенте/приоритете проверяется:

- есть ли фактическое evidence;
- какие источники его подтверждают;
- нет ли конфликта observed vs inferred;
- не делается ли вывод только по raw frequency;
- учтены ли H/A/C/O отдельно;
- применено ли стратегическое правило конфликтов `Business value > SEO foundation > AI visibility > raw traffic`;
- при равных вариантах выбран ли более AI-ready вариант.

## 8. Правила повторного измерения

Повторное measurement:

- создаёт новый `measurement_id`;
- создаёт новые observations;
- не переписывает старые raw/normalized records;
- может обновить latest fields в Ledger;
- может привести к смене решения, но предыдущая история должна оставаться проверяемой через Git + evidence IDs.

Если старое measurement признано ошибочным:

- raw сохраняется;
- соответствующие observations получают `INVALID`/`SUPERSEDED`;
- Ledger пересобирается на валидных observations;
- причина фиксации invalid/superseded документируется.

## 9. Минимальный checklist перед использованием evidence

Evidence допускается в решение, если одновременно:

- [ ] известен источник;
- [ ] есть дата/время наблюдения;
- [ ] есть raw reference;
- [ ] есть measurement ID;
- [ ] есть observation ID;
- [ ] provenance корректен;
- [ ] evidence mode корректен;
- [ ] query/topic идентифицирован;
- [ ] region/device/status заполнены, если применимо;
- [ ] null не подменяет zero;
- [ ] observed не смешан с inferred;
- [ ] запись не помечена `INVALID`;
- [ ] фактический вывод не шире, чем поддерживает source.

## 10. Источники с особыми проверками

### Wordstat

Проверять:

- метод;
- root phrase;
- region/device;
- relation type `RESULT` vs `ASSOCIATION`;
- counts не суммируются как уникальный спрос;
- broad/phrase/exact не смешиваются.

### Yandex SERP

Проверять:

- это прямой Yandex measurement, а не обычный web search;
- region/device/date;
- одна позиция = одна observation;
- Top-10 snapshot хранится целиком.

### Alice AI

Проверять:

- root input;
- дата наблюдения;
- sources хранятся отдельно;
- observed fan-out отделён от inferred;
- один Alice snapshot не интерпретируется как постоянная закономерность.

### Customer evidence

Проверять:

- source/platform;
- реальный excerpt/paraphrase не перепутан с нашей интерпретацией;
- не делать обобщение по одному отзыву без соответствующей оговорки.

### Marketplace evidence

Проверять:

- listing/page snapshot;
- цена/rating/reviews имеют captured_at;
- наличие карточки не считается доказательством продаж;
- outbound click на marketplace не считается продажей без атрибуции.

## 11. Когда Ledger не обновляется

Ledger не обновляется как факт, если:

- measurement технически невалиден;
- raw отсутствует;
- source неясен;
- observed/inferred невозможно разделить;
- query/topic не удаётся однозначно связать;
- данные являются только предположением без маркировки inferred;
- есть конфликт схемы, который сначала требует исправления нормализации.

Такие записи могут временно существовать как `INVALID`, `NOT_AVAILABLE` или исследовательская гипотеза, но не должны влиять на factual summary.

## 12. Готовность к массовому сбору

Перед переходом к пунктам 03–04 roadmap система считается готовой, если:

- raw storage rules закреплены;
- normalized schemas закреплены;
- ID/provenance закреплены;
- Ledger traceability закреплена;
- quality gates закреплены;
- реальный measurement успешно проходит полный pipeline в шаге 02.5.

Именно шаг 02.5 является acceptance test этой архитектуры.