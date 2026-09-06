# Ozon AI Worker — CAP-24 SKU Unit Economics Capability Requirement

Date: 2026-09-06
Status: PROMOTED_TO_PRIMARY_GATE
Scope: authenticated Ozon seller without Premium
Parent layer: `OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`

## Why this is a distinct commercial capability

A seller does not only need raw sales, finance, advertising or stock figures. A high-value worker job is to assemble those independent Ozon surfaces into a defensible unit-economics answer for one concrete product.

This is materially different from generic cross-surface orchestration because the answer must preserve SKU-level attribution, reconcile positive and negative financial events, avoid double counting, and explicitly refuse to invent allocation for account-level costs that Ozon does not attribute to the selected SKU.

Existing reserve `STD-23 Unit economics` is not duplicated. CAP-24 is the promoted capability-aware primary-gate version of that commercial job.

## CAP-24 primary capability

`SKU / monthly unit economics orchestration`

The worker must be able to take one actually sold product and calculate a monthly contribution-style Ozon unit economy using the strongest available evidence from Seller API + Performance API.

## Canonical business question

`Возьми один реально продававшийся товар из моего текущего каталога и посчитай по нему юнит-экономику за последний полный календарный месяц. Покажи продажи в штуках и рублях, все расходы Ozon, которые можно честно привязать к этому SKU: комиссию за продажу, логистику/доставку, эквайринг, возвраты/сторно, размещение и другие прямые удержания, а также рекламные расходы. Затем посчитай, сколько осталось после этих расходов всего и на одну проданную единицу. Если какой-то расход Ozon доступен только общей суммой по кабинету или его нельзя доказуемо привязать к SKU, не распределяй его выдуманным способом — покажи отдельно как нераспределённый расход/coverage gap и объясни, чего не хватает для точного расчёта.`

For the first Sol execution after promotion, freeze the last full calendar month as:

`2026-08-01` through `2026-08-31` inclusive.

## Required evidence classes

The worker should use only the minimum necessary reads, but the solved job must address these evidence classes where the current Bridge can provide them:

1. **Product identity / selector**
   - choose one current catalog SKU that actually has sales in the frozen month;
   - preserve Ozon SKU vs product_id vs offer_id identity correctly.

2. **Sales volume and gross seller sales evidence**
   - ordered/sold units and revenue for the selected SKU over the frozen month;
   - do not substitute current price × units when actual period sales evidence exists.

3. **Direct finance deductions attributable to the SKU/postings**
   - sale commission;
   - logistics / delivery services;
   - acquiring;
   - return/cancellation reversals or other SKU-linked negative accruals;
   - any other direct fee supported by finance accrual evidence.

4. **Advertising**
   - use Performance API evidence when a defensible SKU-level or campaign-to-SKU attribution exists for the requested period;
   - do not divide campaign/account spend across products without an explicit basis;
   - if the current Performance contract cannot provide a historical monthly SKU attribution, report that as an attribution coverage limit rather than inventing spend.

5. **Placement / storage**
   - prefer product-level placement evidence when available;
   - the Bridge registry exposes `report_placement_by_products_create`, but the current report-file retrieval boundary may prevent direct consumption of the generated report;
   - account-level/non-item placement charges must not be silently assigned to the selected SKU.

6. **Returns / reversals**
   - distinguish gross sales from later return/reversal finance effects;
   - do not treat a return as an advertising or logistics charge.

## Required calculations

Where evidence is attributable, calculate at minimum:

- `gross_sales_rub`
- `sold_or_ordered_units` with exact semantic label used by source
- `sale_commission_rub`
- `logistics_delivery_rub`
- `acquiring_rub`
- `returns_reversals_rub`
- `placement_storage_rub` if SKU-attributable
- `advertising_rub` if SKU-attributable
- `other_direct_ozon_costs_rub`
- `total_attributable_ozon_costs_rub`
- `contribution_after_attributable_ozon_costs_rub`
- `contribution_per_unit_rub`
- `ozon_cost_share_of_gross_sales_percent`

