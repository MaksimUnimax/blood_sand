# 05 — Свести Wordstat + Search/SERP + Alice в единую карту возможностей

Статус: **[~] READY TO START — R2 INPUTS COMPLETE**  
Дата старта: **2026-08-26**

## Цель

Преобразовать завершённые R1/R2 evidence в приоритизированную **opportunity map** для Blood & Sand: какие query/user-problem clusters действительно заслуживают дальнейшей продуктовой и коммерческой проработки.

Этот этап **не проектирует финальную IA сайта** и не утверждает окончательные Page Jobs. Он должен определить opportunity candidates, их evidence strength, overlap/contamination и роль в следующем исследовании покупателей/SKU, конкурентов и экономики.

## Входы

Canonical inputs:

- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`
- `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`
- `marketing/research/R2_PRIMARY_SEARCH_ALICE_COMPARISON_2026-08-26.md`
- `marketing/research/R2_SECONDARY_SEARCH_FINAL_REVIEW_2026-08-26.md`
- `marketing/data/ledger/query_evidence_ledger.csv`
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_R2_FINAL_VALIDATION_2026-08-26.md`

Supporting raw/normalized evidence remains under:
- `marketing/data/raw/`
- `marketing/data/normalized/`

## Evidence discipline

1. H/A/C/O are independent dimensions; high query volume does not automatically mean high opportunity.
2. Broad Wordstat volume must be discounted when precision/intent contamination is directly observed.
3. Search-provider, browser UI and Alice evidence remain separate facts even when summarized into one opportunity.
4. Marketplace presence is competition/commerce evidence, not owned-site proof.
5. Absence of owned-site performance is not scored as failure; site does not yet provide that evidence.
6. No final IA URL count is inferred from lexical variants.
7. Separate query wording becomes a separate opportunity/job only when evidence shows a distinct user problem or result-set behavior.
8. All scoring rationales must point back to canonical evidence; no unsupported numerical precision.

---

# Planned steps

## 05.1 — Define opportunity units and scoring rubric

Status: **[ ] NEXT**  
Estimated: **1 run**

Work:
- derive evidence-backed opportunity units from the 23-row canonical Ledger;
- define ordinal rubric for:
  - `H` — human demand / precision;
  - `A` — Alice/source usefulness and explanatory need;
  - `C` — provisional commercial fit based on Search/Alice/product-category evidence only;
  - `O` — provisional owned-asset leverage: where an independent specialist asset can plausibly add unique value;
- explicitly separate score from confidence;
- define contamination/overlap penalties without hiding them inside raw volume.

Expected result:
- one canonical scoring rubric;
- one candidate universe with merge/split rationale.

Completion criterion:
- every candidate has a clear evidence-backed boundary and no candidate exists solely because of a synonym.

## 05.2 — Score and rank opportunity candidates

Status: **[ ] WAIT**  
Estimated: **1–2 runs**

Work:
- score each candidate H/A/C/O using only R1/R2 evidence;
- assign evidence confidence;
- record strongest positive and negative evidence;
- compare opportunities on a common matrix without fabricating revenue forecasts.

Expected result:
- ranked opportunity matrix;
- explicit `KEEP / INVESTIGATE / DEFER / REJECT-AS-PRIMARY` status.

Completion criterion:
- every status has a traceable evidence rationale.

## 05.3 — Resolve overlaps and provisional user-job boundaries

Status: **[ ] WAIT**  
Estimated: **1–2 runs**

Work:
- determine which query clusters are one opportunity with shared semantic coverage vs genuinely separate jobs;
- explicitly review:
  - named symbol commercial vs meaning layers;
  - automotive protection vs mirror-pendant form factor;
  - Slavic category vs individual symbols;
  - Vegvisir vs Шлем Ужаса;
  - zodiac contamination;
  - broad gift roots;
- identify what must be answered by stage 06 customer/SKU evidence before architecture decisions.

Expected result:
- opportunity overlap map;
- provisional user-job boundaries;
- unresolved questions handed to 06/07/08.

Completion criterion:
- no lexical synonym is promoted to a separate future page/job without evidence;
- no final IA is frozen.

## 05.4 — Publish final opportunity map and handoff

Status: **[ ] WAIT**  
Estimated: **1 run**

Work:
- consolidate ranking + overlap decisions;
- update canonical Ledger H/A/C/O fields only to the level actually supported;
- create final R3/opportunity report;
- define exact evidence questions for 06 buyer/SKU research, 07 competitors and 08 economics.

Expected result:
- canonical opportunity map;
- prioritized research queue for next stages;
- no accidental jump to site build/IA.

Completion criterion:
- Roadmap 05 can be closed without needing more R2 Search/Alice measurements unless a concrete decision gap is discovered.

---

# Initial evidence-backed candidate universe

These are **candidates, not final rankings**:

1. broad Slavic category / `славянские обереги`;
2. `Печать Велеса` named-symbol commercial opportunity;
3. `Печать Велеса` meaning/explanation layer;
4. automotive protection / `оберег в машину` (includes `амулет в машину` semantic coverage);
5. mirror-pendant form factor / `подвеска на зеркало в машину`;
6. `Алатырь` named-symbol opportunity;
7. broader `Велес` symbol-family opportunity / `оберег велес`;
8. `Вегвизир` named-symbol commercial/entity opportunity;
9. `Вегвизир` meaning/history layer;
10. `Шлем Ужаса / Агисхьяльм` adjacent named-symbol opportunity;
11. zodiac-related opportunity — **contaminated / requires cautious narrowing**;
12. generic automotive gift opportunity — **weak default pendant fit / likely defer as primary acquisition target**.

The candidate list may merge during 05.1/05.3. It must not expand through unsupported query brainstorming.

## Current continuation point

**Next exact work: 05.1 — define the scoring rubric and canonical opportunity units from the final 23-row Ledger.**

No user/browser/API action is required to start 05.1.
