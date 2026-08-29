# Ozon Seller workflow / report / document inventory — 2026-08-29

Status: `WORKFLOW_REPORT_DOCUMENT_CANDIDATE_UNIVERSE_BUILT_EXACT_SCHEMA_DECISIONS_PENDING`

## Counts

- Seller master rows: **463**.
- Accepted Step3 Seller aliases: **191**.
- Step5 candidate rows: **203**.
- Candidates already represented by accepted Step3 aliases: **85**.
- Candidate rows still requiring exact-schema decision: **118**.
- Accepted direct single reads in this candidate surface: **85**.
- Accepted explicit workflow read steps: **0**.

## Historical accepted workflow/report/document carry-forward

- B24: `supply_order_act_accept_status` → `POST /v1/supply-order/act/accept/status`
- B24: `supply_order_act_product_get` → `POST /v1/supply-order/act/product/get`
- B24: `supply_order_act_summary_get` → `POST /v1/supply-order/act/summary/get`
- B24: `supply_order_cancel_status` → `POST /v1/supply-order/cancel/status`
- B24: `supply_order_content_update_status` → `POST /v1/supply-order/content/update/status`
- B24: `supply_order_content_update_validation` → `POST /v1/supply-order/content/update/validation`
- B24: `supply_order_pass_status` → `POST /v1/supply-order/pass/status`
- B24: `supply_order_timeslot_status` → `POST /v1/supply-order/timeslot/status`
- B37: `removal_from_stock_list` → `POST /v1/removal/from-stock/list`
- B37: `removal_from_supply_list` → `POST /v1/removal/from-supply/list`
- B40: `finance_balance` → `POST /v1/finance/balance`
- B40: `finance_realization_by_day` → `POST /v1/finance/realization/by-day`
- B40: `finance_realization_posting` → `POST /v1/finance/realization/posting`
- B40: `finance_realization_v2` → `POST /v2/finance/realization`
- B5: `report_info` → `POST /v1/report/info`
- B5: `report_list` → `POST /v1/report/list`

B5/B24/B37/B40 boundaries are preserved: report/result/status reads may be explicit single commands, while report creation, mutation, automatic download, hidden polling, retry, pagination, fanout and provider chaining are not inferred or added.

## Fail-closed rule

Candidate detection is discovery-only. Any row without an accepted Step3 alias remains `REQUIRES_EXACT_ACCEPTED_SWAGGER_SNAPSHOT`. A path or purpose containing report/status/PDF/document/create is not by itself semantic authority.

No Seller or Performance business API request is performed by this inventory.
