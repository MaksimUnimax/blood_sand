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
11. Alice measurement с явным carry-over из предыдущего диалога помечается `CONTEXT_CONTAMINATED` и не засчитывается в primary set; для canonical evidence требуется clean rerun.

---

# Шаги

## [x] 04.1 — Зафиксировать protocol, scope и acceptance rules

Принято:

- разделение Search provider evidence / browser SERP / consumer Alice;
- primary query set зафиксирован;
- region для первичного Search API съёма: Russia `225`;
- browser UI localization хранится отдельно и не наследуется от Search API;
- request/query provenance обязателен;
- отсутствие UI/device evidence не заменяется предположениями.

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

Для всех 10:

- status `OK`;
- HTTP `200`;
- request executed `true`;
- automatic retry `false`;
- region `225`;
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

По `алатырь оберег` в Search-provider snippet Wildberries непосредственно наблюдался товар:

`Кровь и Песок / Славянский оберег в машину "Алатырь (Крест Сварога)"`, `593 оценки`.

Это **marketplace visibility**, не organic visibility будущего собственного сайта.

## [x] 04.3 — Проверить representative desktop browser SERP/UI признаки

План representative desktop roots: 5.  
Фактически закрыто по фиксированному representative set: **5/5**.

Browser URLs в нескольких прямых captures содержат `lr=11202`; это сохраняется как numeric localization parameter. Human-readable geography не разрешена и не подменяется Search API region `225`.

### 1. `славянские обереги` — OBSERVED

- embedded Alice above results: `ABSENT`;
- три последовательных `Промо` до первого organic result;
- product carousel/rich shopping block в видимом top viewport: `NOT_OBSERVED`;
- first visible organic: `slavyanskieoberegi.ru`;
- next visible organic: `simvolroda.ru`.

Artifact:
- `marketing/data/raw/browser_serp/20260826T0723Z__slavyanskie_oberegi__desktop.md`.

### 2. `печать велеса` — OBSERVED

- top `Промо` `logovo-volka.ru`;
- large embedded `Быстрый ответ Алисы AI`;
- image thumbnails in Alice + `Картинки` block;
- first visible result below Alice: `slavyanskieoberegi.ru`, далее Wildberries и Yandex Market;
- `Люди ищут` directly exposes `значение`, `тату`, `фото`, `серебро купить`, `медвежья лапа значение` branches.

Artifact:
- `marketing/data/raw/browser_serp/20260826T0734Z__pechat_velesa__desktop.md`.

### 3. `оберег в машину` — OBSERVED

- top `Промо` commerce result;
- `Картинки`;
- large rich/shopping block `Популярные товары по запросу «оберег в машину»`;
- product cards from Yandex Market and Ozon;
- direct product-level card for `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`;
- marketplace pressure: Wildberries / Ozon / Yandex Market;
- independent/specialist commerce also present;
- embedded Alice: `NOT_OBSERVED` in this full-page capture.

Artifacts:
- `marketing/data/raw/browser_serp/20260826T0743Z__obereg_v_mashinu__desktop.md`;
- `marketing/data/raw/browser_serp/20260826__obereg_v_mashinu__desktop.md`.

### 4. `подвеска на зеркало в машину` — OBSERVED

- top `Промо` Ozon result;
- ordinary Ozon result/category;
- `Картинки`;
- large `Популярные товары` rich shopping block;
- product cards dominated by Ozon with Yandex Market participation;
- direct product-level variants include generic decor, fandom, Slavic amulets and zodiac talismans;
- directly observed relevant products include `Знич`, `Печать Велеса`, zodiac pendants (`Овен`, `Дева`, `Телец`);
- `Видео` observed;
- embedded Alice: `NOT_OBSERVED` in this capture.

Artifact:
- `marketing/data/raw/browser_serp/20260826__podveska_na_zerkalo_v_mashinu__desktop.md`.

### 5. `талисман знак зодиака` — OBSERVED

- large embedded `Быстрый ответ Алисы AI` before ordinary results;
- Yandex Market + Wildberries immediately below, then informational/retail sources;
- `Картинки`;
- ordinary marketplace/retail results from Ozon, Sunlight, 585 and others;
- lower-page `Промо`, including off-topic ad noise preserved separately from intent evidence;
- `Люди ищут`: 10/10 observed related queries are strongly stone/zodiac-oriented;
- large `Популярные товары` product-card block: `NOT_OBSERVED`.

Artifact:
- `marketing/data/raw/browser_serp/20260826__talisman_znak_zodiaka__desktop.md`.

### Opportunistic desktop captures — additional evidence, not fixed-set substitutes

