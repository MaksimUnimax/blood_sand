# CAP-15 — Run 2 — FBS/rFBS error index

Status: PASS / DRILLDOWN_REQUIRED

Operation: `seller_fbs_error_index`
Request ID: `f8fd3ab1-7bd5-45aa-9139-da7064abfa7a`
HTTP: 200
Exact request preserved: true
Command transformed: false
Logical/physical business requests: 1/1

Provider evidence:
- period: `2026-08-23` through `2026-09-06`
- current aggregate `index`: `0`
- current `processing_costs_sum`: `0`
- `penalty_score_exceeded` is not part of this surface; do not infer it here
- provider returned daily defect/index history with non-zero `index_by_date` from 2026-08-23 through 2026-09-05, then `0` on 2026-09-06
- maximum observed daily index in this response: `0.11494253` on 2026-08-29
- all returned daily processing-cost sums are `0`

Interpretation discipline:
The current aggregate index is a real provider zero, but this response also exposes an affected historical period with non-zero daily index values. Under the frozen CAP-15 method, that requires a dedicated contributing-postings drilldown over the non-zero period. Do not conclude that there were no FBS/rFBS error events merely from the current aggregate zero.

Checkpoint: `CAP_15_ACTIVE_RUN_3_FBS_ERROR_POSTINGS_NEXT`
