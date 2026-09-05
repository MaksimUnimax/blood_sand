# CAP-11 — Promotions/actions — FINAL

Status: PASS

Canonical job:

`Какие акции и скидочные механики продавца сейчас активны в моём кабинете Ozon и какие товары реально участвуют в них? Используй отдельные promotion/action API Ozon, а не только встроенный блок marketing_actions из ответа по ценам.`

## Evidence

Run 1 — `seller_actions_list`, request `f09bfda2-f7a3-42da-8e42-7b832a38f602`: HTTP 200, exactly one logical and one physical business request. Ozon returned three ACTIVE seller actions. The Bridge applied transport/request normalization (`exact_request_preserved=false`, `command_transformed=true`) while preserving the single-request invariant and successful business result.

Run 2 — `seller_action_products` for action `4096949`, request `48fb0a21-52a9-4cc7-b161-2f938f6b30b9`: HTTP 200, exact request preserved, one logical and one physical business request, 76 active products, `has_next=false`.

Run 3 — `seller_action_products` for action `4069431`, request `60ba861d-cca1-4946-9a54-e4d87e17aeb9`: HTTP 200, exact request preserved, one logical and one physical business request, 76 active products, `has_next=false`.

## Findings

- `4096949` — `Скидка 1700`: ACTIVE `VOUCHER_DISCOUNT`, seller participates, `sku_count=76`; dedicated product read confirms all 76 current catalog products participate and are active.
- `4069431` — `Промо на всякий 2 не исп`: ACTIVE `VOUCHER_DISCOUNT`, seller participates, `sku_count=76`; dedicated product read again confirms all 76 current catalog products participate and are active.
- `2064767` — `Автоакция. Рассрочка 0-0-6 #1742100345`: ACTIVE `INSTALLMENT`, but `is_participated=false` and `sku_count=0`; it is an available/active mechanism, not a currently participating seller promotion.
- Promo product data exposes actual action pricing: the two 580 RUB products have `action_price=6`, while the 1700 RUB assortment has `action_price=17`, with provider-reported `discount_percent=99`.

## Classification

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE
- operational_reliability: PASS

Checkpoint: `CAP_11_PASS_CAP_12_READY`
