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

## Bounded FBO pagination conclusion

Tests 7.6–7.10 establish five consecutive live pages with distinct postings, forward provider-cursor movement, HTTP 200 and one physical business request per page. No duplicate posting appeared in the tested five-page chain.

## Next planned live test

8.2 — execute `supply_order_get` with a syntactically valid `order_ids` array so the request crosses the bridge contract boundary and reaches Ozon. Use a non-existent int64-shaped supply-order id because the current bridge allowlist has no supply-order list operation from which to discover a real supply-order id.
