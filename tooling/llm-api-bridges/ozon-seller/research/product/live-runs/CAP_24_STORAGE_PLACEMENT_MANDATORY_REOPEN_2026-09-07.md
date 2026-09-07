# CAP-24 — mandatory storage/placement cost — REOPEN

Date: 2026-09-07
Status: `REOPENED__STORAGE_PLACEMENT_REQUIRED_FOR_UNIT_ECONOMICS`

## Correction

CAP-24 was closed too early with placement/storage treated only as a permissible coverage boundary.

For the seller-facing unit-economics job, this is insufficient while an official Ozon product-level storage/placement report exists and the remaining failure may be Bridge XLSX parsing/observability rather than true provider unavailability.

Ozon terminology:

- FBO `Стоимость размещения` is the seller's storage/placement cost on Ozon warehouses;
- Seller API exposes `POST /v1/report/placement/by-products/create` as `Получить отчёт о стоимости размещения по товарам`;
- the method corresponds to the seller-cabinet section `FBO -> Стоимость размещения`;
- the report is therefore a mandatory cost source for SKU unit economics when the seller uses FBO and a period cost exists.

## Why this is mandatory

A unit-economics result that includes commission, delivery/logistics, acquiring and advertising but leaves FBO storage unresolved may materially overstate contribution.

Therefore CAP-24 must not call the result final while storage/placement remains unresolved for a reason that could still be a Bridge materialization/parser defect.

Required treatment:

1. obtain the official August product-level placement report;
2. obtain the August by-supplies placement report as an independent structural/control source;
3. materialize both through the patched `report_file_get` path;
4. determine whether the empty logical sheet is true provider no-data or parser coverage failure;
5. recover target SKU `1636048691` storage/placement amount if present;
6. reconcile that amount against finance `Placements` / NON_ITEM evidence to prevent double counting;
7. only after this step recompute total Ozon cost per unit and contribution.

## Current evidence

Previous Run 27 proved the first XLSX relationship defect is fixed live:

- HTTP 200;
- `142845` XLSX bytes;
- workbook and sheet opened;
- sheet `Страница #1` found;
- no `xl/xl/worksheets/...` failure;
- parser returned `columns=[]`, `row_count=0`.

That output does NOT prove storage cost is zero.

The current worksheet parser recognizes a limited XML cell shape. The preserved live response does not include sufficient worksheet structural diagnostics to prove whether the provider worksheet itself is empty.

## Reopened classification

`CAP_24 = REOPENED__STORAGE_PLACEMENT_MANDATORY`

The previous `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` is no longer the current acceptance state for the seller-facing unit-economics answer.

Advertising attribution may remain a documented historical-membership boundary, but storage/placement must be investigated to the strongest available provider-backed result before CAP-24 can close again.

## Next test

Issue an explicit two-command batch, because both report-creation commands are independent and their parameters are known upfront:

1. `report_placement_by_products_create` for `2026-08-01..2026-08-31`;
2. `report_placement_by_supplies_create` for the same period.

Then follow each returned report code stepwise through `report_info` and `report_file_get`.

No hidden polling, retry or chaining.

## Request invariant for this reopen record

- new Ozon logical commands: `0`
- new Ozon physical requests: `0`

Checkpoint:

`CAP_24_REOPENED__NEXT_DUAL_PRODUCT_AND_SUPPLY_STORAGE_REPORT_CREATE`
