# CAP-08 — Supply-order details / acceptance — FINAL

Status: PASS

Canonical job: drill from active supply order 122149074 into supply-level acceptance details rather than relying only on parent order status.

Evidence: one `supply_order_details` read returned HTTP 200 with exactly one logical and one physical business request; exact request preserved; no command transform.

Findings:
- parent order state: `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- supply id: `2000062599609`;
- supply state: `ACCEPTED_AT_STORAGE_WAREHOUSE`;
- bundle id: `019feae9-0fbe-75af-8f63-b9df1ca38840`;
- `storage_warehouse = null`;
- `is_crossdock = true`;
- `overdue_reason = UNSPECIFIED`;
- `macrolocal_cluster_id = 4002`.

Important semantic distinction: parent order lifecycle remains broader `ACCEPTANCE_AT_STORAGE_WAREHOUSE` while the nested supply itself is already `ACCEPTED_AT_STORAGE_WAREHOUSE`.

Classification: capability_recognition PASS; operation_or_cluster_selection PASS; discovery_help_usage_when_needed NOT_NEEDED; multi_run_orchestration PASS; business_answer PASS; operator_intervention_required NO; bridge_guidance_gap NONE.

Checkpoint: `CAP_08_PASS_CAP_09_READY`