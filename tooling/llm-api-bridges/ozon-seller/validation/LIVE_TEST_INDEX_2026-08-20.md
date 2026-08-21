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
| 9.4 | `analytics_data` | `limit=1001` exceeds maximum 1000 | PASS (negative guard) | `validation/live-results/9.4-analytics-data-limit-max-guard-2026-08-20.md` |
| 9.5 | `analytics_data` | 15 metrics exceeds maximum 14 | PASS (negative guard) | `validation/live-results/9.5-analytics-data-max-14-metrics-guard-2026-08-20.md` |
| 9.6 | `product_queries` | `page_size=1001` exceeds maximum 1000 | PASS (negative guard) | `validation/live-results/9.6-product-queries-page-size-max-guard-2026-08-20.md` |
| 9.7 | `product_queries_details` | `page_size=101` exceeds maximum 100 | PASS (negative guard) | `validation/live-results/9.7-product-queries-details-page-size-max-guard-2026-08-20.md` |
| 9.8 | `product_queries_details` | `limit_by_sku=16` exceeds maximum 15 | PASS (negative guard) | `validation/live-results/9.8-product-queries-details-limit-by-sku-max-guard-2026-08-20.md` |
| 9.9 | `product_queries` | `page=-1` is below minimum 0 | PASS (negative guard) | `validation/live-results/9.9-product-queries-page-min-guard-2026-08-20.md` |
| 9.10 | `product_queries_details` | `page=-1` is below minimum 0 | PASS (negative guard) | `validation/live-results/9.10-product-queries-details-page-min-guard-2026-08-20.md` |
| 9.11 | `stocks_current` | `limit=0` is below minimum 1 | PASS (negative guard) | `validation/live-results/9.11-stocks-current-limit-min-guard-2026-08-20.md` |
| 9.12 | `analytics_data` | `limit=0` is below minimum 1 | PASS (negative guard) | `validation/live-results/9.12-analytics-data-limit-min-guard-2026-08-20.md` |
| 9.13 | `posting_fbo_list` | `limit=0` is below minimum 1 | PASS (negative guard) | `validation/live-results/9.13-posting-fbo-limit-min-guard-2026-08-20.md` |
| 10.1 | `stocks_current` | unknown filter key `definitely_unknown_field`; strict local schema boundary | VALIDATION GAP | `validation/live-results/10.1-stocks-current-unknown-filter-field-validation-gap-2026-08-20.md` |
| 10.2 | `stocks_current` | valid documented `filter.offer_id` with a known live offer | PASS | `validation/live-results/10.2-stocks-current-offer-id-filter-pass-2026-08-20.md` |
| 10.3 | `stocks_current` | valid documented `filter.product_id` with a known live product | PASS | `validation/live-results/10.3-stocks-current-filter-product-id-pass-2026-08-20.md` |
| 10.4 | `stocks_current` | scalar `filter.offer_id` instead of array; local type boundary | VALIDATION GAP | `validation/live-results/10.4-stocks-current-offer-id-type-validation-gap-2026-08-20.md` |
| 10.5 | `stocks_current` | scalar `filter.product_id` instead of array; local type boundary | VALIDATION GAP | `validation/live-results/10.5-stocks-current-product-id-scalar-validation-gap-2026-08-20.md` |
| 11.1 | `analytics_data` | `offset=-1` is below minimum 0 | PASS (negative guard) | `validation/live-results/11.1-analytics-data-offset-min-guard-2026-08-20.md` |
| 11.2 | `analytics_data` | unmistakably unknown top-level parameter; strict local allowlist | PASS (negative guard) | `validation/live-results/11.2-analytics-data-unknown-param-guard-2026-08-20.md` |
| 11.3 | `analytics_data` | scalar `dimension` instead of documented array; rejection diagnostic | PARTIAL PASS / DIAGNOSTIC GAP | `validation/live-results/11.3-analytics-data-dimension-scalar-diagnostic-gap-2026-08-20.md` |

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

Test 9.13 proves `posting_fbo_list` enforces `limit >= 1` locally: `limit=0` produces `OZON_LIMIT_VIOLATION`, zero physical business requests and no external Ozon request.

## Other local limit guards

Test 9.3 proves `stocks_current` enforces `limit <= 1000` locally: `limit=1001` produces `OZON_LIMIT_VIOLATION`, zero physical business requests and no external Ozon request.

