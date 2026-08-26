# R3 — Opportunity scoring rubric — 2026-08-26

Status: **05.1 COMPLETE — rubric + canonical opportunity units fixed**

Purpose: convert R1/R2 evidence into a comparable opportunity map without pretending to know final revenue, IA or owned-site performance.

## 1. Core rule

H/A/C/O are **ordinal evidence dimensions**, not a mathematical forecast.

Each dimension uses:
- `HIGH`
- `MEDIUM`
- `LOW`
- `UNKNOWN`

Every rating must also have evidence confidence:
- `HIGH_CONFIDENCE` — supported by multiple direct surfaces / repeated behavior;
- `MEDIUM_CONFIDENCE` — direct evidence exists but one or more important surfaces are missing or mixed;
- `LOW_CONFIDENCE` — sparse / indirect / contaminated evidence;
- `NOT_ASSESSED` — no honest score yet.

No weighted total is allowed in 05.1. Stage 05.2 may rank opportunities, but only after preserving dimension-by-dimension rationale.

---

# 2. H — Human demand

Question:

**Is there meaningful human search demand for this opportunity unit, and how cleanly does the measured demand map to the actual job?**

## H = HIGH

Use when:
- direct Wordstat demand is materially large for this project; and
- query/job evidence is sufficiently coherent, or a large broad root is supported by precise subqueries / Search behavior.

Examples of evidence patterns:
- high broad + meaningful quoted precision;
- multiple related roots converging on one job;
- strong device signal does not lower H but may affect channel/UX implications.

## H = MEDIUM

Use when:
- direct demand is meaningful but narrower; or
- broad demand is large but precision/intent contamination materially weakens confidence that volume maps to the candidate job.

## H = LOW

Use when:
- direct demand is small; or
- only a very narrow query supports the candidate.

## H = UNKNOWN

Use when:
- exact opportunity demand was not directly measured and cannot safely be inferred from a parent root.

### Precision / contamination is stored separately

Do **not** silently discount H with an undocumented formula.

Each opportunity also gets `intent_quality`:
- `CLEAN`
- `MIXED`
- `CONTAMINATED`
- `UNKNOWN`

This prevents broad roots like zodiac from looking equivalent to equally large but cleaner opportunity units.

---

# 3. A — Alice / AI usefulness

Question:

**How naturally does the opportunity produce a substantive Alice answer / source need, and can an owned specialist asset plausibly be useful to that answer?**

## A = HIGH

Use when direct Alice evidence shows one or more of:
- substantial explanation / selection / suitability answer;
- repeatable named-symbol meaning/history behavior;
- specialist independent domains directly used as Alice sources;
- answer structure clearly requires more context than a marketplace product card alone supplies.

## A = MEDIUM

Use when:
- Alice is useful but primarily shopping/selection oriented; or
- direct product integration dominates but explanatory context still matters.

## A = LOW

Use when:
- Alice answer is broad/generic and the Blood & Sand product/category is not a natural central answer; or
- the candidate is mostly commodity/form-factor shopping with limited distinctive explanatory need.

## A = UNKNOWN

Use when no canonical Alice measurement exists for the candidate and nearby evidence is insufficient for a safe family-level inference.

Important:
- absence of embedded Alice in one browser SERP is not automatically A=LOW if standalone Alice directly answered the query;
- source eligibility and answer usefulness matter more than whether Alice happened to be visually embedded in one capture.

---

# 4. C — Provisional commercial fit

Question:

**Based only on current Search/browser/Alice evidence, how directly does this opportunity connect to products Blood & Sand can plausibly sell or route to commerce?**

This is **provisional C**. It is not unit economics and not actual conversion.

## C = HIGH

Use when:
- Search is strongly transactional/product/category oriented; and/or
- rich product/shopping blocks are directly observed; and/or
- Alice injects orderable products; and
- Blood & Sand product form/category is a natural answer rather than an edge case.

## C = MEDIUM

Use when:
- commercial and informational jobs coexist;
- specialist commerce ranks, but purchase is not the only job;
- product fit is plausible and direct but not dominant across all surfaces.

## C = LOW

Use when:
- the query is primarily informational with weak immediate product role; or
- broad gift/decor intent contains the product only as one optional answer among many unrelated alternatives.

## C = UNKNOWN

Use when actual product/SKU fit cannot be judged from current evidence and requires stage 06 assortment/customer evidence.

Do not convert C into revenue forecasts before stages 06–09.

---

# 5. O — Provisional owned-asset leverage

Question:

**Is there evidence that an independent owned specialist asset can add value and compete, rather than merely duplicating marketplace listings?**

This is not actual owned-site performance; Webmaster/Metrika do not exist yet for the future asset.

## O = HIGH

Use when:
- specialist independent sites repeatedly rank in Search; and/or
- specialist domains are repeatedly Alice sources;
- content/explanation and commerce can coexist;
- the user job benefits from expertise, comparison, symbolism/history, suitability or selection that marketplaces handle poorly.

## O = MEDIUM

Use when:
- marketplaces are strong but independent specialist pages still appear;
- an owned asset can plausibly differentiate through explanation/selection, but evidence is less repeated.

## O = LOW

Use when:
- the opportunity is dominated by generic commodity platforms / broad gift lists / decor alternatives;
- there is little direct evidence that specialist ownership adds unique value.

