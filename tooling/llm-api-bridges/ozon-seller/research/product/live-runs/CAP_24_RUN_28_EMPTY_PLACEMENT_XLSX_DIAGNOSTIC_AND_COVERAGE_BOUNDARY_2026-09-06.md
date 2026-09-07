# CAP-24 Run 28 — empty placement XLSX diagnostic and coverage boundary

Date: 2026-09-06
Status: `PASS__PLACEMENT_ATTRIBUTION_NOT_AVAILABLE__EMPTY_XLSX_SEMANTICS_NOT_PROVEN_ZERO`

## Purpose

Resolve the remaining CAP-24 placement/storage decision after Run 27 without issuing another Ozon provider request and without inventing a zero cost.

This is an evidence/contract diagnostic only. No executable Bridge patch is authorized or performed in this run.

## Evidence inspected

Authoritative live evidence:

- `CAP_24_RUN_27_POST_PATCH_PLACEMENT_XLSX_MATERIALIZATION_SUCCESS_EMPTY_SHEET_2026-09-06.md`
- current `dist-step7-candidate/shared/provider_transport_core.js`
- XLSX relationship-target regression added in commit `cb353190c3e13a644601198c6a854b99356f20d6`
- CAP-24 primary authority `OZON_AI_WORKER_UNIT_ECONOMICS_CAPABILITY_REQUIREMENT_2026-09-06.md`

Run 27 proved:

- one logical `report_file_get` command;
- one physical external report-file request;
- HTTP 200;
- XLSX byte length `142845`;
- workbook/sheet relationship path now resolves correctly;
- sheet `Страница #1` is discovered;
- parser output is `columns=[]`, `rows=[]`, `row_count=0`.

The Run-24 `xl/xl/worksheets/...` path defect is therefore live-fixed and is not reopened here.

## Parser diagnostic

The current worksheet parser recognizes physical rows only through unprefixed paired XML tags matching:

- `<row ...>...</row>`
- `<c ...>...</c>`

and then extracts supported cell values from `<v>` or inline/shared strings.

If no non-empty matched physical row is produced, the parser returns:

- `columns=[]`
- `row_count=0`
- `rows=[]`

The current result does not expose enough worksheet-level diagnostics to distinguish all materially different causes of that empty logical table. In particular, the Run-27 evidence does not preserve the raw worksheet XML, worksheet `dimension`, row/cell-tag counts, or a structural diagnostic proving that the worksheet itself contains no records.

The regression for the relationship-target repair uses a synthetic workbook with ordinary unprefixed paired `<row>` and `<c>` elements and known sample data. It proves the repaired relationship-target normalization and the simple supported worksheet shape; it does not certify that every real Ozon placement XLSX representation maps to that exact cell shape.

Therefore the following inference is NOT justified:

`columns=[] && row_count=0 => placement_cost = 0`

Likewise, the opposite inference is not justified: this run does not prove a second parser defect. The preserved evidence is insufficient to distinguish a genuinely empty provider report from an unsupported worksheet representation.

## Root-cause classification for CAP-24

For the business job, the remaining placement condition is an attribution/materialization coverage boundary rather than a defensible numeric zero:

`INDETERMINATE_EMPTY_PLACEMENT_REPORT__PARSER_SHAPE_COVERAGE_NOT_CERTIFIED__PLACEMENT_ATTRIBUTION_NOT_AVAILABLE`

What is proven:

- the exact August placement-by-products report path was attempted;
- report creation succeeded;
- report readiness succeeded;
- the report file was fetched successfully;
- XLSX container/workbook/sheet path materialization succeeded after the parser repair;
- no product-level placement amount for target SKU `1636048691` was defensibly recovered.

What is not proven:

- `placement_cost = 0`;
- any positive target-SKU placement amount;
- any account-level placement amount that may be allocated to this SKU;
- whether the remaining empty table is provider no-data or a worksheet-shape parser coverage gap.

## CAP-24 arithmetic treatment

Placement/storage is excluded from the strict exact-attributable subtotal as **unavailable attribution**, not entered as zero.

Do not:

- assign `0 RUB` as a proven placement cost;
- allocate account-level/NON_ITEM placement charges heuristically;
- repeat the same report-file request merely to obtain another copy of the same evidence;
- add an unsupported placement estimate to the seller-facing contribution.

The exact known-attributable finance subtotal remains:

`113264.00 RUB`

The known-attributable contribution before unresolved advertising/placement coverage is:

`259136.00 - 113264.00 = 145872.00 RUB`

or `941.11 RUB` per `155` ordered units.

This is an Ozon-side known-attributable contribution, not full net profit and not a claim that unresolved costs are zero.

## Primary-gate consequence

The CAP-24 authority explicitly permits `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` when correct advertising/placement paths were attempted, supported totals are calculated correctly, and unavailable/unallocated costs are separated rather than invented.

Placement now satisfies that boundary condition:

`PLACEMENT_ATTEMPT_COMPLETE__PRODUCT_LEVEL_AMOUNT_NOT_DEFENSIBLY_RECOVERED__NO_HEURISTIC_ALLOCATION`

No further provider request is required to close CAP-24 commercial validation.

A future parser-observability improvement may expose worksheet structural diagnostics or broader OOXML cell-shape coverage, but that is a separate engineering follow-up and requires explicit authorization before any executable Bridge change.

## Request invariant

Run 28 issued:

- logical Ozon business commands: `0`
- physical Ozon provider requests: `0`
- hidden retry/pagination/fanout/polling/chaining: `0`

## Final Run-28 classification

`PASS__PLACEMENT_COVERAGE_BOUNDARY_CLOSED__ZERO_COST_NOT_INFERRED__NO_NEW_PROVIDER_REQUEST`
