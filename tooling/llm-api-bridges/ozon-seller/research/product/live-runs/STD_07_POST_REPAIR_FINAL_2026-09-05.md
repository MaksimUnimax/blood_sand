# STD-07 post-repair final — 2026-09-05

Business question: `Какие товары скоро закончатся, какие лежат слишком долго, что пополнять?`

Status: **PASS**

## Live reads

1. `stock_turnover_analytics` — request `df2beebf-fa3d-40ed-abbe-c9dbe30d03ee`, HTTP 200, one logical / one physical request.
2. `fbs_stock_by_warehouse` — request `87250817-20f5-4a09-8b57-1a6d7d55826f`, HTTP 200, 24/24 selected SKUs returned, `has_next=false`.
3. `fbo_stock_by_warehouse` — four explicit pages, requests:
   - `22f09192-be5b-4950-8d96-80621215357e`
   - `5e2177cc-e0db-4290-8b50-45dfdd8a1bee`
   - `2269cae4-6579-4204-ad15-0d57fc28a550`
   - `d1e9c5a4-f57c-4f5e-9ab9-c8ec99542e32`
   terminal page `has_next=false`.
4. `supply_order_list` — request `7a4385a8-24cd-46af-bc11-b4aec901d93e`, HTTP 200, five current unfinished order IDs, `last_id=""`.
5. `supply_order_get` — request `ed0f34d4-fd4c-4c09-971e-0b85ddd6ec3d`, HTTP 200, five order records and five exact bundle IDs.
6. `supply_order_bundle` — request `f1cfd2a9-2caa-4d61-9f67-6f908f6dd775`, HTTP 200, `total_count=23`, `has_next=false`.

## Source-semantics-preserving stock join

The selected 24 turnover-risk SKUs have:

- FBS free stock: **1026 units** in total, every selected SKU has **31–50** free units on the returned FBS warehouse surface.
- FBO present stock: **40 units** in total across the full explicit four-page FBO read.
- Combined current stock across these two separately preserved surfaces: **1066 units**.

Therefore the turnover surface must not be interpreted as total sellable inventory. The live rerun reconfirms the non-repeat control:

`DO_NOT_RECOMMEND_REPLENISHMENT_FROM_SINGLE_STOCK_SURFACE`

The main risk is FBO placement/coverage, not a broad procurement stockout.

## Active/inbound correlation

Among the 24 selected candidates, **12 SKUs / 112 units** are present in the currently active five supply bundles:

- 1720144370 — Дева — 1
- 2559748332 — Герб России — 8
- 2559437928 — Чур — 27
- 2183921966 — Сварог — 7
- 1842444165 — Родимич — 1
- 2183985513 — Перун — 8
- 1640306007 — Молвинец — 2
- 1640330072 — Громовик — 13
- 1640251697 — Алатырь — 26
- 1602717077 — Шлем ужаса / Эгисхьяльм — 8
- 1611643847 — Гунгнир — 1
- 1602722942 — Вегвизир — 10

The bundle response is flattened and does not identify which returned item belongs to which of the five bundle IDs; therefore evidence supports only `present in at least one current active bundle`, not exact per-order attribution.

## Current business interpretation

### FBO coverage gaps without current inbound coverage

The highest-priority placement candidates are SKUs with zero FBO stock and no match in the active bundle contents, while still having substantial FBS stock:

- 1720124782 — Стрелец — FBS free 43, FBO 0
- 1720141903 — Водолей — FBS free 42, FBO 0
- 1720148880 — Овен — FBS free 41, FBO 0
- 1720153914 — Рак — FBS free 42, FBO 0
- 1720160556 — Скорпион — FBS free 49, FBO 0
- 2186836116 — Скорпион (Античность) — FBS free 43, FBO 0
- 2186857668 — Лев (Античность) — FBS free 50, FBO 0
- 2271210394 — Близнецы (Символы) — FBS free 41, FBO 0

These are **FBO replenishment / redistribution** candidates from existing seller stock, not evidence of a procurement emergency.

Additional low-FBO / no-current-bundle candidates include:

- 1720151850 — Лев — FBS free 42, FBO 2
- 2271188511 — Лев (Символы) — FBS free 43, FBO 4
- 1720137256 — Весы — FBS free 43, FBO 4
- 2186766628 — Телец (Античность) — FBS free 41, FBO 1

### Slow / do-not-replenish signals from current turnover read

Do not increase stock merely because FBO is low when turnover says the product is materially overstocked or has no sales. Current turnover highlights included:

- 2186852750 — Козерог (Античность) — CRITICAL
- 1640326230 — Знич — CRITICAL
- 2184168890 — Хорс — CRITICAL
- 2271246783 — Козерог (Символы) — CRITICAL
- 1720155616 — Рыбы — CRITICAL
- 1640334195 — Всеславец — CRITICAL
- 2186846833 — Водолей (Античность) — CRITICAL
- 2271251938 — Овен (Символы) — CRITICAL
- 2186802133 — Весы (Античность) — NOSALES

## Final STD-07 verdict

**PASS.** The live evidence answers all three parts of the business question without collapsing incompatible stock surfaces:

- `скоро закончатся` → FBO placement gaps identified;
- `лежат слишком долго` → CRITICAL/NOSALES turnover items identified;
- `что пополнять` → prioritize FBO redistribution from existing FBS stock, account for already-active inbound bundles, and do not recommend broad external procurement from the single turnover surface.

Checkpoint: `STD_07_POST_REPAIR_PASS_NEXT_STD08_RUN1`
