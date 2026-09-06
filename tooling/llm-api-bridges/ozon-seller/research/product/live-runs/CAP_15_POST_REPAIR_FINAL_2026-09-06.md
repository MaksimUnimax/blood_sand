# CAP-15 — Seller ratings / FBS error index — FINAL

Status: PASS

Canonical job:

`Как Ozon сейчас оценивает мой кабинет продавца: какие рейтинги и пороги у меня действуют и есть ли проблемы по индексу ошибок FBS/rFBS? Если индекс ошибок ненулевой или Ozon показывает проблемный период, найди конкретные отправления, которые на него повлияли. Используй отдельные rating/error-index API Ozon, а не выводы из продаж, возвратов или отзывов.`

## Live evidence

### Run 1 — seller_rating_summary
- request_id: `97c239b2-74c3-4af0-80d0-6bbf2e992846`
- HTTP 200; exact request preserved; command not transformed; logical/physical = 1/1.
- Product review score: 4.99, status OK.
- Progressive FBS/rFBS indicator: 0, status OK.
- FBS complaints: 0, status OK.
- `penalty_score_exceeded=false`.
- Provider also returned several `UNKNOWN_STATUS` metrics; these are preserved as unknown and are not reinterpreted as confirmed healthy zeros.

### Run 2 — seller_fbs_error_index
- request_id: `f8fd3ab1-7bd5-45aa-9139-da7064abfa7a`
- HTTP 200; exact request preserved; command not transformed; logical/physical = 1/1.
- Current aggregate `index=0`.
- `processing_costs_sum=0`.
- Provider period: `2026-08-23` through `2026-09-06`.
- Historical daily `index_by_date` was nonzero on 2026-08-23 through 2026-09-05, while 2026-09-06 is 0.

### Run 3 — seller_fbs_error_postings
- request_id: `e482ae44-ed45-4e42-b4ca-418b102dc2fd`
- requested relevant period: `2026-08-23T00:00:00Z` through `2026-09-05T23:59:59Z`.
- HTTP 200; exact request preserved; command not transformed; logical/physical = 1/1.
- `errors=[]`, `cursor=""`, `has_next=false`.

## Business conclusion

The current FBS/rFBS error index is zero and Ozon exposes no current contributing postings through the dedicated posting-detail surface. Historical daily index values existed during the returned period, but the worker must not invent specific guilty postings when the provider now returns an explicit terminal empty detail set.

Current actionable state: no FBS/rFBS error-index burden is evidenced at the observation point.

## Capability score

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE
- operational_reliability: PASS

Checkpoint: `CAP_15_PASS_CAP_16_READY`
