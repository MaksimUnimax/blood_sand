# Query Evidence Ledger — merge status — 2026-08-26

Статус: **MERGE VALIDATED; CANONICAL REWRITE DEFERRED UNTIL MOBILE 2/2 FOR ONE ATOMIC FINAL WRITE**

## Зачем этот файл

Зафиксировать точную точку продолжения синхронизации `marketing/data/ledger/query_evidence_ledger.csv` и не допустить использования старого canonical CSV как будто он уже содержит весь R2 evidence.

## Уже сохранено отдельно от canonical Ledger

### Primary Search
- `marketing/research/R2_YANDEX_SEARCH_PRIMARY_SERP_2026-08-26.md`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__225.tsv`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__measurements.csv`
- `marketing/data/normalized/yandex_search/20260826__search__primary10__summaries.csv`
- `marketing/data/ledger/query_evidence_serp_patch_2026-08-26.csv`

### Consumer Alice
Accepted primary: **10/10**, normalized under:
- `marketing/data/normalized/alice/`

A context-contaminated gift run is retained separately and excluded from canonical primary count.

### Secondary Search
Completed and normalized:
- A1 `оберег по знаку зодиака`
- A2 `печать велеса значение`
- A3 `амулет в машину`
- B1 `вегвизир значение`
- B2 `шлем ужаса оберег`

Canonical secondary review:
- `marketing/research/R2_SECONDARY_SEARCH_FINAL_REVIEW_2026-08-26.md`

Paid secondary expansion is stopped.

## Legacy defect still confirmed

Existing canonical row `подвеска на зеркало в машину` has incomplete/shifted trailing CSV fields in the pre-R2 Ledger. This predates the Search merge.

Expected repaired trailing state before applying newer evidence:
- `alice_status=NOT_MEASURED` in the legacy baseline before Alice backfill;
- `alice_fanout_observed=NOT_MEASURED` in the legacy baseline before Alice backfill;
- `webmaster_search_status=NOT_APPLICABLE`;
- `webmaster_alice_status=NOT_APPLICABLE`;
- `customer_evidence_status=NOT_MEASURED`;
- `marketplace_evidence_status=NOT_MEASURED`;
- `human_demand_H=PROVISIONAL_HIGH`;
- `alice_importance_A=NOT_ASSESSED`;
- `commercial_value_C=NOT_ASSESSED`;
- `owned_asset_value_O=NOT_ASSESSED`;
- `commerce_status=NOT_APPLICABLE`;
- `decision_status=PENDING_MORE_EVIDENCE`;
- original Wordstat reason/notes must be preserved.

## Previously validated primary Search merge

Analytical merge validation already established:
- legacy Ledger rows: 13;
- after adding missing primary Search roots: 19;
- `serp_status=MEASURED`: 10 rows;
- extra columns: 0;
- missing columns: 0;
- Wordstat evidence retained;
- provider request IDs are not used as canonical measurement IDs;
- `serp_product_block` is not inferred from Search API;
- `serp_device` is not inferred from Search API.

## Why canonical rewrite is intentionally not performed yet

Roadmap 04 still has **mobile browser evidence 0/2**:
- `славянские обереги`
- `оберег в машину`

Those measurements are browser/UI evidence and may affect browser-specific fields/notes. Rewriting the canonical Ledger now and again immediately after mobile would create two high-risk whole-file rewrites around a known legacy CSV defect.

Decision: **perform one atomic canonical rewrite after mobile reaches 2/2**, combining:
1. legacy-row repair;
2. primary Search patch + canonical measurement IDs;
3. accepted Alice 10/10 linkage from real normalized artifacts;
4. existing Wordstat linkage only where real IDs/artifacts exist;
5. secondary A1/A2/A3/B1/B2 Search measurements where appropriate;
6. direct browser/mobile evidence only in browser-supported fields/notes;
7. no invented Webmaster/customer/commerce evidence.

This is a risk-control sequencing decision, not an unresolved data question.

## Current continuation point

1. Do **not** run more paid secondary Search requests.
2. Capture representative mobile browser SERP 2/2, one root at a time.
3. After mobile 2/2, perform one atomic `query_evidence_ledger.csv` rewrite and structural validation.
4. Then complete final R2 report / Roadmap 05 handoff.
