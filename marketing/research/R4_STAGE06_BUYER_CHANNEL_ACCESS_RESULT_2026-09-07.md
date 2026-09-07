# R4 — Stage 06 buyer-channel access result — 2026-09-07

Status: **06.4 ACTIVE — direct Ozon review channel BLOCKED; question channel not yet tested**

## What was tested

One exact read-only `review_list` request was sent for the five Tier A SKUs:
- Печать Велеса — `1636048691`
- Велес — `1636041142`
- Алатырь — `1640251697`
- Вегвизир — `1602722942`
- Шлем Ужаса / Эгисхьяльм — `1602717077`

Request id: `5649ec00-ecdb-437c-951d-f9edaddf9244`.

## Result

- external Seller API request executed: **true**;
- HTTP: **403**;
- category: `auth_or_permission`;
- automatic retry: false;
- no buyer review text returned.

Canonical raw evidence:
- `marketing/data/raw/marketplace/ozon/20260907__ozon__review-list__tier-a5__provider-403.md`

## Classification

`CURRENT_DIRECT_OZON_REVIEW_READ = BLOCKED_BY_PROVIDER_PERMISSION`

Do not classify this as:
- zero reviews;
- no buyer interest;
- local personal-data gate failure;
- proven absence of Premium Pro.

B9 contract authority establishes that `POST /v2/review/list` may be available through either the separate Ozon subscription `Управление отзывами` or Premium Pro. Because the bridge intentionally represents that entitlement alternative as unresolved, the provider 403 is authoritative only for the fact that this exact current credential/request combination is not permitted.

## Stage 06 consequence

06.4 continues. The blocked review channel does not invalidate:
- existing analog/category customer evidence in `CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`;
- preserved historical seller performance;
- Tier A product-info/attributes evidence.

The next direct buyer channel to test is `question_list`, which is a separate endpoint and permission surface. It has no SKU filter; therefore, if available, its returned questions must be joined to owned products only from fields actually returned by Ozon. No inferred SKU linkage is allowed.

If `question_list` is also unavailable, direct current Ozon buyer-text evidence for Stage 06 will be explicitly closed as blocked and the stage will proceed using the preserved analog customer evidence plus seller-side product/performance facts, with provenance kept separate.
