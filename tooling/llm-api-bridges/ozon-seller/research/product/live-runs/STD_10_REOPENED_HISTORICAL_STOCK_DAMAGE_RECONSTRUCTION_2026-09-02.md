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

## Correct status

STD-10 prior final classification is withdrawn as a gate-completion state.

New status:
`REOPENED_IN_PROGRESS_HISTORICAL_STOCK_DAMAGE_RECONSTRUCTION`.

STD-11 remains a valid completed independent test, but STD-12 execution is paused until this reopened STD-10 investigation reaches the strongest evidence-backed conclusion.

## Immediate next read

Start with Ozon financial compensation transactions from the incident through today. This is a direct JSON surface available in the current Bridge and may immediately identify compensated SKUs/amounts related to inventory loss.

Operation: `finance_transaction_list_v3`
Filter window: `2026-08-22T00:00:00Z..2026-09-02T23:59:59Z`
Transaction type: `compensation`
Page size: `1000`.

After that, correlate any compensation rows with SKU/posting/warehouse data, then inspect removals/utilization and post-incident Samara postings. Historical pre-incident stock remains the load-bearing baseline gap to solve or explicitly bound.

Checkpoint:
`STD_10_REOPENED_PREINCIDENT_STOCK_BASELINE_PLUS_POSTINCIDENT_FLOW_AND_COMPENSATION_RECONSTRUCTION_COMPENSATION_READ_NEXT`
