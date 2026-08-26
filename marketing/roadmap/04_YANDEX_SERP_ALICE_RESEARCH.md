# 04 — Исследовать реальный Yandex Search / SERP и Alice AI

Статус: **[x] COMPLETE — R2 FINAL / READY FOR ROADMAP 05**  
Дата закрытия: **2026-08-26**

## Цель

Получить decision-grade evidence о том, какие страницы и источники Yandex реально выбирает по приоритетным запросам Blood & Sand, разделяя:

- Wordstat human demand;
- Search provider organic evidence;
- browser SERP/UI composition;
- consumer Alice AI;
- marketplace / independent commerce / informational competition;
- разные intent-классы.

Roadmap 04 **не назначает финальную IA/Page Jobs**. Решения переходят в Roadmap 05.

## Evidence rules retained

1. Public web search не подменяет direct Yandex evidence.
2. Search API evidence не считается browser/UI snapshot.
3. Ads, product/rich blocks, organic и Alice хранятся раздельно.
4. `NOT_OBSERVED` / `BLOCKED` не превращаются в inferred absence.
5. Search API region и browser localization не смешиваются.
6. `lr=10466` / `lr=11202` сохраняются как numeric evidence без выдуманной географии.
7. Context-contaminated Alice run исключается из canonical evidence.
8. Secondary Search запускается только под отдельный decision question.
9. Page Jobs / IA до Roadmap 05 остаются unassigned.

---

# 04.1 — Protocol / scope

**[x] COMPLETE**

- Search API canonical region: Russia `225`;
- provenance обязательный;
- Search / browser / Alice разделены;
- primary and secondary measurement rules fixed.

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

All 10 returned HTTP 200 / Top-10 / executed=true / retry=false.

Canonical artifacts:
- `marketing/research/R2_YANDEX_SEARCH_PRIMARY_SERP_2026-08-26.md`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__225.tsv`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__measurements.csv`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__summaries.csv`

---

# 04.3 — Browser SERP/UI

## Desktop

**[x] COMPLETE — fixed representative set 5/5**

Measured:
- `славянские обереги`
- `печать велеса`
- `оберег в машину`
- `подвеска на зеркало в машину`
- `талисман знак зодиака`

Additional direct desktop captures:
- `вегвизир`
- `алатырь оберег`
- `подарок автомобилисту`

## Mobile / touch

**[x] COMPLETE — representative set 2/2**

Physical phone was unavailable, therefore both are explicitly classified as:
`YANDEX_TOUCH / EMULATED_MOBILE`

### `славянские обереги`
- no top Promo before first organic;
- `simvolroda.ru` #1;
- `Картинки` immediately after #1;
- `slavyanskieoberegi.ru` #2;
- specialist commerce dominates first ten organic results;
- embedded Alice / rich Popular-products / People-search not observed.

Artifact:
- `marketing/data/raw/browser_serp/20260826__slavyanskie_oberegi__emulated_mobile_touch.md`

### `оберег в машину`
- no top ad before first organic;
- first five organic: Livemaster → m.Avito → Happy Witch → Slavyarmarka → Wildberries;
- first visible ad block only after those five;
- Ozon and multiple specialist merchants later;
- embedded Alice / rich Popular-products / People-search not observed.

Artifact:
- `marketing/data/raw/browser_serp/20260826__obereg_v_mashinu__emulated_mobile_touch.md`

Mobile UI differs materially from desktop composition, but both measured roots preserve their underlying commercial job.

---

# 04.4 — Consumer Alice primary

**[x] COMPLETE — accepted canonical 10/10**

Key cross-root pattern:
- named-symbol roots are meaning/history/suitability-first in Alice even when Search is commercial;
- `оберег в машину` is query-native selection + shopping;
- `подвеска на зеркало в машину` is form-factor/decor shopping;
- broad zodiac is strongly stones/jewelry contaminated;
- clean gift roots are broad gift-selection jobs with weak default pendant fit;
- specialist independent sites repeatedly qualify as Search/Alice sources.

One context-contaminated `подарок мужчине в машину` run is retained only for audit and excluded from canonical count; clean rerun is canonical.

Canonical comparison:
- `marketing/research/R2_PRIMARY_SEARCH_ALICE_COMPARISON_2026-08-26.md`

---

# 04.5 — Evidence-driven secondary Search

**[x] COMPLETE — 5/5; PAID EXPANSION STOPPED**

A1 `оберег по знаку зодиака`:
- lexical narrowing did not clean zodiac intent;
- stones/jewelry + marketplace contamination remains.

A2 `печать велеса значение`:
- distinct meaning-first Search job confirmed;
- specialist commerce remains competitive;
- generic marketplaces disappear from Top-10.

A3 `амулет в машину`:
- no separate Search job;
- Yandex folds it into `оберег в машину` cluster.

B1 `вегвизир значение`:
- second independent named-symbol family confirms the meaning-first split.

B2 `шлем ужаса оберег`:
- coherent adjacent named-symbol commercial lane confirmed;
- WB #1, Ozon #2, `slavyanskieoberegi.ru` #3, Yandex Market #4/#7/#8/#10.

Canonical final review:
- `marketing/research/R2_SECONDARY_SEARCH_FINAL_REVIEW_2026-08-26.md`

**Stop rule:** no more paid secondary Search by default. New paid request requires a new explicit decision question from later analysis.

---

# 04.6 — Normalize evidence / Query Evidence Ledger

**[x] COMPLETE**

Canonical Ledger:
- `marketing/data/ledger/query_evidence_ledger.csv`

Atomic rewrite commit:
- `c26ce1ab555ad49fc585c6d85b70cd82c4f67ede`

Validation:
- rows: 23
- columns: 72
- unique query IDs: 23
- Search measured: 15
- Alice measured: 10
- duplicate query IDs: 0
- extra/missing CSV columns: 0
- validated local Git blob SHA exactly matches GitHub content SHA `edc56af00eded6a3d0bf7b6e7ebffa13d81a79f8`.

Validation artifact:
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_R2_FINAL_VALIDATION_2026-08-26.md`

Legacy malformed `подвеска на зеркало в машину` row is repaired. No fake Wordstat IDs, Search device values, Webmaster, customer or commerce evidence were introduced.

---

# 04.7 — Final R2 report / handoff

**[x] COMPLETE**

Canonical final report:
- `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`

Core decision-ready inputs for Roadmap 05:

1. named symbols show recurring **commercial + explanatory/meaning** jobs;
2. specialist content-commerce sites can rank in both layers;
3. `оберег в машину` is a real mobile-first protection/selection commerce opportunity;
4. `подвеска на зеркало в машину` is a distinct transactional form-factor/decor universe;
5. broad zodiac volume is heavily contaminated and must not be treated as clean product demand;
6. broad gift roots have weak default pendant fit;
7. `Шлем Ужаса` is a credible adjacent named-symbol opportunity;
8. lexical synonyms such as `амулет в машину` should be semantic coverage, not automatically separate IA.

## Final continuation point

**Roadmap 04 is closed.**

Next stage:
- Roadmap 05 — combine H/A/C/O, score opportunities, assign Page Jobs / target CTA / owned-asset role, and only then make IA decisions.

Do not reopen R2 evidence collection unless Roadmap 05 exposes a concrete unresolved decision question.
