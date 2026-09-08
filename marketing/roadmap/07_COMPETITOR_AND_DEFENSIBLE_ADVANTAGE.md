# 07 — Конкурентная разведка и доказуемое конкурентное преимущество

Статус: **[~] IN PROGRESS — 07.1 ACTIVE**  
Дата старта: **2026-09-08**

## Цель

Не составить ещё один список конкурентов, а доказать по приоритетным opportunity lanes, **где независимый Blood & Sand может дать пользователю и Яндексу/Алисе ценность, которой маркетплейсы и текущие нишевые сайты не дают или дают хуже**.

Stage 07 не фиксирует финальную IA/Page Jobs и не считает финальную экономику.

## Входные authority

Обязательные:
- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`;
- `marketing/research/R4_STAGE06_BUYER_SKU_EVIDENCE_FINAL_2026-09-08.md`;
- `marketing/data/normalized/products/product_listing_master.csv`;
- `marketing/data/normalized/customer/customer_evidence.csv`;
- `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`;
- `marketing/research/R2_COMPETITIVE_LANDSCAPE_PECHAT_VELESA_2026-08-01.md` — reusable historical landscape, not current ranking authority.

## Evidence rules

- Existing Yandex Search/Alice observations remain the ranking/source authority for their captured date; public web research must not be relabelled as a fresh Yandex Top-10.
- Competitor claims are observations about competitor content, not facts about history/religion/product efficacy.
- Every competitor page is recorded by URL, page role, observed features, opportunity relevance and measurement date.
- Separate `MARKETPLACE`, `SPECIALIST_COMMERCE`, `INFORMATIONAL`, `HYBRID_COMMERCE` and `OTHER`.
- Separate `feature present` from `feature is good/useful`.
- A competitive advantage is accepted only when all three are evidenced: **user need / competitor gap / Blood & Sand capability or evidence asset**.
- No invented traffic, conversion, authority, sales or ranking numbers.
- No final IA/Page Jobs before Stage 10/11.
- Every completed pass is committed before the next pass.

## Expected working runs

**5 decision-grade runs** plus bounded rechecks only if an evidence gap remains.

---

## 07.1 — Freeze comparison contract + reuse existing evidence

Status: **[~] ACTIVE**

Tasks:
- inventory competitor domains/pages already observed in R2 Search/Alice and historical landscape;
- map them to current OU01–OU10 after Stage-06 decisions;
- define one comparison schema applied to every page;
- identify which historical observations need fresh public-page recheck and which do not.

Comparison fields:
- competitor_type;
- domain/page URL;
- page_role;
- opportunity_ids;
- current accessibility;
- product breadth/depth;
- exact physical product facts;
- real-car scale/use visuals;
- mounting/attachment explanation;
- materials/construction explanation;
- packaging/gift evidence;
- price/availability/checkout;
- marketplace alternative checkout;
- reviews/UGC/social proof;
- historical/source citations;
- separation of historical fact vs modern/esoteric interpretation;
- comparison/selection help;
- FAQ/instructions;
- internal knowledge↔commerce linkage;
- source-worthiness for AI;
- observed gap;
- possible Blood & Sand response;
- evidence certainty.

Expected result:
- canonical competitor target registry and comparison schema;
- bounded fresh-page research package.

Completion gate:
- every active/investigate/reopened opportunity has at least one relevant competitor class assigned;
- no domain is selected only because it appeared in an old web snapshot if it is no longer accessible/relevant.

---

## 07.2 — Fresh specialist-commerce competitor pass

Status: **[ ] WAIT**

Priority lanes:
- OU01 Slavic category;
- OU02 Печать Велеса;
- OU05 Алатырь;
- OU06 broader Велес;
- OU07 Vegvisir;
- OU08 Шлем Ужаса;
- OU03/OU04 automotive/mirror-pendant product experience.

Priority historical candidates to recheck first:
- BEREGY;
- Veles.bz;
- Ярило / slavyanskieoberegi.ru;
- Руническая мастерская / oberegi-runi.ru;
- other independent specialist domains that appear in preserved Search/Alice evidence.

Expected result:
- fresh direct-page feature matrix;
- exact examples of strengths and gaps;
- no generic claims such as “content is weak” without page evidence.

Completion gate:
- decision-grade comparison exists for the major specialist-commerce patterns relevant to accepted opportunities.

---

## 07.3 — Fresh informational/source-quality pass

Status: **[ ] WAIT**

Priority questions:
- how leading pages explain Печать Велеса / Велес / Алатырь / Vegvisir / Ægishjálmur;
- whether they cite primary/academic/museum/encyclopedic sources;
- whether historical claims are separated from modern esoteric interpretation;
- whether content helps selection or merely repeats symbolic claims;
- whether commerce pages and knowledge pages are connected.

Historical candidates include Arcanum, VashObereg, Grimuar, 100kulonov and other domains actually preserved in Search/Alice evidence.

Expected result:
- source-quality matrix;
- list of claim classes Blood & Sand should source, qualify or avoid;
- evidence-backed AI/source-worthiness gaps.

Completion gate:
- historical/source-quality bar defined for OU02/OU05/OU06/OU07/OU08 without treating competitor folklore as authority.

---

## 07.4 — Marketplace vs owned-site defensibility + reopened zodiac test

Status: **[ ] WAIT**

Tasks:
- compare what Ozon/WB already solve well versus what owned specialist experience can uniquely solve;
- test OU04 mirror-pendant differentiation against marketplace commodity experience;
- test reopened OU09 against actual specialist/marketplace page patterns without overriding weak broad Search purity;
- connect Stage-06 customer gaps: scale-in-car, attachment, material, packaging, trust, source quality.

Expected result:
- opportunity-level defensibility matrix with verdicts: `DEFENSIBLE`, `CONDITIONAL`, `WEAK`, `NO_ADVANTAGE`;
- explicit reason/evidence for each.

Completion gate:
- OU04 and OU09 have explicit go-forward conditions rather than vague “investigate later”.

---

## 07.5 — Final competitive-advantage decision + Stage 08 handoff

Status: **[ ] WAIT**

Required final output:
- accepted competitor facts;
- what marketplaces do better and should not be duplicated;
- what specialist sites already do well and must be matched;
- defensible Blood & Sand advantage candidates;
- content/evidence capabilities required to realize each advantage;
- opportunities with no defensible advantage;
- unknowns that must move to economics rather than more competitor research;
- exact Stage-08 economic questions.

Completion gate:
- every OU01–OU10 has an explicit competitive verdict or remains rejected by prior authority;
- each accepted advantage traces to user need + competitor gap + owned evidence/capability;
- no final URL/IA/Page Job decisions are frozen.

---

# Initial hypotheses to test, not conclusions

H1. `real product documentation` can beat generic marketplace copy: exact dimensions, scale in real car, mounting, materials, packaging, construction.

H2. `source-rigorous symbol explanation` can beat unsourced esoteric repetition and improve Alice/source-worthiness.

H3. `knowledge → selection → exact product` linkage can be stronger than pure information sites or pure marketplaces.

H4. Hybrid direct + marketplace paths can reduce trust/checkout friction without forcing one channel.

H5. OU04 may have product fit but no defensible Search advantage unless real-car/use evidence is substantially better than marketplace listings.

H6. Reopened OU09 may deserve a seasonal/supporting specialist role, but not a generic “zodiac” SEO category unless Stage 07 finds a concrete defensible angle.

# Current continuation point

**07.1 ACTIVE — build the canonical competitor target registry from preserved Search/Alice + R2 evidence, then execute a bounded fresh public-page recheck before moving to 07.2.**
