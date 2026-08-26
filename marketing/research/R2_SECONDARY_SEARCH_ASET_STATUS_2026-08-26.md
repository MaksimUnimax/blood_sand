# R2 — Secondary Search status — 2026-08-26

Status: **A-SET COMPLETE; B1 COMPLETE; B2 NEXT**

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

Commercial intent survives through specialist product pages rather than generic marketplace-heavy results. This materially differs from base `печать велеса`, which was transactional/product and marketplace-heavy.

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
- most returned titles/URLs use `оберег`, not `амулет`.

Decision result:

**`амулет в машину` is not a clearly separate Search job. Yandex largely folds it into the same semantic cluster as `оберег в машину`, but this measurement is more marketplace/transactional in composition.**

Therefore A3 is a lexical/supporting query of the automotive-protection cluster, not a provisional independent Page Job.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_A3__amulet_v_mashinu__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_A3__amulet_v_mashinu__225.csv`

Canonical IDs:
- query `q_aa4ac349a92c`
- measurement `m_search_20260826_aa4ac349`

# Joint A-set review

Priority A: **3/3 COMPLETE**

1. Lexical narrowing is not automatically useful: `оберег по знаку зодиака` still inherits the broad zodiac/stone/marketplace universe.
2. Explicit meaning intent can be genuinely distinct: `печать велеса значение` flips the base transactional query into a meaning-first result set.
3. Close synonym variation may not create a new job: `амулет в машину` is normalized back to the `оберег в машину` semantic cluster.

The A-set rule is therefore: **pay for secondaries only when they test a real semantic/job hypothesis, not merely a wording variant.**

# Priority B

## B1 — `вегвизир значение` — COMPLETE

Direct Search result:
- request `search-9739861a-3871-47de-a904-0a9049c1a663`;
- region 225;
- HTTP 200;
- elapsed 1627 ms;
- Top-10;
- executed=true;
- retry=false;
- FORMAT_XML.

Observed result composition:
- Top-10 is overwhelmingly meaning/history/origin/explanation-led;
- no Ozon, Wildberries or Yandex Market in returned Top-10;
- #1 `ruyan-master.ru` article explicitly answers symbol meaning;
- translated Wikipedia #2;
- specialist/editorial results at #1, #3, #4, #6, #8, #9;
- community sources Pikabu #5 and VK #7;
- YouTube explanation #10;
- commerce-linked domains appear, where present, through editorial/article surfaces rather than product/catalog pages.

B1 answer:

**YES — `вегвизир значение` creates a distinct informational / meaning-first Search job relative to the mixed base query `вегвизир`.**

This is the second independent named-symbol family showing the same modifier split already observed for `печать велеса` → `печать велеса значение`.

### Cross-family implication

The `значение` layer is now a **repeatable Search behavior**, not a one-query anomaly:
- Slavic named symbol: `печать велеса` → transactional/product, while `печать велеса значение` → meaning-first;
- Icelandic/Norse-associated named symbol: `вегвизир` → mixed entity + commercial, while `вегвизир значение` → meaning/history-first.

This materially strengthens the evidence that named-symbol demand may require separate commercial and explanatory jobs at the later Page Job decision stage. This remains PROVISIONAL until Roadmap 05.

Artifacts:
- `marketing/data/raw/yandex_search/20260826__search__secondary_B1__vegvizir_znachenie__225.md`
- `marketing/data/normalized/yandex_search/20260826__search__secondary_B1__vegvizir_znachenie__225.csv`

Canonical IDs:
- query `q_99eac125dfed`
- measurement `m_search_20260826_99eac125`

## B2 — `шлем ужаса оберег` — NEXT / STILL DECISION-USEFUL

B1 does **not** make B2 redundant. They test different questions:
- B1 tests meaning-layer separation for an existing high-demand named symbol;
- B2 tests whether there is a second coherent named-symbol opportunity inside the adjacent Norse/Icelandic symbolic cluster.

Existing evidence for B2:
- Wordstat broad demand: 474;
- it is not a lexical synonym of Vegvisir;
- Alice/Vegvisir evidence directly raised Ægishjálmur / `Шлем ужаса` as a comparison branch;
- if Search is coherent specialist symbolic/commercial, it may represent a real adjacent opportunity;
- if Search is mostly diffuse information/noise, it should be deprioritized.

Decision question:

**Does `шлем ужаса оберег` produce a coherent specialist symbolic/commercial Search job, or is it too informational/contaminated to matter commercially?**

## Execution decision

**Run B2 once, save/normalize it immediately, then stop paid secondary expansion and perform the complete R2 secondary review.**

Reason: B1 has already answered the general meaning-modifier question. Additional `значение` variants such as `вегвизир значение символа` or `алатырь оберег значение` now have low marginal value. B2 is the remaining distinct structural hypothesis.

Before B2, fresh-verify official Yandex Search API pricing.
