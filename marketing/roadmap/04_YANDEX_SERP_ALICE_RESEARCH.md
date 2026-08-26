# 04 — Исследовать реальный Yandex Search / SERP и Alice AI

Статус: **[~] В РАБОТЕ**  
Дата фактического активного этапа: **2026-08-26**  
Оценка: **примерно 8–15 содержательных исследовательских ранов**, уточняется по secondary expansion.

## Цель пункта

Получить decision-grade evidence о том, **какие страницы и источники Яндекс реально выбирает** по приоритетным запросам бренда и как эта картина меняется между:

- обычным Search/organic layer;
- browser SERP/UI composition, где она непосредственно наблюдаема;
- consumer Alice AI;
- marketplace / independent commerce / informational sources;
- разными пользовательскими intent-классами.

Результат пункта 04 должен дать входные данные для следующего decision stage. Пункт 04 **не назначает окончательную IA, Page Jobs или количество страниц** сам по себе.

## Критерий завершения пункта

Пункт 04 закрывается, когда одновременно:

- primary query set имеет прямой Search evidence;
- типы ранжируемых страниц и marketplace/independent/info composition нормализованы;
- browser/UI-only признаки либо непосредственно измерены, либо явно помечены `NOT_OBSERVED`/`BLOCKED`;
- primary Alice inputs проверены в consumer Alice, где доступно;
- Alice answers/sources/fan-out сохранены только как direct observations;
- secondary queries добавлены только по evidence, а не из свободной семантической генерации;
- Query Evidence Ledger обновлён;
- выпущен финальный R2 report с ограничениями и передан в следующий decision stage.

---

# Жёсткие правила evidence

1. Обычный public web search не подменяет прямое Yandex evidence.
2. Direct Yandex Search API/WebSearch считается **Search provider evidence**, но не browser/UI snapshot.
3. Browser SERP layout, ads, product/rich blocks считаются наблюдёнными только при прямом UI observation.
4. Consumer Alice считается наблюдённой только по фактически полученному consumer Alice answer.
5. Search API generative output, если он будет использоваться отдельно, не переименовывается в consumer Alice UI.
6. `NOT_OBSERVED` и `BLOCKED` — валидные результаты; запрещено дорисовывать отсутствующие данные выводом.
7. Organic, ads, product/rich blocks и AI surface не смешиваются в одну «позицию».
8. Secondary expansion — только evidence-driven.
9. Любые Page Job / IA выводы на этом этапе остаются `PROVISIONAL` до объединения с Wordstat, Alice и commercial/customer evidence.
10. Каждый завершённый measurement/аналитический проход должен быть сохранён в GitHub, а не оставаться только в диалоге.

---

# Шаги

## [x] 04.1 — Зафиксировать protocol, scope и acceptance rules

Результат:

- принято разделение Search provider evidence / browser SERP / consumer Alice;
- primary query set зафиксирован;
- region для текущего первичного съёма: Russia `225`;
- результаты должны хранить request/query provenance;
- ограничения device/UI не заменяются предположениями.

## [x] 04.2 — Снять и нормализовать direct Yandex Search evidence по primary queries

**Primary query set: 10/10 direct Search measurements выполнены и сохранены.**

Измерено:

1. `славянские обереги`;
2. `печать велеса`;
3. `оберег в машину`;
4. `подвеска на зеркало в машину`;
5. `вегвизир`;
6. `талисман знак зодиака`;
7. `алатырь оберег`;
8. `оберег велес`;
9. `подарок мужчине в машину`;
10. `подарок автомобилисту`.

Для всех 10 запросов:

- status: `OK`;
- HTTP: `200`;
- request actually executed: `true`;
- automatic retry: `false`;
- region: `225`;
- Top-10 returned.

Артефакты:

- `marketing/research/R2_YANDEX_SEARCH_PRIMARY_SERP_2026-08-26.md`;
- `marketing/data/normalized/yandex_search/20260826__search__primary10__225.tsv`;
- `marketing/data/normalized/yandex_search/20260826__search__primary10__measurements.csv`;
- `marketing/data/normalized/yandex_search/20260826__search__primary10__summaries.csv`.

### Наблюдаемая intent-карта primary set

- `славянские обереги` — commercial/category-first; independent specialized sites competitive;
- `печать велеса` — strong transactional/product intent; very high marketplace/platform pressure;
- `оберег в машину` — mixed commercial + choice/use-case;
- `подвеска на зеркало в машину` — near-pure transactional form-factor / auto-accessory;
- `вегвизир` — mixed entity + commercial;
- `талисман знак зодиака` — guide/selection-first with strong stone/zodiac informational contamination;
- `алатырь оберег` — commercial-first + meaning support;
- `оберег велес` — commercial-first with strong niche independent competition;
- `подарок мужчине в машину` — broad gift-shopping, weak default fit to our pendant category;
- `подарок автомобилисту` — shopping + gift idea-selection, pendant only one possible option.

