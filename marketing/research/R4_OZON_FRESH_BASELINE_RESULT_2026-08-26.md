# R4 — Ozon fresh baseline result — 2026-08-26

Status: **PASS — ROADMAP 06.2 IDENTITY/CURRENTNESS BASELINE COMPLETE**

## Scope

This pass answers one question only: **is the current Ozon listing identity set still the same as the proven historical 76-item baseline, and is the fresh enumeration terminal?**

It does not upgrade historical sales windows to current, does not infer buyer motive, and does not treat stock quantities as timeless product facts.

## Fresh provider sequence

### Page 1

Raw evidence:
- `marketing/data/raw/marketplace/ozon/20260826T1102Z__ozon__stocks-current__fresh-page1.md`
- request_id `7c5e5bc9-4208-44e4-8651-296eb4ce6a7f`
- HTTP 200
- 76 returned items
- provider total 76
- non-empty cursor `WzIzMjQ0Njc4NTUsMjMyNDQ2Nzg1NV0=`

Interpretation at that point: **NON_TERMINAL_CONTINUATION_REQUIRED**.

### Explicit continuation

Raw evidence:
- `marketing/data/raw/marketplace/ozon/20260826__ozon__stocks-current__fresh-terminal.md`
- request_id `91bbb10d-3ad3-4f39-bda7-b838637e05ac`
- HTTP 200
- 0 returned items
- provider total 76
- cursor empty

Interpretation: **TERMINAL_76_OF_76_PROVEN**.

## Identity normalization

Fresh normalized identity set:
- `marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`

Validation:
- fresh unique `ozon_product_id`: 76;
- fresh unique marketplace SKU: 76;
- historical 2026-08-12 unique `ozon_product_id`: 76;
- historical 2026-08-12 unique marketplace SKU: 76;
- exact fresh-vs-historical identity matches: **76/76**;
- fresh additions: **0**;
- historical identities absent from fresh enumeration: **0**;
- unresolved returned listing identities: **0**.

Therefore there is **no assortment identity churn detected between the proven 2026-08-11/12 baseline and the fresh 2026-08-26 Ozon enumeration** at the `product_id + SKU` level.

This does not claim that names, attributes, prices, listing state, stock quantities, media, or performance metrics are unchanged.

## Priority current stock observations

The fresh page directly returned snapshot stock values. Examples retained from the raw pass:

| product_id | SKU | seller offer | FBO present | FBS present |
|---:|---:|---|---:|---:|
| 1119965443 | 1636048691 | Печать Велеса | 220 | 50 |
| 1119957837 | 1636041142 | Велес | 23 | 41 |
| 1124658338 | 1640251697 | Алатырь (Крест Сварога) | 5 | 37 |
| 1082862005 | 1602722942 | Вегвизир - Рунический компас | 19 | 35 |
| 1082855228 | 1602717077 | Шлем ужаса - Эгисхьяльм | 7 | 50 |
| 2324003802 | 2559437928 | Чур | 7 | 41 |

These values are dated dynamic marketplace observations only.

## 06.2 completion decision

Roadmap 06.2 completion criterion is satisfied:
- explicit terminal/completeness evidence: **PASS**;
- every returned listing identity normalized or unresolved: **76 normalized, 0 unresolved**.

No broad product-detail / price / attribute fan-out is required to establish the fresh assortment baseline. Targeted enrichment remains required for passport gaps, but it should be selected **after current assortment → opportunity mapping**, so requests are driven by decision need rather than indiscriminate 76-SKU collection.

Next: Roadmap **06.3 — map the unchanged current 76-item assortment to accepted R3 opportunities/product families, resolve the Veles split, car use-case/form-factor distinction, priority symbols, zodiac reopen test, and unmapped products.**
