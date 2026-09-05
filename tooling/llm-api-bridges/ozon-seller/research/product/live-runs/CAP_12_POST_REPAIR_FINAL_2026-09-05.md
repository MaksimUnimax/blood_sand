# CAP-12 — Returns / cancellations — FINAL

Status: PASS

Canonical job:

`Какие возвраты сейчас есть у меня на Ozon, по каким товарам и в каких статусах/состояниях они находятся? Отдельно разберись с отменами: не подменяй справочник возможных причин отмены списком фактически отменённых заказов и не выдумывай отмену без order/posting evidence.`

## Evidence

Run 1 — `returns_list`, request `f143d826-a4ae-4653-a35a-e831658d6579`: HTTP 200, exact request preserved, one logical and one physical business request, 500 records, `has_next=true`; last returned id `1001147799`.

Run 2 — explicit continuation `returns_list` from `last_id=1001147799`, request `19f5e415-cd4a-43d0-89f6-4ec3c7ed1883`: HTTP 200, one logical and one physical business request, 470 records, `has_next=false`. Bridge applied request normalization (`exact_request_preserved=false`, `command_transformed=true`) while preserving the continuation result and single-request invariant.

The two pages therefore cover 970 returned records without silent truncation.

## Findings

- Provider records include actual return/cancellation evidence with `order_number` and `posting_number`; a generic cancellation-reason dictionary was not needed to prove actual cancellations.
- Returned types across the complete read: 906 `Cancellation`, 38 `ClientReturn`, 25 `FullReturn`, 1 `PartialReturn`; 590 FBO and 380 FBS records.
- Current visual states across the returned history include 911 `На складе Ozon`, 29 `Получен`, 15 `Списали товар`, 9 `Едет на склад Ozon`, 3 `Ожидает отправки`, 1 `Деньги возвращены`, 1 `Ищем товар`, 1 `Едет к вам`.
- There are 14 presently non-terminal/in-motion style records by provider status: 9 moving to an Ozon warehouse, 3 waiting shipment, 1 potentially lost and 1 moving to seller.
- Recent examples include `Мара` (`Ожидает отправки`, posting `07620247-0899-1`), `Стрелец (Античность)` (`Едет на склад Ozon`, posting `0116171458-0495-1`) and `Молвинец` (`ClientReturn`, `Ожидает отправки`, posting `41152385-0600-1`, return date 2026-09-04).
- The worker preserved the semantic boundary between actual cancellation rows and reference-only possible cancellation reasons.

## Classification

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE
- operational_reliability: PASS

Checkpoint: `CAP_12_PASS_CAP_13_READY`
