# R1 — Wordstat Root GetTop Log

Дата начала: 2026-08-04  
Статус: **ACTIVE — roadmap 03.2**

Этот файл ведёт последовательный журнал root-level `GetTop` measurements. Каждый вывод ниже относится только к Wordstat human-demand evidence и не подменяет Yandex SERP, Alice AI или commerce evidence.

## Прогресс root set

- root measurements с валидным GetTop: **8/14**;
- из них выполнено непосредственно в roadmap 03: **7**;
- historical baseline: **1** (`печать велеса`).

## 1. `печать велеса`

- historical live measurement;
- `totalCount = 3350`;
- raw: `marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json`.

Ключевые observed child results: `значение=617`, `медвежья лапа=343`, `оберег печать велеса=198`, `купить=120`, `подвеска=80`. Child counts пересекаются и не суммируются как уникальный спрос.

## 2. `оберег печать велеса`

- `query_id = q_a7bcbc7f088c`;
- `measurement_id = m_wordstat_20260804_0ec6b952`;
- Россия `225`, `DEVICE_ALL`;
- `totalCount = 198`;
- 13 `RESULT`, 15 `ASSOCIATION`.

Артефакты: raw `marketing/data/raw/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.json`, normalized `marketing/data/normalized/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.csv`.

Вывод: отдельный human-demand кластер подтверждён; meaning/slavic ветки заметны, автомобильный use case не проявился, associations в основном шумовые.

## 3. `подвеска печать велеса`

- `query_id = q_45793464bf62`;
- `measurement_id = m_wordstat_20260805_12d50a1c`;
- `totalCount = 80`;
- 6 `RESULT`, 11 `ASSOCIATION`.

Ключевые `RESULT`: `серебряная подвеска=20`, `купить подвеску=8`, `подвеска оберег=5`.

Вывод: product-form demand подтверждён; есть прямой purchase-oriented child и отдельная серебряная ветка.

## 4. `печать велеса медвежья лапа`

- `query_id = q_b3389c7563b6`;
- `measurement_id = m_wordstat_20260805_946e9aeb`;
- `totalCount = 343`;
- 10 `RESULT`, 7 `ASSOCIATION`.

Ключевые `RESULT`: `значение=147`, `значение для мужчин=34`, `тату=28`, `купить=23`, `серебро купить=17`, `оберег=16`.

Вывод: самостоятельный заметный variant-root; meaning-ветка сильная, коммерческий child существует, tattoo-intent отделяется от товарного.

## 5. `печать велеса волчья лапа`

- `query_id = q_31806ca53d61`;
- `measurement_id = m_wordstat_20260805_8799de8a`;
- `totalCount = 129`;
- 5 `RESULT`, 8 `ASSOCIATION`.

Ключевые `RESULT`: `значение=58`, `для мужчин=30`, `для женщин=12`, `тату=4`.

Вывод: wolf-root заметно меньше bear-root в том же типе измерения; explicit `купить` в returned RESULT отсутствует, что не доказывает отсутствие коммерческого спроса.

## 6. `печать велеса в машину`

- `query_id = q_4ab5a09494a0`;
- `measurement_id = m_wordstat_20260805_5ea42d6a`;
- `totalCount = 5`;
- HTTP 200 response содержал только `totalCount`; `results` и `associations` отсутствовали.

Артефакты: raw `marketing/data/raw/wordstat/20260805__wordstat__gettop__pechat-velesa-v-mashinu__225__all.json`, normalized `marketing/data/normalized/wordstat/20260805__wordstat__gettop__pechat-velesa-v-mashinu__225__all.csv`.

Вывод: прямая связка Печати Велеса с автомобилем имеет очень малый broad signal; automotive cluster этим не закрывается.

## 7. `оберег в машину`

Measurement:

- дата capture: `2026-08-05` (точность DATE; bridge не передал точное время);
- версия bridge: `1.1.0`;
- `query_id = q_16798cf404fd`;
- `measurement_id = m_wordstat_20260805_60f98dd1`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200;
- `totalCount = 1388`;
- 48 `RESULT`;
- 11 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__obereg-v-mashinu__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__obereg-v-mashinu__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `оберег в машину` — 1388;
- `оберег от сглаза в машину` — 122;
- `обереги в машину купить` — 121;
- `оберег в дорогу на машине` — 73;
- `славянский оберег в машину` — 72;
- `оберег в машину от аварий` — 69;
- `подвеска оберег в машину` — 65;
- `обереги в машину какой лучше выбрать` — 12;
- `оберег в машину из серебра` — 11.

### Что это позволяет утверждать сейчас

1. Общий automotive root `оберег в машину` существенно крупнее прямой связки `печать велеса в машину` (`1388` против `5`).
2. Внутри root есть явный purchase-intent (`купить=121`) и product-form (`подвеска оберег=65`).
3. Славянская ветка наблюдается как реальный RESULT (`72`), а не только association.
4. Значительная часть хвоста относится к религиозным, DIY, защитным и иным поднамерениям; их нельзя механически объединять в одну коммерческую страницу.
5. Associations не считаются child demand и не суммируются с RESULT.

## 8. `славянский оберег в машину`

Measurement:

- дата capture: `2026-08-05` (точность DATE; bridge не передал точное время);
- версия bridge: `1.1.0`;
- `query_id = q_dec36683e8e1`;
- `measurement_id = m_wordstat_20260805_a164a34f`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200;
- `totalCount = 72`;
- 3 `RESULT`;
- 13 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__slavyanskiy-obereg-v-mashinu__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__slavyanskiy-obereg-v-mashinu__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `славянский оберег в машину` — 72;
- `славянский оберег в машину чур` — 7;
- `славянский оберег в машину для семьи` — 5.

### Что это позволяет утверждать сейчас

1. Славянский automotive subcluster существует, но broad signal (`72`) намного уже общего `оберег в машину` (`1388`).
2. Returned RESULT set очень короткий; explicit purchase-формулировка в нём не появилась. Это не доказывает нулевой commercial intent.
3. Associations в основном уходят в широкую славянскую/амулетную тематику и не повышаются до спроса на наш SKU автоматически.
4. Этот root подтверждает нишу для славянского позиционирования, но page/offer решение остаётся pending operator + SERP/Alice evidence.

## Autorun live acceptance — текущий факт

Три последовательных API measurement прошли без ручного Copy: `печать велеса в машину` → `оберег в машину` → `славянский оберег в машину`. Во всех трёх случаях расширение автоматически захватило новый `WORDSTAT_API_V1`, выполнило один Yandex request, вернуло `WORDSTAT_RESULT_V1` с настроенным префиксом и отправило его в ChatGPT. Это эксплуатационный факт текущей сессии, а не изменение документации расширения.

## Следующий root

`подвеска на зеркало в машину` — GetTop / Россия / DEVICE_ALL.

Причина: это последний оставшийся automotive root из исходного root-set перед переходом к meaning/comparison/choice roots; он напрямую проверяет форму товара и способ размещения, максимально близкие текущему SKU.