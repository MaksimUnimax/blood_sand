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
- region для текущего первичного съёма Search API: Russia `225`;
- browser UI region/localization хранится отдельно и не наследуется от Search API;
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

## [~] 04.3 — Проверить browser SERP/UI признаки только там, где они decision-useful

План representative desktop roots: 5.  
Фактически снято: **2/5**.

### 1. `славянские обереги` — desktop browser capture OBSERVED

В верхнем viewport непосредственно наблюдалось:

- consumer Alice answer над обычной выдачей: **ABSENT**;
- три последовательных `Промо`-результата до первого organic result;
- отдельный product carousel/rich shopping block в видимом viewport: **NOT OBSERVED**;
- первый видимый organic result после Promo — `slavyanskieoberegi.ru`;
- следующий видимый organic result — `simvolroda.ru`;
- browser UI заметно более коммерчески занят, чем это видно из Search provider Top-10 alone.

Region в browser UI отдельно не подтверждён, поэтому не повышается до `225` на основании Search API.

Артефакт:

- `marketing/data/raw/browser_serp/20260826T0723Z__slavyanskie_oberegi__desktop.md`.

### 2. `печать велеса` — desktop browser capture OBSERVED

В верхнем viewport непосредственно наблюдалось:

- один `Промо` result `logovo-volka.ru`;
- большой embedded `Быстрый ответ Алисы AI` до первых organic results;
- Alice answer содержит image thumbnails;
- справа отдельный крупный блок `Картинки`;
- первый видимый результат под Alice: `slavyanskieoberegi.ru`;
- далее видны Wildberries и Yandex Market;
- page copy показывает browser localization parameter `lr=11202`; его human-readable geography не разрешена и не подменяется API region `225`.

Из полного page copy дополнительно получен direct UI блок `Люди ищут` с 10 related queries, включая `печать велеса значение`, `печать велеса тату`, `печать велеса фото`, `печать велеса серебро купить`, `печать велеса медвежья лапа значение`.

Это прямое доказательство многослойного intent: paid commerce + AI meaning + visual discovery + shopping + informational expansion.

Артефакт:

- `marketing/data/raw/browser_serp/20260826T0734Z__pechat_velesa__desktop.md`.

Осталось по representative desktop:

- `оберег в машину`;
- `подвеска на зеркало в машину`;
- `талисман знак зодиака`.

Mobile comparison пока `NOT_OBSERVED`; плановый representative mobile set: `славянские обереги`, `оберег в машину`.

## [~] 04.4 — Снять consumer Alice evidence по primary query set

Primary Alice plan: 10 roots.  
Фактически завершено: **2/10**.

### 1. `славянские обереги` — COMPLETE PRIMARY ALICE ROOT

Direct observation:

- exact input: `славянские обереги`;
- answer present: `YES`;
- ответ — длинный informational/explanatory guide: виды оберегов, назначение, значения символов, применение/традиция, советы;
- внутри ответа Алиса самостоятельно выделяет `Печать Велеса` и `Алатырь`;
- присутствуют image thumbnails и video card;
- Sources panel открыт и прокручен до конца;
- 7 source rows читаются уверенно и нормализованы в display order;
- нечитаемые/неуверенные строки не реконструируются и не выдумываются;
- exact source URLs из panel не захвачены, поэтому остаются незаполненными;
- fan-out / suggested follow-up отдельным измерением пока `NOT_OBSERVED`.

Уверенно прочитанные source domains:

1. `blog.arcanum.ru`;
2. `livemaster.ru`;
3. `amorem.ru`;
4. `ruyan-master.ru`;
5. `славяне.сайт`;
6. `blog.mann-ivanov-ferber.ru`;
7. `dzen.ru`.

Ключевое сравнительное наблюдение:

- browser SERP above-the-fold = heavily commercial (`3 × Промо` before organic);
- consumer Alice for exact same query = informational/meaning-first answer with editorial/content sources.

Артефакты:

- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi.md`;
- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi_sources_visible_01.md`;
- `marketing/data/normalized/alice/20260826T0723Z__slavyanskie_oberegi.csv`.

### 2. `печать велеса` — COMPLETE PRIMARY ALICE ROOT

Surface: embedded `Быстрый ответ Алисы AI` directly in ordinary Search SERP.

Direct observation:

