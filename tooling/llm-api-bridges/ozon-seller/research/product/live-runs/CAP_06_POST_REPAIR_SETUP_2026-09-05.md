# CAP-06 — Ozon warehouses / clusters / logistics geography — SETUP

Status: ACTIVE

Canonical job:

`Какие кластеры и FBO-склады Ozon относятся к моей текущей логистической географии? Покажи справочные кластеры и названия складов, чтобы можно было сопоставить их с warehouse_id из моих текущих остатков, а не оставлять только числовые ID.`

Capability target: prove the worker recognizes Ozon warehouse/cluster/logistics reference data as a distinct Bridge surface and can use it to interpret warehouse IDs from stock/supply evidence.

Fresh context: CAP-04 produced current FBO warehouse-level stock rows containing Ozon warehouse IDs and FBS stock on seller warehouse `1020001773680000` (`Златоуст Чёт`).

Planned sequence:
1. read `cluster_list` as the cluster/geography reference surface;
2. read the relevant Ozon/FBO warehouse reference surface with explicit contract-safe parameters rather than the provider-rejected empty `ozon_warehouse_list {}` pattern observed in STD-10;
3. correlate locally with current warehouse IDs where possible.

Checkpoint: `CAP_06_ACTIVE_RUN_1_CLUSTER_LIST_NEXT`
