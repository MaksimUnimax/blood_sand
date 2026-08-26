# R2 — Secondary Search A-set status — 2026-08-26

Status: **A-SET COMPLETE — JOINT REVIEW COMPLETE; PRIORITY B DECISION READY**

This checkpoint is the authoritative continuation marker for the active secondary Search pass. It does not assign final Page Jobs / IA.

## A1 — `оберег по знаку зодиака` — COMPLETE

Direct Search result:
- request `search-ae0b8945-90f4-44da-b508-927267242aa2`;
- region 225;
- HTTP 200;
- Top-10;
- executed=true;
- retry=false.

Decision result:

**The `оберег` modifier does not cleanly shift the zodiac query toward symbolic/Slavic specialist commerce.**

Observed result mix remains marketplace + zodiac-selection/editorial + stones/jewelry. No Slavic-symbol specialist merchant/site in returned Top-10.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_A1__obereg_po_znaku_zodiaka__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_A1__obereg_po_znaku_zodiaka__225.csv`

## A2 — `печать велеса значение` — COMPLETE

Direct Search result:
- request `search-4d5ed645-c23c-45bc-b9b5-bea712eb54ae`;
- region 225;
- HTTP 200;
- elapsed 1326 ms;
- Top-10;
- executed=true;
- retry=false;
- FORMAT_XML.

Observed result composition:
- ranks 1–6 are meaning/explanation-led;
- ranks 7–10 are specialist commerce/product pages with meaning-rich snippets;
- `slavyanskieoberegi.ru` occupies #1, #7, #9, #10;
- no Yandex Market, Ozon or Wildberries in returned Top-10.

Decision result:

**YES — explicit `значение` creates a distinct informational / meaning-first Search job.**

Commercial intent is not absent; it survives through specialist product pages rather than generic marketplace-heavy results. This is materially different from the base `печать велеса` measurement, which was transactional/product and marketplace-heavy.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_A2__pechat_velesa_znachenie__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_A2__pechat_velesa_znachenie__225.csv`

Canonical IDs:
- query `q_ddc00bf51857`
- measurement `m_search_20260826_ddc00bf5`

## A3 — `амулет в машину` — COMPLETE

Direct Search result:
- request `search-aee9a6d6-fa5c-4bd3-ac72-dd682acf08c7`;
- region 225;
- HTTP 200;
- elapsed 1234 ms;
- Top-10;
- executed=true;
- retry=false;
- FORMAT_XML.

Observed result composition:
- marketplace/platform commerce dominates: Ozon #1, Wildberries #2, Yandex Market #4/#5, Livemaster #6/#7, Avito #8;
- Happy Witch #3 provides commerce + explanatory choice content;
- VK #9 provides informational/community material;
- Amber Land #10 provides specialist religious commerce;
- Livemaster #7 directly exposes a `Славянский оберег в машину` branch;
- Avito #8 snippet directly exposes a `скандинавский амулет руна Феху` product example;
- most returned titles/URLs use `оберег`, not `амулет`.

Decision result:

**`амулет в машину` is not a clearly separate Search job. Yandex largely folds it into the same semantic cluster as `оберег в машину`, but this measurement is more marketplace/transactional in composition.**

Comparison with primary roots:
- primary `оберег в машину`: mixed commercial + choice/use-case; normalized composition 4 marketplace/platform, 3 independent commerce, 3 informational;
- primary `подвеска на зеркало в машину`: transactional form-factor; all Top-10 commerce/platform;
- A3 `амулет в машину`: semantic synonym of protection/amulet cluster, not a form-factor query; marketplace-heavy but still includes explanatory and symbolic branches.

Therefore A3 is best treated as a lexical/supporting query of the automotive-protection cluster, not as a provisional independent Page Job.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_A3__amulet_v_mashinu__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_A3__amulet_v_mashinu__225.csv`

Canonical IDs:
- query `q_aa4ac349a92c`
- measurement `m_search_20260826_aa4ac349`

# Joint A-set review

Priority A progress: **3/3 COMPLETE**

The three tests answer three different uncertainty classes:

1. **Lexical narrowing is not automatically useful.** `оберег по знаку зодиака` still inherits the broad zodiac/stone/marketplace universe.
2. **Explicit meaning intent can be genuinely distinct.** `печать велеса значение` flips the base transactional query into a meaning-first result set while retaining specialist commercial pages.
3. **Close synonym variation may not create a new job.** `амулет в машину` is largely normalized back to the `оберег в машину` semantic cluster.

## Implication for secondary expansion

The A-set shows that secondary queries are worth paying for only when they test a real semantic/job hypothesis, not merely a wording variant.

### B1 `вегвизир значение` — KEEP / DECISION-USEFUL

Reason:
- base `вегвизир` Search is mixed entity + commercial;
- browser `Люди ищут` directly exposed `вегвизир значение` and `вегвизир значение символа`;
- Alice is meaning/history-first;
- A2 proves that an explicit `значение` modifier can materially change Search composition for a symbolic root.

Decision question:

**Does the meaning-modifier split observed for `Печать Велеса` generalize to the Norse/European symbol cluster, or does `вегвизир` remain mixed even with explicit meaning intent?**

This measurement is decision-useful because it tests whether meaning-layer behavior is repeatable across symbol families rather than a one-query anomaly.

### B2 `шлем ужаса оберег` — KEEP / DECISION-USEFUL

Reason:
- Wordstat broad demand: 474;
- it is an adjacent named-symbol opportunity, not a simple synonym;
- existing Vegvisir/Alice evidence directly raises Ægishjálmur / `Шлем ужаса` as a comparison branch;
- it tests whether the Norse cluster contains another commercially viable named-symbol lane beyond Vegvisir.

Decision question:

**Does `шлем ужаса оберег` produce a coherent specialist symbolic/commercial Search job, or is it too informational/contaminated to matter commercially?**

## Execution decision

**Run B1 first, save it, then reassess B2. Do not batch B1+B2 automatically.**

Rationale: B1 validates whether A2's important meaning-layer finding generalizes. That result can change the interpretation and marginal value of B2.

Before the next paid Search API request, fresh-verify official Yandex Search pricing.