## O = UNKNOWN

Use when:
- current R1/R2 surfaces do not support a reliable owned-asset inference.

---

# 6. Candidate-level auxiliary fields

Every opportunity row must include:

- `opportunity_id`
- `opportunity_name`
- `query_roots`
- `job_lanes`
- `intent_quality`
- `H`
- `A`
- `C`
- `O`
- `score_confidence`
- `strongest_positive_evidence`
- `strongest_negative_evidence`
- `overlap_risk`
- `next_evidence_dependency`
- `status`

Allowed `status` in 05.2:
- `KEEP`
- `INVESTIGATE`
- `DEFER`
- `REJECT_AS_PRIMARY`

No `BUILD_PAGE` status exists at stage 05.

---

# 7. Canonical opportunity units v1

The 23-query Ledger is normalized into **10 opportunity units**. These are analysis units, not page counts.

## OU01 — Slavic category

Core roots:
- `славянские обереги`

Job lanes:
- category exploration / purchase;
- broad symbol discovery.

Reason to keep separate:
- very large human demand;
- specialist independent commerce is directly competitive on desktop and touch.

Overlap risk:
- individual named symbols may deserve their own opportunity units but must not double-count category demand.

## OU02 — Печать Велеса family

Core roots:
- `печать велеса`
- `печать велеса значение`
- bear/wolf variants as supporting evidence.

Job lanes:
- evaluate/buy;
- meaning/history/suitability.

Reason to keep as one opportunity family with two lanes:
- direct Search proves a real commercial-vs-meaning split;
- stage 05 should compare the family before deciding later whether architecture needs separate URLs.

## OU03 — Automotive protection

Core roots:
- `оберег в машину`
- `амулет в машину`
- `славянский оберег в машину`
- `какой оберег выбрать в машину`
- narrow symbol+car variants as support.

Job lanes:
- protection/use-case selection;
- product purchase.

Merge rule:
- `амулет в машину` is not a separate unit because direct secondary Search collapses it into the same semantic cluster.

## OU04 — Mirror-pendant form factor

Core roots:
- `подвеска на зеркало в машину`
- `подвеска печать велеса` as narrow supporting product-form evidence.

Job lanes:
- hanging accessory / form-factor shopping;
- decor/personalization/symbol selection.

Reason to keep separate from OU03:
- direct Search + Alice show a different, more commodity/form-factor job.

## OU05 — Алатырь named symbol

Core roots:
- `алатырь оберег`

Job lanes:
- evaluate/buy;
- meaning/suitability.

Reason:
- meaningful named-symbol demand;
- commercial + Alice meaning evidence;
- direct marketplace visibility of Blood & Sand product exists, but owned-site visibility does not yet exist.

## OU06 — Veles broader symbol family

Core roots:
- `оберег велес`

Job lanes:
- choose among Veles symbol forms;
- suitability/meaning;
- light commerce.

Reason to keep provisionally distinct from OU02:
- Alice directly treats `оберег велес` as a family of symbols, not only `Печать Велеса`;
- overlap must be resolved in 05.3.

## OU07 — Vegvisir family

Core roots:
- `вегвизир`
- `вегвизир значение`

Job lanes:
- entity/commercial evaluation;
- history/meaning/origin.

Reason:
- large human demand;
- explicit meaning split independently reproduces the named-symbol behavior seen for Печать Велеса.

## OU08 — Шлем Ужаса / Агисхьяльм

Core roots:
- `шлем ужаса оберег`

Job lanes:
- named-symbol purchase;
- meaning/history support.

Reason:
- secondary Search shows a tight commercial lane rather than generic Norse noise.

## OU09 — Zodiac-related opportunity

Core roots:
- `талисман знак зодиака`
- `оберег по знаку зодиака`

Job lanes:
- zodiac selection / meaning;
- potential product selection.

Status before scoring:
- **contaminated candidate**.

Reason:
- broad demand is large, but quoted precision collapses and Search/Alice/People-search are strongly stones/jewelry oriented.

Do not split zodiac signs into separate opportunity units at 05.1.

## OU10 — Generic automotive gift

Core roots:
- `подарок автомобилисту`
- `подарок мужчине в машину`

Job lanes:
- broad practical gift ideation.

Status before scoring:
- **weak default product fit candidate**.

Reason:
- clean Alice does not naturally select amulets/pendants as a central answer;
- a pendant can appear in marketplace Search, but only as one option.

---

# 8. Explicit non-units

Do not create separate opportunity units for:
- `амулет в машину` — proven synonym/cluster collapse;
- `вегвизир значение символа` — redundant after B1 unless later evidence creates a different job;
- `алатырь оберег значение` — additional meaning wording not needed to prove the already-replicated structural pattern;
- generic extra gift wording;
- arbitrary zodiac sign variants;
- every bear/wolf Veles phrase independently.

---

# 9. 05.1 completion decision

05.1 is complete because:
- one scoring rubric is fixed;
- score vs confidence is separated;
- contamination is explicit rather than hidden in volume;
- canonical candidate universe is reduced to 10 opportunity units;
- synonym-driven duplicate units are explicitly rejected;
- no final IA/Page Job has been assigned.

Next: **05.2 — score/rank these 10 units using only canonical R1/R2 evidence.**
