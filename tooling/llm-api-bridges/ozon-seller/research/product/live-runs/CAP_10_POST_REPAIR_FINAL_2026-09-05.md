# CAP-10 — Prices / price details — FINAL

Status: PASS_WITH_ENTITLEMENT_BOUNDARY

Canonical job:

`Какие текущие цены установлены на товары моего каталога? Покажи цену по каждому SKU и выдели позиции, где Ozon отдаёт разные типы цены, скидочные или иные ценовые признаки. Используй отдельные данные Ozon о ценах, а не продажи или ручной экспорт.`

## Evidence

Run 1 intentionally exercised the detailed price surface `product_price_details` (`POST /v1/product/prices/details`). The Bridge capability probe returned HTTP 200, identified the endpoint as `PREMIUM_PRO`-only, and stopped before any business request: `SUPPORTED_BUT_NOT_ENTITLED`, `external_request_executed=false`, logical/physical business requests `0/0`. Full evidence and diagnosis are preserved in `CAP_10_RUN_01_ENTITLEMENT_BOUNDARY_2026-09-05.md`.

Run 2 recovered to the distinct all-account current-price surface `product_prices_bulk` (`POST /v5/product/info/prices`). It returned HTTP 200, external request executed, exactly one logical and one physical business request, exact request preserved, no command transformation, `total=76`, and all 76 current catalog products fit the single `limit=100` page. The response materialized seller offer/product identity, current and marketing seller price, minimum price, old price, price indexes, commissions, and marketing-action metadata.

CAP-01 remains the fresh catalog identity authority for the 76 current SKU/offer mappings, so the returned price rows can be joined to the current SKU inventory without asking the operator to manually enumerate products again.

## Business findings

- The two legacy cards `Чётки - Талисман в машину "RSOTM".` and `Чётки - Талисман в машину "Soldier Of Fortune".` are a clear price outlier group in the returned catalog: `price=580 RUB`, `marketing_seller_price=580`, `min_price=580`, `old_price=800`, with `color_index=WITHOUT_INDEX`.
- The main assortment represented in the price response uses `price=1700 RUB` / `marketing_seller_price=1700` with `old_price=2200`; the provider also exposes per-product `min_price` and price-index data rather than forcing price inference from sales.
- Example: `Чётки - Талисман в машину "Бусидо - Путь Воина".` has `price=1700`, `min_price=1450`, `old_price=2200`, and `color_index=SUPER`.
- Example exception within the 1700-RUB assortment: `Знак зодиака "Стрелец" (Символы)` has `min_price=1500` while current price remains `1700`.
- The current-price response also surfaces marketing-action memberships/metadata; CAP-11 will test promotions as their own dedicated capability rather than treating this embedded block as a substitute for the promotion APIs.

Do not interpret the Premium Pro restriction as inability to answer ordinary current-price questions: the all-account `/v5/product/info/prices` surface is sufficient for the base pricing job. Conversely, do not claim access to the richer `/v1/product/prices/details` surface on this account.

## Classification

- capability_recognition: PASS
- operation_or_cluster_selection: PASS_WITH_RECOVERY
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE
- operational_reliability: PASS

The initial detailed-price choice crossed a real subscription boundary, but the Bridge detected it before any business call and the job was preserved and completed through the correct all-account price surface instead of being skipped.

Checkpoint: `CAP_10_PASS_WITH_ENTITLEMENT_BOUNDARY_CAP_11_READY`
