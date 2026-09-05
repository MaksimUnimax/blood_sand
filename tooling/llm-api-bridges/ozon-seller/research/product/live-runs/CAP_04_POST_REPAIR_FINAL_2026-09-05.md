# CAP-04 — Current stock by warehouse — FINAL

Status: PASS

Canonical job: show current seller stock by warehouse using dedicated Ozon warehouse-stock data rather than inferring inventory from sales.

Evidence:
- FBO: one `fbo_stock_by_warehouse` read over all 76 current catalog SKUs returned HTTP 200, exactly one logical and one physical business request, terminal `has_next=false`. The known Bridge transport normalization occurred (`exact_request_preserved=false`, `command_transformed=true`); this is the previously observed accepted transport behavior for this operation, not a new defect.
- FBS: one `fbs_stock_by_warehouse` read over the same 76 SKUs returned HTTP 200, exactly one logical and one physical business request, terminal `has_next=false`. The same expected transport normalization occurred.

Findings:
- FBO data exposes per-SKU `warehouse_id`, `present`, and `reserved` values across Ozon warehouses.
- FBS data exposes per-SKU `warehouse_id`, `warehouse_name`, `present`, `reserved`, and `free_stock`.
- All returned FBS stock is on seller warehouse `1020001773680000` (`Златоуст Чёт`).
- FBS rows exist for 74 of 76 current catalog SKUs. SKU 1602711278 and 1602711870 are absent from the FBS stock response, consistent with the fresh CAP-01 catalog flags `has_fbs_stocks=false` for both.
- The dedicated stock surfaces also distinguish FBO-zero from FBS-positive cases, so lack of FBO stock must not be reported as complete seller stockout when FBS remains available.

Classification: capability_recognition PASS; operation_or_cluster_selection PASS; discovery_help_usage_when_needed NOT_NEEDED; multi_run_orchestration PASS; business_answer PASS; operator_intervention_required NO; bridge_guidance_gap NONE.

Operational: PASS_WITH_KNOWN_FBO_FBS_TRANSPORT_NORMALIZATION.

Checkpoint: `CAP_04_PASS_CAP_05_READY`