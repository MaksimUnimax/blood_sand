# Ozon Tier A product attributes — direct evidence

Observed in operator-provided `OZON_RESULT_V1` on 2026-09-07.

## Request metadata

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- request_id: `877ef57d-d048-4d8d-98f0-d17ce5d71a0d`
- operation: `seller_product_attributes`
- HTTP: `200`
- external_request_executed: `true`
- physical_business_request_count: `1`
- entitlement: `SUPPORTED_AND_ENTITLED`
- endpoint authority: `POST /v4/product/info/attributes`
- result total: `5`
- last_id: empty string
- terminal: `YES`

Requested SKUs:
- `1636048691` — Печать Велеса
- `1636041142` — Велес
- `1640251697` — Алатырь
- `1602722942` — Вегвизир
- `1602717077` — Шлем Ужаса / Эгисхьяльм

## Direct common seller-declared physical/content facts

All five returned descriptions explicitly state:
- medallion/obereg material: `дерево`;
- medallion diameter: `45 мм`;
- bead diameter: `12 мм`;
- bead material: `акрил`;
- total talisman length: `36 см`.

Attribute `7405` directly lists `Дерево` and `Акрил` for all five.

All five have country attribute `Россия` and a product video in complex attribute `21845`.

## Top-level marketplace dimensions

Returned top-level listing/package-style fields:
- Шлем Ужаса: 40 × 130 × 130 mm; 200 g
- Вегвизир: 40 × 130 × 130 mm; 200 g
- Велес: 40 × 130 × 130 mm; 200 g
- Печать Велеса: 40 × 140 × 130 mm; 200 g
- Алатырь: 40 × 130 × 130 mm; 200 g

Control rule: these top-level dimensions/weight are stored as marketplace listing/package observations and are **not** reinterpreted as medallion dimensions/weight.

## Classification observed in attributes

- Печать Велеса: seller taxonomy `Славянские символы`; type `Оберег`.
- Алатырь: seller taxonomy `Славянские символы`; type `Оберег`.
- Велес: seller taxonomy `Славянские обереги Русская община.`; type `Оберег`.
- Вегвизир: seller taxonomy `Скандинавские обереги`; type `Талисман`.
- Шлем Ужаса: seller taxonomy `Скандинавские обереги`; type `Талисман`.

## Direct automotive/form-factor positioning

All five returned listing titles/descriptions explicitly position the item as a rear-view-mirror car pendant. This is fresh direct seller evidence for both:
- automotive use-case relation;
- mirror-pendant form-factor relation.

## Claim control

Descriptions contain claims about protection, luck, negative energy, evil eye, destiny and similar effects. These are preserved only as `SELLER_CLAIM_UNVERIFIED`; they are not upgraded to objective product facts.

Historical/cultural statements in seller copy are also not treated as independently verified history. In particular, Vegvisir copy must later be reconciled with the already preserved R2 historical-source evidence rather than copied as authority.

## Completeness decision

`TIER_A_ATTRIBUTES_5_OF_5_TERMINAL_PASS`

No continuation request is required because `last_id=""`.
