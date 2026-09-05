# STD-13 post-repair Run 2 — fresh accepted-supply bundle refresh

Date: 2026-09-05
Canonical question: `Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.`
Target order: `122149074` / `2000062599609`
Target bundle: `019feae9-0fbe-75af-8f63-b9df1ca38840`

## Context from Run 1

Fresh `supply_order_details` showed:

- order state: `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- supply state: `ACCEPTED_AT_STORAGE_WAREHOUSE`;
- state updated: `2026-09-04T13:13:46.708202Z`;
- therefore the supply is no longer stuck before warehouse acceptance.

The next question is whether the accepted supply contents are still the same bounded SKU set and whether those SKUs have appeared in current FBO stock.

## Command/result

Operation: `supply_order_bundle`
Request id: `ce67532d-80f9-424a-9300-76d753c2b6a0`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Provider pagination: `has_next=false`
Total SKU rows: `9`

## Fresh bundle contents

| SKU | Product | Qty |
|---|---|---:|
| 2559748332 | Герб России | 2 |
| 2559437928 | Чур | 5 |
| 1636048691 | Печать Велеса | 31 |
| 2183985513 | Перун | 2 |
| 2184234912 | Звезда Лады | 2 |
| 1640330072 | Громовик | 2 |
| 1640251697 | Алатырь (Крест Сварога) | 5 |
| 2326866320 | Спаси и Сохрани | 2 |
| 1602717077 | Шлем ужаса — Эгисхьяльм | 3 |

Fresh total: **54 units across 9 SKUs**.

## Reconciliation with 2026-09-02 historical bundle

The fresh 2026-09-05 bundle exactly matches the preserved 2026-09-02 composition by SKU and quantity:

- same 9 SKUs;
- same per-SKU quantities;
- same 54-unit total;
- no hidden continuation.

Therefore there is no evidence that the provider changed or truncated the supply composition between the historical stale-IN_TRANSIT investigation and the current accepted-supply state.

This still does **not** prove that all 54 units have been materialized into sellable FBO inventory. Acceptance-state evidence and stock-availability evidence are separate surfaces.

## Next diagnostic

Run fresh `fbo_stock_by_warehouse` for all 9 bundle SKUs in one explicit request.

Required interpretation:

- identify which bundle SKUs currently have FBO `present` stock;
- identify warehouse rows and reservations;
- do not infer that a unit was accepted into sellable stock solely from `ACCEPTED_AT_STORAGE_WAREHOUSE`;
- do not equate zero current FBO stock with proven loss without additional evidence.

Checkpoint:
`STD_13_RUN2_FRESH_BUNDLE_MATCHES_HISTORICAL_54_UNITS_9_SKUS_FBO_STOCK_REFRESH_NEXT`