#### `вегвизир`

- `Промо`, `Картинки`, Ozon / Yandex Market / Wildberries / Livemaster;
- Wikipedia + specialist informational results;
- embedded Alice;
- `Люди ищут`: `вегвизир это`, `вегвизир значение`, `вегвизир значение символа`, `вегвизир что это`, `вегвизир тату`, gaming-contamination `Valheim` branch.

Artifact:
- `marketing/data/raw/browser_serp/20260826__vegvizir__desktop.md`.

#### `алатырь оберег`

- embedded Alice;
- Wildberries / Ozon / Livemaster / Yandex Market;
- specialist commerce/content;
- `Видео` + `Картинки`;
- `Люди ищут`: meaning, male/female meaning, imagery, `что значит`, `купить серебро мужской`, embroidery.

Artifact:
- `marketing/data/raw/browser_serp/20260826__alatyr_obereg__desktop.md`.

Mobile comparison remains `NOT_OBSERVED`; planned set:

- `славянские обереги`;
- `оберег в машину`.

## [~] 04.4 — Снять consumer Alice evidence по primary query set

Primary Alice plan: 10 roots.  
**Фактически завершено и принято: 9/10.**

### 1. `славянские обереги` — COMPLETE

- answer job: informational/explanatory guide;
- Alice explicitly discusses `Печать Велеса` and `Алатырь`;
- images + video card;
- Sources panel scrolled to end;
- 7 confidently normalized source rows;
- exact URLs not captured;
- fan-out `NOT_OBSERVED`.

Artifacts:
- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi.md`;
- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi_sources_visible_01.md`;
- `marketing/data/normalized/alice/20260826T0723Z__slavyanskie_oberegi.csv`.

### 2. `печать велеса` — COMPLETE

Surface: embedded SERP Alice.

- answer job = meaning/explanation despite strongly transactional Search evidence;
- 17 displayed sources, all exact URLs captured;
- 3 fan-out prompts captured;
- `slavyanskieoberegi.ru` is Alice source #2 and also prominent in ordinary Search.

Artifacts:
- `marketing/data/raw/alice/20260826T0734Z__pechat_velesa__embedded.md`;
- `marketing/data/normalized/alice/20260826T0734Z__pechat_velesa.csv`.

### 3. `вегвизир` — COMPLETE

Two direct consumer surfaces captured.

Embedded Alice:
- entity/history/meaning job;
- Huld manuscript / 1860;
- explicit no-Viking-age-source correction;
- 11 displayed sources, all exact URLs captured.

Standalone Alice independently converges on the same job; 7 visible source rows were readable, panel completeness `NOT_CONFIRMED`.

Artifacts:
- `marketing/data/raw/alice/20260826__vegvizir__embedded.md`;
- `marketing/data/raw/alice/20260826__vegvizir__consumer_chat.md`;
- `marketing/data/normalized/alice/20260826__vegvizir.csv`.

### 4. `алатырь оберег` — COMPLETE

Surface: embedded SERP Alice.

- answer job = mythology + symbolism + meaning + suitability/use;
- answer text captured `PARTIAL` in final section;
- Alice explicitly displays 18 sources, all 18 exact URLs captured;
- source mix spans information/social/media, specialist commerce/content and Wildberries;
- fan-out `NOT_OBSERVED`.

Artifacts:
- `marketing/data/raw/alice/20260826__alatyr_obereg__embedded.md`;
- `marketing/data/normalized/alice/20260826__alatyr_obereg.csv`.

### 5. `оберег в машину` — COMPLETE

Surface: standalone consumer Alice.

- answer job = choice/use-case + shopping;
- multiple symbol families and practical placement/safety guidance;
- 7 directly orderable product examples;
- answer commerce destinations: Yandex Market / Ozon / Wildberries;
- 13 confidently readable source rows across screenshots; completeness `NOT_CONFIRMED`;
- exact source URLs not reconstructed;
- fan-out `NOT_OBSERVED`.

Artifacts:
- `marketing/data/raw/alice/20260826__obereg_v_mashinu__consumer_chat.md`;
- `marketing/data/normalized/alice/20260826__obereg_v_mashinu.csv`.

### 6. `подвеска на зеркало в машину` — COMPLETE

Surface: standalone consumer Alice after embedded Alice was not observed in browser SERP.

- answer job = decor/form-factor selection + shopping;
- figurines, thematic/symbolic, personalized and multi-material variants;
- safety/use guidance;
- 6 directly orderable product examples;
- shopping destinations explicitly include Ozon, Wildberries, Yandex Market and Livemaster;
- 10 confidently readable source rows; panel completeness `NOT_CONFIRMED`;
- source mix heavily platform/commerce-oriented;
- amulets are one branch among generic decor/fandom/personalization rather than the dominant intent.

