# 04 — Исследовать реальный Yandex Search / SERP и Alice AI

Статус: **[~] В РАБОТЕ — PRIMARY COMPLETE; SECONDARY A-SET 3/3 COMPLETE; NEXT B1**  
Дата активного этапа: **2026-08-26**

## Цель

Получить decision-grade evidence о том, какие страницы и источники Yandex реально выбирает по приоритетным запросам бренда, разделяя:

- Search provider organic evidence;
- browser SERP/UI composition;
- consumer Alice AI;
- marketplace / independent commerce / informational sources;
- разные intent-классы.

Roadmap 04 **не назначает финальную IA/Page Jobs**. Финальные решения делаются после объединения evidence на Roadmap 05.

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

- `славянские обереги`: 3 Promo before organic; no embedded Alice above results; first visible organic `slavyanskieoberegi.ru`.
- `печать велеса`: promo + embedded Alice + images; `slavyanskieoberegi.ru` prominent; `Люди ищут` exposes meaning/tattoo/photo/buy branches.
- `оберег в машину`: promo + images + large shopping block; Yandex Market/Ozon; direct `Печать Велеса` mirror-pendant product; embedded Alice not observed in supplied browser capture.
- `подвеска на зеркало в машину`: promo + Ozon + images + shopping; generic decor/fandom/personalization strong alongside symbolic products; video observed; embedded Alice not observed.
- `талисман знак зодиака`: embedded Alice before ordinary results; marketplaces/jewelry retailers; images; `Люди ищут` heavily stone/zodiac-oriented.

Artifacts are stored under:
- `marketing/data/raw/browser_serp/`

## Additional opportunistic desktop captures

- `вегвизир`: promo, images, marketplaces + specialist info; embedded Alice; `Люди ищут` exposes `вегвизир значение`, `вегвизир значение символа`, etc.
- `алатырь оберег`: embedded Alice; marketplaces + specialist commerce/content; video + images; meaning/gender/buy branches.
- `подарок автомобилисту`: Ozon first; embedded Alice high in SERP; WB/Poryadok/KP/gift retailers; WB snippet contains wolf pendant as one possible gift; `lr=10466` directly observed, human-readable geography unresolved.

## Mobile

Representative mobile browser UI remains **0/2**:

- `славянские обереги`
- `оберег в машину`

Wordstat PHONE counts do not substitute for mobile SERP evidence.

---

# 04.4 — Consumer Alice primary

**[x] COMPLETE — accepted canonical primary 10/10**

Canonical results:

1. `славянские обереги` — informational/explanatory; highlights `Печать Велеса`, `Алатырь`; 7 confidently normalized sources.
2. `печать велеса` — meaning/history/use-first despite transactional Search; exact 17 sources; 3 fan-outs.
3. `вегвизир` — entity/history/meaning-first; embedded + standalone corroboration; exact 11 embedded sources.
4. `алатырь оберег` — mythology/meaning/suitability; exact 18 sources.
5. `оберег в машину` — choice/use-case + shopping; 7 direct product examples; 13 readable sources.
6. `подвеска на зеркало в машину` — decor/form-factor selection + shopping; 6 direct products; symbolic products only one branch.
7. `талисман знак зодиака` — informational zodiac selection; stones/jewelry central; exact 30 sources; 3 fan-outs.
8. `оберег велес` — symbol-family explanation + suitability + light shopping; specialist Slavic sources strong.
9. `подарок мужчине в машину` — clean rerun: broad practical gift selection; no pendant/amulet/talisman default category; contaminated prior run excluded.
10. `подарок автомобилисту` — broad gift guide; practical/general auto gifts dominate; no amulet/Slavic category in Alice answer; exact 11 sources.

Cross-root result:

- symbol/entity roots are meaning/history/suitability-first in Alice even when Search is commercial;
- `оберег в машину` is query-native selection + commerce;
- `подвеска на зеркало в машину` is broad form-factor/decor commerce;
- broad zodiac root is strongly stone/jewelry contaminated;
- both clean gift roots are broad gift-selection jobs with weak default pendant fit;
- specialist independent sites repeatedly qualify as Search and Alice sources for symbolic roots.

