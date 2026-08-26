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

## [~] 04.3 — Проверить browser SERP/UI признаки только там, где они decision-useful

План representative desktop roots: 5.  
Фактически закрыто по фиксированному representative set: **2/5**.

### 1. `славянские обереги` — desktop browser capture OBSERVED

В верхнем viewport непосредственно наблюдалось:

- embedded/consumer Alice answer над обычной выдачей: `ABSENT`;
- три последовательных `Промо` до первого organic result;
- отдельный product carousel/rich shopping block в видимом viewport: `NOT_OBSERVED`;
- первый видимый organic: `slavyanskieoberegi.ru`;
- следующий: `simvolroda.ru`.

Артефакт:

- `marketing/data/raw/browser_serp/20260826T0723Z__slavyanskie_oberegi__desktop.md`.

### 2. `печать велеса` — desktop browser capture OBSERVED

Непосредственно наблюдалось:

- `Промо` `logovo-volka.ru`;
- большой embedded `Быстрый ответ Алисы AI`;
- image thumbnails в Alice;
- крупный `Картинки` block;
- первый видимый результат под Alice: `slavyanskieoberegi.ru`;
- далее Wildberries и Yandex Market;
- copied URLs содержат `lr=11202`; human-readable geography не разрешена и не подменяется `225`.

`Люди ищут` прямо подтверждает ветки `значение`, `тату`, `фото`, `серебро купить`, `медвежья лапа значение`.

Артефакт:

- `marketing/data/raw/browser_serp/20260826T0734Z__pechat_velesa__desktop.md`.

### Дополнительные opportunistic browser captures — не заменяют фиксированный representative set

#### `вегвизир`

Full-page browser copy непосредственно показывает:

- `Промо` `logovo-volka.ru`;
- `Картинки` block;
- Ozon / Yandex Market / Wildberries / Livemaster;
- Wikipedia и specialist informational results;
- embedded `Быстрый ответ Алисы AI`;
- `Люди ищут`: `вегвизир это`, `вегвизир значение`, `вегвизир значение символа`, `вегвизир что это`, `вегвизир тату`, а также gaming-contamination branch `Valheim`.

Артефакт:

- `marketing/data/raw/browser_serp/20260826__vegvizir__desktop.md`.

#### `алатырь оберег`

Full-page browser copy непосредственно показывает:

- embedded `Быстрый ответ Алисы AI`;
- Wildberries / Ozon / Livemaster / Yandex Market;
- specialist commerce/content results (`slavyanskieoberegi.ru`, `ruyan-master.ru`, `master-run.ru`, `simvolroda.ru`, `veseliyviking.ru` и др.);
- `Видео` carousel;
- `Картинки` block;
- `Люди ищут`: meaning, male/female meaning, photo/images, `что значит`, `купить серебро мужской`, embroidery.

Артефакт:

- `marketing/data/raw/browser_serp/20260826__alatyr_obereg__desktop.md`.

Осталось по фиксированному representative desktop set:

- `оберег в машину`;
- `подвеска на зеркало в машину`;
- `талисман знак зодиака`.

Mobile comparison пока `NOT_OBSERVED`; плановый set: `славянские обереги`, `оберег в машину`.

## [~] 04.4 — Снять consumer Alice evidence по primary query set

Primary Alice plan: 10 roots.  
Фактически завершено: **4/10**.

### 1. `славянские обереги` — COMPLETE PRIMARY ALICE ROOT

Direct observation:

- exact input `славянские обереги`;
- answer present `YES`;
- длинный informational/explanatory guide: виды, назначение, значения, применение/традиция, советы;
- Alice самостоятельно выделяет `Печать Велеса` и `Алатырь`;
- image thumbnails + video card;
- Sources panel прокручен до конца;
- 7 source rows уверенно нормализованы;
- exact source URLs не захвачены и не реконструируются;
- fan-out `NOT_OBSERVED`.

Artifacts:

- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi.md`;
- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi_sources_visible_01.md`;
- `marketing/data/normalized/alice/20260826T0723Z__slavyanskie_oberegi.csv`.

### 2. `печать велеса` — COMPLETE PRIMARY ALICE ROOT

Surface: embedded `Быстрый ответ Алисы AI`.

Direct observation:

- answer job = meaning/explanation despite strongly transactional Search evidence;
- structure: `Как выглядит` → `Что символизирует` → `Как использовали` → `Несколько нюансов`;
- explicit folk-belief/esotericism caveat;
- 17 displayed sources, all exact URLs captured;
- 3 fan-out prompts captured;
- `slavyanskieoberegi.ru` is Alice source #2 and also prominent in ordinary Search.

Artifacts:

- `marketing/data/raw/alice/20260826T0734Z__pechat_velesa__embedded.md`;
- `marketing/data/normalized/alice/20260826T0734Z__pechat_velesa.csv`.

### 3. `вегвизир` — COMPLETE PRIMARY ALICE ROOT

Two direct consumer surfaces captured for the same exact input.

#### Embedded SERP Alice

- answer job = entity/history/meaning;
- definition and Icelandic etymology;
- Huld manuscript, 1860;
- explicit correction: no Viking-age source confirmation;
- purpose as path-finding symbol in storm/bad weather;
- explicit note that it does not indicate cardinal directions;
- modern jewelry/tattoo use;
- scientific caveat for magical-property claims;
- **11 displayed sources, all 11 exact URLs captured**;
- fan-out `NOT_OBSERVED`.

Source mix includes social/reference plus many independent commerce/content sources: `veseliyviking.ru`, `zevira.ru`, `vesta-peterburg.ru`, `ruyan-master.ru`, `bikerringshop.com`, `zevira.net`, `elarus.ru`.

