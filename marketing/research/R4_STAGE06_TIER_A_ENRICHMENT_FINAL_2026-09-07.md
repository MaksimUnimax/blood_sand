# R4 — Stage 06 Tier A product-passport enrichment — FINAL

Status: **COMPLETE — PRODUCT INFO 5/5 + ATTRIBUTES 5/5**  
Continuation date: **2026-09-07**

## Scope

Tier A current Ozon identities:

1. `1636048691` / `1119965443` — Печать Велеса
2. `1636041142` / `1119957837` — Велес
3. `1640251697` / `1124658338` — Алатырь
4. `1602722942` / `1082862005` — Вегвизир
5. `1602717077` / `1082855228` — Шлем Ужаса / Эгисхьяльм

## Direct provider passes

### Product info

- operation: `seller_product_info_list`
- request: `4a6a224d-43ae-4c7a-a99f-c9842273e43e`
- HTTP 200
- external request executed: yes
- returned: **5/5**

### Attributes

- operation: `seller_product_attributes`
- request: `877ef57d-d048-4d8d-98f0-d17ce5d71a0d`
- HTTP 200
- external request executed: yes
- returned total: **5**
- `last_id=""` — terminal, no continuation required

## Fresh listing/job evidence

All five current seller titles explicitly position the products as automotive rear-view-mirror pendants.

Three Slavic Tier A products are titled as `Славянский оберег - Подвеска на зеркало в машину ...`.

Vegvisir and Шлем Ужаса are titled as `Амулет - Подвеска на зеркало в машину ...`.

Therefore for these five identities:
- OU04 mirror-pendant form-factor relation is supported by fresh direct seller evidence;
- OU03 automotive symbolic/use-case relation is supported by fresh direct seller wording rather than historical-only mapping.

## Current commerce/listing facts from product-info snapshot

All five:
- listing status: `Продается`;
- moderation: `approved`;
- validation: `success`;
- not archived;
- current returned price: `1700 RUB`;
- returned min price: `1450 RUB`;
- returned old price: `2200 RUB`.

Dynamic stock facts remain timestamped marketplace observations, not timeless passport properties.

## Direct seller-declared physical facts

All five descriptions explicitly state:
- medallion/obereg material: wood;
- medallion diameter: 45 mm;
- bead material: acrylic;
- bead diameter: 12 mm;
- total talisman length: 36 cm / 360 mm.

Attribute `7405` independently returns the material values `Дерево` and `Акрил` for all five.

All five return country `Россия` and a product video attribute.

## Marketplace top-level dimension fields

Observed:
- Шлем Ужаса: 40 × 130 × 130 mm / 200 g;
- Вегвизир: 40 × 130 × 130 mm / 200 g;
- Велес: 40 × 130 × 130 mm / 200 g;
- Печать Велеса: 40 × 140 × 130 mm / 200 g;
- Алатырь: 40 × 130 × 130 mm / 200 g.

These fields are preserved as marketplace top-level dimensions/weight and **must not be relabeled as medallion dimensions or medallion weight**.

## Seller taxonomy

- Печать Велеса — `Славянские символы`, type `Оберег`;
- Алатырь — `Славянские символы`, type `Оберег`;
- Велес — `Славянские обереги Русская община.`, type `Оберег`;
- Вегвизир — `Скандинавские обереги`, type `Талисман`;
- Шлем Ужаса — `Скандинавские обереги`, type `Талисман`.

Seller taxonomy is marketplace content evidence, not independent historical/religious authority.

## Claim discipline

Seller descriptions contain protection, luck, evil-eye, energy and related supernatural claims. They remain:

`SELLER_CLAIM_UNVERIFIED`

They are not objective product facts.

Historical/cultural statements in seller descriptions are likewise not independent authority. Vegvisir historical claims must remain subordinate to the already preserved R2 historical/source evidence.

## Canonical artifacts

- `marketing/data/raw/marketplace/ozon/20260907T1721+0500__ozon__seller-product-attributes__tier-a5.md`
- `marketing/data/normalized/products/20260907__ozon__tier-a5__physical-content-passport.csv`
- prior product-info raw/normalized artifacts from the same Tier A pass

## Completion decision

Tier A technical/product enrichment is complete enough to proceed to buyer/customer evidence.

This does **not** yet make all five passports `DECISION_GRADE`: buyer evidence/performance linkage and explicit remaining missing physical fields still need to be handled under 06.4/06.6.

Next: **06.4 — current buyer evidence first, using read-only Ozon reviews/questions where permitted, then link seller performance without inferring motive from sales.**
