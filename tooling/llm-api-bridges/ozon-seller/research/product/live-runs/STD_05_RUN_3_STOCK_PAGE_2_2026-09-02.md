# STD-05 — Run 3 / stock_on_warehouses_v2 page 2

Date: 2026-09-02
Benchmark: `OZON_AI_WORKER_40_TEST_LIVE_RESULTS_TABLE_2026-09-02.md`
Business question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`
Status: `IN_PROGRESS / STOCK_EVIDENCE_PAGINATION_CONTINUES`

## Command

```text
OZON_API_V1
{
  "operation": "stock_on_warehouses_v2",
  "params": {
    "limit": 100,
    "offset": 100,
    "warehouse_type": "ALL"
  }
}
```

## Observed Bridge/provider result

- request id: `4f710fa8-5a83-491a-9e55-3782df4b27a7`;
- operation: `stock_on_warehouses_v2`;
- path: `POST /v2/analytics/stock_on_warehouses`;
- entitlement: `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- exactly one physical business request;
- HTTP `200`;
- no rate-limit metadata;
- `pagination: null`;
- returned exactly `100` rows for `limit=100` at `offset=100`.

Because the second page again contains exactly the requested page size and Bridge exposes no terminal/pagination metadata, the AI must not assume the inventory result is complete. The next explicit read is `offset=200`.

## Evidence relevant to STD-05

The earlier sales decomposition established:

- 2026-08-31 revenue `49,640 RUB`, ordered units `31`;
- 2026-09-01 revenue `27,200 RUB`, ordered units `16`;
- net change `-22,440 RUB`;
- selling-SKU count fell approximately `24 -> 14`;
- gross negative SKU contribution `-36,652 RUB`, offset by positive/new SKU contribution `+14,212 RUB`;
- largest negative contributors included:
  - SKU `1720144370` — approximately `-5,100 RUB`;
  - SKU `2184234912` — approximately `-3,094 RUB`;
  - SKU `1636048691` — approximately `-2,788 RUB`.

Current-stock evidence across pages 1-2 now shows materially different availability profiles for these three leaders:

### SKU 1636048691 — `Печать Велеса`

Page 1 contained stock across many RFCs. Sum of visible `free_to_sell_amount` rows is approximately `188` free units, with additional promised stock including `31` at `ХАБАРОВСК_2_РФЦ`.

Interpretation: a broad current stockout is **not supported** as the explanation for this SKU's sales decline.

### SKU 1720144370 — `Дева`

Page 1 showed one current stock row:

- `ВАТУТИНКИ_РФЦ`: `free_to_sell_amount = 1`.

No additional row for this exact SKU appeared on page 2.

Interpretation: this exact SKU currently has very narrow visible availability in the first 200 warehouse rows and remains a plausible stock-constrained contributor. This is current-state evidence only; it does not prove what stock was available during 2026-09-01.

### SKU 2184234912 — `Звезда Лады`

Page 2 showed:

- `ХОРУГВИНО_РФЦ`: free `1`;
- `ХАБАРОВСК_2_РФЦ`: free `0`, promised `2`;
- `ПЕРМЬ_РФЦ`: free `2`;
- `ВАТУТИНКИ_РФЦ`: free `1`;
- `РОСТОВ_НА_ДОНУ_2_РФЦ`: free `1`.

Visible current free stock total = `5`; promised = `2`.

Interpretation: current stock is thin enough that availability may be a plausible contributor, but current stock cannot establish historical causation for the previous day's sales decline.

## Current hypothesis state

- `ONE_SKU_FAILURE` — rejected; the decline is broad across many SKUs.
- `BROAD_CURRENT_STOCKOUT` — not supported because the leading product `Печать Велеса` has substantial current stock.
- `SELECTIVE_STOCK_CONSTRAINT_ON_SOME_DECLINING_SKUS` — plausible; `Дева` and `Звезда Лады` are current low-stock examples.
- `HISTORICAL_STOCK_CAUSED_2026-09-01_DECLINE` — not proven because `/v2/analytics/stock_on_warehouses` is a current snapshot.
- visibility, advertising, price/promotion and logistics explanations remain open.

## Product/weak-model finding

`stock_on_warehouses_v2` returned `pagination:null` on two consecutive full-size pages. A weak model can easily mistake one full page for a complete dataset unless Bridge exposes deterministic continuation/terminal guidance.

Required product rule:

`DO_NOT_REQUIRE_MODEL_INTELLIGENCE_TO_INFER_PAGINATION_FROM_ROW_COUNT`

When an operation uses explicit `limit/offset`, Bridge should surface machine-readable continuation state when safely derivable, or at minimum a deterministic guidance field stating that a full-size page may require the next offset and that the result must not yet be treated as complete.

No hidden pagination is authorized; continuation remains one later explicit AI command = at most one physical provider request.

## Next exact step

Continue the same stock evidence collection:

```text
OZON_API_V1
{
  "operation": "stock_on_warehouses_v2",
  "params": {
    "limit": 100,
    "offset": 200,
    "warehouse_type": "ALL"
  }
}
```

Do not move to visibility/advertising until the current stock pagination reaches a terminal short/empty page or another evidence-backed terminal signal.