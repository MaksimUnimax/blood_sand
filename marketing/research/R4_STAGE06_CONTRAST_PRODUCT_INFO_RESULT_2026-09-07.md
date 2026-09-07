# R4 — Stage 06 contrast product-info result — 2026-09-07

Status: **06.4 CONTRAST PRODUCT-INFO 4/4 COMPLETE — ATTRIBUTES REQUIRED**

Direct request:
- operation `seller_product_info_list`
- request `2f3c8b11-1539-4cc1-96fc-8a3647d67ea6`
- HTTP 200
- external request executed true
- returned 4/4 requested SKUs

Artifacts:
- `marketing/data/raw/marketplace/ozon/20260907__ozon__seller-product-info-list__contrast4.md`
- `marketing/data/normalized/products/20260907__ozon__contrast4__product-info.csv`

## What is now proven

All four contrast identities are current Ozon listings, not archival assumptions:

1. Бусидо — SKU `1602715556`
2. Овен classic — `1720148880`
3. Лев antique — `2186857668`
4. Близнецы symbols — `2271210394`

All four are explicitly titled as rear-view-mirror car pendants / talismans. All four share Ozon `description_category_id=87515080` and `type_id=93733` with the Tier A set.

All four are currently `Продается`, moderation `approved`, validation `success`, and all returned the same price ladder in this snapshot: `1700 RUB`, minimum `1450`, old price `2200`.

The three zodiac representatives are therefore confirmed as real automotive-form-factor products. This satisfies the product-side part of the OU09 reopen test more strongly than assortment titles alone.

It **does not** overturn the R3 Search conclusion: broad zodiac Search/Alice demand remains contaminated by stones/jewelry. Product existence and sales cannot be substituted for clean acquisition intent.

## Historical seller-performance context

Preserved 90-day evidence for these contrast identities:
- Бусидо: 19 ordered units
- classic Овен: 32
- antique Лев: 26
- symbols Близнецы: 30

The three zodiac representatives total 88 ordered units in the preserved window. This proves non-zero commercial reality for each sampled zodiac line but does not prove buyer motivation or future search opportunity.

## Why attributes are still required

Product-info proves identity, listing state, price, stock and form-factor wording, but it does not establish whether these four share Tier A's physical construction:
- wooden 45 mm medallion;
- acrylic 12 mm beads;
- 36 cm total length;
- other seller-declared content attributes.

This is a concrete Stage-06 comparison question: **is the automotive assortment essentially one standardized physical chassis with different symbols, or are zodiac/Busido materially different product types?**

Therefore one targeted `seller_product_attributes` request for exactly these four SKUs is authorized. No wider attributes pull is needed.

## Next exact action

Run one `seller_product_attributes` request for:
- `1602715556`
- `1720148880`
- `2186857668`
- `2271210394`

After normalization, decide whether 06.4 contrast enrichment is complete and proceed toward 06.5 WB status / 06.6 final passports.