Artifacts:
- `marketing/data/raw/alice/20260826__podveska_na_zerkalo_v_mashinu__consumer_chat.md`;
- `marketing/data/normalized/alice/20260826__podveska_na_zerkalo_v_mashinu.csv`.

### 7. `талисман знак зодиака` — COMPLETE

Surface: embedded SERP Alice.

- answer job = informational zodiac selection guide;
- explicit scientific-evidence caveat;
- stones/jewelry are central, not incidental;
- 30 displayed sources, all 30 exact URLs captured;
- 3 fan-out prompts captured (`Рыбы`, `Лев`, `Стрелец` branches);
- no direct orderable product-card section observed.

Artifacts:
- `marketing/data/raw/alice/20260826__talisman_znak_zodiaka__embedded.md`;
- `marketing/data/normalized/alice/20260826__talisman_znak_zodiaka.csv`.

### 8. `оберег велес` — COMPLETE

Surface: standalone consumer Alice.

- answer job = symbol-family explanation + suitability/selection with light shopping integration;
- differentiates bull-head/Velес symbol, bear paw, wolf paw and other forms;
- 3 visible orderable product cards: two Ozon + one `slavyanskieoberegi.ru`;
- 8 unique source rows confidently readable, with strong specialist independent Slavic commerce/content representation;
- source-panel completeness `NOT_CONFIRMED`;
- fan-out `NOT_OBSERVED`.

Artifacts:
- `marketing/data/raw/alice/20260826__obereg_veles__consumer_chat.md`;
- `marketing/data/normalized/alice/20260826__obereg_veles.csv`.

### 9. `подарок мужчине в машину` — COMPLETE CLEAN PRIMARY RERUN

Canonical accepted surface: standalone consumer Alice **clean rerun**.

Direct observation:

- answer job = broad gift selection for a driver/car owner;
- sections focus on practical items, comfort, electronics, car care/style and emotional gifts;
- no direct product-card block observed;
- amulet / pendant / talisman category: `NOT_OBSERVED`;
- Slavic/Norse symbol suggestions: `NOT_OBSERVED`;
- five source rows confidently readable: `mvideo.ru`, `kp.ru`, `100suvenirov.ru`, `journal.citilink.ru`, `wildberries.ru`;
- exact URLs not captured; panel completeness `NOT_CONFIRMED`;
- fan-out `NOT_OBSERVED`.

This clean result independently reinforces the Search-provider interpretation: the root is a **broad gift-idea query with weak default fit to the pendant category**.

Artifacts:
- `marketing/data/raw/alice/20260826__podarok_muzhchine_v_mashinu__consumer_chat_CLEAN.md`;
- `marketing/data/normalized/alice/20260826__podarok_muzhchine_v_mashinu.csv`.

#### Excluded contaminated run for the same root

A prior standalone Alice answer explicitly said `с учётом твоих прошлых запросов про обереги` and injected `вегвизир`, `печать Велеса`, `оберег Велеса` from conversation history. It is preserved for audit but **excluded from primary evidence**.

Artifacts:
- `marketing/data/raw/alice/20260826__podarok_muzhchine_v_mashinu__consumer_chat_CONTEXT_CONTAMINATED.md`;
- `marketing/data/normalized/alice/20260826__podarok_muzhchine_v_mashinu__CONTEXT_CONTAMINATED.csv`.

### Cross-root observation after 9/10 accepted Alice roots

Direct pattern is strongly intent-dependent:

- symbol/entity roots (`печать велеса`, `вегвизир`, `алатырь`, `оберег велес`) are meaning/history/suitability-first, with specialist independent sites repeatedly eligible as Alice sources;
- automotive symbolic/use-case root `оберег в машину` becomes a selection assistant with direct shopping integration;
- generic form-factor root `подвеска на зеркало в машину` becomes a broad decor/accessory shopping assistant in which symbolic products are only one branch;
- `талисман знак зодиака` becomes an informational zodiac/stone selection guide with heavy jewelry contamination;
- clean `подарок мужчине в машину` does **not** naturally pull the pendant/amulet category into the answer, proving that the earlier symbolic gift suggestions were context contamination rather than query-native evidence;
- this strengthens the hybrid content-commerce opportunity for symbol/use-case roots while weakening the broad generic gift root as a default acquisition target;
- all Page Job / IA implications remain `PROVISIONAL` until Roadmap 05.

**Remaining primary Alice root: `подарок автомобилисту`.**