- exact input/query: `печать велеса`;
- answer present: `YES`;
- answer job = meaning/explanation despite strongly transactional Search evidence;
- structure: `Как выглядит` → `Что символизирует` → `Как использовали` → `Несколько нюансов`;
- answer explains bear-paw vs wolf-paw forms, meanings, use, wearing/activation beliefs and modern jewelry/tattoo use;
- explicit caveat states this belongs to folk belief/esotericism rather than evidence-based history/science;
- image thumbnails present;
- source count explicitly displayed by Alice: **17**;
- all 17 exact source URLs captured;
- three Alice follow-up prompts captured.

Source mix includes:

- informational/editorial: `blog.arcanum.ru`, `славяне.сайт`, `nlo-mir.ru`, `mistymag.ru`, `domoracula.com`;
- independent commerce/content: `slavyanskieoberegi.ru`, `logovo-volka.ru`, `dommagii.com`, `ruyan-master.ru`, `silverbeard.ru`;
- marketplace/platform: `avito.ru`;
- community/social/media: `vk.ru`, `dzen.ru`, `shambala.mirtesen.ru`.

Important direct observation: `slavyanskieoberegi.ru` is displayed as Alice source #2 while also ranking prominently in ordinary Search UI. This demonstrates that a specialized commercial site with explanatory content can participate in both surfaces.

Observed Alice fan-out:

1. `Как использовали печать Велеса в славянской культуре?`
2. `Какие ещё символы связаны с Велесом?`
3. `Какие легенды связаны с печатью Велеса?`

Артефакты:

- `marketing/data/raw/alice/20260826T0734Z__pechat_velesa__embedded.md`;
- `marketing/data/normalized/alice/20260826T0734Z__pechat_velesa.csv`.

Следующий primary Alice root: `оберег в машину`.

## [ ] 04.5 — Выполнить evidence-driven secondary expansion

Secondary query не запускается только потому, что формулировка логична.

Кандидаты:

- `оберег по знаку зодиака` — возник из Wordstat/Search divergence;
- `шлем ужаса оберег` — кандидат для проверки Norse cluster после `вегвизир`;
- `печать велеса значение` — теперь **сильно подтверждён прямым browser evidence**: присутствует в `Люди ищут`, а Alice по базовому query выполняет meaning/explanation job;
- дополнительные queries добавляются только из последующих primary Alice/fan-out evidence.

Окончательный secondary set выбирается после сопоставления primary Wordstat + Search + Alice.

## [~] 04.6 — Нормализовать evidence и обновить Query Evidence Ledger

Уже выполнено:

- URL-level normalized Search dataset для 10 primary measurements;
- аналитический R2 Search report;
- canonical measurement manifest для 10 measurements;
- derived composition summaries для 10 measurements;
- Search→Ledger staging patch;
- canonical measurement IDs отделены от provider `request_id`;
- structural merge-проход проверен: целевой результат 19 Ledger rows, 10 `serp_status=MEASURED`, 0 extra/missing CSV columns после repair;
- consumer Alice roots `2/10` нормализованы отдельными measurement/observation sets;
- second Alice root contains exact 17 source URLs + 3 fan-out rows.

Обнаружен legacy-дефект:

- существующая строка `подвеска на зеркало в машину` в canonical Ledger имеет старый сдвиг хвостовых CSV-полей;
- точный repair-state и merge-state сохранены в `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- исходный canonical Ledger не заменяется повреждающей «слепой» записью.

Осталось:

- выполнить безопасный canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv` после repair legacy row;
- применить Search patch и measurement IDs;
- backfill Alice linkage по мере завершения 10 primary roots;
- отдельно backfill Wordstat measurement linkage для новых Search rows только из существующих R1 raw/normalized artifacts — не придумывать IDs;
- browser-only `serp_product_block` заполнять только по direct browser UI evidence.

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

**Не запускать secondary Search query автоматически.**

Текущее состояние:

- Search provider primary: `10/10`;
- representative desktop browser UI: `2/5`;
- representative mobile browser UI: `0/2`;
- consumer Alice primary: `2/10`.

Следующий исследовательский root: **`оберег в машину`**.

Порядок:

1. direct desktop browser SERP top viewport;
2. если Alice embedded в SERP — раскрыть и сохранить именно этот consumer surface; если нет — использовать отдельную вкладку `Алиса AI` с exact input `оберег в машину`;
3. сохранить полный Alice answer, Sources до конца и fan-out;
4. немедленно сохранить observation в GitHub;
5. перейти к следующему primary root.
