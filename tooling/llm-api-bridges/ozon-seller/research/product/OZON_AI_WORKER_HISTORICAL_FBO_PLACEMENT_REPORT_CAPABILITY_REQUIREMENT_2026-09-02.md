# Ozon AI Worker — Historical FBO Placement Report Implementation Coverage Defect

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Origin: reopened `STD-10` incident/damage reconstruction.
Status: CORRECTED CLASSIFICATION — implementation omission against the accepted full-read scope, not a newly discovered optional capability.

## Correction

The earlier wording called this a new `Capability Requirement`. That wording was misleading.

The accepted 463/463 Seller API coverage model already defined a **full read rollout of 268 operations**, including **40 explicit read workflows for reports/files/documents/status**. Its global rules explicitly state that generic report helpers are hidden `_workflow` steps while **report creation belongs to its business cluster**. Therefore server-side report generation that only produces a read report is part of the intended read-workflow model and is not supposed to be dismissed merely because the provider path contains `/create`.

Historical inventory also shows `POST /v1/report/placement/by-products/create` as key-permitted under `Admin read only`. The later workflow inventory still classified it as `SERVER_SIDE_GENERATION_OR_WORKFLOW_START_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED`, with no accepted Bridge alias/effect at that point. The current v0.1.19 runtime likewise does not register this path.

Therefore the correct defect classification is:

`FULL_READ_ROLLOUT_INCOMPLETE_FOR_PLACEMENT_REPORT_WORKFLOW`

and specifically:

`POST /v1/report/placement/by-products/create` is an intended read-workflow surface that was not carried through to the current executable registry.

## Provider contract

Current accepted Seller Swagger defines:
- endpoint: `POST /v1/report/placement/by-products/create`;
- operationId: `CreatePlacementByProductsReport`;
- purpose: obtain the FBO placement-cost report by products;
- required request fields: `date_from`, `date_to` in `YYYY-MM-DD`;
- maximum report interval: 31 days;
- response: report `code`;
- the returned `code` is then passed to `POST /v1/report/info`.

This is a server-side report-generation workflow. It does not mutate seller catalog, stock, prices, orders or other business state and belongs in the project's explicit read-workflow model.

## Why STD-10 exposed the defect

Run 10 called the already registered `report_list` and received `reports=[]`, `total=0`, so there is no pre-existing report code to reuse.

The incident investigation therefore needs the missing workflow:
1. explicit `placement by products` report creation for the historical interval around 2026-08-21/22;
2. explicit `report_info` read by returned code;
3. safe report-file download/ingestion preserving provenance;
4. parse/filter by warehouse/product/date where the provider file exposes those dimensions.

Without that workflow, current stock reads cannot supply the exact pre-incident Samara baseline because they have no historical `as_of` semantics.

## Required fix

Implement the missing accepted read workflow in the Bridge rather than treating the absence as a legitimate product coverage boundary:
- add a unique Bridge alias for `POST /v1/report/placement/by-products/create`;
- compile the exact request/response contract from the accepted Swagger;
- classify it as an explicit read-workflow start, not a business mutation;
- preserve one explicit AI command = at most one physical provider request;
- no hidden polling/retry;
- make the generated report result consumable through an explicit safe report-file ingestion step;
- keep unrelated PII out of the AI surface.

## Acceptance criterion

Given an explicit historical interval, the Worker can start the placement-by-products report, receive its code, explicitly read report status, ingest the resulting report, and use provider-backed rows for incident stock reconstruction. If the report itself does not contain exact point-in-time warehouse stock, that remaining provider semantic limit must be stated explicitly.

Checkpoint:
`STD_10_HISTORICAL_PLACEMENT_WORKFLOW_IS_MISSING_IMPLEMENTATION_AGAINST_ACCEPTED_FULL_READ_SCOPE_NOT_NEW_OPTIONAL_CAPABILITY`
