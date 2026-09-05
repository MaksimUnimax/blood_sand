# CAP-09 — FBO postings/orders — FINAL

Status: PASS

Canonical job: identify all FBO orders/postings created during 2026-09-04 and report posting/order, product, quantity, current status, and fulfillment warehouse using the dedicated FBO posting surface.

Evidence:
- Run 1 `posting_fbo_list` for `2026-09-04T00:00:00Z..2026-09-05T00:00:00Z`: HTTP 200, exact request preserved, 1 logical / 1 physical request, `has_next=false`; returned 18 postings representing 17 orders and 18 units. Warehouse evidence was not present because `analytics_data` was not requested.
- Run 2 repeated the same period with `with.analytics_data=true`: HTTP 200, exact request preserved, 1 logical / 1 physical request, `has_next=false`; returned the same 18 postings and materialized `warehouse_id` + `warehouse_name` for every posting.

Current status distribution across the 18 postings:
- `delivering`: 11
- `awaiting_deliver`: 5
- `awaiting_packaging`: 2

Representative warehouse evidence:
- Даждьбог `2184932293` -> `ХАБАРОВСК_2_РФЦ` (`1020000890160000`)
- Хорс `2184168890` -> `ПУШКИНО_1_РФЦ` (`23843917228000`)
- Триглав `1640264403` -> `РОСТОВ_НА_ДОНУ_2_РФЦ` (`1020003110535000`)
- Водолей (Античность) `2186846833` -> `САНКТ-ПЕТЕРБУРГ_РФЦ` (`18044249781000`)

No aggregate Seller Analytics inference was used for order/posting evidence.

Classification: capability_recognition PASS; operation_or_cluster_selection PASS; discovery_help_usage_when_needed NOT_NEEDED; multi_run_orchestration PASS; business_answer PASS; operator_intervention_required NO; bridge_guidance_gap NONE.

Checkpoint: `CAP_09_PASS_CAP_10_READY`
