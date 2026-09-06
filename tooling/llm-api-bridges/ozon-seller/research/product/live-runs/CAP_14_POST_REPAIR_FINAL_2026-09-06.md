# CAP-14 — Finance transactions / reconciliation — FINAL

Status: PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY

Canonical job:

`По отправлению 0140839416-0012-1 цена продажи была 1700 ₽, но это не означает выплату продавцу. Сверь все финансовые начисления Ozon по этому posting и объясни итог после комиссий, логистики и отдельных fee-строк. Если в начислениях есть только type_id, расшифруй их через финансовый справочник Ozon. Не используй выключенный старый transaction-list как будто он ещё текущий.`

## Evidence

Run 1 — `finance_accrual_postings`, request `d8be67b6-2b60-4fa3-af8f-93c7723934ce`: HTTP 200, exact request preserved, one logical and one physical business request. For posting `0140839416-0012-1`, provider returned three posting-specific accrual components for SKU `1623753672`: type 98 = -25 RUB, type 69 = -714 RUB, type 32 = -70 RUB.

Run 2 — `finance_accrual_types`, request `bb0dc017-e6c3-4ece-afdb-36ea830f0b3d`: provider HTTP 429, Retry-After 1, external request executed, exact request preserved, no automatic retry. Full failure evidence was persisted separately.

Run 2 retry 1 — `finance_accrual_types`, request `95503d26-17cc-4e77-bfbf-fc1a079dcf27`: same provider HTTP 429 under the same exact request. Full failure evidence was persisted separately.

Run 2 retry 2 — `finance_accrual_types`, request `14e4eeb7-a9f8-4418-b0c7-216e4d7d66da`: HTTP 200, exact request preserved, one logical and one physical business request. Required type mapping was returned:
- 1 = `Acquiring` / `Эквайринг`;
- 32 = `Logistic` / `Логистика`;
- 69 = `SaleCommission` / `Вознаграждение за продажу`;
- 98 = `DeliveryToHandoverPlaceByOzon` / `Доставка до места выдачи силами Ozon`.

Frozen CAP-13 day evidence for the same posting also contains a separate ITEM accrual `61944769016` of -6.19 RUB with type 1.

## Reconciliation

Posting sale amount: 1700 RUB.

Posting-level components from `finance_accrual_postings`:
- SaleCommission: -714 RUB;
- Logistic: -70 RUB;
- DeliveryToHandoverPlaceByOzon: -25 RUB.

`1700 - 714 - 70 - 25 = 891 RUB`.

Separate day-level ITEM fee:
- Acquiring: -6.19 RUB.

Final reconciled net for the posting on 2026-09-04:

`891 - 6.19 = 884.81 RUB`.

Therefore seller price/revenue is not the payout/net. The current accrual replacement surfaces reproduce the financial mechanics without using sunset `finance_transaction_list_v3`.

## Classification

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE
- notes: two consecutive provider 429 responses occurred on `finance_accrual_types`; the third identical explicit run succeeded. This is recorded as transient provider rate limiting, not a semantic or entitlement failure.

Checkpoint: `CAP_14_PASS_CAP_15_READY`
