# 05 — Свести Wordstat + Search/SERP + Alice в единую карту возможностей

Статус: **[x] COMPLETE — R3 FINAL / HANDOFF TO 06**  
Дата закрытия: **2026-08-26**

## Цель

Преобразовать завершённые R1/R2 evidence в приоритизированную opportunity map для Blood & Sand без преждевременной финальной IA/Page Jobs.

## Canonical inputs

- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`
- `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`
- `marketing/data/ledger/query_evidence_ledger.csv`

---

## 05.1 — Opportunity units + H/A/C/O rubric

Status: **[x] COMPLETE**

Artifacts:
- `marketing/research/R3_OPPORTUNITY_SCORING_RUBRIC_2026-08-26.md`
- `marketing/data/normalized/opportunity_map/20260826__opportunity_units_v1.csv`

Result:
- 23 query rows reduced to 10 evidence-backed opportunity units;
- H/A/C/O defined as ordinal evidence ratings, separate from confidence;
- contamination stored separately;
- synonym duplicates rejected;
- no page count assigned.

## 05.2 — Score + rank opportunities

Status: **[x] COMPLETE**

Artifacts:
- `marketing/research/R3_OPPORTUNITY_SCORING_2026-08-26.md`
- `marketing/data/normalized/opportunity_map/20260826__opportunity_units_scored_v2.csv`

Final tiers:

### KEEP
1. OU02 — Печать Велеса family
2. OU01 — Slavic category
3. OU03 — Automotive protection
4. OU05 — Алатырь named symbol
5. OU07 — Vegvisir family

### INVESTIGATE
6. OU06 — Veles broader symbol family
7. OU08 — Шлем Ужаса / Агисхьяльм
8. OU04 — Mirror-pendant form factor

### REJECT_AS_PRIMARY
9. OU09 — broad zodiac
10. OU10 — generic automotive gift

## 05.3 — Resolve overlaps / provisional job boundaries

Status: **[x] COMPLETE**

Artifacts:
- `marketing/research/R3_OPPORTUNITY_OVERLAP_AND_JOB_BOUNDARIES_2026-08-26.md`
- `marketing/data/normalized/opportunity_map/20260826__opportunity_overlap_v3.csv`

Key decisions:
- Печать Велеса and broader Veles family are not duplicates; provisional family→specific-form relationship retained pending SKU evidence;
- automotive protection and mirror-pendant form factor are distinct jobs even when one SKU can satisfy both;
- Slavic category and named-symbol children are distinct intent levels; demand must not be double-counted;
- Vegvisir and Шлем Ужаса are separate sibling named-symbol opportunities;
- broad zodiac has no clean primary lane on current evidence; reopen only with coherent SKU evidence;
- generic automotive gift is supporting/seasonal only unless later commerce evidence changes the decision.

## 05.4 — Final opportunity map + Ledger H/A/C/O backfill

Status: **[x] COMPLETE**

Canonical final report:
- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`

Ledger update:
- `marketing/data/ledger/query_evidence_ledger.csv`
- commit `21e17e64de5e02e393c3aa22a522b06d1f5ce26e`
- content blob `7d59a47759031694c4cbacff8a9923e416972a87`

Validation:
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_STAGE05_VALIDATION_2026-08-26.md`

Evidence discipline retained:
- `page_job` remains empty;
- `target_cta` remains empty;
- direct-commerce/Webmaster/customer metrics remain unmeasured;
- exact-query Alice unknowns remain `UNKNOWN` rather than inferred;
- no final IA is encoded.

---

# Stage 06 handoff

Exact next research questions are in:
- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`

Priority:
1. map actual SKUs to OU01–OU08;
2. resolve real Veles product hierarchy;
3. separate automotive protection vs mirror-form use at SKU/buyer level;
4. identify actual buyer choice drivers;
5. confirm sellable/current Алатырь, Vegvisir, Шлем Ужаса variants;
6. reopen zodiac only if a coherent real SKU lane exists;
7. identify commodity vs differentiated SKUs.

## Final continuation point

**Roadmap 05 is closed. Next: Roadmap 06 — buyer evidence + complete SKU passport.**

Do not reopen R2 or invent final IA/Page Jobs before stages 06–09 are complete.
