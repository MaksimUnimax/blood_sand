# Ozon AI Worker — Primary Gate Extension Results

Updated: 2026-09-06
Branch: `repair/ozon-date-contract-2026-09-04`
Status: `PRIMARY_GATE_EXTENSION_41_TO_44_COMPLETE`
Scope: rows promoted beyond the original 40-row baseline.
Rule: `NO_SKIP_ON_FAILURE`.

The original 40-row gate is a baseline, not a ceiling. Rows are promoted only when they represent a materially distinct commercial capability or a meaningful entitlement/coverage boundary.

Current primary gate after CAP-24 promotion:

- 20 STD rows: `STD-01..STD-20`
- 24 CAP rows: `CAP-01..CAP-24`
- total: **44 rows**

| # | ID | Distinct commercial capability | Final Sol result | Final authority |
|---:|---|---|---|---|
| 41 | CAP-21 | Own-card SEO / semantic core using factual card content + Ozon product-query evidence | `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP` | `live-runs/CAP_21_POST_REPAIR_FINAL_2026-09-06.md` |
| 42 | CAP-22 | Competitor SEO / positioning benchmark with proven Ozon discovery boundary | `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` | `live-runs/CAP_22_POST_REPAIR_FINAL_2026-09-06.md` |
| 43 | CAP-23 | Category/search position and Standard/Premium/Bridge coverage boundary | `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES` | `live-runs/CAP_23_POST_REPAIR_FINAL_2026-09-06.md` |
| 44 | CAP-24 | SKU monthly unit economics across Seller Analytics + Finance + Performance + product-placement report workflow | `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` | `live-runs/CAP_24_POST_REPAIR_FINAL_2026-09-06.md` |

## CAP-21

The worker completed own-card semantic/SEO analysis without inventing marketplace queries or unsupported exact rank. The final result preserves recovery and data-readiness guidance gaps.

## CAP-22

The worker exhausted the defensible Ozon competitor-discovery chain for the target SKU but could not materialize a proven target-specific competitor card set. The row remains commercially useful as a truthful coverage result and is intentionally `PARTIAL`, not promoted to PASS by assumption.

## CAP-23

The worker proved Standard own-product search-demand evidence and explicitly separated unavailable exact query/category ranking and provider-role/Bridge-registry coverage. It did not convert `null` position into zero or fabricate competitors above the seller.

## CAP-24

The worker selected a real sold SKU and reconstructed August 2026 Ozon-side unit economics:

- target SKU `1636048691`
- revenue `259136.00 RUB`
- `ordered_units = 155`
- exact directly attributable Ozon finance costs `113264.00 RUB`
- known-attributable Ozon-side contribution `145872.00 RUB`
- `941.11 RUB` per ordered unit

Advertising `35785.11 RUB` remains strongly target-linked but not strict exact historical SKU attribution because the historical membership interval is not exposed. Placement/storage remains `PLACEMENT_ATTRIBUTION_NOT_AVAILABLE`; the successful August placement XLSX materialized as an empty logical table whose semantics cannot be certified as a true zero from preserved evidence. No heuristic allocation was used.

## Primary-gate effect

All four promoted extension rows have now been executed and have final evidence. This does **not** mean every row is first-attempt clean; reliability/recovery/coverage defects remain inputs to the consolidated hardening phase.

The correct next phase is not another primary-gate business row. It is reconciliation of the complete 44-row Sol evidence into one consolidated Bridge guidance/hardening package, followed by affected-row Sol regression before Alice.

## Current checkpoint

`PRIMARY_GATE_EXTENSION_41_TO_44_COMPLETE__SOL_44_ROW_GATE_COMPLETE__NEXT_CONSOLIDATED_HARDENING`
