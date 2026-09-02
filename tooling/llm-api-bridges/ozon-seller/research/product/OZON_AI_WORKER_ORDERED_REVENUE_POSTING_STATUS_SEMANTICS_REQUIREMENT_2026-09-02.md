# Ozon AI Worker — ordered revenue vs posting status semantics requirement

Date: 2026-09-02
Status: PRODUCT HARDENING REQUIREMENT
Source: live STD-09 cross-source reconciliation.

## Observed fact

For `2026-09-01`, the accepted Standard analytics result was:
- `revenue = 27,200 RUB`;
- `ordered_units = 16`.

STD-09 reconstructed warehouse attribution from order/posting surfaces:
- FBO postings created in the target day: 12 units / 20,400 RUB;
- FBS postings created in the target day: 4 units / 6,800 RUB;
- exact total: 16 units / 27,200 RUB.

The exact reconciliation includes two postings that are currently `cancelled` (one FBO, one FBS). Excluding current cancelled postings yields only 14 units / 23,800 RUB and therefore does not match `analytics_data`.

## Required semantic rule

`ANALYTICS_REVENUE_ORDERED_UNITS_ARE_ORDER_CREATION_METRICS_NOT_CURRENT_NONCANCELLED_POSTING_TOTALS`

When AI correlates `analytics_data.revenue` / `ordered_units` with posting/order records, it must not silently filter out postings solely because their **current** lifecycle status is cancelled.

The model must distinguish:
- ordered revenue / ordered units for the target order-creation period;
- current posting status;
- delivered/realized/final net sales metrics when those are requested and supported.

## Product requirement

Bridge guidance/semantic metadata should make this distinction explicit enough that weaker models do not make the common but incorrect transformation:

`ordered metric -> drop currently cancelled postings -> pretend remaining total is the same metric`

Desired machine-readable shape for correlated posting surfaces:

```text
metric_semantics: {
  benchmark_metric: "ordered_revenue_and_units",
  cohort_basis: "order_created_in_target_period",
  current_cancelled_postings_still_belong_to_ordered_cohort: true,
  do_not_equate_with: ["delivered_sales", "current_noncancelled_postings", "realized_revenue"],
  source: "cross_source_live_reconciliation"
}
```

## Evidence

- STD-01 analytics total: 16 / 27,200.
- STD-09 FBO: 12 / 20,400.
- STD-09 FBS: 4 / 6,800.
- STD-09 exact reconciliation: 16 / 27,200.
- Detailed live evidence: `live-runs/STD_09_RUN_3_FBS_WAREHOUSE_RECONCILIATION_2026-09-02.md`.

## Scope caution

This requirement is an observed semantic rule for the benchmark's `revenue + ordered_units` correlation. It does not imply that every Ozon finance, delivered-sales, realization, cancellation, or Performance metric has the same lifecycle semantics.
