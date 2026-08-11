# Ozon Seller API — delivery check / checkout quote preflight — 2026-08-11

Статус: **CURRENT CONTOUR / CONDITIONAL MANUAL DIAGNOSTIC CANDIDATE / NOT BASELINE AUTO-CALL / FULL CONTRACT + PII/SIDE-EFFECT REVIEW PENDING**

## Why this surface is separate

After Ozon retired aggregate `Average Delivery Time` analytics, current Ozon-owned evidence shows a different delivery contour used before order creation:

1. `/v1/delivery/check` — availability/check step;
2. `/v2/delivery/checkout` — delivery-options/quote step;
3. `/v2/order/create` — order creation mutation.

This workflow proves that `delivery/check` and `delivery/checkout` belong to order/delivery preflight, not ordinary background seller analytics.

## `/v1/delivery/check`

Ozon-owned notification evidence:

- 2025-12-30: method description and request `client_phone` description updated;
- 2026-02-12: `client_phone` marked required.

Current implications:

- the operation requires customer/contact data at least in the documented request surface;
- it must not be automatically invoked for every product/warehouse during seller baseline analytics;
- any future bridge exposure requires a PII minimization/review rule and explicit user intent.

Still pending:

- HTTP verb;
- full request/response;
- exact purpose/availability semantics;
- whether any request form can be used without unnecessary PII;
- permissions/rate limits;
- side-effect classification.

## `/v2/delivery/checkout`

Ozon-owned currentness evidence:

- 2025-12-30: method description added/updated in Ozon Logistics workflow;
- 2026-07-09: method error body documentation updated;
- 2026-08-06: Ozon announced that the method now returns **preliminary delivery service cost in addition to preliminary delivery time**.

Ozon community workflow evidence from 2026 places it between `delivery/check` and `order/create` and shows that its result supplies delivery-option identifiers such as warehouse/delivery method/timeslot used by the later order-create operation.

Known business role:

- delivery option / quote calculation before order creation;
- prospective delivery time and service-cost evidence for a concrete delivery scenario.

This is not historical realized delivery performance and is not a direct replacement for retired Average Delivery Time analytics.

## Safety / architecture classification

Current project disposition:

- candidate class: `conditional_manual_delivery_quote`;
- automatic seller-wide execution: **FORBIDDEN**;
- hidden fan-out across SKUs/regions: **FORBIDDEN**;
- real customer PII in LLM result/log: **FORBIDDEN**;
- order creation `/v2/order/create`: **OUTSIDE INITIAL READ-ONLY SCOPE**;
- mutation methods are not unlocked by the existence of quote/check methods.

Before provider inclusion we must determine from current Ozon-owned full docs:

1. HTTP verb for check/checkout;
2. complete request schema;
3. minimum data required;
4. complete response fields, including preliminary time/cost;
5. whether check/checkout have any reservation/session/server-side state side effects;
6. token/account access restrictions;
7. rate limits;
8. data retention/privacy implications;
9. exact relationship to Ozon Logistics / Retail order workflows and whether it is applicable to marketplace seller diagnostics.

## Diagnostic use if later approved

Possible explicit use case:

> Given a user-authorized delivery destination/scenario, check whether Ozon currently offers delivery for the selected SKU/order context and return the preliminary time/cost/options.

It must **not** be used as evidence that ordinary marketplace customers broadly see the same availability or delivery promise without matching input context.

## Gate impact

This surface improves the map of current delivery capabilities but does not close the logistics gate. It is optional/conditional and cannot substitute for seller-wide realized delivery analytics.

03A.3 remains open; 03A.4 remains not started.
