# 04 — Исследовать реальный Yandex Search / SERP и Alice AI

Статус: **[~] В РАБОТЕ — PRIMARY COMPLETE, SECONDARY SELECTED**  
Дата активного этапа: **2026-08-26**

## Цель

Получить decision-grade evidence о том, какие страницы и источники Yandex реально выбирает по приоритетным запросам бренда, разделяя:

- Search provider organic evidence;
- browser SERP/UI composition;
- consumer Alice AI;
- marketplace / independent commerce / informational sources;
- разные intent-классы.

Roadmap 04 **не назначает финальную IA/Page Jobs**. Это делается только после объединения evidence на следующем decision stage.

## Жёсткие правила evidence

1. Public web search не подменяет direct Yandex evidence.
2. Search API/WebSearch = Search-provider evidence, но не browser/UI snapshot.
3. Ads, product/rich blocks, Alice и organic не смешиваются в одну позицию.
4. Consumer Alice считается измеренной только по фактически полученному consumer answer.
5. `NOT_OBSERVED` / `BLOCKED` — валидные результаты; отсутствие не дорисовывается выводом.
6. Browser localization хранится отдельно от Search API region.
7. Secondary expansion — только evidence-driven.
8. Page Job / IA выводы до Roadmap 05 остаются `PROVISIONAL`.
9. Каждый завершённый measurement/analysis pass немедленно сохраняется в GitHub.
10. Alice run с явным carry-over из прошлого диалога = `CONTEXT_CONTAMINATED`, не считается canonical primary evidence; нужен clean rerun.

---

# 04.1 — Protocol / scope

**[x] COMPLETE**

- primary set зафиксирован;
- Search API region: Russia `225`;
- browser localization не наследует `225`;
- provenance обязателен;
- Search / browser / Alice разделены.

---

# 04.2 — Direct Search provider primary

**[x] COMPLETE — 10/10**

Primary roots:

1. `славянские обереги`
2. `печать велеса`
3. `оберег в машину`
4. `подвеска на зеркало в машину`
5. `вегвизир`
6. `талисман знак зодиака`
7. `алатырь оберег`
8. `оберег велес`
9. `подарок мужчине в машину`
10. `подарок автомобилисту`

Все 10: HTTP 200, executed=true, retry=false, region 225, Top-10 returned.

Artifacts:

