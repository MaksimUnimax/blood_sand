# R1 — Wordstat Root GetTop Log

Дата начала: 2026-08-04  
Статус: **ACTIVE — roadmap 03.2**

Этот файл ведёт последовательный журнал root-level `GetTop` measurements. Каждый вывод ниже относится только к Wordstat human-demand evidence и не подменяет Yandex SERP, Alice AI или commerce evidence.

## Прогресс root set

- root measurements с валидным GetTop: **4/14**;
- из них выполнено непосредственно в roadmap 03: **3**;
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
- HTTP 200;
- `totalCount = 198`;
- 13 `RESULT`;
- 15 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`: `значение=44`, `славянский оберег=42`, медвежьи варианты по `16`, `подвеска оберег=5`.

Вывод: отдельный human-demand кластер подтверждён; meaning/slavic ветки заметны, автомобильный use case не проявился, associations в основном шумовые и не повышаются до Tier 2 автоматически.

## 3. `подвеска печать велеса`

Measurement:

- дата capture: `2026-08-05` (точность DATE);
- `query_id = q_45793464bf62`;
- `measurement_id = m_wordstat_20260805_12d50a1c`;
- Россия `225`;
- `DEVICE_ALL`;
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
- `подвеска оберег печать велеса` — 5.

Вывод: product-form demand подтверждён; есть прямой purchase-oriented child и отдельная серебряная ветка. Automotive use case не проявился; associations шумовые.

## 4. `печать велеса медвежья лапа`

Measurement:

- дата capture: `2026-08-05` (точность DATE; bridge не передал точное время);
- `query_id = q_b3389c7563b6`;
- `measurement_id = m_wordstat_20260805_946e9aeb`;
- Россия `225`;
- `DEVICE_ALL`;
- `numPhrases = 100`;
- HTTP 200;
- `totalCount = 343`;
- 10 `RESULT`;
- 7 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__pechat-velesa-medvezhya-lapa__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__pechat-velesa-medvezhya-lapa__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `печать велеса медвежья лапа` — 343;
- `печать велеса медвежья лапа значение` — 147;
- `печать велеса медвежья лапа значение для мужчин` — 34;
- `тату печать велеса медвежья лапа` — 28;
- `печать велеса медвежья лапа купить` — 23;
- `печать велеса медвежья лапа серебро купить` — 17;
- `оберег печать велеса медвежья лапа` — 16;
- `печать велеса медвежья лапа что означает` — 9.

### Что это позволяет утверждать сейчас

1. `медвежья лапа` — самостоятельный и заметный variant-root с broad `totalCount = 343`.
2. Meaning-ветка очень заметна внутри returned results: `значение=147` и дополнительные meaning-формулировки. Эти counts пересекаются и не суммируются.
3. Есть прямой purchase-oriented child `... купить = 23` и более узкий `... серебро купить = 17`; коммерческий спрос существует, но он уже broad variant-root.
4. Tattoo-ветка (`28`, плюс эскиз `8`) заметна и должна оставаться отдельным намерением, а не автоматически превращаться в коммерческую страницу товара.
5. Формулировка `оберег ... медвежья лапа = 16` подтверждает пересечение product-variant и obereg terminology.
6. Все 7 associations нерелевантны текущему SKU/контентному решению и не получают Tier 2 measurement автоматически.

## Следующий root

`печать велеса волчья лапа` — GetTop / Россия / DEVICE_ALL.

Причина: это второй основной variant-root, уже наблюдавшийся в historical `печать велеса` с count `129`; отдельный GetTop нужен для честного сравнения структуры human demand медвежьей и волчьей веток до operator/SERP/Alice этапов.
