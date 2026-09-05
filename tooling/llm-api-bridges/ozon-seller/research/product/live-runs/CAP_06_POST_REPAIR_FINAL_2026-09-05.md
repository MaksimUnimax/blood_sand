# CAP-06 — Ozon warehouses / clusters / logistics geography — FINAL

Status: PASS

Canonical job:

`Какие кластеры и FBO-склады Ozon относятся к моей текущей логистической географии? Покажи справочные кластеры и названия складов, чтобы можно было сопоставить их с warehouse_id из моих текущих остатков, а не оставлять только числовые ID.`

Evidence:
- Run 1 `cluster_list`, request `0092c110-ea90-4b4f-9424-bf98d98ce9aa`: HTTP 200, external request executed, exact request preserved, 1 logical / 1 physical. Returned Ozon fulfillment warehouse reference data grouped by macrolocal cluster and country.
- This reference resolves FBO `warehouse_id` values from CAP-04 into names/clusters, e.g. `1020000890160000` = `ХАБАРОВСК_2_РФЦ` / Дальний Восток; `18044249781000` = `САНКТ-ПЕТЕРБУРГ_РФЦ`; `23843917228000` = `ПУШКИНО_1_РФЦ`; `1020003110535000` = `РОСТОВ_НА_ДОНУ_2_РФЦ`.
- Run 2 `fbo_seller_warehouse_list`, request `6eebc4aa-ba78-4810-af64-84f7bc72f0fe`: HTTP 200, exact request preserved, 1 logical / 1 physical. Returned one active seller warehouse `Златоуст`, seller_warehouse_id `1020005000290131`, Челябинская region, macrolocal_cluster_id `4009`.

Semantic boundary:
- `seller_warehouse_id` from the seller-specific warehouse surface is a different identifier/entity from FBO fulfillment `warehouse_id` returned by the FBO stock surface and cluster reference.
- Do not join these ID namespaces directly. The current FBO-stock geography is mapped through `cluster_list`; seller warehouse `Златоуст` is preserved separately as seller-specific logistics metadata.

Classification: capability_recognition PASS; operation_or_cluster_selection PASS; discovery_help_usage_when_needed NOT_NEEDED; multi_run_orchestration PASS; business_answer PASS; operator_intervention_required NO; bridge_guidance_gap NONE.

Checkpoint: `CAP_06_PASS_CAP_07_READY`
