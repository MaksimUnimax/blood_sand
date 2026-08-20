# Ozon Bridge v0.1.19 — live test index, 2026-08-20

Account boundary: ordinary Seller account; positive Premium-only scenarios are not claimed.

This index is maintained alongside the main ledger and individual per-result evidence files.

| ID | Operation/surface | Scenario | Status | Evidence file |
|---|---|---|---|---|
| 7.1 | `roles` | ordinary-account live role list | PASS | `validation/live-results/2026-08-20-step-7.1-roles.md` |
| 7.2 | `posting_fbo_list` | basic real FBO postings over 2026-08-18..2026-08-20 | PASS | `validation/live-results/07-02-posting-fbo-list-basic-pass-2026-08-20.md` |
| 7.3 | `posting_fbo_list` | filter by exact `posting_numbers` | PASS | `validation/live-results/TEST_7_3_POSTING_FBO_FILTER_POSTING_NUMBER_2026-08-20.md` |
| 7.4 | `posting_fbo_list` | filter by exact `order_numbers` | PASS | `validation/live-tests/7.4-posting-fbo-order-numbers-pass.md` |
| 7.5 | `posting_fbo_list` | valid request with no matching order | PASS | `validation/live-results/7.5-posting-fbo-empty-result-2026-08-20.md` |
| 7.6 | `posting_fbo_list` | pagination page 1 with `limit=1`; real continuation cursor captured | PASS | `validation/live-results/7.6-posting-fbo-pagination-page1-2026-08-20.md` |
| 7.7 | `posting_fbo_list` | pagination page 2 from exact 7.6 cursor; forward movement/no duplicate | PASS | `validation/live-results/7.7-posting-fbo-pagination-page2-2026-08-20.md` |
| 7.8 | `posting_fbo_list` | pagination page 3 from exact 7.7 cursor; third distinct posting and fresh cursor | PASS | `validation/live-results/7.8-posting-fbo-pagination-page3-2026-08-20.md` |
| 7.9 | `posting_fbo_list` | pagination page 4 from exact 7.8 cursor; fourth distinct posting and fresh cursor | PASS | `validation/live-results/7.9-posting-fbo-pagination-page4-2026-08-20.md` |
| 7.10 | `posting_fbo_list` | pagination page 5 from exact 7.9 cursor; fifth distinct posting and fresh cursor | PASS | `validation/live-results/7.10-posting-fbo-pagination-page5-2026-08-20.md` |
| 8.1 | `supply_order_get` | required `order_ids` pre-execution contract guard | PASS (negative guard) | `validation/live-results/8.1-supply-order-get-required-order-ids-guard-2026-08-20.md` |
| 8.2 | `supply_order_get` | syntactically valid synthetic `order_ids`; real provider request | PARTIAL PASS / provider-negative | `validation/live-results/8.2-supply-order-get-provider-negative-2026-08-20.md` |
| 8.3 | `supply_order_details` | required `order_id` pre-execution contract guard | PASS (negative guard) | `validation/live-results/8.3-supply-order-details-required-order-id-guard-2026-08-20.md` |
| 8.4 | `supply_order_details` | syntactically valid synthetic `order_id`; real provider request | PARTIAL PASS / provider-negative | `validation/live-results/8.4-supply-order-details-provider-negative-2026-08-20.md` |
| 8.5 | `supply_order_get` | 51 `order_ids` exceeds documented maximum 50 | PASS (negative guard) | `validation/live-results/8.5-supply-order-get-max-50-order-ids-guard-2026-08-20.md` |
| 9.1 | `posting_fbo_list` | `limit=101` exceeds maximum 100 | PASS (negative guard) | `validation/live-results/9.1-posting-fbo-limit-max-guard-2026-08-20.md` |
| 9.2 | `posting_fbo_list` | request period exceeds one year | PASS (negative guard) | `validation/live-results/9.2-posting-fbo-period-over-one-year-guard-2026-08-20.md` |
| 9.3 | `stocks_current` | `limit=1001` exceeds maximum 1000 | PASS (negative guard) | `validation/live-results/9.3-stocks-current-limit-max-guard-2026-08-20.md` |

## Bounded FBO pagination conclusion

Tests 7.6–7.10 establish five consecutive live pages with distinct postings, forward provider-cursor movement, HTTP 200 and one physical business request per page. No duplicate posting appeared in the tested five-page chain.

## Supply-order boundary

Test 8.2 proves the bridge accepts the `order_ids` array and reaches Ozon exactly once without capability probing or retry. It is not a positive business-data PASS because the id was synthetic and Ozon returned HTTP 400 / code 9. The current bridge allowlist has no supply-order list alias from which to discover a real supply-order id automatically.

Test 8.3 proves `supply_order_details` requires `params.order_id` and rejects omission locally with zero physical business requests.

Test 8.4 proves the bridge accepts a syntactically valid `order_id` for `supply_order_details` and reaches Ozon exactly once without capability probing or retry. It is not a positive business-data PASS because the id was synthetic and Ozon returned HTTP 400 / code 9.

Test 8.5 proves `supply_order_get` enforces the documented maximum of 50 `order_ids` locally: 51 IDs produce `OZON_LIMIT_VIOLATION` with zero physical business requests and no external Ozon request.

## FBO contract guards

Test 9.1 proves `posting_fbo_list` enforces `limit <= 100` locally: `limit=101` produces `OZON_LIMIT_VIOLATION` with zero physical business requests and no external Ozon request.

Test 9.2 proves `posting_fbo_list` rejects a filter period longer than one year locally with `OZON_LIMIT_VIOLATION`, zero physical business requests and no external Ozon request.

## Other local limit guards

Test 9.3 proves `stocks_current` enforces `limit <= 1000` locally: `limit=1001` produces `OZON_LIMIT_VIOLATION`, zero physical business requests and no external Ozon request.

## Next planned live test

9.4 — verify the documented upper bound for `analytics_data.limit`: `limit=1001` with otherwise valid recent universal analytics params must be rejected locally before capability resolution or any external Ozon request.