Do not label this as full net profit unless product COGS, tax, manufacturing/purchase cost, packaging outside Ozon, payroll and other seller-side costs are also supplied. The default result is **Ozon-side contribution / marketplace unit economics**, not accounting profit.

## Allocation discipline

`NO_UNSUPPORTED_COST_ALLOCATION`

If a cost is only account-level, campaign-level across multiple SKUs, or otherwise lacks a defensible product key, the worker must:

- exclude it from the exact attributable subtotal;
- list it separately as `UNALLOCATED` / `ATTRIBUTION_NOT_PROVEN`;
- explain what key/report would be needed to allocate it;
- optionally show a clearly labelled scenario only if the user explicitly asks for an allocation model.

An invented pro-rata allocation is a benchmark FAIL.

## Double-counting discipline

The worker must not count the same economic effect twice when Seller Analytics, posting financial data and finance accrual data overlap.

Examples:

- use Seller Analytics for sales/units and Finance for deductions, but do not add the same sale amount again from finance as extra revenue;
- if a finance posting total is already reconstructed from seller price minus commission/services, do not also subtract the same embedded commission/services a second time;
- return/reversal entries must be reconciled against the chosen gross-sales basis.

## Known current Bridge boundaries that CAP-24 is allowed to discover

- `performance_sku_statistics` is a current near-date product advertising surface and may not support an arbitrary historical full-month SKU query under the current contract.
- `report_placement_by_products_create` can create a product-level placement report, but report materialization/file-read policy may block direct AI consumption of the report payload.
- `finance_accrual_by_day` and posting-level finance reads can expose SKU/posting-linked fees, while some `NON_ITEM` charges are account-level and therefore not automatically attributable.

These are not reasons to fabricate a full unit economy. They are exactly the kind of product coverage boundary CAP-24 must surface honestly.

## PASS criteria

CAP-24 can PASS even with an attribution boundary if the worker:

1. selects a real sold SKU without operator teaching the API;
2. obtains period sales evidence;
3. obtains and reconciles the direct SKU/posting finance deductions available through Bridge;
4. attempts the correct advertising/placement capability path where relevant;
5. computes all supported attributable totals correctly;
6. explicitly separates unallocated costs instead of inventing allocation;
7. labels the result as Ozon-side contribution/unit economics unless full COGS/tax data is available;
8. gives a useful seller-facing conclusion about whether Ozon-side economics are healthy and what missing evidence prevents a stricter profit calculation.

Suggested final status when core arithmetic is correct but one current Bridge surface cannot provide defensible monthly SKU attribution:

`PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY`

## FAIL conditions

- asks the operator to manually list the product when Bridge can discover it;
- uses current price × units instead of period sales evidence without necessity;
- confuses revenue with payout;
- treats all account-level Ozon fees as this SKU's costs;
- arbitrarily prorates ad/placement spend without an explicit rule/evidence;
- double-counts commission/logistics/returns;
- claims full net profit without seller COGS/tax inputs;
- silently omits unavailable cost classes instead of identifying the coverage boundary.

## Scoring additions

In addition to standard CAP fields, record:

- `sku_identity_integrity`: PASS/PARTIAL/FAIL
- `financial_attribution_integrity`: PASS/PARTIAL/FAIL
- `advertising_attribution_integrity`: PASS/PARTIAL/FAIL/NOT_AVAILABLE
- `placement_attribution_integrity`: PASS/PARTIAL/FAIL/NOT_AVAILABLE
- `double_counting_control`: PASS/FAIL
- `unsupported_allocation_avoided`: PASS/FAIL
- `profit_label_discipline`: PASS/FAIL

## Primary-gate effect

Promotion of CAP-24 expands the evidence-driven primary gate from 43 to **44 rows**:

- 20 STD rows;
- 24 CAP rows.

Checkpoint:

`PRIMARY_GATE_44_WITH_CAP_24_SKU_MONTHLY_UNIT_ECONOMICS`
