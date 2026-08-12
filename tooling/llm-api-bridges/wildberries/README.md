# Wildberries Read-Only LLM API Bridge

Version: `0.1.0`  
Implementation currentness date: **2026-08-12**

This directory contains a local Manifest V3 Chrome extension that implements:

`WB_API_V1 → fixed local operation registry → official Wildberries API → WB_RESULT_V1 → same bound ChatGPT conversation`.

The bridge is an evidence-transport component for the marketplace factual-data project. It is **not** a business-analysis layer and it does not decide which products are good/bad or what the site/assortment strategy should be.

## Security contract

- READ / read-derived only; unknown or mutation effects fail closed.
- LLM supplies only `operation` + `params`; it cannot supply URL, host, HTTP method, Authorization, token, arbitrary headers or transport configuration.
- One `WB_API_V1` command causes **at most one external Wildberries HTTP request**.
- No automatic retry, hidden pagination, polling or fan-out.
- Each next page, report stage or explicit report retry is a separate command.
- Seller credentials are stored only in `chrome.storage.local` and are not included in ChatGPT reports, diagnostics, source or build artifacts.
- Direct buyer/client/courier PII endpoints are not present in the executable registry. Responses from admitted customer-content endpoints are recursively sanitized.
- Provider HTTP errors are converted into bounded controlled `WB_RESULT_V1` errors and do not trigger automatic repeat.

## Executable surface

Current production registry: **157 operations**.  
Body-required operations: **53**.  
Binary response operations: **1**.

Category counts:
- `analytics`: 39
- `any`: 7
- `content`: 15
- `documents`: 4
- `feedbacks`: 14
- `finance`: 7
- `marketplace`: 34
- `prices`: 7
- `promotion`: 20
- `returns`: 1
- `statistics`: 2
- `supplies`: 7

See `WB_PRODUCTION_ALLOWLIST_V0.1.0.md` for the exact aliases, hosts, methods and paths.

## Runtime architecture

Production files are separated into:

- `shared/wb_operations.js` — executable fixed registry;
- `shared/wb_contract.js` — command parsing, transport-key rejection, required params, bounds and sanitization;
- `shared/wb_credentials.js` — Bearer token / token-type / optional `X-Client-Secret` model;
- `shared/provider_transport_core.js` — exactly one bounded fetch, no retry;
- `shared/wb_provider.js` — WB provider adapter and `WB_RESULT_V1` production;
- `service_worker.js` — credential ownership, durable request/delivery ledgers, manual/autorun state and recovery;
- `content_script.js` — conversation-scoped capture/delivery/status UI;
- popup — local setup, diagnostics and operator controls;
- provider-neutral lifecycle modules inherited from exact Ozon Bridge v0.1.3 where safe.

## Release/reference

`reference-0.1.0/` stores the exact release identity and reconstruction material. The production ZIP itself contains exactly the 17 production extension files and excludes tests, credentials, evidence and private keys.

## Acceptance boundary

Automated source/emulator and fresh-unpack tests are separate from live account acceptance. A seller token and real Wildberries account are never embedded in tests. Live user-account acceptance must be done after installation and is not claimed by automated PASS results.
