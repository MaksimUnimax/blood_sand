# CAP-17 — Advertising campaigns — FINAL

Status: PASS

Canonical job:

`Какие рекламные кампании Ozon у меня сейчас есть и какие из них активны, остановлены или завершены? Покажи campaign ID, тип/объект рекламы и текущий state из Performance API; не пытайся выводить список кампаний из расходов Seller Analytics.`

## Live result

Operation: `performance_campaigns` (`GET /api/client/campaign`).

Provider reported total: **1128 campaigns**.

Pagination was completed explicitly with `pageSize:100`:
- pages 1..11: full 100-item pages;
- page 12: **28 items**;
- arithmetic terminal check: `11 * 100 + 28 = 1128`.

Every page preserved the benchmark invariant for the logical command that produced it: `logical_business_result_count=1`, `physical_business_request_count=1`, provider HTTP 200, `SUPPORTED_AND_ENTITLED`, exact request preserved, no command transformation.

Observed provider state classes across the inventory include `CAMPAIGN_STATE_RUNNING`, `CAMPAIGN_STATE_INACTIVE` and `CAMPAIGN_STATE_ARCHIVED`. The worker must preserve these provider states rather than infer state from spend. The inventory also demonstrated multiple advertising object/payment families, including SKU campaigns, banners, order-payment/search-promo campaigns and provider-generated `REF_VK` rows.

No operator-supplied campaign IDs were required. No Seller Analytics sales surface was used as a substitute for campaign inventory. No hidden autopagination was used.

## Scoring

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE
- operational_reliability: PASS

Checkpoint: `CAP_17_PASS_CAP_18_READY`