- `marketing/research/R2_YANDEX_SEARCH_PRIMARY_SERP_2026-08-26.md`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__225.tsv`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__measurements.csv`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__summaries.csv`

Primary Search intent map:

- `славянские обереги` — commercial/category-first; independent specialist sites competitive;
- `печать велеса` — strong transactional/product; marketplace-heavy;
- `оберег в машину` — mixed commercial + choice/use-case;
- `подвеска на зеркало в машину` — near-pure transactional form factor;
- `вегвизир` — mixed entity + commercial;
- `талисман знак зодиака` — guide/selection-first, strong stone contamination;
- `алатырь оберег` — commercial-first + meaning;
- `оберег велес` — commercial-first, strong niche independents;
- `подарок мужчине в машину` — broad gift-shopping, weak default pendant fit;
- `подарок автомобилисту` — shopping + gift ideas, pendant one possible option.

Direct brand evidence:

- `алатырь оберег`: Wildberries snippet directly exposed `Кровь и Песок / Славянский оберег в машину "Алатырь (Крест Сварога)"`, 593 оценки.
- This is marketplace visibility, not own-site organic visibility.

---

# 04.3 — Browser SERP/UI

## Fixed representative desktop set

**[x] COMPLETE — 5/5**

### `славянские обереги`

- 3 `Промо` before first organic;
- embedded Alice above results absent;
- first visible organic `slavyanskieoberegi.ru`, then `simvolroda.ru`.

Artifact: `marketing/data/raw/browser_serp/20260826T0723Z__slavyanskie_oberegi__desktop.md`

### `печать велеса`

- top promo;
- embedded Alice;
- images;
- `slavyanskieoberegi.ru` prominent;
- `Люди ищут` directly exposes meaning/tattoo/photo/buy branches.

Artifact: `marketing/data/raw/browser_serp/20260826T0734Z__pechat_velesa__desktop.md`

### `оберег в машину`

- promo + images;
- large rich shopping block;
- Yandex Market/Ozon product cards;
- direct `Печать Велеса` mirror-pendant product;
- embedded Alice not observed in supplied browser capture.

Artifacts:

- `marketing/data/raw/browser_serp/20260826T0743Z__obereg_v_mashinu__desktop.md`
- `marketing/data/raw/browser_serp/20260826__obereg_v_mashinu__desktop.md`

### `подвеска на зеркало в машину`

- promo + Ozon;
- images + rich shopping block;
- Ozon/Yandex Market dominant;
- relevant products include `Знич`, `Печать Велеса`, zodiac pendants;
- generic decor/fandom/personalization also strong;
- video observed;
- embedded Alice not observed.

Artifact: `marketing/data/raw/browser_serp/20260826__podveska_na_zerkalo_v_mashinu__desktop.md`

### `талисман знак зодиака`

- embedded Alice before ordinary results;
- Yandex Market/Wildberries/Ozon/jewelry retailers;
- `Картинки`;
- `Люди ищут` 10/10 strongly stone/zodiac-oriented;
- large product-card block not observed.

Artifact: `marketing/data/raw/browser_serp/20260826__talisman_znak_zodiaka__desktop.md`

## Additional opportunistic desktop captures

### `вегвизир`

- promo, images, marketplaces + specialist info;
- embedded Alice;
- `Люди ищут`: `вегвизир это`, `вегвизир значение`, `вегвизир значение символа`, `вегвизир что это`, `вегвизир тату`, Valheim contamination.

Artifact: `marketing/data/raw/browser_serp/20260826__vegvizir__desktop.md`

### `алатырь оберег`

- embedded Alice;
- marketplaces + specialist commerce/content;
- video + images;
- related meaning / gender / buy branches.

Artifact: `marketing/data/raw/browser_serp/20260826__alatyr_obereg__desktop.md`

### `подарок автомобилисту`

- ordinary Ozon result first;
- embedded Alice immediately high in SERP;
- Wildberries / Poryadok / KP / gift retailers;
- WB snippet directly contains `Подвеска автомобилисту Волк, подарок близкому`;
- multiple lower-page promos, including off-topic ad noise;
- rich product block / images / video / `Люди ищут` not observed in supplied full-page copy;
- copied URLs expose `lr=10466`, human-readable geography unresolved.

Artifact: `marketing/data/raw/browser_serp/20260826__podarok_avtomobilistu__desktop.md`

## Mobile

Representative mobile browser UI remains **0/2**:

- `славянские обереги`
- `оберег в машину`

Wordstat PHONE counts do not substitute for mobile SERP evidence.

---

# 04.4 — Consumer Alice primary

**[x] COMPLETE — accepted canonical primary 10/10**

### 1. `славянские обереги`

- informational/explanatory guide;
- highlights `Печать Велеса`, `Алатырь`;
- 7 confidently normalized source rows;
- exact source URLs not captured.

Artifacts:
- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi.md`
- `marketing/data/raw/alice/20260826T0723Z__slavyanskie_oberegi_sources_visible_01.md`
- `marketing/data/normalized/alice/20260826T0723Z__slavyanskie_oberegi.csv`

### 2. `печать велеса`

- embedded Alice;
- meaning/history/use-first despite transactional Search;
- exact 17 sources;
- 3 fan-outs.

Artifacts:
- `marketing/data/raw/alice/20260826T0734Z__pechat_velesa__embedded.md`
- `marketing/data/normalized/alice/20260826T0734Z__pechat_velesa.csv`

### 3. `вегвизир`

- embedded + standalone corroboration;
- entity/history/meaning-first;
- embedded exact 11 sources;
- no-Viking-age-source correction preserved.

Artifacts:
- `marketing/data/raw/alice/20260826__vegvizir__embedded.md`
- `marketing/data/raw/alice/20260826__vegvizir__consumer_chat.md`
- `marketing/data/normalized/alice/20260826__vegvizir.csv`

### 4. `алатырь оберег`

