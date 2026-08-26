# 04 — Исследовать реальный Yandex Search / SERP и Alice AI

Статус: **[~] В РАБОТЕ — PRIMARY COMPLETE; SECONDARY A 3/3 + B1 COMPLETE; NEXT B2**  
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

**[~] A1+A2+A3+B1 COMPLETE; NEXT B2; STOP PAID EXPANSION AFTER B2**

Detailed canonical checkpoint:

- `marketing/research/R2_SECONDARY_SEARCH_ASET_STATUS_2026-08-26.md`

## Priority A — **3/3 COMPLETE**

### A1 `оберег по знаку зодиака`

Result:

**Lexical narrowing did not create a clean Slavic/symbolic commercial branch.** Search remains marketplace + zodiac-selection + stones/jewelry contaminated.

### A2 `печать велеса значение`

Result:

**Explicit `значение` creates a distinct informational / meaning-first Search job.** Base `печать велеса` is transactional/product and marketplace-heavy; the meaning modifier shifts the Top-10 toward explanation plus specialist commerce.

### A3 `амулет в машину`

Result:

**No separate Search job.** Yandex largely folds the lexical variant into the existing `оберег в машину` automotive-protection cluster, with a stronger marketplace tilt.

## Joint A-set rule

Secondary queries are worth paying for only when they test a real semantic/job hypothesis, not merely another wording variant.

## Priority B

### B1 `вегвизир значение` — **[x] COMPLETE**

Direct Search:
- request `search-9739861a-3871-47de-a904-0a9049c1a663`;
- HTTP 200;
- elapsed 1627 ms;
- region 225;
- Top-10;
- FORMAT_XML.

Observed:
- Top-10 overwhelmingly meaning/history/origin/explanation-led;
- no Ozon, Wildberries or Yandex Market;
- #1 `ruyan-master.ru` article explicitly answers meaning;
- translated Wikipedia #2;
- specialist/editorial surfaces dominate;
- Pikabu #5 and VK #7 provide community interpretation;
- YouTube explanation #10;
- commerce-connected domains, where present, appear through article/editorial URLs rather than product/catalog surfaces.

Result:

**YES — `вегвизир значение` creates a distinct informational / meaning-first Search job relative to mixed base `вегвизир`.**

This independently reproduces A2's modifier split in a second named-symbol family.

Cross-family evidence is now strong enough to say that the `значение` layer is a **repeatable Search behavior**, not a one-query anomaly:

- `печать велеса` → transactional/product; `печать велеса значение` → meaning-first;
- `вегвизир` → mixed entity + commercial; `вегвизир значение` → meaning/history-first.

This strengthens a later PROVISIONAL hypothesis that named symbols may need separate commercial and explanatory jobs. Final decision belongs to Roadmap 05.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_B1__vegvizir_znachenie__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_B1__vegvizir_znachenie__225.csv`

Canonical IDs:
- query `q_99eac125dfed`
- measurement `m_search_20260826_99eac125`

### B2 `шлем ужаса оберег` — **[ ] NEXT / FINAL PAID SECONDARY**

B1 does not make B2 redundant:

- B1 tested meaning-layer separation for an existing high-demand named symbol;
- B2 tests whether an **adjacent named symbol** forms a coherent specialist/commercial lane of its own.

Evidence:
- Wordstat broad demand: 474;
- not a synonym of Vegvisir;
- Alice/Vegvisir evidence directly raised Ægishjálmur / `Шлем ужаса` as a comparison branch.

Decision question:

**Does `шлем ужаса оберег` produce a coherent specialist symbolic/commercial Search job, or is it too informational/contaminated to matter commercially?**

Execution rule:

1. fresh-verify official Yandex pricing;
2. run B2 once;
3. save raw + normalized immediately;
4. stop paid secondary expansion;
5. perform complete secondary review and proceed to normalization / R2 handoff.

## Deferred / no longer worth immediate paid measurement

- `вегвизир значение символа` — B1 already proves the meaning layer;
- `алатырь оберег значение` — cross-family meaning behavior now independently proven twice;
- gift expansions — clean evidence shows weak default pendant fit;
- generic mirror/decor expansions — primary evidence already proves commodity contamination;
- additional automotive `амулет/оберег` synonyms — A3 shows low marginal value.

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
- secondary Search A1/A2/A3/B1 raw + normalized saved;
- A-set joint review committed;
- B1 cross-family meaning-split result committed.

Legacy defect:

- old `подвеска на зеркало в машину` Ledger row has shifted tail CSV fields due unescaped commas;
- repair/merge state stored in `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_SERP_MERGE_STATUS_2026-08-26.md`;
- do not blindly overwrite canonical Ledger.

Remaining:

- execute/save B2;
- complete secondary review;
- safe canonical rewrite `marketing/data/ledger/query_evidence_ledger.csv`;
- apply Search patch + measurement IDs;
- backfill Alice linkage for 10/10;
- Wordstat linkage only from real R1 artifacts;
- browser-only product-block fields only from direct UI evidence.

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
- B1 `вегвизир значение`: **COMPLETE**;
- cross-family meaning-layer replication: **CONFIRMED**;
- B2 `шлем ужаса оберег`: **NEXT / FINAL PAID SECONDARY**.

## Next action

1. Fresh-verify official Yandex synchronous Search pricing.
2. Execute only B2: **`шлем ужаса оберег`**.
3. Save raw + normalized immediately.
4. Stop paid secondary expansion and perform final secondary review.

Do not add further `значение` or lexical-synonym requests unless new evidence creates a genuinely new decision question.
