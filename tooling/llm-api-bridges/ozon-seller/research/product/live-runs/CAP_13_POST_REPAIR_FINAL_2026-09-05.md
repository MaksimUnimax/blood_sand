# CAP-13 — Finance balance / accruals — FINAL

Status: PASS

Canonical job:

`Сколько денег Ozon показывает в моём финансовом балансе за последние 30 полных календарных дней и какие финансовые начисления лежат за последним полным днём? Используй именно финансовые API Ozon: не называй выручку из аналитики продаж моим балансом или выплатой.`

## Evidence

Run 1 — `finance_balance`, request `39650bd1-0411-4ed9-9524-8b27ad57ee61`: HTTP 200, external request executed, exact request preserved, no command transformation, exactly one logical and one physical business request.

For `2026-08-06` through `2026-09-04` Ozon returned opening balance 167799.64 RUB, accrued 304470.33 RUB, payments -217600.14 RUB, and closing balance 254669.83 RUB. The balance identity reconciles exactly: 167799.64 + 304470.33 - 217600.14 = 254669.83 RUB. `cashflows.sales.amount=981932 RUB` is a separate sales-flow dimension and must not be represented as balance or payout.

Run 2 — `finance_accrual_by_day`, request `90fd8057-ebba-40c8-b5f3-9ecc74e620e0`: HTTP 200, external request executed, exact request preserved, no command transformation, exactly one logical and one physical business request, `last_id=""` so the 2026-09-04 accrual set is complete.

The complete day returned 75 accrual rows across provider categories `POSTING`, `ITEM`, and `NON_ITEM`. Summed provider `total_amount` values for the day equal 8286.30 RUB net: POSTING +15721.22 RUB, ITEM -232.48 RUB, NON_ITEM -7202.44 RUB. The rows expose real FBO/FBS postings, item fees, logistics/commission components, reversal-like negative posting entries, and non-item service charges.

## Classification

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE
- operational_reliability: PASS

Checkpoint: `CAP_13_PASS_CAP_14_READY`
