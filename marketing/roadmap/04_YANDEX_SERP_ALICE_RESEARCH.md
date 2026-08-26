# 04 — Исследовать реальный Yandex Search / SERP и Alice AI

Статус: **[~] В РАБОТЕ — PRIMARY COMPLETE; SECONDARY COMPLETE; NEXT MOBILE SERP + LEDGER**  
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

Additional direct desktop captures:
- `вегвизир`;
- `алатырь оберег`;
- `подарок автомобилисту`.

Artifacts: `marketing/data/raw/browser_serp/`

## Mobile

Representative mobile browser UI remains **0/2**:
- `славянские обереги`
- `оберег в машину`

Wordstat PHONE counts do not substitute for mobile SERP evidence.

---

# 04.4 — Consumer Alice primary

**[x] COMPLETE — accepted canonical primary 10/10**

Cross-root result:
- symbol/entity roots are meaning/history/suitability-first in Alice even when Search is commercial;
- `оберег в машину` is query-native selection + commerce;
- `подвеска на зеркало в машину` is broad form-factor/decor commerce;
- broad zodiac root is strongly stone/jewelry contaminated;
- both clean gift roots are broad gift-selection jobs with weak default pendant fit;
- specialist independent sites repeatedly qualify as Search and Alice sources for symbolic roots.

Canonical comparison:
- `marketing/research/R2_PRIMARY_SEARCH_ALICE_COMPARISON_2026-08-26.md`

Alice artifacts:
- `marketing/data/raw/alice/`
- `marketing/data/normalized/alice/`

---

# 04.5 — Evidence-driven secondary expansion

**[x] COMPLETE — A1+A2+A3+B1+B2; PAID SECONDARY EXPANSION STOPPED**

Canonical detailed review:
- `marketing/research/R2_SECONDARY_SEARCH_FINAL_REVIEW_2026-08-26.md`
- `marketing/research/R2_SECONDARY_SEARCH_ASET_STATUS_2026-08-26.md`

## Completed measurements

### A1 `оберег по знаку зодиака`
**Lexical narrowing did not create a clean Slavic/symbolic commercial branch.** Search remains marketplace + zodiac-selection + stones/jewelry contaminated.

### A2 `печать велеса значение`
**Explicit `значение` creates a distinct informational / meaning-first Search job.** Base `печать велеса` is transactional/product and marketplace-heavy; the meaning modifier shifts the Top-10 toward explanation plus specialist commerce.

### A3 `амулет в машину`
**No separate Search job.** Yandex largely folds the lexical variant into the existing `оберег в машину` automotive-protection cluster, with a stronger marketplace tilt.

### B1 `вегвизир значение`
**Distinct meaning-first Search job confirmed in a second named-symbol family.** This independently reproduces the A2 modifier split and confirms that the `значение` layer is repeatable Search behavior.

### B2 `шлем ужаса оберег`
Direct Search:
- request `search-f7b9d7c0-8a86-4b81-bfad-dc87e066582f`;
- HTTP 200;
- elapsed 1493 ms;
- region 225;
- Top-10;
- FORMAT_XML.

Observed:
- Wildberries #1;
- Ozon #2;
- `slavyanskieoberegi.ru` #3;
- Yandex Market #4/#7/#8/#10;
- Livemaster catalog #5;
- Livemaster explanatory/history article #6;
- `swargas.ru` specialist/history #9.

Result:

**YES — `шлем ужаса оберег` forms a coherent named-symbol Search lane with strong commercial intent and supporting meaning/history content.** The result set stays tightly centered on `Шлем Ужаса` / `Агисхьяльм` rather than diffusing into unrelated Norse topics.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_B2__shlem_uzhasa_obereg__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_B2__shlem_uzhasa_obereg__225.csv`

Canonical IDs:
- query `q_136048babfad`
- measurement `m_search_20260826_136048ba`

## Final secondary conclusions

1. lexical narrowing is not automatically a new job;
2. explicit meaning intent is structurally real for named symbols, independently confirmed for `Печать Велеса` and `Вегвизир`;
3. close lexical synonyms may collapse into an existing job (`амулет в машину`);
4. adjacent named symbols can form coherent commercial lanes (`Шлем Ужаса`).

**Stop rule:** no further paid Search secondary requests without a new explicit decision question generated by later analysis.

Deferred / no longer worth immediate paid measurement:
- `вегвизир значение символа`;
- `алатырь оберег значение`;
- gift expansions;
- generic mirror/decor expansions;
- additional automotive `амулет/оберег` synonyms.

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
- secondary Search A1/A2/A3/B1/B2 raw + normalized saved;
- final secondary review committed.

Legacy defect:
- old `подвеска на зеркало в машину` Ledger row has shifted tail CSV fields due unescaped commas;
- repair/merge state stored in `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- do not blindly overwrite canonical Ledger.

Remaining:
- safe canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv`;
- apply Search patch + measurement IDs;
- backfill Alice linkage for 10/10;
- Wordstat linkage only from real R1 artifacts;
- browser-only product-block fields only from direct UI evidence.

Continuity artifacts:
- `marketing/data/ledger/query_evidence_serp_patch_2026-08-26.csv`
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`
- `marketing/research/R2_SECONDARY_SEARCH_FINAL_REVIEW_2026-08-26.md`

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
- mobile browser representative set: **0/2**;
- consumer Alice accepted primary: **10/10**;
- primary cross-surface comparison: **COMPLETE**;
- secondary Search: **COMPLETE — 5/5 secondary measurements executed**;
- paid secondary expansion: **STOPPED**;
- Query Evidence Ledger: **repair/merge still open**;
- Final R2 report: **not started**.

## Next action

1. Repair/merge the canonical Query Evidence Ledger using existing committed artifacts; no user action required for this part.
2. Capture representative **mobile** Yandex browser SERP for `славянские обереги` and `оберег в машину` (one at a time) because mobile UI evidence is still 0/2 and Wordstat showed strongly mobile-skewed demand.
3. Complete final R2 report / handoff only after the remaining evidence and ledger work are closed.

Do not add further paid secondary Search requests unless a new decision question appears.