## [ ] 04.5 — Выполнить evidence-driven secondary expansion

Secondary query не запускается только потому, что формулировка логична.

Current evidence-driven candidates:

- `оберег по знаку зодиака` — Wordstat/Search divergence, strengthened by Alice's heavy stone/jewelry contamination on the broad zodiac root;
- `шлем ужаса оберег` — Norse cluster candidate, strengthened by standalone Alice directly contrasting Ægishjálmur with Vegvísir;
- `печать велеса значение` — strongly confirmed by `Люди ищут` + Alice meaning job;
- `вегвизир значение` / `вегвизир значение символа` — directly observed in `Люди ищут`;
- `алатырь оберег значение` — directly observed in `Люди ищут` and aligned with Alice answer job;
- generic mirror-pendant secondary branches must be selected carefully because both Search and Alice show broad commodity/decor contamination;
- broad gift-root expansion is not justified by the contaminated run; use only clean query-native evidence;
- further candidates only after the final primary Alice root `подарок автомобилисту` is closed.

**Do not start secondary Search before primary Alice reaches 10/10 and the primary comparison is reviewed.**

## [~] 04.6 — Нормализовать evidence и обновить Query Evidence Ledger

Уже выполнено:

- URL-level normalized Search dataset for 10 primary measurements;
- R2 Search report;
- canonical Search measurement manifest;
- derived composition summaries;
- Search→Ledger staging patch;
- canonical measurement IDs separated from provider `request_id`;
- structural merge check: target 19 Ledger rows, 10 `serp_status=MEASURED`, 0 extra/missing columns after repair;
- accepted consumer Alice roots **9/10** normalized as separate measurement/observation sets;
- `печать велеса`: exact 17 source URLs + 3 fan-out rows;
- `вегвизир`: embedded exact 11 source URLs + standalone corroboration;
- `алатырь оберег`: exact 18 source URLs, answer explicitly marked partial;
- `оберег в машину`: 13 readable source rows + 7 direct products;
- `подвеска на зеркало в машину`: 10 readable source rows + 6 direct products;
- `талисман знак зодиака`: exact 30 source URLs + 3 fan-out rows;
- `оберег велес`: 8 readable source rows + 3 direct products;
- `подарок мужчине в машину`: clean canonical rerun normalized; five readable source rows; no pendant/amulet category observed;
- contaminated gift run retained separately with `CONTEXT_CONTAMINATED` and excluded from primary completion count.

Legacy defect remains:

- existing `подвеска на зеркало в машину` row in canonical Ledger has shifted tail CSV columns from old unescaped commas;
- exact repair/merge state is saved in `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- canonical Ledger is not overwritten blindly.

Осталось:

- close primary Alice 10/10 with `подарок автомобилисту`;
- safe canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv` after repair;
- apply Search patch + measurement IDs;
- backfill Alice linkage after primary roots complete;
- backfill Wordstat linkage only from existing R1 artifacts, never invent IDs;
- browser-only `serp_product_block` only from direct browser UI evidence.

Continuity artifacts:

- `marketing/data/ledger/query_evidence_serp_patch_2026-08-26.csv`;
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`.

## [ ] 04.7 — Выпустить финальный R2 report и передать evidence в следующий decision stage

Final report must combine:

- Wordstat human demand;
- direct Search provider evidence;
- browser/UI evidence where actually captured;
- consumer Alice evidence;
- marketplace/independent/informational competition;
- gaps/limitations;
- evidence-driven candidates for opportunity/Page Job evaluation.

До закрытия 04.7 запрещено превращать provisional intent observations в окончательную архитектуру сайта.

---

# Текущая точка продолжения — 2026-08-26

**Не запускать secondary Search query автоматически.**

Текущее состояние:

- Search provider primary: **`10/10`**;
- representative desktop browser UI fixed set: **`5/5`**;
- additional opportunistic desktop captures: `вегвизир`, `алатырь оберег`;
- representative mobile browser UI: **`0/2`**;
- consumer Alice primary accepted: **`9/10`**;
- excluded context-contaminated Alice run: `подарок мужчине в машину` old run, preserved but not counted.

Следующий и последний primary Alice root: **`подарок автомобилисту`**.

Порядок:

1. use a **new/clean Alice conversation** to avoid cross-query contamination;
2. exact input: `подарок автомобилисту`;
3. capture the full answer;
4. open `Источники` and capture to the end where observable;
5. capture direct product integration and fan-out if present;
6. immediately save raw + normalized evidence to GitHub;
7. after Alice primary reaches 10/10, review the primary comparison before choosing any secondary Search queries.