Canonical comparison:

- `marketing/research/R2_PRIMARY_SEARCH_ALICE_COMPARISON_2026-08-26.md`

Alice raw/normalized artifacts:
- `marketing/data/raw/alice/`
- `marketing/data/normalized/alice/`

---

# 04.5 — Evidence-driven secondary expansion

**[~] PRIORITY A 3/3 COMPLETE; JOINT REVIEW COMPLETE; NEXT B1**

Detailed canonical checkpoint:

- `marketing/research/R2_SECONDARY_SEARCH_ASET_STATUS_2026-08-26.md`

## Priority A

### A1 `оберег по знаку зодиака` — **[x] COMPLETE**

Direct Search:
- request `search-ae0b8945-90f4-44da-b508-927267242aa2`;
- HTTP 200;
- region 225;
- Top-10.

Result:

**The `оберег` modifier does not cleanly shift Search toward symbolic/Slavic specialist commerce.**

Observed mix remains marketplace + zodiac-selection/editorial + stones/jewelry; no Slavic-symbol specialist site in returned Top-10.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_A1__obereg_po_znaku_zodiaka__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_A1__obereg_po_znaku_zodiaka__225.csv`

Canonical IDs:
- query `q_f31b17922a59`
- measurement `m_search_20260826_f31b1792`

### A2 `печать велеса значение` — **[x] COMPLETE**

Direct Search:
- request `search-4d5ed645-c23c-45bc-b9b5-bea712eb54ae`;
- HTTP 200;
- elapsed 1326 ms;
- region 225;
- Top-10.

Observed:
- ranks 1–6 are meaning/explanation-led;
- ranks 7–10 are specialist commerce/product pages with meaning-rich snippets;
- `slavyanskieoberegi.ru` occupies #1, #7, #9, #10;
- no Yandex Market, Ozon or Wildberries in Top-10.

Result:

**YES — explicit `значение` creates a distinct informational / meaning-first Search job.**

Commercial intent survives via specialist pages, materially different from base `печать велеса`, which was transactional/product and marketplace-heavy.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_A2__pechat_velesa_znachenie__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_A2__pechat_velesa_znachenie__225.csv`

Canonical IDs:
- query `q_ddc00bf51857`
- measurement `m_search_20260826_ddc00bf5`

### A3 `амулет в машину` — **[x] COMPLETE**

Direct Search:
- request `search-aee9a6d6-fa5c-4bd3-ac72-dd682acf08c7`;
- HTTP 200;
- elapsed 1234 ms;
- region 225;
- Top-10.

Observed:
- Ozon #1, Wildberries #2, Yandex Market #4/#5, Livemaster #6/#7, Avito #8;
- Happy Witch #3 gives commerce + explanatory choice content;
- VK #9 is informational/community;
- Amber Land #10 is specialist religious commerce;
- Livemaster #7 explicitly exposes `Славянский оберег в машину`;
- Avito #8 snippet explicitly exposes `скандинавский амулет руна Феху`;
- most titles/URLs use `оберег`, not `амулет`.

Result:

**`амулет в машину` does not form a clearly separate Search job. Yandex largely folds it into the same semantic cluster as `оберег в машину`, with a stronger marketplace/transactional tilt in this measurement.**

