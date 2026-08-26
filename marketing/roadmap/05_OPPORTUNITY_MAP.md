# 05 — Свести Wordstat + Search/SERP + Alice в единую карту возможностей

Статус: **[~] IN PROGRESS — 05.1 COMPLETE; NEXT 05.2**  
Дата старта: **2026-08-26**

## Цель

Преобразовать завершённые R1/R2 evidence в приоритизированную **opportunity map** для Blood & Sand: какие query/user-problem clusters действительно заслуживают дальнейшей продуктовой и коммерческой проработки.

Этот этап **не проектирует финальную IA сайта** и не утверждает окончательные Page Jobs. Он определяет opportunity candidates, evidence strength, overlap/contamination и роль в следующем исследовании покупателей/SKU, конкурентов и экономики.

## Canonical inputs

- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`
- `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`
- `marketing/research/R2_PRIMARY_SEARCH_ALICE_COMPARISON_2026-08-26.md`
- `marketing/research/R2_SECONDARY_SEARCH_FINAL_REVIEW_2026-08-26.md`
- `marketing/data/ledger/query_evidence_ledger.csv`
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_R2_FINAL_VALIDATION_2026-08-26.md`

## Evidence discipline

1. H/A/C/O независимы; высокий volume не равен высокой opportunity.
2. Broad Wordstat не трактуется как clean demand при доказанной contamination.
3. Search provider, browser UI и Alice сохраняют отдельный provenance.
4. Marketplace presence = competition/commerce evidence, не owned-site proof.
5. Отсутствие owned-site performance сейчас не считается провалом opportunity.
6. Лексический вариант не становится отдельной opportunity/job без прямого evidence.
7. Никаких revenue forecasts до product/customer/economics stages.
8. Никакой финальной IA в пункте 05.

---

# Planned steps

## 05.1 — Define opportunity units and scoring rubric

Status: **[x] COMPLETE**  
Estimated / actual: **1 run**

Completed:
- fixed ordinal H/A/C/O rubric: `HIGH / MEDIUM / LOW / UNKNOWN`;
- score separated from evidence confidence;
- `intent_quality = CLEAN / MIXED / CONTAMINATED / UNKNOWN` separated from H;
- provisional C explicitly separated from actual economics;
- O defined as evidence for owned specialist leverage, not actual Webmaster performance;
- synonym duplication rule fixed;
- 23 query rows reduced to **10 canonical opportunity units**.

Canonical artifacts:
- `marketing/research/R3_OPPORTUNITY_SCORING_RUBRIC_2026-08-26.md`
- `marketing/data/normalized/opportunity_map/20260826__opportunity_units_v1.csv`

Canonical units:
1. OU01 — Slavic category;
2. OU02 — Печать Велеса family (commercial + meaning lanes);
3. OU03 — Automotive protection (`амулет в машину` merged as semantic coverage);
4. OU04 — Mirror-pendant form factor;
5. OU05 — Алатырь named symbol;
6. OU06 — Veles broader symbol family;
7. OU07 — Vegvisir family (entity/commercial + meaning lanes);
8. OU08 — Шлем Ужаса / Агисхьяльм;
9. OU09 — Zodiac-related opportunity, explicitly contaminated;
10. OU10 — Generic automotive gift, weak default product-fit candidate.

Completion criterion: **PASS** — no opportunity exists solely because of a synonym; no final page count or IA assigned.

## 05.2 — Score and rank opportunity candidates

Status: **[ ] NEXT**  
Estimated: **1–2 runs**

Work:
- score each of the 10 units H/A/C/O using only canonical R1/R2 evidence;
- assign evidence confidence;
- record strongest positive and negative evidence;
- preserve contamination and overlap explicitly;
- assign one of:
  - `KEEP`
  - `INVESTIGATE`
  - `DEFER`
  - `REJECT_AS_PRIMARY`

Expected result:
- ranked opportunity matrix;
- no fabricated weighted revenue score.

Completion criterion:
- every rating/status has traceable direct evidence.

## 05.3 — Resolve overlaps and provisional user-job boundaries

Status: **[ ] WAIT**  
Estimated: **1–2 runs**

Work:
- named symbol commercial vs meaning lanes;
- automotive protection vs mirror-pendant form factor;
- Slavic category vs individual symbols;
- Печать Велеса vs broader Veles family;
- Vegvisir vs Шлем Ужаса;
- zodiac contamination;
- broad gift roots;
- define evidence questions for 06/07/08.

Expected result:
- opportunity overlap map;
- provisional user-job boundaries;
- no final IA frozen.

## 05.4 — Publish final opportunity map and handoff

Status: **[ ] WAIT**  
Estimated: **1 run**

Work:
- consolidate ranking + overlap decisions;
- update canonical Ledger H/A/C/O only where supported;
- create final R3/opportunity report;
- hand exact evidence questions to stages 06, 07 and 08.

Completion criterion:
- Roadmap 05 closes without reopening R2 unless a concrete decision gap appears.

---

# Current continuation point

**Next exact work: 05.2 — score/rank the 10 canonical opportunity units from existing evidence.**

No new browser capture or paid Search API request is required for 05.2.
