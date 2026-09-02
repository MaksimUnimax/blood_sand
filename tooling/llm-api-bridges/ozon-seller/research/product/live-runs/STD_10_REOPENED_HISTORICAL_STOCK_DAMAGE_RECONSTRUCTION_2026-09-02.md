# STD-10 REOPENED — historical stock and damage reconstruction

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident: 2026-08-22, Chapayevsk, Samara region.

## Why STD-10 is reopened

The prior closure established:
- seller FBO flow through the exact affected warehouse immediately before the incident;
- current explicit zero stock at Samara for the two sampled exposed SKUs;
- current healthy aggregate stock outside Samara.

That was sufficient to answer exposure/current-state questions, but it was **not sufficient to answer whether any seller inventory was physically lost/destroyed in the incident**.

The missing investigation is a stock-balance reconstruction.

## Correct accounting question

For each SKU that was physically/accountedly present at Samara immediately before the incident, reconstruct:

`pre_incident_stock + inbound_after_incident + returns_to_stock - sales/outbound_postings - removals/utilization - other_explained_outflows - current_stock = unexplained_delta`

Then correlate any unexplained delta with Ozon compensation/write-off evidence.

If all pre-incident units can be explained by normal movements, there is no evidence of burned/lost seller stock.
If a residual remains and is supported by compensation/write-off evidence, that becomes strong damage evidence.

## Important limitation discovered in current Bridge

Current registered stock operations are current-state surfaces:
- `stocks_current` — current aggregate stock;
- `stock_on_warehouses_v2` — current warehouse stock report;
- `fbo_stock_by_warehouse` — current FBO stock by warehouse;
- `stock_analytics` — current stock analytics;
- `stock_turnover_analytics` — current turnover/current stock.

They do not accept a historical `as_of` date and therefore cannot directly return `САМАРА_РФЦ` stock as of 2026-08-21/22.

This means a historical pre-incident baseline must come from another evidence surface rather than pretending the current stock endpoints are historical.

## Potential historical-source capability gap

Public Ozon Seller API exposes report families for placement/storage history, including `/v1/report/placement/by-products/create`, and finance compensation reports. Current Bridge v0.1.19 does not register the placement-report creation method and does not register the dedicated `/v1/finance/compensation` report. Existing `report_info` also redacts its `file` field, so report-file ingestion is not currently an available Bridge evidence path.

This is a real product-coverage gap for historical FBO damage forensics and must be recorded rather than silently guessed around.

## Evidence we can still collect with current Bridge

Current Bridge can directly inspect:
1. post-incident FBO postings and warehouse attribution via `posting_fbo_list`;
2. FBO removals/utilization via `removal_from_stock_list`;
3. returns and compensation-status signals via `returns_list`;
4. financial compensation transactions via `finance_transaction_list_v3` with `transaction_type=compensation`;
5. current stock at Samara, already proven absent on the complete current warehouse traversal;
6. supply-order history/details where relevant.

These flows can explain part or all of the stock delta and can identify direct Ozon compensation even if an exact historical stock snapshot is not available.

## Reopened Run 5 — compensation transaction check

Operation: `finance_transaction_list_v3`
Request id: `5fd0c0ac-b6b5-42d3-89b6-a23373d295a0`
Window: `2026-08-22T00:00:00Z..2026-09-02T23:59:59Z`
Filter: `transaction_type=compensation`
HTTP: `200`
Physical business requests: `1`
External request executed: `true`
Result: `operations=[]`, `page_count=0`, `row_count=0`.

Interpretation:
`NO_FINANCE_TRANSACTION_V3_COMPENSATION_ROWS_2026_08_22_TO_2026_09_02`.

This is negative compensation evidence only. It does not prove zero physical loss, zero write-off, or that compensation will never appear. The relevant event may be pending or represented on another movement/accounting surface.

Detailed evidence:
`live-runs/STD_10_REOPENED_RUN_5_COMPENSATION_TRANSACTIONS_EMPTY_2026-09-02.md`.

## Correct status

STD-10 remains:
`REOPENED_IN_PROGRESS_HISTORICAL_STOCK_DAMAGE_RECONSTRUCTION`.

STD-11 remains a valid completed independent test, but STD-12 execution is paused until this reopened STD-10 investigation reaches the strongest evidence-backed conclusion.

## Immediate next read

Inspect formal FBO stock removals/utilization from the incident through today using `removal_from_stock_list`.

Use:
- `date_from=2026-08-22`;
- `date_to=2026-09-02`;
- `limit=500`.

If the provider exposes continuation/`last_id`, continue with a separate explicit command. Then correlate any returned records with `САМАРА_РФЦ`, target SKUs and later post-incident posting evidence.

After removals/utilization, inspect post-incident Samara FBO postings and attempt the historical pre-incident baseline through any already available report/history surface. The historical stock baseline remains load-bearing for a numerical burned/lost-unit conclusion.

Checkpoint:
`STD_10_REOPENED_RUN5_NO_COMPENSATION_ROWS_REMOVAL_UTILIZATION_READ_NEXT`
