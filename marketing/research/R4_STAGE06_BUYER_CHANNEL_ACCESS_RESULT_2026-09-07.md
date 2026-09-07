# R4 — Stage 06 buyer-channel access result — 2026-09-07

Status: **06.4 DIRECT OZON BUYER-TEXT ACCESS CLOSED — BLOCKED**

## Review channel

One exact read-only `review_list` request was sent for the five Tier A SKUs:
- Печать Велеса — `1636048691`
- Велес — `1636041142`
- Алатырь — `1640251697`
- Вегвизир — `1602722942`
- Шлем Ужаса / Эгисхьяльм — `1602717077`

Request id: `5649ec00-ecdb-437c-951d-f9edaddf9244`.

Result:
- external Seller API request executed: **true**;
- HTTP: **403**;
- category: `auth_or_permission`;
- automatic retry: false;
- buyer review text returned: **0 because access was denied**.

Classification:

`CURRENT_DIRECT_OZON_REVIEW_READ = BLOCKED_BY_PROVIDER_PERMISSION`

This does not prove zero reviews, no buyer interest, a local personal-data gate failure, or the exact missing entitlement.

Canonical raw evidence:
- `marketing/data/raw/marketplace/ozon/20260907__ozon__review-list__tier-a5__provider-403.md`

The same request must not be retried without a permission-state change.

## Question channel

One exact read-only `question_list` attempt was made newest-first with limit 100.

Request id: `capability-967db1fe-1c3c-4d84-af6d-cdc6c92ce091`.

Capability result:
- capability probe performed: **true**;
- capability probe HTTP: **200**;
- capability status: `known`;
- subscription type: `UNSPECIFIED`;
- `is_premium=false`;
- endpoint requires: `PREMIUM_PLUS`;
- entitlement status: `SUPPORTED_BUT_NOT_ENTITLED`;
- external business request executed: **false**;
- physical business request count: **0**;
- error code: `SUBSCRIPTION_REQUIRED`;
- stage: `capability_planning`.

Classification:

`CURRENT_DIRECT_OZON_QUESTION_READ = BLOCKED_BY_SUBSCRIPTION`

This is not evidence of zero questions. The provider business request was not sent because the bridge correctly failed closed before execution.

Canonical raw evidence:
- `marketing/data/raw/marketplace/ozon/20260907__ozon__question-list__subscription-block.md`

No retry is authorized unless subscription/capability state changes.

## Combined direct buyer-text verdict

`CURRENT_DIRECT_OZON_BUYER_TEXT = BLOCKED`

Two different mechanisms are preserved separately:
- reviews: provider-side permission/auth denial after real request;
- questions: pre-execution entitlement denial after successful capability probe.

They must not be collapsed into one invented cause.

## Evidence retained for Stage 06

The blocked current Ozon buyer-text channels do not invalidate:
- existing analog/category customer evidence in `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`;
- preserved historical Ozon seller performance;
- current Tier A product-info/attributes evidence.

Stage 06 therefore continues with those evidence classes kept separate. Sales/performance must not be interpreted as buyer motive.

Next: normalize the existing customer themes and preserved historical seller performance into the Stage-06 canonical customer/performance layers, then decide targeted Tier B/C enrichment from concrete remaining decision gaps.
