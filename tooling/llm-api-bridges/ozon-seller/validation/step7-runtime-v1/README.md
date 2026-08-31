# Ozon Seller Step 7 runtime execution harness v1

This harness executes every one of the 26 admitted Seller read operations through the built MCP server bundle. It does not trust inventory status fields as runtime evidence.

## What is executed

1. Start `dist/ozon-seller-mcp-nodebundle.js` as a real MCP stdio server.
2. Complete MCP `initialize` and `tools/list`.
3. Call the public `ozon` MCP tool once for each operation vector in `OZON_STEP7_RUNTIME_TEST_ARTIFACT_2026-08-30.json`.
4. Replace only `globalThis.fetch` with `mock_fetch.cjs`; registration, validation, dispatch, request construction, adapters, result envelopes, and MCP serialization remain production code.
5. Require exactly one physical request for every admitted read.
6. Compare actual HTTP method, path, JSON payload, and credential headers to the exact registry and runtime contract.

## Pass contract

A pass requires all 26 operations to return:

- `ok: true`;
- `physical_business_request_count: 1`;
- `external_request_executed: true`;
- `attempt_count: 1`.

The mock transport must observe exactly 26 requests, with an exact method/path/payload match for every operation. The terminal marker is:

```text
STEP7_READ_RUNTIME_26_PASS
```

The output proof is deterministic for a fixed source commit and is suitable for Linux/Windows byte comparison.
