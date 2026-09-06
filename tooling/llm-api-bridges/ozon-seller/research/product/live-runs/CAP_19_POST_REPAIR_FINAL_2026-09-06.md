# CAP-19 — Cross-surface orchestration — POST-REPAIR FINAL

Status: PASS_WITH_STOCK_PROVIDER_OMISSION_LIMIT

Canonical job:

`Есть ли риск, что я сейчас трачу рекламу на товары без доступного остатка? Возьми активную CPC-кампанию с максимальным расходом за 29 августа — 4 сентября 2026 года из уже проверенной Performance-статистики, сам получи список рекламируемых товаров и сверь их с текущими остатками Ozon. Покажи товары без остатка отдельно от товаров с положительным остатком; отсутствие строки не считай нулём и не проси меня вручную перечислять SKU.`

## Live runs

### Run 1 — `performance_campaign_products`

- request_id: `ee0c8c27-070d-4d04-a745-70c4ccd9b851`
- campaign: `37130634` — `Печать Реком 21,03 27.08.2026`
- HTTP 200
- `logical_business_result_count=1`
- `physical_business_request_count=1`
- `external_request_executed=true`
- entitlement `SUPPORTED_AND_ENTITLED`
- exact request preserved; no command transformation
- provider returned one campaign product:
  - SKU `1636048691`
  - `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`
  - bid `2500000`
  - targetCir `0`
- provider did not prove another page, so no hidden pagination was invented.

### Run 2 — `stocks_current`

- request_id: `1d92bcb0-2726-4ebd-94ab-09ddfa712ba2`
- exact filter: campaign-returned identifier `1636048691`
- HTTP 200
- `logical_business_result_count=1`
- `physical_business_request_count=1`
- `external_request_executed=true`
- entitlement `SUPPORTED_AND_ENTITLED`
- exact request preserved; no command transformation
- provider result: `items: []`, `total: 0`, empty cursor.

Per the frozen CAP-19 method, absence of a stock row is **not** zero stock. The result is classified as `UNKNOWN / OMITTED`.

## Cross-surface reconciliation

| Campaign product | Current stock result | Classification |
|---|---|---|
| `1636048691` — Печать Велеса | no row returned by `stocks_current` | `UNKNOWN / OMITTED` |

Therefore:

- explicit positive-stock products: none proven by this stock response;
- explicit zero-stock products: none proven;
- omitted/unknown products: `1636048691`;
- claim "advertising is currently spending on an out-of-stock product": **NOT_PROVEN**;
- claim "the advertised product currently has positive stock": **NOT_PROVEN**.

The benchmark requirement was satisfied operationally: the worker selected the campaign from already-proven Performance evidence, obtained live campaign membership from Performance API, carried the returned product identifier across provider surfaces, queried Seller current stock without asking the operator for SKU enumeration, and preserved omission semantics instead of fabricating zero.

## Scoring

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: PASS
- multi_run_orchestration: PASS
- business_answer: PASS_WITH_EXPLICIT_STOCK_OMISSION_BOUNDARY
- operator_intervention_required: NO
- bridge_guidance_gap: NO_NEW_GAP_PROVEN — provider omission is preserved explicitly; no zero-stock inference is allowed.

## Final business answer

For the highest-spend active CPC campaign selected from CAP-18 (`37130634`, period spend `3,871.74 RUB`), Performance API reports one advertised product: SKU `1636048691`, `Печать Велеса`.

The current Seller stock read returned no row for that identifier. Under the benchmark contract this is `UNKNOWN / OMITTED`, not stock `0`. Therefore there is currently no evidence-backed basis to say that the campaign is spending on an out-of-stock SKU, but there is also no positive-stock proof for that SKU from this response. The safe action is to keep the stock state unresolved rather than silently treating provider omission as zero.
