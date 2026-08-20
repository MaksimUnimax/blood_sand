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

## Next planned live test

7.10 — continue `posting_fbo_list` from the exact provider cursor returned by 7.9 with the same window and `limit=1`; verify page 5 is distinct from pages 1–4. Five consecutive distinct live pages will complete the bounded FBO cursor-chain check.
