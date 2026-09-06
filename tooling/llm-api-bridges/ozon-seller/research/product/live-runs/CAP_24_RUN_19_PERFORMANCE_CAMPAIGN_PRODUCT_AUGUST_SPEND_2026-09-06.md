# CAP-24 Run 19 — historical August campaign statistics and advertising-attribution gate

Date: 2026-09-06
Status: `PASS__HISTORICAL_CAMPAIGN_SPEND_VISIBLE__SKU_ATTRIBUTION_PENDING_OBJECT_PROOF`

## Business purpose

CAP-24 requires an explicit attempt to attribute August 2026 advertising cost to the selected real SKU without inventing allocation.

Target identity:

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- frozen period: `2026-08-01..2026-08-31`

This run tests whether the historical Performance surface can return actual August campaign statistics and spend. It does **not** by itself prove which campaign belongs to the target SKU.

## Exact Bridge execution

Command:

```json
{
  "operation": "performance_campaign_product",
  "params": {
    "dateFrom": "2026-08-01",
    "dateTo": "2026-08-31"
  }
}
```

Observed execution:

- request_id: `c1d0f47e-71bf-4b0d-9ff3-f94f3b51c958`
- operation: `performance_campaign_product`
- fingerprint: `a95edb33`
- provider: `ozon`
- host_alias: `performance_api`
- HTTP method: `GET`
- HTTP status: `200`
- elapsed: `453 ms`
- external_request_executed: `true`
- capability_probe_executed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact_request_preserved: `true`
- command_transformed: `false`
- pagination: `null`
- rate_limit: `null`
- batch logical_business_result_count: `1`
- batch physical_business_request_count: `1`

Invariant preserved:

`1 explicit business command => 1 physical provider request`.

## What the response proves

The explicit historical range `2026-08-01..2026-08-31` returned campaign rows containing, among other fields:

- campaign `id`;
- `title`;
- `objectType`;
- `status`;
- `placement`;
- `moneySpent`;
- views/clicks/orders/order revenue and related campaign metrics.

Therefore the Performance API surface can expose non-zero advertising spend under the frozen August date range.

The returned row `id` is treated as campaign identity at this stage. `objectType: SKU` states the advertising-object class; it does **not** identify the concrete advertised SKU.

## Corrected non-zero spend inventory

A fresh arithmetic recheck of the raw Run-19 rows corrected an intermediate subtotal error before promotion into CAP-24 evidence.

### Campaign set with IDs `33379...`

Non-zero `moneySpent` values:

| campaign_id | title | moneySpent, RUB |
|---|---|---:|
| `33379098` | Восточные 26.07.2026 | 1179.75 |
| `33379099` | Герб 26.07.2026 | 4909.19 |
| `33379101` | Зод Античные 26.07.2026 | 2076.19 |
| `33379103` | Зод Символы 26.07.2026 | 3009.61 |
| `33379105` | Зод Чер 26.07.2026 | 6905.52 |
| `33379108` | Печать Поиск 21.03 Вывод в топ 25.03 26.07.2026 | 14900.95 |
| `33379109` | Православные 26.07.2026 | 1094.42 |
| `33379112` | Скандинавские 26.07.2026 | 3761.78 |
| `33379115` | Слав Боги 26.07.2026 | 5454.77 |
| `33379117` | Слав Символы 26.07.2026 | 4688.23 |
| `33379118` | Восточные 26.07.2026 | 88.60 |
| `33379120` | Герб 26.07.2026 | 1242.89 |
| `33379123` | Зод Античные 26.07.2026 | 2592.86 |
| `33379124` | Зод Символы 26.07.2026 | 2645.46 |
| `33379125` | Зод Чер 26.07.2026 | 3834.46 |
| `33379127` | Печать Реком 21,03 26.07.2026 | 14291.96 |
| `33379129` | Православные 26.07.2026 | 978.43 |
| `33379130` | Скандинавские 26.07.2026 | 2120.50 |
| `33379131` | Слав Боги 26.07.2026 | 1571.72 |
| `33379132` | Слав Символы 26.07.2026 | 4179.09 |

Exact subtotal: **`81526.38 RUB`**.

