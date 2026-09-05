# CAP-02 — Product visibility — FINAL

Canonical question:
`Какие товары из моего текущего каталога сейчас видимы покупателю, а какие нет или имеют ограничения видимости? Проверь это по отдельным данным Ozon о видимости, а не выводи из продаж или остатков.`

Result:
- Dedicated `product_visibility_info` surface used for all 76 current catalog SKUs.
- HTTP 200.
- `logical_business_result_count=1`, `physical_business_request_count=1`.
- `exact_request_preserved=true`, `command_transformed=false`.
- 76/76 returned `showcases_visibility="OZON"`.
- No current visibility-restricted SKU found on this surface.

Classification:
- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: NOT_NEEDED
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: NONE

Checkpoint: `CAP_02_PASS_CAP_03_READY`