#### Standalone consumer Alice chat

A separate Alice chat independently converges on the same job:

- what Vegvísir is;
- Huld manuscript / 1860;
- no Viking-age archaeological/source evidence;
- difference from `Шлем ужаса / эгисхьяльм`;
- literal manuscript use vs later metaphorical `жизненный путь` use.

Visible Sources panel screenshot contains 7 confidently readable rows (`zevira.ru`, VK, Wikipedia, BikerRingShop, Pikabu, m.vk.ru, Pikabu), but panel completeness is `NOT_CONFIRMED`; exact URLs are not reconstructed from screenshot.

Artifacts:

- `marketing/data/raw/alice/20260826__vegvizir__embedded.md`;
- `marketing/data/raw/alice/20260826__vegvizir__consumer_chat.md`;
- `marketing/data/normalized/alice/20260826__vegvizir.csv`.

Key comparison:

- ordinary Search = mixed entity + commerce;
- Alice = strongly entity/history/meaning-first;
- historical qualification / myth correction is a prominent direct answer requirement.

### 4. `алатырь оберег` — COMPLETE PRIMARY ALICE ROOT

Surface: embedded `Быстрый ответ Алисы AI`.

Direct observation:

- answer job = mythology + symbolism + meaning + suitability/use;
- captured sections: opening definition, `Мифологическое происхождение`, `Символика и значение`, `Значение оберега`, `Для кого подходит`, start of `Как использовали оберег`;
- answer text is `PARTIAL` because copied block truncates in the final captured section;
- multiple image thumbnails present;
- Alice explicitly displays **18 sources**, and all 18 exact URLs are captured;
- source mix includes informational/social/media, specialist commerce/content and Wildberries;
- `slavyanskieoberegi.ru` again appears in both Alice source set and ordinary Search;
- fan-out `NOT_OBSERVED`.

Direct browser `Люди ищут` independently exposes:

- `алатырь оберег значение`;
- male/female meaning branches;
- photo/image branches;
- `что значит`;
- specific purchase branch `купить серебро мужской`.

Artifacts:

- `marketing/data/raw/alice/20260826__alatyr_obereg__embedded.md`;
- `marketing/data/normalized/alice/20260826__alatyr_obereg.csv`.

### Cross-root observation after 4/10 Alice roots

Current direct pattern:

- ordinary Search frequently carries strong commerce/marketplace pressure;
- Alice repeatedly performs **meaning / explanation / history / suitability** jobs instead of simply mirroring shopping intent;
- specialist independent commerce sites with useful explanatory content can be selected as Alice sources;
- `slavyanskieoberegi.ru` is now directly observed participating in both Search and Alice for more than one symbol root;
- this is evidence for a hybrid content-commerce opportunity, but it remains `PROVISIONAL` until Roadmap 05.

Next primary Alice root to close the canonical gap: **`оберег в машину`**.

## [ ] 04.5 — Выполнить evidence-driven secondary expansion

Secondary query не запускается только потому, что формулировка логична.

Current evidence-driven candidates:

- `оберег по знаку зодиака` — Wordstat/Search divergence;
- `шлем ужаса оберег` — Norse cluster candidate, now strengthened by standalone Alice directly contrasting Ægishjálmur with Vegvísir;
- `печать велеса значение` — strongly confirmed by `Люди ищут` + Alice meaning job;
- `вегвизир значение` / `вегвизир значение символа` — directly observed in `Люди ищут`, but not executed yet;
- `алатырь оберег значение` — directly observed in `Люди ищут` and aligned with Alice answer job, but not executed yet;
- further candidates only from later primary Alice/fan-out evidence.

Final secondary set is chosen only after primary Wordstat + Search + Alice comparison.

## [~] 04.6 — Нормализовать evidence и обновить Query Evidence Ledger

Уже выполнено:

- URL-level normalized Search dataset for 10 primary measurements;
- R2 Search report;
- canonical Search measurement manifest;
- derived composition summaries;
- Search→Ledger staging patch;
- canonical measurement IDs separated from provider `request_id`;
- structural merge check: target 19 Ledger rows, 10 `serp_status=MEASURED`, 0 extra/missing columns after repair;
- consumer Alice roots **4/10** normalized as separate measurement/observation sets;
- `печать велеса`: exact 17 source URLs + 3 fan-out rows;
- `вегвизир`: embedded exact 11 source URLs + separate standalone-chat corroboration with partial source panel;
- `алатырь оберег`: exact 18 source URLs, answer explicitly marked partial.

Legacy defect remains:

- existing `подвеска на зеркало в машину` row in canonical Ledger has shifted tail CSV columns from old unescaped commas;
- exact repair/merge state is saved in `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- canonical Ledger is not overwritten blindly.

Осталось:

- safe canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv` after repair;
- apply Search patch + measurement IDs;
- backfill Alice linkage as primary roots complete;
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

- Search provider primary: `10/10`;
- representative desktop browser UI: `2/5` fixed-set complete, plus opportunistic direct captures for `вегвизир` and `алатырь оберег`;
- representative mobile browser UI: `0/2`;
- consumer Alice primary: **`4/10`**.

Следующий исследовательский root: **`оберег в машину`**.

Порядок:

1. direct desktop browser SERP top viewport if not already captured in current evidence session;
2. if Alice is embedded in SERP, capture/expand that exact consumer surface; otherwise use a clean standalone `Алиса AI` chat with exact input `оберег в машину`;
3. save answer, sources to the end where observable, and fan-out if present;
4. immediately commit the completed observation/normalization pass to GitHub;
5. only then move to the next primary root.
