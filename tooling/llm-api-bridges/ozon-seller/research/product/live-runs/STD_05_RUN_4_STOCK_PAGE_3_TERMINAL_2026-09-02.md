# STD-05 — Run 4 / stock_on_warehouses_v2 page 3

Date: 2026-09-02
Benchmark row: STD-05
Business question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

Command:

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

Observed:
- request id `de07b1f4-e0a0-4a71-b655-e883da7af0b7`;
- operation `stock_on_warehouses_v2`;
- HTTP `200`;
- exactly one physical business request;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- `pagination: null`;
- `rate_limit: null`;
- returned fewer than the requested 100 rows, therefore this page is treated as the terminal page for the current stock snapshot.

Stock investigation after three explicit pages (`offset=0`, `100`, `200`):

- SKU `1636048691` / «Печать Велеса», one of the largest negative sales contributors, has broad current availability across many RFCs; approximately 188 free-to-sell units were already visible on page 1. Broad stockout is therefore not supported as the cause of this SKU's sales decline.
- SKU `1720144370` / «Дева» had only 1 current free-to-sell unit in the collected snapshot. Current scarcity is a plausible contributor for this SKU.
- SKU `2184234912` / «Звезда Лады» has 5 current free-to-sell units plus 2 promised units across the collected snapshot. Current scarcity is plausible for this SKU.
- Other products show mixed availability: some are broadly stocked, while multiple low-volume SKUs have only a few free units.

Evidence limit:
- this endpoint provides a current stock snapshot, not historical stock as of 2026-09-01;
- therefore stock scarcity can support a hypothesis but cannot by itself prove why sales fell on 2026-09-01;
- stock does not explain the broad decline as a single universal cause because the main SKU `1636048691` is well stocked now.

Product/Bridge finding:
- pages at offset 0 and 100 each returned exactly `limit=100` rows while top-level `pagination` remained null;
- the AI had to infer continuation from page fullness and explicitly request offsets;
- this is a weak-model portability gap already recorded for future Bridge guidance hardening: Bridge should expose deterministic continuation metadata without hidden pagination.

Next STD-05 hypothesis:
- compare Performance API daily advertising statistics for 2026-08-31 and 2026-09-01;
- determine whether ad traffic/spend/statistics materially changed in the same direction as the broad sales decline;
- keep STD-05 open until multiple evidence classes are reconciled.

Checkpoint: `STD_05_STOCK_SNAPSHOT_COMPLETE_NEXT_PERFORMANCE_DAILY_2D`
