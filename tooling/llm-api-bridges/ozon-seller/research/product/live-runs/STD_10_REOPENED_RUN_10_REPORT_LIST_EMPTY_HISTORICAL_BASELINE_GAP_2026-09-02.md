# STD-10 REOPENED Run 10 — report list empty; historical baseline path unavailable

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

## Current API/Bridge coverage boundary

Current Ozon Seller API includes `POST /v1/report/placement/by-products/create` for generating a placement-cost report over an explicit date range, followed by `POST /v1/report/info` for status/file metadata.

Current Bridge v0.1.19 does **not** register `report/placement/by-products/create` (nor a usable report-file download/ingestion path for this workflow). Existing `report_info` is registered, but it is useless here because `report_list` returned no report codes and the Bridge cannot create the required historical report.

This is now a concrete capability gap for incident stock forensics:

`HISTORICAL_FBO_PLACEMENT_REPORT_GENERATION_AND_FILE_INGESTION_REQUIRED_FOR_PREINCIDENT_STOCK_RECONSTRUCTION`.

Do not invent the historical stock quantity from current endpoints.

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

## Next step

Continue eliminating observable normal inventory movement with `returns_list`, filtered to:
- FBO;
- target warehouse_id `23128509046000`;
- logistic return date 2026-08-22..2026-09-02;
- limit 500.

If the provider returns `last_id`, continue explicitly before declaring the return branch terminal.

Checkpoint:
`STD_10_REOPENED_RUN10_REPORT_LIST_TOTAL_ZERO_HISTORICAL_REPORT_CAPABILITY_GAP_SAMARA_FBO_RETURNS_NEXT`
