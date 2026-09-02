# Ozon AI Worker — Historical FBO Placement Report Capability Requirement

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Origin: reopened `STD-10` incident/damage reconstruction.

## Requirement

The Bridge needs a read-only historical FBO placement/report workflow sufficient to reconstruct seller stock around a real warehouse incident.

Minimum useful workflow:
1. create a historical placement report for an explicit date interval via Ozon Seller API `POST /v1/report/placement/by-products/create`;
2. poll/read report status via `POST /v1/report/info` only through explicit AI commands (no hidden retry loop);
3. expose the report file through a safe read-only download/ingestion surface;
4. allow the AI to filter/reconcile rows by warehouse, product/SKU and date where the report format provides those dimensions;
5. preserve provider metadata and report provenance so a reconstructed historical stock/placement quantity is distinguishable from a current stock read.

## Why it is required

Current registered stock methods are current-state surfaces and do not accept historical `as_of` dates. Reopened STD-10 proved this is insufficient for the business question:

`На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`

Current evidence can prove pre-incident FBO flow, current zero stock, post-incident sales/removals/compensation signals, but it cannot quantify destroyed/lost inventory without the historical baseline.

Run 10 called the registered `report_list` and received `reports=[]`, `total=0`, so no pre-existing report can be reused.

## Current Bridge gap

Bridge v0.1.19 registers:
- `report_list`;
- `report_info`.

It does not register a usable creation + file-ingestion path for the historical placement report required by this incident reconstruction.

The product requirement is therefore:

`HISTORICAL_FBO_PLACEMENT_REPORT_GENERATION_AND_FILE_INGESTION_REQUIRED_FOR_PREINCIDENT_STOCK_RECONSTRUCTION`

## Safety / execution rules

- READ-only.
- One explicit AI command = at most one physical Ozon business request.
- No hidden polling/retry/pagination.
- Report creation must be an explicitly requested read-workflow step, not automatic background work.
- File ingestion must preserve provenance and must not expose unrelated sensitive data unnecessarily.
- Do not silently substitute current stock for historical stock.

## Acceptance criterion

Given an explicit historical interval around a warehouse incident, the Worker can obtain and ingest the relevant placement report and produce an evidence-backed per-SKU/per-warehouse historical baseline where the provider report contains the necessary dimensions. If the provider report itself lacks exact point-in-time warehouse stock, the Worker must state that remaining semantic limit rather than infer it.
