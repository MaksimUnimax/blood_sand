# R1 — Wordstat Root GetTop Log

Дата начала: 2026-08-04  
Статус: **ACTIVE — roadmap 03.2**

Этот файл ведёт последовательный журнал root-level `GetTop` measurements. Каждый вывод ниже относится только к Wordstat human-demand evidence и не подменяет Yandex SERP, Alice AI или commerce evidence.

## Прогресс root set

- root measurements с валидным GetTop: **3/14**;
- из них выполнено непосредственно в roadmap 03: **2**;
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

Большинство returned associations лексически широкие или шумовые. Они не повышаются до Tier 2 автоматически.

## 3. `подвеска печать велеса`

Measurement:

- дата capture: `2026-08-05` (точность DATE; bridge не передал точное время);
- `query_id = q_45793464bf62`;
- `measurement_id = m_wordstat_20260805_12d50a1c`;
- Россия `225`;
- `DEVICE_ALL`;
- `numPhrases = 100`;
- HTTP 200;
- `totalCount = 80`;
- 6 `RESULT`;
- 11 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__podveska-pechat-velesa__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__podveska-pechat-velesa__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `подвеска печать велеса` — 80;
- `серебряная подвеска печать велеса` — 20;
- `купить подвеску печать велеса` — 8;
- `подвеска оберег печать велеса` — 5;
- `серебряная подвеска печать велеса кузнеца мастеров` — 5;
- `продажа печать велеса подвеска золотая` — 5.

### Что это позволяет утверждать сейчас

1. Форма товара `подвеска` имеет отдельный подтверждённый human-demand root с `totalCount = 80`.
2. Внутри root есть явный коммерческий child `купить подвеску печать велеса = 8`; это прямое подтверждение purchase-oriented формулировки, хотя её объём заметно уже broad root.
3. Материал `серебряная` формирует наблюдаемую ветку (`20`), но это не означает, что наш SKU должен позиционироваться как серебряный: это только evidence о структуре спроса.
4. Связка `подвеска + оберег` присутствует с count 5, то есть терминология пересекается, но в этом root она не доминирует.
5. В returned results нет автомобильного use case; отдельные automotive roots по-прежнему обязательны.
6. Все 11 associations выглядят как lexical/similarity noise для текущей задачи и не назначаются в Tier 2 автоматически.

## Следующий root

`печать велеса медвежья лапа` — GetTop / Россия / DEVICE_ALL.

Причина: это наиболее крупная variant-ветка в historical root `печать велеса` (`343`) и отдельный variant root нужен, чтобы увидеть собственный хвост значения/покупки/материалов перед сравнением с волчьей лапой.
