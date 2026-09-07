# CAP-24 — SKU monthly unit economics orchestration — FINAL

Date: 2026-09-06
Status: `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY`

Canonical job:
`Возьми один реально продававшийся товар из моего текущего каталога и посчитай по нему юнит-экономику за последний полный календарный месяц. Покажи продажи в штуках и рублях, все расходы Ozon, которые можно честно привязать к этому SKU: комиссию за продажу, логистику/доставку, эквайринг, возвраты/сторно, размещение и другие прямые удержания, а также рекламные расходы. Затем посчитай, сколько осталось после этих расходов всего и на одну проданную единицу. Если какой-то расход Ozon доступен только общей суммой по кабинету или его нельзя доказуемо привязать к SKU, не распределяй его выдуманным способом — покажи отдельно как нераспределённый расход/coverage gap и объясни, чего не хватает для точного расчёта.`

Frozen period:
`2026-08-01..2026-08-31`

Target identity:
- Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- title: `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`

## 1. Canonical August sales evidence

Seller Analytics is the gross-sales authority for the selected SKU:

- revenue: **`259136.00 RUB`**
- source unit semantic: **`ordered_units = 155`**

Finance `sale_amount` was used only as reconciliation evidence and was not added again as revenue.

## 2. Exact directly attributable Ozon finance costs

Complete August `finance_accrual_by_day` coverage was reconstructed for every frozen-period date and reconciled at target-SKU/posting level.

Exact directly attributable cost ledger:

- sale commission: **`97497.72 RUB`**
- ordinary commission-bearing delivery/logistics: **`12097.52 RUB`**
- acquiring, net of explicit signed reversals: **`1957.05 RUB`**
- separate directly attributable commission-null POSTING services: **`1681.71 RUB`**
- other direct ITEM fees: **`30.00 RUB`**
- **total exact directly attributable finance costs: `113264.00 RUB`**

Returns/reversal discipline:
- signed reversal effects were preserved in the finance evidence where they belonged and were netted inside the relevant categorical totals;
- no separate synthetic `returns_reversals_rub` subtotal is added on top, because that would risk double counting the same economic effects;
- account-level/NON_ITEM records without a defensible target-SKU key remain unallocated.

## 3. Advertising attribution

Historical August Performance evidence for four campaign IDs produced:

- `33379108`: `14900.95 RUB`
- `33379127`: `14291.96 RUB`
- `37130607`: `3431.80 RUB`
- `37130634`: `3160.40 RUB`
- total: **`35785.11 RUB`**

Run 20 proved that each of those campaigns currently contains exactly one product, target SKU `1636048691`.

Run 21 independently confirmed the same August campaign spend through historical CSV. The historical response did not expose a concrete SKU/product identifier or a historical membership interval.

Current Bridge/Performance contract also does not expose an arbitrary August SKU-membership interval through the available historical operations; `performance_sku_statistics` is near-current only.

Therefore the strongest defensible classification is:

`HISTORICAL_CAMPAIGN_SPEND_35785_11__CURRENT_EXCLUSIVE_TARGET_SKU_RELATION__HISTORICAL_MEMBERSHIP_INTERVAL_NOT_EXPOSED`

Treatment:
- `35785.11 RUB` is **strongly target-linked advertising evidence**;
- it is **not** silently promoted to strict exact historical SKU advertising cost;
- it is excluded from the strict exact-attributable core and may be shown only as a clearly caveated sensitivity scenario.

Advertising integrity result:
`PARTIAL__ATTRIBUTION_COVERAGE_BOUNDARY`

## 4. Placement/storage attribution

The correct product-level placement path was executed end-to-end:

1. `report_placement_by_products_create` for exact August — success;
2. dependent `report_info` — report ready / opaque file reference returned;
3. first `report_file_get` reached the real XLSX and exposed the Bridge `xl/xl/worksheets/...` relationship-target parser defect;
4. root-cause parser repair was implemented in commit `92773026e479671160aab42c0f7590da155e1184` with regression commit `cb353190c3e13a644601198c6a854b99356f20d6`;
5. fresh Runs 25–26 recreated and readied the report;
6. Run 27 live-proved the repaired parser path against the real provider XLSX: HTTP 200, `142845` bytes, sheet `Страница #1` found;
7. the resulting logical table was `columns=[]`, `row_count=0`, `rows=[]`;
8. Run 28 established that preserved evidence cannot distinguish a genuinely empty provider worksheet from a worksheet representation outside the currently certified parser shape.

Therefore:

`PLACEMENT_ATTRIBUTION_NOT_AVAILABLE`

and specifically:

`INDETERMINATE_EMPTY_PLACEMENT_REPORT__PARSER_SHAPE_COVERAGE_NOT_CERTIFIED__ZERO_COST_NOT_INFERRED`

Treatment:
- no placement/storage amount is added to the strict exact subtotal;
- this means **unknown/not defensibly recovered**, not `0 RUB`;
- account-level/NON_ITEM placement charges are not prorated or heuristically assigned to the SKU.

Placement integrity result:
`NOT_AVAILABLE__ATTRIBUTION_COVERAGE_BOUNDARY`

## 5. Strict exact known-attributable result

Using only evidence that is defensibly attributable to target SKU `1636048691`:

