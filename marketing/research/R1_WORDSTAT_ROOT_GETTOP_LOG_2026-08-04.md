# R1 — Wordstat Root GetTop Log

Дата начала: 2026-08-04  
Статус: **ACTIVE — roadmap 03.2**

Этот файл ведёт последовательный журнал root-level `GetTop` measurements. Каждый вывод ниже относится только к Wordstat human-demand evidence и не подменяет Yandex SERP, Alice AI или commerce evidence.

## Прогресс root set

- root measurements с валидным GetTop: **2/14**;
- из них выполнено непосредственно в roadmap 03: **1**;
- historical baseline: **1** (`печать велеса`).

## 1. `печать велеса`

Источник:

- historical live measurement;
- `totalCount = 3350`;
- raw: `marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json`.

Ключевые observed child results:

- `печать велеса значение` — 617;
- `печать велеса медвежья лапа` — 343;
- `оберег печать велеса` — 198;
- `печать велеса купить` — 120;
- `подвеска печать велеса` — 80.

Ограничение: child counts пересекаются и не суммируются как уникальный спрос.

## 2. `оберег печать велеса`

Measurement:

- `query_id = q_a7bcbc7f088c`;
- `measurement_id = m_wordstat_20260804_0ec6b952`;
- Россия `225`;
- `DEVICE_ALL`;
- `numPhrases = 100`;
- HTTP 200;
- `totalCount = 198`;
- 13 `RESULT`;
- 15 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `оберег печать велеса` — 198;
- `оберег печать велеса значение` — 44;
- `славянский оберег печать велеса` — 42;
- `оберег печать велеса медвежья` — 16;
- `оберег печать велеса медвежья лапа` — 16;
- `славянский оберег печать велеса значение` — 16;
- `оберег печать велеса значение для мужчины` — 13;
- `печать велеса что означает оберег` — 12;
- остальные observed results — 6 или 5.

### Что это позволяет утверждать сейчас

1. Root `оберег печать велеса` имеет подтверждённый человеческий спрос: broad `totalCount = 198` за текущий 30-day GetTop scope.
2. Внутри root заметна информационно-смысловая ветка (`значение`, `что означает`) и славянская квалификация.
3. Медвежья вариация присутствует, но в этом root имеет существенно меньшие counts, чем общий root.
4. Явная формулировка `подвеска оберег печать велеса` присутствует, но только с count 5 в этом measurement.
5. В 13 returned `RESULT` нет отдельной явной формулировки с `купить`; это не доказывает отсутствие purchase intent вообще — только то, что такой result не попал в returned set этого root.
6. Автомобильный use case здесь не проявился; его по-прежнему нужно измерять отдельными automotive roots.

### Associations

Большинство returned associations лексически широкие или шумовые: `амулет ...`, игровые/киношные и иные нерелевантные формулировки. `славянские амулеты` тематически ближе, но остаётся только `ASSOCIATION`, поэтому отдельный measurement не назначается автоматически.

## Следующий root

`подвеска печать велеса` — GetTop / Россия / DEVICE_ALL.

Причина: это прямой product-form root, который уже наблюдался в broad `печать велеса` с count 80 и поможет понять, есть ли самостоятельный хвост вокруг подвески как формы товара.
