# Ozon AI Worker — Primary Gate Index

Updated: 2026-09-07
Branch: `repair/ozon-date-contract-2026-09-04`
Status: `PRIMARY_GATE_44__43_ROWS_CLOSED__CAP24_REOPENED_FOR_MANDATORY_STORAGE_COST`

## Gate policy

The original 40-test gate is a baseline, not a hard ceiling.

Primary gate expands only for materially distinct commercial capabilities or meaningful entitlement/coverage boundaries.

`EXPAND_GATE_FOR_DISTINCT_COMMERCIAL_CAPABILITY_NOT_FOR_TEST_COUNT`

Every promoted test must preserve `NO_SKIP_ON_FAILURE`, persist meaningful runs/results, and record capability/entitlement/recovery/coverage gaps.

## Current primary gate

Authoritative size: **44 rows**.

- Rows 1–20: `STD-01` … `STD-20`.
- Rows 21–44: `CAP-01` … `CAP-24`.

CAP-21..CAP-23 were promoted for SEO/competitor/category-position capabilities.
CAP-24 was promoted for SKU monthly unit economics.

CAP-24 promotion authority:
`OZON_AI_WORKER_UNIT_ECONOMICS_CAPABILITY_REQUIREMENT_2026-09-06.md`

CAP-24 mandatory storage reopen authority:
`live-runs/CAP_24_STORAGE_PLACEMENT_MANDATORY_REOPEN_2026-09-07.md`

Primary live-result master:
`OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`

Detailed run/final evidence:
`research/product/live-runs/`

## Current execution state

Rows `STD-01..STD-20` and `CAP-01..CAP-23` are terminal.

**CAP-24 is REOPENED.**

The previous CAP-24 status `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` was accepted too early for the seller-facing unit-economics result because FBO storage/placement remained unresolved while an official Ozon product-level storage/placement report exists and the remaining empty XLSX output may still be a Bridge parser/observability problem rather than true provider no-data.

Current acceptance state:

`CAP_24 = REOPENED__STORAGE_PLACEMENT_REQUIRED_FOR_UNIT_ECONOMICS`

Therefore the primary gate is currently:

- terminal rows: **43 / 44**;
- reopened rows: **1 / 44** (`CAP-24`);
- no new CAP row should start.

## Why storage is mandatory in CAP-24

Ozon FBO `Стоимость размещения` is the warehouse storage/placement cost charged for FBO inventory. Seller API exposes:

- `POST /v1/report/placement/by-products/create` — product-level storage/placement cost report;
- `POST /v1/report/placement/by-supplies/create` — supply-level storage/placement cost report.

A unit-economics answer that subtracts commission, logistics, acquiring and advertising but leaves FBO storage unresolved can materially overstate contribution.

So storage/placement is a **mandatory cost class** in CAP-24, not an optional note.

## Current CAP-24 known values before storage closure

Target SKU: `1636048691`

August 2026:

- revenue: `259136.00 RUB`;
- `ordered_units = 155`;
- exact directly attributable finance costs already reconstructed: `113264.00 RUB`;
- provisional known-attributable contribution before unresolved advertising/storage: `145872.00 RUB`;
- provisional known-attributable contribution per ordered unit: `941.11 RUB`.

These values remain valid components but **must not be presented as final all-Ozon-cost unit economics until storage/placement is resolved to the strongest available evidence**.

Advertising remains a separate historical-attribution boundary and must not be double-counted with finance Promotion rows.

## Placement/storage evidence so far

The official August product-level report was generated and downloaded.

The first live file read exposed a real XLSX relationship-path bug (`xl/xl/worksheets/...`). That bug was root-fixed and live-retested.

Post-fix Run 27:

- external report-file GET executed;
- HTTP 200;
- XLSX `142845` bytes;
- workbook and sheet opened;
- sheet `Страница #1` found;
- parser returned `columns=[]`, `row_count=0`.

That output does **not** prove storage cost is zero.

The current parser covers a limited worksheet XML shape and the preserved result does not expose enough structural diagnostics to distinguish true empty provider data from unsupported worksheet representation.

## Exact next work

Do not move to Phase-6 hardening yet.

First close CAP-24 storage:

1. create August `report_placement_by_products_create` report;
2. create August `report_placement_by_supplies_create` report in the same explicit two-command batch because both inputs are known upfront and independent;
3. follow each returned report code through explicit dependent `report_info`;
4. materialize each returned opaque ref through explicit dependent `report_file_get`;
5. compare product vs supply XLSX parse behavior;
6. if one parses and one does not, localize the report-shape issue;
7. if both parse, isolate SKU `1636048691` and exact August storage/placement cost;
8. reconcile against finance `Placements`/NON_ITEM evidence to prevent double counting;
9. recompute all-Ozon cost per ordered unit and contribution;
10. only then close CAP-24 and restore 44/44 terminal status.

No hidden polling/retry/pagination/chaining.

Executable parser changes still require explicit operator authorization if a second parser defect is proven.

## Current checkpoint

`PRIMARY_GATE_44__CAP24_REOPENED_STORAGE_MANDATORY__NEXT_DUAL_PLACEMENT_REPORT_CREATE`
