# Patch B13 Promotions / Market Reads — accepted

- Accepted candidate: `fbb1311a9d09938a33e54fbdfaf380075505fa80`
- Independent tester commit: `5933600ee60ed93bd04f909728c887469dacb881`
- Accepted B12 authority: `1f659c16408c39955e4aa5a5c5faf0c2bee1c905`
- B13 production tree: `df77a8cff2e446380ec92c38ba818638ab72cae96d2e0f6a2c2b0f1b4ab854b5`
- Gzip/raw patch SHA-256: `431165f6690175aa1b788fbeabbc541a6c8595e6df8250336710a7e44524ad07` / `3ae79617e1def360f764382466477c23572db1a80d471626702dbe6351ec7ca3`

Independent validation changed only `PATCH_B13_PROMOTIONS_MARKET_READS_INDEPENDENT_TEST_RESULT_2026-08-27.md` and ended with `PATCH_B13_PROMOTIONS_MARKET_READS_INDEPENDENT_TEST_PASS`.

Accepted B13 read surface:
- `ozon_actions_list` -> `GET /v1/actions`
- `ozon_action_candidates` -> `POST /v1/actions/candidates`
- `ozon_action_products` -> `POST /v1/actions/products`
- `ozon_auto_add_products` -> `POST /v1/actions/auto-add/products/list` (beta)
- `ozon_auto_add_candidates` -> `POST /v1/actions/auto-add/products/candidates` (beta)

Safety accounting from independent test:
- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`

`PATCH_B13_PROMOTIONS_MARKET_READS_ACCEPTED`
