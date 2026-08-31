# Ozon Seller Step 7 privacy execution harness v1

This gate executes the 13 admitted operations classified as `personal_data` in two modes:

1. **Denied without authorization:** every operation must fail closed before `fetch`; the aggregate physical request count must remain zero.
2. **Explicitly authorized:** the same 13 operations must succeed and each must execute exactly one physical request.

The harness starts the production MCP bundle, performs JSON-RPC calls through the public `ozon` tool, and replaces only the network transport with the deterministic Step 7 mock. It verifies that the denied and authorized operation sets exactly match the personal-data subset of `OZON_SELLER_EXACT_READ_REGISTRY.json`.

Terminal markers:

```text
STEP7_PRIVACY_DENIAL_13_PASS
STEP7_PRIVACY_AUTHORIZED_13_PASS
```
