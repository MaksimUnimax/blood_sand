# R4 — Stage 06 Tier A Ozon product-info result — 2026-09-07

Status: **PASS — Tier A product-info 5/5 measured; attributes still required**

## Direct measurement

Operation: `seller_product_info_list`  
Request ID: `4a6a224d-43ae-4c7a-a99f-c9842273e43e`  
Bridge: `ozon-llm-api-bridge` v0.1.19  
HTTP: `200`  
External Seller request executed: `true`  
Physical business requests: `1`  
Returned items: **5/5 requested Tier A SKUs**.

Normalized output:
- `marketing/data/normalized/products/20260907__ozon__tier-a5__product-info.csv`

## Runtime blocker resolved

The previously observed local `UNSUPPORTED_OPERATION` mismatch is no longer active. The current runtime accepted `seller_product_info_list`, preserved the exact request and executed one Seller API request against `POST /v3/product/info/list`.

Therefore the Stage 06 runtime deployment blocker is **RESOLVED**.

## Direct listing-title evidence

All five Tier A products are currently framed by the Ozon seller listing title as mirror-hanging automotive pendants:

- Шлем Ужаса: `Амулет - Подвеска на зеркало в машину ...`
- Vegvisir: `Амулет - Подвеска на зеркало в машину ...`
- Велес: `Славянский оберег - Подвеска на зеркало в машину ...`
- Печать Велеса: `Славянский оберег - Подвеска на зеркало в машину ...`
- Алатырь: `Славянский оберег - Подвеска на зеркало в машину ...`

This upgrades the OU04 form-factor relation from historical-title support to **fresh direct seller-listing evidence** for all five Tier A identities.

For the three Slavic titles, `оберег` + `в машину` is also directly present. For Vegvisir and Шлем Ужаса, `амулет` + `в машину` is directly present. This directly supports the automotive symbolic/use-case relation without relying on image inference.

## Current listing/commerce facts

All five:
- `status_name = Продается`;
- moderation `approved`;
- validation `success`;
- not archived / not autoarchived;
- current listed `price = 1700 RUB`;
- `min_price = 1450 RUB`;
- `old_price = 2200 RUB`;
- `volume_weight = 0.2`;
- Seller commission field reports `50% / 850 RUB` for FBO/FBS at the observed price;
- FBO delivery amount `25 RUB`, return amount `115 RUB`;
- FBS delivery amount `25 RUB`, return amount `192 RUB`.

Snapshot stocks in this call:

| Product | SKU | FBO present/reserved | FBS present/reserved |
|---|---:|---:|---:|
| Шлем Ужаса | 1602717077 | 7 / 0 | 50 / 0 |
| Vegvisir | 1602722942 | 14 / 0 | 31 / 0 |
| Велес | 1636041142 | 18 / 0 | 40 / 0 |
| Печать Велеса | 1636048691 | 192 / 1 | 50 / 0 |
| Алатырь | 1640251697 | 6 / 1 | 48 / 0 |

All five share Ozon `description_category_id=87515080`, `type_id=93733` in this result. This is a provider classification fact only; no semantic meaning is inferred from the numeric IDs without a category dictionary.

## Model-group observations

Direct provider facts:
- Шлем Ужаса + Vegvisir: model `733787648`, count `5`;
- Велес: model `869503489`, count `12`;
- Печать Велеса + Алатырь: model `869474151`, count `13`.

Do **not** infer identical physical construction from model membership alone.

## What product-info closed

Closed for Tier A 5/5:
- current marketplace product ID / SKU / offer ID;
- current seller listing title;
- current listing/moderation/validation state;
- current price fields;
- snapshot stocks;
- primary media reference;
- category/type provider IDs;
- model grouping;
- high-level commission fields.

Current passport completeness after this pass: **IDENTITY_COMMERCE**.

## Remaining decision-grade product gaps

`/v3/product/info/list` does not close the key physical/content passport fields required by the canonical Stage 06 schema. Still pending where available:
- material / finish;
- dimensions / weight details beyond provider `volume_weight`;
- cord / bead / hanging construction;
- package contents / package type;
- product attribute claims and seller-entered characteristics;
- any other Ozon attributes needed to distinguish Tier A products physically.

Therefore one targeted `seller_product_attributes` request for the same five SKUs is justified before moving into 06.4 buyer/performance linkage.

## Exact next command

```text
OZON_API_V1
{"operation":"seller_product_attributes","params":{"filter":{"sku":["1636048691","1636041142","1640251697","1602722942","1602717077"]},"last_id":"","limit":1000,"sort_by":"sku","sort_dir":"ASC"}}
```

No broad 76-SKU attributes pull is authorized at this point.
