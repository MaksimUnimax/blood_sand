# R4 — Stage 06 buyer + SKU evidence inventory — 2026-08-26

Status: **06.1 COMPLETE — reusable evidence inventoried; fresh product baseline still required**

## 1. What is directly available

### Ozon stock/listing identity snapshot — 2026-08-11

Raw seller-side response contains **76 product records** with:

- `product_id`;
- `offer_id`;
- Ozon `sku`;
- FBO/FBS `present` and `reserved` stock.

This is direct marketplace evidence, but it is a 2026-08-11 snapshot and therefore cannot be treated as the final 2026-08-26 current-state baseline.

Canonical raw:
`marketing/data/raw/marketplace/ozon/20260811T1025Z__ozon__stocks-current__all.json`

### Ozon SKU analytics

Direct SKU-level `ordered_units` + `revenue` exists for:

- 2026-05-13..2026-08-10 (90-day slice);
- 2026-06-12..2026-07-11;
- 2026-07-12..2026-08-10;
- 2026-08-04..2026-08-10.

The 90-day slice already proves meaningful commercial differentiation between symbols.

Observed leading rows from that response:

| SKU | Listing | Ordered units | Revenue |
|---|---|---:|---:|
| 1636048691 | Печать Велеса | 385 | 653271 |
| 1602722942 | Вегвизир | 84 | 142643 |
| 1640251697 | Алатырь | 84 | 143243 |
| 2559437928 | Чур | 77 | 131588 |
| 1640326205 | Колядник | 67 | 114943 |
| 1636041142 | Велес | 48 | 80317 |
| 2183921966 | Сварог | 34 | 57443 |
| 1720148880 | Овен zodiac | 32 | 54412 |
| 2184234912 | Звезда Лады | 30 | 50600 |
| 2271210394 | Близнецы zodiac — Symbols | 30 | 52000 |
| 1602717077 | Шлем Ужаса / Эгисхьяльм | 22 | 37800 |

No causal interpretation is attached to these numbers yet.

Canonical raw:
`marketing/data/raw/marketplace/ozon/20260811T104232Z__ozon__analytics-data__sku__20260513_20260810.json`

## 2. Immediate opportunity implications from actual SKU evidence

These are product-grounding observations, not final site decisions.

### OU02 — Печать Велеса

Strongly grounded in real assortment and seller performance:

- exact SKU exists;
- 90-day observed sales lead the visible assortment by a wide margin;
- snapshot stock: FBO 283 present / 2 reserved, FBS 50 present.

This supports keeping OU02 as a high-priority Stage 06 family.

### OU06 — broader Veles family

A separate exact `Велес` SKU exists in addition to `Печать Велеса`:

- Ozon sku `1636041142`;
- 48 ordered units / 80317 revenue in the 90-day slice;
- snapshot stock FBO 28, FBS 41.

Therefore OU06 is not merely a semantic alias of OU02 at the product layer. Stage 06.3 still must determine whether the physical/design hierarchy warrants separate buyer jobs/content treatment.

### OU05 — Алатырь

Exact current-at-snapshot sellable evidence exists:

- sku `1640251697`;
- 84 units / 143243 revenue over 90-day slice;
- snapshot FBO 0, FBS 45.

This is direct evidence that the named-symbol opportunity maps to a real commercial SKU.

### OU07 — Vegvisir

Exact product evidence exists:

- sku `1602722942`;
- 84 units / 142643 revenue;
- snapshot FBO 27, FBS 41.

The product layer supports further Stage 06 analysis. Historical/source claims remain a separate evidence problem.

### OU08 — Шлем Ужаса / Ægishjálmur

Exact product evidence exists:

- sku `1602717077`;
- 22 units / 37800 revenue;
- snapshot FBO 11, FBS 50.

This materially upgrades the Stage 05 open question “does Blood & Sand have a sellable/current variant?” to: **yes at the 2026-08-11 seller snapshot; freshness must be re-measured before final Stage 06 closure.**

### OU01 — Slavic category breadth

The seller snapshot directly contains a broad Slavic symbol assortment, including:

- Печать Велеса;
- Велес;
- Алатырь;
- Триглав;
- Ратиборец;
- Молвинец;
- Колядник;
- Знич;
- Громовик;
- Всеславец;
- Боговник;
- Родимич;
- Жива;
- Сварог;
- Перун;
- Стрибог;
- Макошь;
- Семаргл;
- Хорс;
- Мара;
- Звезда Лады;
- Даждьбог;
- Чур;
- Белобог / Чернобог and others visible in the snapshot.

So the “can Blood & Sand credibly support a Slavic specialist category?” question has real assortment support. Stage 06 still needs full current identity/attributes and buyer evidence before any final category architecture.

### OU09 — zodiac reopen condition

The stock snapshot proves a coherent zodiac assortment, not an isolated SKU:

- a base 12-sign series is visible;
- an `Античность` variant series is visible;
- a `Символы` variant series is visible;
- seller analytics contains actual orders across multiple zodiac variants.

This satisfies the **assortment-existence** portion of the Stage 05 reopen condition, but **does not reopen OU09 as primary** because Search/Alice fit remains weak and buyer evidence for this family is not yet measured.

## 3. Automotive form-factor finding

A large share of observed listing names explicitly use forms such as:

- `Подвеска на зеркало в машину`;
- `Оберег в машину`;
- `Талисман в машину`.

Therefore OU04 has substantial actual SKU coverage. However, form-factor coverage alone does not prove owned-search differentiation; Stage 05 already established that this query space is commodity/platform-heavy.

## 4. Existing buyer evidence

`CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md` provides reusable external buyer-topic evidence for:

- visual appearance in real car;
- size and bulk;
- material/finish/darkening;
- cord and attachment reliability;
- heat/sun exposure;
- packaging/gift motive;
- review/social proof.

This defines what the own-SKU audit must verify. It is not evidence that Blood & Sand products themselves have those exact properties/problems.

## 5. Important gaps

Directly not present in the current marketplace raw layer:

- fresh 2026-08-26 product/listing baseline;
- product info/attributes/media snapshot;
- current prices joined to each SKU;
- own Ozon review/question evidence;
- seller-side WB raw measurements;
- own physical dimensions/material/cord/bead/tassel/mount/packaging facts;
- asset coverage audit;
- cross-platform identity.

## 6. Stage 06.1 decision

06.1 is complete because we now have:

1. inventory of reusable evidence;
2. canonical SKU passport schema;
3. provisional SKU↔opportunity mapping;
4. explicit gap list;
5. exact next measurement target.

Artifacts:

- `marketing/roadmap/06_BUYER_SKU_EVIDENCE.md`
- `marketing/data/SKU_PASSPORT_SCHEMA_V1.md`
- `marketing/data/normalized/sku_passport/20260826__sku_opportunity_mapping_provisional_v1.csv`

## 7. Next exact step

**06.2 — obtain a fresh complete Ozon product/listing baseline and normalize it into the canonical SKU passport.**

First priority is identity + attributes + media + current price/status for all products, then join fresh stocks and existing analytics. Do not collect more Yandex Search data at this point.
