# Patch B10 Seller Health / Ratings — contract closure

Accepted base: B9 authority `9996667c1213990c64ae6dc2bfca3cf030d089bc`.

B10 closes the first item of the fresh post-B9 queue: `P0_seller_health_ratings`.

Enabled aliases:

- `seller_rating_summary` -> `POST /v1/rating/summary`
- `seller_rating_history` -> `POST /v1/rating/history`
- `seller_fbs_error_index` -> `POST /v1/rating/index/fbs/info`
- `seller_fbs_error_postings` -> `POST /v1/rating/index/fbs/posting/list`

All four are fixed `seller_api`, `READ`, `single_read` operations. `seller_fbs_error_index` is exact `no_body`; the others use fixed JSON bodies. No caller-controlled URL, host, path, method, headers or authorization material is accepted.

Local validation closes:

- exact empty JSON body for rating summary;
- RFC3339 date-time and ordered period for rating history;
- documented rating identifiers only;
- boolean `with_premium_scores` only;
- exact empty params for FBS error-index info;
- required posting-list filter and limit;
- posting-list limit maximum 1000;
- filter date ordering;
- posting number arrays maximum 1000 and string-only;
- undeclared field rejection.

The cursor is caller-controlled only as an explicit request field. B10 never automatically follows it.

Entitlement: all four exact Swagger operations compile as all-account reads, so no Seller subscription probe is required for B10.

Protected runtime remains unchanged: content script, service worker, Autorun, Work-session model, provider, transport, Manual controls and guidance.