- embedded Alice;
- mythology/meaning/suitability;
- exact 18 sources;
- final answer section partial.

Artifacts:
- `marketing/data/raw/alice/20260826__alatyr_obereg__embedded.md`
- `marketing/data/normalized/alice/20260826__alatyr_obereg.csv`

### 5. `оберег в машину`

- standalone Alice;
- choice/use-case + shopping;
- 7 direct product examples;
- 13 readable sources, panel completeness not confirmed.

Artifacts:
- `marketing/data/raw/alice/20260826__obereg_v_mashinu__consumer_chat.md`
- `marketing/data/normalized/alice/20260826__obereg_v_mashinu.csv`

### 6. `подвеска на зеркало в машину`

- standalone Alice;
- decor/form-factor selection + shopping;
- 6 direct products;
- 10 readable sources;
- symbolic products only one branch of broad decor universe.

Artifacts:
- `marketing/data/raw/alice/20260826__podveska_na_zerkalo_v_mashinu__consumer_chat.md`
- `marketing/data/normalized/alice/20260826__podveska_na_zerkalo_v_mashinu.csv`

### 7. `талисман знак зодиака`

- embedded Alice;
- informational zodiac selection;
- stones/jewelry central;
- exact 30 sources;
- 3 fan-outs.

Artifacts:
- `marketing/data/raw/alice/20260826__talisman_znak_zodiaka__embedded.md`
- `marketing/data/normalized/alice/20260826__talisman_znak_zodiaka.csv`

### 8. `оберег велес`

- standalone Alice;
- symbol-family explanation + suitability + light shopping;
- 3 products;
- 8 readable source rows;
- strong specialist Slavic source representation.

Artifacts:
- `marketing/data/raw/alice/20260826__obereg_veles__consumer_chat.md`
- `marketing/data/normalized/alice/20260826__obereg_veles.csv`

### 9. `подарок мужчине в машину`

Canonical clean rerun:

- broad practical gift selection;
- no pendant/amulet/talisman category;
- no Slavic/Norse symbols;
- 5 readable sources;
- no direct product-card block.

Artifacts:
- `marketing/data/raw/alice/20260826__podarok_muzhchine_v_mashinu__consumer_chat_CLEAN.md`
- `marketing/data/normalized/alice/20260826__podarok_muzhchine_v_mashinu.csv`

Excluded audit-only contaminated run:
- `marketing/data/raw/alice/20260826__podarok_muzhchine_v_mashinu__consumer_chat_CONTEXT_CONTAMINATED.md`
- `marketing/data/normalized/alice/20260826__podarok_muzhchine_v_mashinu__CONTEXT_CONTAMINATED.csv`

### 10. `подарок автомобилисту`

Surface: embedded Alice.

- broad gift recommendation guide;
- practical/general auto gifts dominate;
- no amulet/talisman/Slavic-symbol category in Alice answer;
- no direct product-card block;
- Alice explicitly displayed 11 sources, all 11 exact URLs captured;
- 3 fan-outs: travel gifts, auto accessories, gifts for male drivers;
- source mix = gift retailers/content + Ozon/Wildberries;
- no specialist Slavic source in the 11-source set.

Artifacts:
- `marketing/data/raw/alice/20260826__podarok_avtomobilistu__embedded.md`
- `marketing/data/normalized/alice/20260826__podarok_avtomobilistu.csv`

## Cross-root result after 10/10

- symbol/entity roots are meaning/history/suitability-first in Alice even when Search is commercial;
- `оберег в машину` is a query-native selection + commerce job;
- `подвеска на зеркало в машину` is broad form-factor/decor commerce;
- broad zodiac root is strongly stone/jewelry contaminated;
- both clean gift roots are broad gift-selection jobs with weak default pendant fit;
- specialist independent sites repeatedly qualify as Search and Alice sources for symbolic roots.

Canonical comparison:

- `marketing/research/R2_PRIMARY_SEARCH_ALICE_COMPARISON_2026-08-26.md`

---

# 04.5 — Evidence-driven secondary expansion

**[~] PRIMARY REVIEW COMPLETE; SECONDARY SET SELECTED; NOT YET EXECUTED**

