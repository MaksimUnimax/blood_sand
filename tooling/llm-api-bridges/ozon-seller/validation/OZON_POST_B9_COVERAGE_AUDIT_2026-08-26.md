# Ozon post-B9 coverage audit — 2026-08-26

Accepted base: `9996667c1213990c64ae6dc2bfca3cf030d089bc`.
Accepted production tree: `d955dbfd1a667e40ea0cb04374b31e0cfe95bbf75b3b355d11c50d10f748a6d5`.

Exact Seller Swagger authority: 3,933,043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 paths.

The old `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1` is closed through `P2_reviews_questions`. A fresh comparison of the accepted B9 registry with the exact current Swagger shows substantial additional API surface, but currentness alone is not sufficient to enable it. Mutation endpoints, async report creation, transport/config writes and methods with unclear side effects remain excluded.

The next evidence-backed queue is `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V2_2026-08-26.json`.

Its first priority is `P0_seller_health_ratings` because all four selected endpoints are current, non-deprecated, directly useful for seller diagnostics/recommendations, and are explicit read operations:

- `POST /v1/rating/summary`
- `POST /v1/rating/history`
- `POST /v1/rating/index/fbs/info`
- `POST /v1/rating/index/fbs/posting/list`

B10 is assigned to this first priority. Later queue items remain contract-extraction-only until separately implemented and tested.
