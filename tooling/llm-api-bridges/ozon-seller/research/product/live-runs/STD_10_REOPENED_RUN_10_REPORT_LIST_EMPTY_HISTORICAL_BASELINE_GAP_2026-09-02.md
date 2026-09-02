# STD-10 REOPENED Run 10 — report list empty; historical baseline blocked by missing full-read implementation

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident date: 2026-08-22, Chapayevsk, Samara region.

## Purpose

After Runs 7–9 proved zero ordinary FBO postings from Samara throughout local 2026-08-22..2026-09-02, attack the load-bearing missing left side of the stock balance: exact historical stock at Samara immediately before the incident.

The current Bridge does not expose an `as_of` parameter on current stock endpoints. Therefore Run 10 tests whether an already generated historical placement/storage/stock report exists and can be followed through `report_info`.

## Bridge run

Operation: `report_list`
Request id: `9a9f0004-bd48-4089-b34f-22a795f21f9f`
Endpoint: `POST /v1/report/list`
HTTP: `200`
Elapsed: `1513 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`

Request:
- page `1`;
- page_size `100`.

## Provider result

The provider returned:
- `reports=[]`;
- `total=0`.

Therefore there are **no already formed reports of any type** available through `report_list` in this seller account at this moment.

This is stronger than merely finding no placement report: the existing report-discovery inventory is completely empty, so there is no report code that can be followed with `report_info` to recover the pre-incident Samara stock baseline.

Supported statement:

`REPORT_LIST_TOTAL_ZERO_NO_EXISTING_REPORT_PATH_TO_PREINCIDENT_SAMARA_BASELINE`.

## Corrected implementation interpretation

Do **not** classify the missing workflow as a legitimate optional capability boundary.

The accepted 463/463 coverage model defined 268 operations in the full read rollout, including 40 explicit read workflows for reports/files/documents/status, and explicitly states that report creation belongs to its business cluster. Historical workflow inventory lists `POST /v1/report/placement/by-products/create` as a server-side generation/workflow-start candidate requiring exact schema review. Current runtime does not register it.

The correct classification is therefore an implementation omission against the accepted full-read scope:

`FULL_READ_ROLLOUT_INCOMPLETE_FOR_PLACEMENT_REPORT_WORKFLOW`

Provider Swagger defines the path as an `Admin read only` report workflow with required `date_from` and `date_to`, maximum interval 31 days, returning report `code` for subsequent `POST /v1/report/info`.

So the problem exposed by Run 10 is not that Ozon or the intended Bridge design cannot support the read workflow. The current implementation failed to carry this intended read workflow into the executable registry/file-ingestion path.

## Damage-reconstruction state after Run 10

Proven:
- exact affected warehouse matched to `САМАРА_РФЦ`;
- seller goods were in the exact Samara FBO flow before the incident;
- sampled exposed SKUs are currently explicit zero at Samara;
- zero finance transactions classified as `compensation` in 2026-08-22..09-02;
- zero formal `removal_from_stock_list` rows from Samara in 2026-08-22..09-02;
- zero ordinary Samara FBO postings in three terminal windows covering local 2026-08-22..09-02;
- no existing generated report can supply the historical baseline.

Still unproven:
- exact per-SKU stock physically/accountedly present at Samara immediately before the incident;
- post-incident FBO returns/inbound to Samara;
- internal Ozon transfers or generic inventory adjustments not exposed by tested surfaces;
- write-off evidence outside the tested `compensation` transaction type;
- exact destroyed/lost unit count.

## Required project action

Before accepting the historical-baseline limit as terminal, fix the missing accepted read-workflow implementation:
1. add `POST /v1/report/placement/by-products/create` with exact Swagger validation;
2. expose the returned report code;
3. use explicit `report_info` reads without hidden polling;
4. provide a safe report-file download/ingestion path;
5. then rerun the historical Samara baseline attempt.

Other observable movement reads such as `returns_list` may still be useful, but they are not a substitute for fixing the missing full-read workflow.

Checkpoint:
`STD_10_REOPENED_RUN10_REPORT_LIST_TOTAL_ZERO_FULL_READ_PLACEMENT_WORKFLOW_IMPLEMENTATION_DEFECT_MUST_FIX_BEFORE_TERMINAL_BASELINE_LIMIT`