## Priority A

### A1 `оберег по знаку зодиака`

Evidence:
- Wordstat 710 broad;
- narrower/product-adjacent than contaminated `талисман знак зодиака`;
- contamination independently proven by Wordstat + Search + browser + Alice.

Decision question: does `оберег` shift results toward symbolic/specialist commerce or do stones remain dominant?

### A2 `печать велеса значение`

Evidence:
- meaning layer in Wordstat;
- exact phrase directly observed in browser `Люди ищут`;
- base Search transactional, Alice meaning-first.

Decision question: does explicit meaning modifier produce a distinct informational Search job?

### A3 `амулет в машину`

Evidence:
- Wordstat 404 broad;
- close human lexical variant of core automotive use-case;
- primary roots split between mixed `оберег в машину` and transactional form-factor `подвеска на зеркало`.

Decision question: which job does `амулет в машину` actually map to?

## Priority B — only after A-set review

### B1 `вегвизир значение`

- directly observed in `Люди ищут`;
- base demand 5,938 broad / 1,541 quoted;
- base Search mixed, Alice meaning/history-first.

### B2 `шлем ужаса оберег`

- Wordstat 474 broad;
- directly supported by Alice contrast with Ægishjálmur / Шлем ужаса;
- tests adjacent Norse symbol opportunity.

## Deferred

- `вегвизир значение символа` — initially redundant with B1;
- `алатырь оберег значение` — defer until A2 shows marginal value of explicit meaning modifiers;
- gift expansions — rejected now because clean evidence shows weak default product fit;
- generic mirror/decor expansions — deferred because primary evidence already proves commodity contamination.

Execution rule:

1. run A1;
2. save/normalize/commit;
3. run A2;
4. save/normalize/commit;
5. run A3;
6. review A-set jointly;
7. run B-set only if still decision-useful.

**Do not auto-run all secondaries blindly.**

Before any paid Search API secondary request, fresh-verify official Yandex pricing.

---

# 04.6 — Normalize evidence / Query Evidence Ledger

**[~] IN PROGRESS**

Completed:

- 10/10 Search provider measurements normalized;
- Search→Ledger staging patch exists;
- canonical measurement IDs separated from provider request IDs;
- structural merge check done;
- accepted Alice primary **10/10** normalized;
- all exact-source sets preserved where captured;
- contaminated gift run retained separately and excluded from canonical count.

Legacy defect still requires safe repair:

- old `подвеска на зеркало в машину` Ledger row has shifted tail CSV fields due unescaped commas;
- repair/merge state stored in `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- do not blindly overwrite canonical Ledger.

Remaining:

- safe canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv`;
- apply Search patch + measurement IDs;
- backfill Alice linkage for 10/10;
- Wordstat linkage only from real R1 artifacts;
- browser-only product-block fields only from direct UI evidence;
- add secondary measurements as executed.

Continuity artifacts:

- `marketing/data/ledger/query_evidence_serp_patch_2026-08-26.csv`
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`

---

# 04.7 — Final R2 report / handoff

**[ ] NOT STARTED**

Final report must combine:

- Wordstat human demand;
- Search provider;
- browser/UI evidence;
- Alice;
- marketplace/independent/info competition;
- secondary results;
- gaps/limitations;
- evidence-driven inputs for Roadmap 05.

No final IA/Page Job before 04.7 handoff.

---

# Current continuation point — 2026-08-26

Current state:

- Search provider primary: **10/10**;
- desktop browser fixed set: **5/5**;
- additional direct desktop captures: `вегвизир`, `алатырь оберег`, `подарок автомобилисту`;
- mobile browser representative set: **0/2**;
- consumer Alice accepted primary: **10/10**;
- primary cross-surface comparison: **COMPLETE**;
- secondary set: **SELECTED, 0 executed**.

## Next action

1. Fresh-verify official Yandex synchronous Search pricing.
2. Execute only secondary A1: **`оберег по знаку зодиака`**.
3. Save raw + normalized result immediately.
4. Reassess before A2.

Do not jump directly to Roadmap 05 and do not auto-run the full secondary set.