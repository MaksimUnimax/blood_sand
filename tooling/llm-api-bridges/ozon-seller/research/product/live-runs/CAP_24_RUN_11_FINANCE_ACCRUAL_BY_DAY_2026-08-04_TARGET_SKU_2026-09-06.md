# CAP-24 — Run 11: finance_accrual_by_day — 2026-08-04 target-SKU evidence

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `ozon-llm-api-bridge v0.1.19`
- Operation: `finance_accrual_by_day`
- Requested date: `2026-08-04`
- Request ID: `41bd6ad3-b425-48b3-86c9-fcc35d0cc8c9`
- Logical/physical fingerprint: `cd728589`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `200`
- Elapsed: `1442 ms`
- Rate-limit metadata: `null`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`
- Response `last_id`: empty string
- Day coverage status: `COMPLETE_SINGLE_PAGE`

## CAP-24 target identity

- Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`

## Target-SKU POSTING accruals observed on 2026-08-04

Four POSTING records contain target SKU `1636048691`.

| accrual_id | unit_number | schema | sale_amount | sale_commission | delivery total | type 32 | type 29 | posting total_amount |
|---:|---|---|---:|---:|---:|---:|---:|---:|
| `58689846528` | `0110909617-0328-1` | Fbo | 1700.00 | -714.00 | -91.75 | -69.00 | -22.75 | 894.25 |
| `58691173065` | `0202900972-0093-7` | Fbo | 1700.00 | -714.00 | -81.07 | -70.00 | -11.07 | 904.93 |
| `58726195176` | `0156894759-0085-1` | Fbo | 1700.00 | -714.00 | -93.06 | -69.00 | -24.06 | 892.94 |
| `58757467590` | `0132352950-0155-1` | Fbo | 1700.00 | -714.00 | -87.21 | -78.00 | -9.21 | 898.79 |

Observed POSTING subtotals:

- posting sale_amount evidence: `6800.00 RUB`
- sale commission: `-2856.00 RUB`
- delivery/logistics total: `-353.09 RUB`
  - type_id `32`: `-286.00 RUB`
  - type_id `29`: `-67.09 RUB`
- summed POSTING total_amount: `3590.91 RUB`

Arithmetic cross-check:

`6800.00 - 2856.00 - 353.09 = 3590.91 RUB`

Seller Analytics remains the canonical monthly gross-sales source; these finance sale amounts are reconciliation evidence and are not additional revenue.

## Target-SKU ITEM accruals observed on 2026-08-04

Eight ITEM components explicitly name target SKU `1636048691`, all with `type_id = 1` (Acquiring / Эквайринг under the preserved Run 02 `/types` dictionary):

- accrual_id `58688958622`, unit `50547330-0396`: `-16.20 RUB`
- accrual_id `58689983158`, unit `0110909617-0328-1`: `-15.71 RUB`
- accrual_id `58691569471`, unit `0202900972-0093-7`: `-15.53 RUB`
- accrual_id `58703752560`, unit `89615475-0048`: `-13.59 RUB`
- accrual_id `58706301576`, unit `0133294845-0040`: `-7.91 RUB`
- accrual_id `58709058867`, unit `85962015-0362`: `-15.49 RUB`
- accrual_id `58728437568`, unit `0156894759-0085-1`: `-15.55 RUB`
- accrual_id `58760685014`, unit `0132352950-0155-1`: `-15.20 RUB`

Observed target-SKU acquiring subtotal:

`-115.18 RUB`

Several acquiring rows do not have a same-day matching target POSTING. They remain directly attributable because the ITEM row itself names SKU `1636048691`.

## Direct-cost subtotal observed on this accrual date

- sale commission: `2856.00 RUB` cost
- delivery/logistics: `353.09 RUB` cost
- acquiring: `115.18 RUB` cost
- total directly attributable Ozon costs observed on 2026-08-04: `3324.27 RUB`

This is a date-local collection subtotal, not the monthly CAP-24 result.

## Cumulative collection progress

For completed dates `2026-08-01..2026-08-04` only:

- target POSTING count: `13`
- posting sale_amount reconciliation evidence: `22100.00 RUB`
- sale commission: `9282.00 RUB` cost
- delivery/logistics: `1297.67 RUB` cost
- acquiring: `234.49 RUB` cost
- directly attributable Ozon costs: `10814.16 RUB`

Including the separately preserved complete `2026-08-25` Run 06, current preserved-date evidence becomes:

- sale commission: `11424.00 RUB` cost
- delivery/logistics: `1552.01 RUB` cost
- acquiring: `300.02 RUB` cost
- directly attributable Ozon costs across preserved dates `01,02,03,04,25`: `13276.03 RUB`

These figures are collection-progress statistics only. They are not the full-August unit-economics result.

## Unallocated / NON_ITEM discipline

The response contains many NON_ITEM charges, including type_ids `46`, `41`, and `54`. They are not assigned to SKU `1636048691` because the records do not provide a defensible SKU attribution key.

## Coverage / pagination

`last_id = ""`.

Therefore 2026-08-04 is complete and requires no continuation request.

## Orchestration correction

Do not continue the remaining month as one operator round trip per date.

The current Bridge supports multiple explicit `OZON_API_V1` commands in one assistant response with sequential batch delivery. Remaining independent first-page August dates must use the project rule:

`EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS`

Only a returned non-empty `last_id` creates a dependent continuation that must be constructed after inspecting that result.