### Campaign set with IDs `37130...`

| campaign_id | title | moneySpent, RUB |
|---|---|---:|
| `37130594` | Восточные 27.08.2026 | 198.38 |
| `37130595` | Герб 27.08.2026 | 1229.64 |
| `37130600` | Зод Античные 27.08.2026 | 629.04 |
| `37130604` | Зод Символы 27.08.2026 | 634.50 |
| `37130606` | Зод Чер 27.08.2026 | 1191.84 |
| `37130607` | Печать Поиск 21.03 Вывод в топ 25.03 27.08.2026 | 3431.80 |
| `37130609` | Православные 27.08.2026 | 190.23 |
| `37130617` | Скандинавские 27.08.2026 | 545.17 |
| `37130619` | Слав Боги 27.08.2026 | 984.74 |
| `37130620` | Слав Символы 27.08.2026 | 1102.53 |
| `37130622` | Восточные 27.08.2026 | 22.18 |
| `37130624` | Герб 27.08.2026 | 259.52 |
| `37130627` | Зод Античные 27.08.2026 | 514.17 |
| `37130629` | Зод Символы 27.08.2026 | 606.85 |
| `37130631` | Зод Чер 27.08.2026 | 927.28 |
| `37130634` | Печать Реком 21,03 27.08.2026 | 3160.40 |
| `37130638` | Православные 27.08.2026 | 197.44 |
| `37130640` | Скандинавские 27.08.2026 | 458.18 |
| `37130642` | Слав Боги 27.08.2026 | 332.22 |
| `37130644` | Слав Символы 27.08.2026 | 893.96 |

Exact subtotal: **`17510.07 RUB`**.

### All non-zero campaign spend returned under the explicit August range

`81526.38 + 17510.07 = 99036.45 RUB`.

This is the corrected total. An earlier working subtotal of `97532.05 RUB` was an arithmetic error and must not be reused.

Defensible wording: **`99036.45 RUB of non-zero campaign moneySpent returned under the explicit 2026-08-01..2026-08-31 request`**.

Do not silently relabel this as lifetime spend or as target-SKU spend.

## Title-based target discovery candidates — NOT attribution

Four rows contain `Печать` in their campaign title:

- `33379108` — `14900.95 RUB`
- `33379127` — `14291.96 RUB`
- `37130607` — `3431.80 RUB`
- `37130634` — `3160.40 RUB`

Candidate sum:

**`35785.11 RUB`**.

This number is **not** target-SKU advertising cost yet.

Campaign titles are only a discovery hint. They cannot serve as the attribution key for SKU `1636048691`.

## Required attribution gate

For each of the four candidate campaign IDs, retrieve the campaign's promoted objects using `performance_campaign_objects`.

Provider contract for `GET /api/client/campaign/{campaignId}/objects` uses required path parameter `campaignId`. For product advertising campaigns, returned object `id` represents the advertised SKU.

Decision rule per campaign:

1. If returned object list contains only SKU `1636048691`, the campaign-level August `moneySpent` can be directly associated with the target SKU, subject to duplicate reconciliation.
2. If the campaign contains multiple SKUs, the full campaign spend cannot be assigned to the target SKU without a provider-supported historical SKU split.
3. If the target SKU is absent, the campaign is not attributed to the target even if its title contains `Печать`.
4. If object proof is unavailable or ambiguous, mark that campaign `ADVERTISING_ATTRIBUTION_NOT_PROVEN` rather than allocate heuristically.

## Duplicate-cost boundary

August finance evidence contains `NON_ITEM` promotion-related charges, including type_id `54`, which were intentionally excluded from the direct target-SKU finance subtotal because no SKU key was present.

If Performance advertising spend becomes directly attributable, it must still be reconciled against those finance promotion charges before any final CAP-24 total is formed. Do not add both surfaces blindly and do not assume they are exact duplicates without evidence.

## Current CAP-24 state

- direct August finance ledger: complete, `113264.00 RUB`
- historical August campaign spend visibility: PASS
- target-SKU advertising attribution: PENDING campaign-object proof
- placement/storage attribution: still pending after advertising gate
- executable Bridge change: none