- gross sales: **`259136.00 RUB`**
- ordered units: **`155`**
- exact directly attributable Ozon finance costs: **`113264.00 RUB`**
- known-attributable Ozon-side contribution: **`145872.00 RUB`**
- known finance cost per ordered unit: **`730.74 RUB`**
- known-attributable contribution per ordered unit: **`941.11 RUB`**
- exact known finance cost share of gross sales: **`43.7083%`**
- known-attributable contribution share before unresolved advertising/placement: **`56.2917%`**

Formula:

`259136.00 - 113264.00 = 145872.00 RUB`

This is **not** a claim that advertising or placement cost is zero.

## 6. Caveated advertising sensitivity

If the seller deliberately treats all `35785.11 RUB` of the strongly target-linked historical campaign spend as belonging to this SKU for decision sensitivity — while still leaving placement unresolved — the scenario becomes:

- finance + strongly target-linked campaign spend: **`149049.11 RUB`**
- contribution after those costs: **`110086.89 RUB`**
- contribution per ordered unit: **`710.24 RUB`**
- combined finance + caveated advertising cost share: **`57.5177%`**
- remaining contribution share before unresolved placement and seller-side costs: **`42.4823%`**

This is a **sensitivity scenario**, not the strict exact historical SKU result.

No excluded NON_ITEM Promotion rows are added again, so this scenario does not double count the excluded account-level finance Promotion evidence.

## 7. Seller-facing conclusion

For this SKU, the Ozon-side economics are demonstrably positive at the level of costs that can be attributed exactly:

- after exact directly attributable Ozon finance deductions, `145872.00 RUB` remains from `259136.00 RUB` of August gross sales;
- that is `941.11 RUB` per ordered unit before unresolved advertising/placement and before seller COGS, tax, manufacturing/purchase cost, packaging outside Ozon, payroll and other seller-side costs;
- even the deliberately caveated scenario that assigns all `35785.11 RUB` of strongly target-linked campaign spend to the SKU remains positive at `110086.89 RUB`, or `710.24 RUB` per ordered unit, before unresolved placement and seller-side costs.

However, a final accounting-profit or full-margin claim is not justified because:

- historical SKU advertising membership is not exposed for the full frozen month;
- product-level placement amount was not defensibly recovered from the materialized XLSX;
- seller COGS/tax and other non-Ozon costs are outside the supplied Ozon evidence.

Therefore the commercially truthful output is a **known-attributable Ozon-side contribution plus explicit attribution gaps**, not a fabricated full net profit.

## 8. Business-value result

CAP-24 proves a high-value multi-surface seller job rather than a raw endpoint demonstration:

- real sold SKU discovery;
- monthly sales/revenue authority selection;
- full-month finance reconstruction;
- signed cost/reversal reconciliation;
- advertising campaign-to-product identity work;
- report-generation/report-file workflow;
- double-counting control;
- explicit refusal to invent allocation where Ozon/Bridge evidence is insufficient;
- seller-facing per-unit contribution calculation.

This is commercially useful because the worker can replace a substantial manual cabinet/export/Excel reconciliation workflow while also stating exactly where the source coverage prevents a stricter answer.

## 9. Reliability / recovery findings

The business result passes, but the execution history is not a clean first-attempt path and should remain visible for later hardening:

- repeated `finance_accrual_types` calls exposed provider 429 behavior; the accepted operating rule became fetch reference dictionary once and reuse it rather than repeatedly probing it;
- one malformed assistant batch construction and one wrong historical `performance_sku_statistics` choice were recorded as assistant orchestration errors with no hidden provider fanout;
- the placement XLSX path exposed a real Bridge parser defect, repaired at root cause and live-accepted in Run 27;
- the remaining placement ambiguity is preserved as a coverage/observability boundary rather than hidden behind a false zero.

No additional executable Bridge change is authorized by Run 28/finalization.

## 10. Scoring

- `capability_recognition`: PASS
- `business_job_completion`: PASS_WITH_BOUNDARY
- `sku_identity_integrity`: PASS
- `financial_attribution_integrity`: PASS
- `advertising_attribution_integrity`: PARTIAL
- `placement_attribution_integrity`: NOT_AVAILABLE
- `double_counting_control`: PASS
- `unsupported_allocation_avoided`: PASS
- `profit_label_discipline`: PASS
- `period_sales_authority`: PASS
- `full_month_finance_coverage`: PASS
- `advertising_correct_path_attempted`: PASS
- `placement_correct_path_attempted`: PASS
- `seller_facing_usefulness`: PASS
- `first_attempt_operational_reliability`: PARTIAL
- `bridge_defect_recovery`: PASS__ROOT_CAUSE_FIXED_AND_LIVE_RETESTED
- `unsupported_claims`: NONE

Final classification:

`PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY`

## 11. Request invariant at finalization

Run 28 and final materialization issue no new Ozon provider request:

- new logical Ozon commands: `0`
- new physical Ozon provider requests: `0`
- hidden retry/pagination/fanout/polling/chaining: `0`

## Final checkpoint

`CAP_24_CLOSED__PRIMARY_GATE_44_LAST_PROMOTED_ROW_COMPLETE__NEXT_CONSOLIDATED_GATE_STATE_RECONCILIATION`
