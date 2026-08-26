# 05 — Свести Wordstat + Search/SERP + Alice в единую карту возможностей

Статус: **[~] IN PROGRESS — 05.1 + 05.2 COMPLETE; NEXT 05.3**  
Дата старта: **2026-08-26**

## Цель

Преобразовать завершённые R1/R2 evidence в приоритизированную **opportunity map** для Blood & Sand. Этот этап не проектирует финальную IA и не утверждает окончательные Page Jobs.

## Canonical inputs

- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`
- `marketing/research/R2_YANDEX_SERP_ALICE_FINAL_REPORT_2026-08-26.md`
- `marketing/data/ledger/query_evidence_ledger.csv`
- `marketing/research/R3_OPPORTUNITY_SCORING_RUBRIC_2026-08-26.md`

## Evidence discipline

- H/A/C/O independent; no weighted revenue forecast.
- Intent contamination stored separately.
- Marketplace presence is not owned-site proof.
- Synonyms do not become opportunities without distinct job evidence.
- No final IA in stage 05.

---

## 05.1 — Define opportunity units and scoring rubric

Status: **[x] COMPLETE**

Artifacts:
- `marketing/research/R3_OPPORTUNITY_SCORING_RUBRIC_2026-08-26.md`
- `marketing/data/normalized/opportunity_map/20260826__opportunity_units_v1.csv`

Result:
- 23 Ledger queries reduced to 10 canonical analysis units;
- H/A/C/O rubric fixed as `HIGH / MEDIUM / LOW / UNKNOWN` + independent confidence;
- synonym duplicate units rejected;
- no page count assigned.

## 05.2 — Score and rank opportunity candidates

Status: **[x] COMPLETE**

Artifacts:
- `marketing/research/R3_OPPORTUNITY_SCORING_2026-08-26.md`
- `marketing/data/normalized/opportunity_map/20260826__opportunity_units_scored_v2.csv`

Current ranking:

### KEEP
1. OU02 — Печать Велеса family
2. OU01 — Slavic category
3. OU03 — Automotive protection
4. OU05 — Алатырь named symbol
5. OU07 — Vegvisir family

### INVESTIGATE
6. OU06 — Veles broader symbol family — strong evidence, overlap unresolved
7. OU08 — Шлем Ужаса / Агисхьяльм — coherent commerce, exact Alice unknown
8. OU04 — Mirror-pendant form factor — high commerce, low owned-asset differentiation evidence

### REJECT_AS_PRIMARY
9. OU09 — broad zodiac — contaminated despite high AI usefulness
10. OU10 — generic automotive gift — real demand but weak default product fit

No weighted total was used.

## 05.3 — Resolve overlaps and provisional user-job boundaries

Status: **[ ] NEXT**  
Estimated: **1–2 runs**

Required decisions:
- OU02 Печать Велеса vs OU06 broader Veles family;
- OU03 automotive protection vs OU04 mirror-pendant form factor;
- OU01 Slavic category vs named-symbol children;
- OU07 Vegvisir vs OU08 Шлем Ужаса;
- whether OU09 has any narrow salvageable lane for stage 06;
- whether OU10 should be fully deferred vs retained as supporting/seasonal only.

Expected output:
- overlap map;
- provisional user-job boundaries;
- exact unresolved evidence questions handed to stages 06/07/08;
- still no final IA.

## 05.4 — Publish final opportunity map and handoff

Status: **[ ] WAIT**

Work after 05.3:
- consolidate ranking + overlap decisions;
- update Ledger H/A/C/O only where supported;
- publish final R3 opportunity map;
- hand research questions to stages 06/07/08.

---

# Current continuation point

**Next exact work: 05.3 — resolve opportunity overlaps and provisional job boundaries from existing evidence.**

No new browser/API action required unless 05.3 exposes a concrete decision gap.