Test 9.4 proves `analytics_data` enforces `limit <= 1000` locally: `limit=1001` with otherwise valid recent universal analytics params produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 9.5 proves `analytics_data` enforces a maximum of 14 metrics locally: 15 metrics produce `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 9.6 proves `product_queries` enforces `page_size <= 1000` locally: `page_size=1001` with a real known SKU produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request. The Premium-dependent provider endpoint is not exercised by this guard test.

Test 9.7 proves `product_queries_details` enforces `page_size <= 100` locally: `page_size=101` with a real known SKU and otherwise syntactically valid recent params produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 9.8 proves `product_queries_details` enforces `limit_by_sku <= 15` locally: `limit_by_sku=16` with a real known SKU and otherwise valid recent params produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 9.9 proves `product_queries` enforces `page >= 0` locally: `page=-1` with a real known SKU and otherwise valid recent params produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 9.10 proves `product_queries_details` enforces `page >= 0` locally: `page=-1` with a real known SKU and otherwise valid recent params produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 9.11 proves `stocks_current` enforces `limit >= 1` locally: `limit=0` produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 9.12 proves `analytics_data` enforces `limit >= 1` locally: `limit=0` with otherwise valid recent universal analytics params produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 11.1 proves `analytics_data` enforces `offset >= 0` locally: `offset=-1` produces `OZON_LIMIT_VIOLATION`, zero physical business requests, no capability probe and no external Ozon request.

Test 11.2 proves `analytics_data` rejects unknown top-level parameters locally: `definitely_unknown_field` produces `UNKNOWN_OPERATION_PARAM`, zero physical business requests, no capability probe and no external Ozon request.

Test 11.3 proves a scalar `analytics_data.dimension` is safely rejected with zero physical requests and no capability probe, but the bridge returns `NO_OZON_COMMANDS` even though an explicit envelope is present. This is a diagnostic gap: a recognizable schema-invalid command is collapsed into a generic discovery failure instead of a truthful field-level type error.

## Stocks filter-schema validation gap

Test 10.1 shows that `stocks_current` does not reject an unmistakably unknown filter key locally. The command was accepted unchanged, one physical business request was sent to Ozon, and Ozon returned HTTP 200 with ordinary stock data. This proves a bridge-side strict filter-schema validation gap; it does not prove semantics for the unknown filter key.

Test 10.2 confirms the documented `filter.offer_id` path works live: the bridge sent one physical request, Ozon returned HTTP 200 and exactly one matching product (`product_id=1082848375`, known live offer id), with `total=1`.

Test 10.3 confirms the documented `filter.product_id` path works live: the bridge sent one physical request, Ozon returned HTTP 200 and exactly one matching product (`product_id=1082848375`), with `total=1`.

Test 10.4 shows that `stocks_current` also does not enforce the documented array shape for `filter.offer_id` locally. A scalar string was accepted unchanged and sent as one physical business request; Ozon rejected the request with HTTP 400 / code `3`. This is a bridge-side type-validation gap, not a provider success.

Test 10.5 shows the same missing local array-shape validation for `filter.product_id`: a scalar string was accepted unchanged and sent as one physical business request; Ozon rejected it with HTTP 400 / code `3`. Together, 10.1, 10.4 and 10.5 establish that the current `stocks_current.filter` boundary is not strict for unknown keys or the documented array shape.

## Next planned live test

11.4 — probe type validation for `analytics_data.metrics` by supplying a scalar string instead of the documented array shape. A strict bridge should reject it locally before capability probing and before any external Ozon request. Record whether it produces a field-level error or repeats the generic `NO_OZON_COMMANDS` diagnostic gap.

---

## Append-only final observation — 11.4

| ID | Operation/surface | Scenario | Status | Evidence file |
|---|---|---|---|---|
| 11.4 | ChatGPT Work mode / Manual delivery readiness | after the first delivery, expected completion Voice/Microphone control is absent; composer remains at dictation microphone + disabled Send, Manual operation stays busy and all Ozon buttons remain disabled | BUG / DEFERRED REPAIR | `validation/live-results/11.4-work-mode-manual-ready-recovery-bug-2026-08-20.md` |

Test 11.4 establishes a Work-mode UI-compatibility gap in the downstream delivery completion classifier. Initial state synchronization enables the first Ozon action because no Manual operation is active. Manual batch admission then sets the bridge busy. Work mode does not return the terminal Voice/Microphone-ready control expected by the current classifier, so the completed delivery is not acknowledged back to `ready=true`; the global Manual bridge remains busy and every Ozon block action stays disabled.

This observation is append-only and intentionally left unfixed during the current live-test pass. The deferred repair must add focused Work-mode composer/control-state coverage without weakening exactly-once delivery or treating the persistent dictation microphone as delivery completion.

The earlier next-planned `analytics_data.metrics` probe was not executed. This appended Work-mode blocker takes the final 11.4 position; the metrics probe is deferred until after the Work-mode readiness repair and must receive a new test ID when resumed.


---

## Append-only checkpoint — 2026-08-21 Work repair and analytics continuation

Work-mode delivery blocker 11.4 was repaired by production artifact `OZON_BRIDGE_v0.1.19_WORK_COMPOSER_CONTROL_LIFECYCLE_FIX_2026-08-21.zip` (SHA-256 `232389f1bfbe2a78c5ea41d78d0942b0b7d6bb872cdea296f75326c72c0da901`; commit `4d8856175141c00caf638d5b8311d7d4deff1abb`). Live Work verification completed three consecutive `stocks_current` deliveries with HTTP 200, one physical request each, and restored clickable Ozon buttons after each delivery. No worker/scheduler reset was used.

| ID | Operation/surface | Scenario | Status | Evidence file |
|---|---|---|---|---|
| 11.5 | `analytics_data` | metrics scalar | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.6 | `analytics_data` | filters scalar | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.7 | `analytics_data` | filters scalar element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.8 | `analytics_data` | invalid date_from format | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.9 | `analytics_data` | invalid date_to format | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.10 | `analytics_data` | date_from later than date_to | VALIDATION GAP / provider rate-limit | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.11 | `analytics_data` | missing date_from | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.12 | `analytics_data` | missing date_to | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.13 | `analytics_data` | missing metrics | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.14 | `analytics_data` | missing dimension | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.15 | `analytics_data` | empty metrics array | VALIDATION GAP / provider-negative | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.16 | `analytics_data` | limit scalar string | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.17 | `analytics_data` | offset scalar string | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.18 | `analytics_data` | metrics numeric element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.19 | `analytics_data` | dimension numeric element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.20 | `analytics_data` | filters null element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.21 | `analytics_data` | limit fractional number | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.22 | `analytics_data` | offset fractional number | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.23 | `analytics_data` | date_from null | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.24 | `analytics_data` | date_to null | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.25 | `analytics_data` | date_from empty string | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.26 | `analytics_data` | date_to empty string | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.27 | `analytics_data` | filters object instead of array | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.28 | `analytics_data` | metrics object instead of array | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.29 | `analytics_data` | dimension object instead of array | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.30 | `analytics_data` | empty dimension array | VALIDATION GAP / provider-negative | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.31 | `analytics_data` | date_from array | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.32 | `analytics_data` | date_to array | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.33 | `analytics_data` | sort scalar | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.34 | `analytics_data` | sort scalar element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.35 | `analytics_data` | empty sort object | INCONCLUSIVE / provider rate-limit | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.36 | `analytics_data` | sort null element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.37 | `analytics_data` | limit null | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.38 | `analytics_data` | offset null | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.39 | `analytics_data` | filters array element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.40a | `analytics_data` | sort array element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.40b | `analytics_data` | valid baseline retry | INCONCLUSIVE / provider rate-limit | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.41 | `analytics_data` | limit boolean | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.42 | `analytics_data` | offset boolean | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.43 | `analytics_data` | sort null | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.44 | `analytics_data` | sort boolean element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.45 | `analytics_data` | sort key numeric | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.46 | `analytics_data` | sort order numeric | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.47 | `analytics_data` | sort order-only object | PASS / live HTTP 200 | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.48 | `analytics_data` | sort key null | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.49 | `analytics_data` | sort order null | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.50 | `analytics_data` | sort order empty string | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.51 | `analytics_data` | sort key empty string | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.52 | `analytics_data` | sort key-only object | INCONCLUSIVE / provider rate-limit | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.53 | `analytics_data` | sort key boolean | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.54 | `analytics_data` | sort order boolean | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.55 | `analytics_data` | sort order array | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.56 | `analytics_data` | sort key array | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.57 | `analytics_data` | sort unsupported order enum | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.58 | `analytics_data` | sort unknown key enum | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.59 | `analytics_data` | unknown metric enum | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.60 | `analytics_data` | unknown dimension enum | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.61 | `analytics_data` | empty dimension element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |
| 11.62 | `analytics_data` | empty metric element | PASS | `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md` |

The detailed commands, raw outcome classification, provider request IDs, analytics rate-limit observations, positive HTTP 200 response, artifact identity and the `11.40a/11.40b` numbering clarification are in `validation/live-results/11.5-11.62-analytics-data-validation-continuation-2026-08-21.md`. These entries are append-only. The next test must allocate a new unambiguous ID after 11.62.
