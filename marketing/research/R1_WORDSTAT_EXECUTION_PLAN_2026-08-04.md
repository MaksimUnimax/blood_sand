# R1 — Wordstat Execution Plan

Дата: 2026-08-04  
Статус: **ACTIVE — measurement plan for roadmap 03**

Этот документ превращает `R1_WORDSTAT_MEASUREMENT_SPEC_2026-08-04.md` в реальный план исполнения через Wordstat Manual Bridge.

## 1. Принцип

Цель — не собрать максимально возможное число API-ответов, а получить достаточную для решения картину человеческого спроса до Yandex SERP/Alice этапа.

Wordstat измеряет human search demand. Он не измеряет Alice fan-out, Alice source selection, конверсию или прибыль; эти слои остаются отдельными.

## 2. Правило каждого API-вызова

Перед **каждым** executable `WORDSTAT_API_V1` command необходимо:

- заново проверить актуальную официальную цену Yandex Search API/Wordstat;
- объяснить, какой метод/phrase/region/device будет запрошен;
- назвать стоимость одного вызова;
- только после этого дать один command.

Один command = один request. API key не передаётся в чат.

## 3. Staged measurement design

Используется пять измерительных слоёв.

### A. Root GetTop discovery

Цель: понять broad demand и реальные формулировки/хвосты внутри каждого важного кластера.

Root set:

**Уже измерено**
- `печать велеса` — historical baseline, `totalCount=3350`;
- `оберег печать велеса` — roadmap 03 measurement, `totalCount=198`.

**Product / variants — осталось**
- `подвеска печать велеса`;
- `печать велеса медвежья лапа`;
- `печать велеса волчья лапа`.

**Automotive**
- `печать велеса в машину`;
- `оберег в машину`;
- `славянский оберег в машину`;
- `подвеска на зеркало в машину`.

**Meaning / comparison / choice**
- `печать велеса значение`;
- `медвежья и волчья печать велеса отличие`;
- `какой оберег выбрать в машину`.

**Gift**
- `подарок автомобилисту`;
- `подарок мужчине в машину`.

Текущий прогресс root set: **2/14** валидных GetTop.

### B. Operator precision

После root discovery для high-value queries измеряются более узкие operator forms. Первичный кандидатный набор:

- `печать велеса`;
- `оберег печать велеса`;
- `подвеска печать велеса`;
- `печать велеса медвежья лапа`;
- `печать велеса волчья лапа`;
- `оберег в машину`;
- `подвеска на зеркало в машину`;
- `печать велеса значение`;
- `подарок автомобилисту`.

Набор может быть сокращён/расширен только по результатам A.

### C. Dynamics

Предварительные cluster leaders:

- `печать велеса`;
- `оберег в машину`;
- `подвеска на зеркало в машину`;
- `печать велеса значение`;
- `подарок автомобилисту`.

### D. Device / regional sample

Device split проверяется выборочно на high-value product/automotive roots. Полный device cube для всех запросов не нужен до появления доказательства, что он меняет решение.

RegionsDistribution — выборочно для 1–2 cluster leaders, если географическая концентрация имеет практическое значение. Базовый коммерческий scope остаётся Россия.

### E. Tier 2 / gap closure

Tier 2 не измеряется массово заранее. Фраза получает отдельный measurement, если выполняется хотя бы одно:

- появилась как релевантный фактический result в GetTop;
- имеет сильную прямую связь с нашим SKU/use case;
- способна изменить решение о будущем Page Job;
- закрывает явный пробел между product/automotive/meaning/gift слоями.

Wordstat associations сами по себе не являются основанием для отдельного measurement: lexical noise отбрасывается.

## 4. Что НЕ делаем

- не суммируем child counts как уникальный спрос;
- не считаем association равным result;
- не принимаем решение о странице только по Wordstat;
- не используем raw frequency как H/A/C/O aggregate;
- не повторяем `печать велеса` GetTop без методологической причины;
- не выполняем одинаковые device/dynamics measurements для всех 37 seed phrases механически.

## 5. Хранение

Каждый новый measurement проходит `DATA_ARCHITECTURE.md`, `DATA_SCHEMA_CONTRACT.md` и `DATA_WORKFLOW_AND_QUALITY.md`.

Для новых measurements используются целевые каталоги `raw/wordstat/` и `normalized/wordstat/`. Historical live measurement `marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json` остаётся на прежнем пути и связан через `raw_ref`.

Running log root measurements:

- `marketing/research/R1_WORDSTAT_ROOT_GETTOP_LOG_2026-08-04.md`.

## 6. Текущий baseline

### `печать велеса`

- `totalCount = 3350`;
- high observed child phrases include `печать велеса значение = 617`, `печать велеса медвежья лапа = 343`, `оберег печать велеса = 198`, `печать велеса купить = 120`, `подвеска печать велеса = 80`;
- counts overlap and are not summed;
- автомобильный use case не проявился заметно в top-100 этого root, поэтому automotive roots измеряются отдельно.

### `оберег печать велеса`

- `totalCount = 198`;
- 13 RESULT и 15 ASSOCIATION;
- заметны meaning/slavic ветки;
- explicit `подвеска оберег печать велеса = 5`;
- automotive ветка не проявилась;
- associations в основном широкие/шумовые и не получают Tier 2 автоматически.

## 7. Следующий measurement

`GetTop("подвеска печать велеса")`, Россия (`225`), `DEVICE_ALL`, `numPhrases=100`.

Причина: это прямой product-form root, уже наблюдавшийся внутри broad `печать велеса` с count 80; отдельный GetTop нужен для собственного broad total и хвоста вокруг подвески как формы товара.