### Прямое brand evidence

По `алатырь оберег` в snippet результата #1 Wildberries непосредственно наблюдался товар:

`Кровь и Песок / Славянский оберег в машину "Алатырь (Крест Сварога)"`, `593 оценки`.

Это фиксируется как **marketplace visibility**, не как organic visibility будущего собственного сайта.

## [ ] 04.3 — Проверить browser SERP/UI признаки только там, где они decision-useful

Текущий статус:

- browser SERP composition: `NOT_OBSERVED`;
- ads: `NOT_OBSERVED`;
- visual product/rich blocks: `NOT_OBSERVED`;
- mobile vs desktop SERP composition: `NOT_OBSERVED`.

Важно:

Текущий Search API measurement не имеет подтверждённого device selector, поэтому его результаты нельзя маркировать как mobile SERP или desktop SERP.

Этот шаг не требует механически повторять все запросы в UI. UI observation проводится только там, где отсутствие UI-композиции реально мешает decision-making.

## [ ] 04.4 — Снять consumer Alice evidence по primary query set

Для тех же decision-useful roots фиксировать:

- exact Alice input;
- answer present / absent;
- direct answer snapshot;
- source domains/URLs;
- source page type;
- observed fan-out — только если он непосредственно видим;
- отсутствие источников/ответа как валидный `NOT_OBSERVED`/`NO_ANSWER` result.

Search provider results не подменяют этот шаг.

## [ ] 04.5 — Выполнить evidence-driven secondary expansion

Secondary query не запускается только потому, что формулировка логична.

Кандидаты, уже возникшие из Wordstat/Search evidence, но **пока не утверждённые как окончательный список**:

- `оберег по знаку зодиака`;
- `шлем ужаса оберег`;
- `печать велеса значение`;
- при необходимости другие queries, которые появятся из Alice source/fan-out evidence.

Окончательный secondary set выбирается после сопоставления primary Wordstat + Search + Alice.

## [~] 04.6 — Нормализовать evidence и обновить Query Evidence Ledger

Уже выполнено:

- URL-level normalized Search dataset для 10 primary measurements;
- аналитический R2 Search report;
- canonical measurement manifest для 10 measurements;
- derived composition summaries для 10 measurements;
- Search→Ledger staging patch;
- canonical measurement IDs отделены от provider `request_id`;
- structural merge-проход проверен: целевой результат 19 Ledger rows, 10 `serp_status=MEASURED`, 0 extra/missing CSV columns после repair.

Обнаружен legacy-дефект:

- существующая строка `подвеска на зеркало в машину` в canonical Ledger имеет старый сдвиг хвостовых CSV-полей;
- точный repair-state и merge-state сохранены в `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- исходный canonical Ledger не заменяется повреждающей «слепой» записью.

Осталось:

- выполнить безопасный canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv` после repair legacy row;
- применить Search patch и measurement IDs;
- отдельно backfill Wordstat measurement linkage для новых Search rows только из существующих R1 raw/normalized artifacts — не придумывать IDs;
- browser-only `serp_product_block` держать `NOT_MEASURED` без direct UI evidence;
- Alice поля оставить `NOT_MEASURED` до 04.4.

Артефакты continuity:

- `marketing/data/ledger/query_evidence_serp_patch_2026-08-26.csv`;
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`.

## [ ] 04.7 — Выпустить финальный R2 report и передать evidence в следующий decision stage

Финальный отчёт должен свести:

- Wordstat human demand;
- direct Search provider evidence;
- browser/UI evidence, где реально получено;
- consumer Alice evidence;
- marketplace/independent/informational competition;
- gaps/limitations;
- evidence-driven candidates для дальнейшей opportunity/Page Job оценки.

До закрытия 04.7 запрещено превращать provisional intent observations в окончательную архитектуру сайта.

---

# Текущая точка продолжения — 2026-08-26

**Не запускать следующий secondary Search query автоматически.**

Search primary capture и normalization завершены. Ledger merge-state полностью сохранён и воспроизводим; canonical rewrite остаётся техническим data-hygiene действием и не должен менять исследовательские выводы.

Следующий исследовательский проход:

1. определить минимальный набор decision-useful browser/UI observations;
2. зафиксировать primary consumer Alice observation plan;
3. выполнить Alice observations с немедленным сохранением каждого результата;
4. только после Search + Alice выбирать secondary queries.