Comparison:
- `оберег в машину`: mixed commercial + choice/use-case; 4 marketplace/platform, 3 independent commerce, 3 informational;
- `подвеска на зеркало в машину`: transactional form-factor; all Top-10 commerce/platform;
- `амулет в машину`: semantic synonym of automotive-protection cluster, not a separate form-factor branch.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_A3__amulet_v_mashinu__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_A3__amulet_v_mashinu__225.csv`

Canonical IDs:
- query `q_aa4ac349a92c`
- measurement `m_search_20260826_aa4ac349`

## Joint A-set result

Three uncertainty classes are now separated:

1. lexical narrowing is not automatically useful (`оберег по знаку зодиака` still contaminated);
2. explicit meaning intent can create a real separate Search job (`печать велеса значение`);
3. close synonym variation may collapse into the same job (`амулет в машину` → `оберег в машину` cluster).

**Rule going forward:** pay for secondary Search only when it tests a real semantic/job hypothesis, not merely another wording variant.

## Priority B

### B1 `вегвизир значение` — **[ ] NEXT / KEEP**

Evidence:
- directly observed in browser `Люди ищут`;
- base Wordstat `вегвизир`: 5,938 broad / 1,541 quoted;
- base Search mixed entity + commercial;
- Alice meaning/history-first;
- A2 proves explicit `значение` can materially change Search composition for a symbolic root.

Decision question:

**Does the meaning-modifier split observed for `Печать Велеса` generalize to the Norse/European symbol cluster, or does `вегвизир` remain mixed even with explicit meaning intent?**

This is decision-useful because it tests repeatability across symbol families, not a synonym.

### B2 `шлем ужаса оберег` — **[ ] KEEP, REASSESS AFTER B1**

Evidence:
- Wordstat 474 broad;
- adjacent named-symbol opportunity, not a synonym;
- direct Alice/Vegvisir evidence raises Ægishjálmur / `Шлем ужаса` as comparison branch.

Decision question:

**Does `шлем ужаса оберег` produce a coherent specialist symbolic/commercial Search job, or is it too informational/contaminated to matter commercially?**

Execution rule:

1. run B1 only;
2. save raw + normalized immediately;
3. reassess B2 after B1;
4. do not auto-batch Priority B.

Before each paid Search API secondary request, fresh-verify official Yandex pricing.

## Deferred

- `вегвизир значение символа` — redundant until B1 proves otherwise;
- `алатырь оберег значение` — explicit meaning behavior already proven on Велес; marginal value currently lower than B1;
- gift expansions — rejected now because clean evidence shows weak default product fit;
- generic mirror/decor expansions — deferred because primary evidence already proves commodity contamination;
- additional `амулет/оберег` automotive synonyms — low value unless new evidence shows a distinct job.

---

# 04.6 — Normalize evidence / Query Evidence Ledger

**[~] IN PROGRESS**

Completed:

- primary Search 10/10 normalized;
- Search→Ledger staging patch exists;
- canonical measurement IDs separated from provider request IDs;
- structural merge check done;
- accepted Alice primary 10/10 normalized;
- contaminated gift run retained separately and excluded from canonical count;
- secondary Search A1/A2/A3 raw + normalized saved;
- A-set joint review committed.

Legacy defect:

- old `подвеска на зеркало в машину` Ledger row has shifted tail CSV fields due unescaped commas;
- repair/merge state stored in `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- do not blindly overwrite canonical Ledger.

Remaining:

- safe canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv`;
- apply Search patch + measurement IDs;
- backfill Alice linkage for 10/10;
- Wordstat linkage only from real R1 artifacts;
- browser-only product-block fields only from direct UI evidence;
- add B1/B2 only if executed.

Continuity artifacts:

- `marketing/data/ledger/query_evidence_serp_patch_2026-08-26.csv`
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`
- `marketing/research/R2_SECONDARY_SEARCH_ASET_STATUS_2026-08-26.md`

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
- secondary Priority A: **3/3 COMPLETE**;
- A-set joint review: **COMPLETE**;
- B1 `вегвизир значение`: **NEXT**;
- B2 `шлем ужаса оберег`: **WAIT / reassess after B1**.

## Next action

1. Fresh-verify official Yandex synchronous Search pricing immediately before paid B1.
2. Execute only B1: **`вегвизир значение`**.
3. Save raw + normalized immediately.
4. Reassess whether B2 still adds decision value.

Do not jump directly to Roadmap 05 and do not auto-run B1+B2 together.
