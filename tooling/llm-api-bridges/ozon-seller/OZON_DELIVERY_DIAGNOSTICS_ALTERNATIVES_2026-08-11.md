# Ozon Seller API — current delivery diagnostics alternatives after Average Delivery Time retirement — 2026-08-11

Статус: **CURRENT FAMILY EVIDENCE / NOT A ONE-TO-ONE REPLACEMENT / FULL CONTRACTS PENDING**

## Context

Ozon fully retired the `Average Delivery Time` analytics functionality in 2026. Its former methods must not be targeted by 03A.4.

This pass searched Ozon-owned Seller API notifications for other current read families that can still explain delivery-related sales problems without pretending there is a direct replacement.

## 1. FBS/rFBS error index

Current family evidence:

- `/v1/rating/index/fbs/info`;
- `/v1/rating/index/fbs/posting/list`.

Lifecycle evidence:

- 2025-11-20: added as beta methods for the FBS/rFBS error index;
- 2026-02-02: moved from beta to the main Seller API section.

Diagnostic role:

- seller-level / posting-level FBS/rFBS error-index evidence;
- identify operational quality/error conditions that may suppress or degrade seller performance even when stock remains positive;
- join error evidence to postings only after full identifier/schema contract is extracted.

Still pending:

- HTTP verbs;
- request filters;
- exact rating/error index metrics and status model;
- posting identifiers and pagination/history;
- permissions/rate limits;
- current pre-coding deprecation recheck.

## 2. Products with FBS delivery restrictions

Current family evidence:

- `/v1/warehouse/invalid-products/get` — products with FBS delivery restrictions;
- `/v1/warehouse/warehouses-with-invalid-products` — warehouses containing products with FBS delivery restrictions.

Lifecycle evidence:

- 2025-12-15: added as beta read methods;
- 2026-02-02: moved from beta to the main Seller API section.

Diagnostic role:

- distinguish `stock exists` from `product cannot be normally delivered from this warehouse`;
- identify warehouse/product delivery restrictions before blaming demand, advertising or conversion;
- provide a direct product/warehouse restriction layer next to stock and delivery-method configuration.

Still pending:

- HTTP verbs;
- request identifiers/filters;
- response product/warehouse ids and restriction reasons/statuses;
- pagination;
- FBS-only vs broader scheme semantics;
- permissions/rate limits.

## 3. FBS posting delivery-promise fields

Ozon Seller API notification on 2026-03-17 updated the descriptions of these response fields for current `/v3/posting/fbs/get`:

- `result.analytics_data.client_delivery_date_begin`;
- `result.analytics_data.client_delivery_date_end`.

`/v3/posting/fbs/get` remains a current target family in later 2026 notification evidence.

Diagnostic role:

- posting-level promised delivery window for FBS;
- useful for comparing order outcome against promised dates where current full contract confirms semantics;
- this is **not** aggregate Average Delivery Time analytics and must not be presented as its replacement.

Boundary:

- do not assume the same fields exist in `/v4/posting/fbs/list` until its full current contract is extracted;
- do not transfer old `/v2/posting/fbo/*` delivery-date fields into current `/v3/posting/fbo/*` without direct current evidence.

## 4. Correct causal model after retirement

Current delivery-related evidence can be split into distinct layers:

`warehouse/product stock`
→ `delivery-method configuration`
→ `product/warehouse delivery restrictions`
→ `FBS/rFBS error index`
→ `carriage/shipment configuration`
→ `posting delivery promise where confirmed`
→ `posting/order outcome`.

This is a diagnostic evidence graph, not an automatic API fan-out plan.

## 5. Gate impact

These families materially reduce the delivery-diagnostics blind spot after Average Delivery Time retirement, but they do **not** close 03A.3 because full contracts and history/access limits are still unavailable in the current docs runtime.

They may enter the research candidate registry as current families pending full contract extraction. They may not enter a production provider allowlist until the 03A.3 contract gate is satisfied.
