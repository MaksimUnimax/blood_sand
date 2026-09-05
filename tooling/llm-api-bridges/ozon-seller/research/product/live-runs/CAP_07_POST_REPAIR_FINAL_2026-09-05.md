# CAP-07 — Supply-order list/status — FINAL

Status: PASS

Canonical job: determine the seller's current active supply orders and current state of each without asking the operator to enumerate IDs.

Fresh evidence:
- `supply_order_status_counter` request `4f2fc721-1740-446c-817a-253b0d353de8`: HTTP 200, exact 1 logical / 1 physical, exact request preserved. Non-terminal counts: `IN_TRANSIT=4`, `ACCEPTANCE_AT_STORAGE_WAREHOUSE=1`; other non-terminal states are zero.
- `supply_order_list` request `6fd9cb28-9c39-4f3b-8271-d797ac250633`: HTTP 200, exact 1/1, returned five active order IDs and `last_id=""`: `125820894`, `125819631`, `125818485`, `125818083`, `122149074`.
- `supply_order_get` request `5a821150-f65f-4c16-b80d-07f5309306fe`: HTTP 200, exact 1/1, exact request preserved. Orders `125818083`, `125818485`, `125819631`, `125820894` are `IN_TRANSIT` with state updates around `2026-09-05T07:40:14Z`; order `122149074` remains `ACCEPTANCE_AT_STORAGE_WAREHOUSE`.

Lifecycle finding: compared with fresh STD-12 evidence, the four Aug-30 supplies progressed from `READY_TO_SUPPLY` to `IN_TRANSIT`; the older order `122149074` remains in storage-warehouse acceptance.

Classification: capability_recognition PASS; operation_or_cluster_selection PASS; discovery_help_usage_when_needed NOT_NEEDED; multi_run_orchestration PASS; business_answer PASS; operator_intervention_required NO; bridge_guidance_gap NONE.

Checkpoint: `CAP_07_PASS_CAP_08_READY`