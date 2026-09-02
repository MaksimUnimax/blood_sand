# Ozon AI Worker — Historical FBO Placement Report Coverage Note

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Origin: reopened `STD-10` incident/damage reconstruction.
Status: FINAL CORRECTION — **not an implementation defect in the accepted read surface**.

## Final authority

The final Seller 463/463 terminal matrix classifies:

`POST /v1/report/placement/by-products/create`

as:

`REJECT_SERVER_SIDE_GENERATION_OR_CREATION`

with the decision reason that the operation creates server-side business/job/artifact/report state.

The final accepted semantic model contains **245 admissible Seller reads** and **218 terminal-unavailable operations**. It explicitly preserves the rule that an endpoint does not become a read merely because it returns a report ID, file, label or status; operations that create reports/documents or initiate server-side work remain generation/mutation and are excluded from the AI read surface.

Therefore the earlier same-day interpretation based on the older intermediate 268-operation catalog was wrong. The current v0.1.19 registry is not missing this endpoint relative to the final accepted read classification; its absence is intentional.

## Why the confusion occurred

An older intermediate coverage artifact from 2026-08-25 described a 268-operation provisional read rollout with explicit report workflows. That artifact was superseded by the later exhaustive Seller classification.

The later workflow/report/document work and final terminal matrix tightened the semantic rule:
- report creation/generation must not be disguised as reads;
- `report_info` and `report_list` are reads;
- report `/create` endpoints that initiate server-side generation are terminal unavailable from the read-only AI surface.

The final terminal matrix specifically records `CreatePlacementByProductsReport` as `REJECT_SERVER_SIDE_GENERATION_OR_CREATION`.

## STD-10 implication

Run 10 remains valid:
- `report_list` returned `reports=[]`, `total=0`;
- therefore there is no already-created report that the accepted read surface can inspect with `report_info`.

But this does **not** reveal an incomplete full-read implementation. Instead it reveals a legitimate boundary of the intentionally read-only Bridge: obtaining a new placement report would require a server-side generation operation that the final safety classification deliberately excludes.

For the incident investigation, continue with admissible read surfaces (returns, supplies, movements/finance where available) and state the historical point-in-time baseline limitation if it cannot be reconstructed without initiating a new report-generation job.

## Final classification

`PLACEMENT_BY_PRODUCTS_CREATE_INTENTIONALLY_TERMINAL_UNAVAILABLE_SERVER_SIDE_GENERATION_NOT_A_MISSING_READ`

Checkpoint:
`STD_10_RUN10_REPORT_LIST_EMPTY_FINAL_MATRIX_CONFIRMS_PLACEMENT_CREATE_IS_INTENTIONAL_GENERATION_EXCLUSION_CONTINUE_ADMISSIBLE_READ_FORENSICS`
