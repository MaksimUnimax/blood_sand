# Ozon Bridge candidate 0.1.0 — acceptance evidence

Дата: 2026-08-10  
Статус: **candidate accepted in local/mock Chromium environment; REAL OZON SELLER ACCOUNT NOT YET ACCEPTED**

## Artifact

Repository artifact:

`tooling/llm-api-bridges/ozon-seller/artifacts/ozon-bridge-v0.1.0-candidate.zip`

Current tested ZIP:

- version: `0.1.0`;
- files in installable package: **14**;
- size: **67,828 bytes**;
- SHA-256: `c4bb7969de1d42782a074be0f014851ade2fd5ee146bd88baeb69c997bc4c015`.

The binary ZIP stored in GitHub is the same candidate bytes that were tested locally before commit.

## Provider surface

Initial bridge is deliberately read-only and includes only the currently confirmed symbolic aliases:

- `product_stocks` → `POST /v4/product/info/stocks`;
- `analytics_data` → `POST /v1/analytics/data`;
- `product_queries` → `POST /v1/analytics/product-queries`;
- `product_query_details` → `POST /v1/analytics/product-queries/details`;
- `fbo_postings` → `POST /v3/posting/fbo/list`;
- `fbs_posting` → `POST /v3/posting/fbs/get`;
- `finance_transactions` → `POST /v3/finance/transaction/list`;
- `fbo_supply_order` → `POST /v3/supply-order/get`;
- `fbo_supply_details` → `POST /v1/supply-order/details`.

Machine-readable reviewed list:

`OZON_READ_ONLY_ALLOWLIST_V1.json`.

Assistant command family:

`OZON_API_V1 → OZON_RESULT_V1`.

One accepted command executes at most one external provider HTTP request. There is no hidden retry or hidden pagination loop.

## Credentials and security

- `Client-Id` and `Api-Key` are stored only in local extension storage;
- they are attached by the service worker to `api-seller.ozon.ru`;
- credentials are not returned in `OZON_RESULT_V1`;
- assistant cannot provide arbitrary URL, host, HTTP method or auth headers;
- unsupported operations fail before network;
- marketplace v0.1.0 is read-only.

A local settings check validates header-safe credentials but intentionally does **not** perform a hidden network request. Real API smoke is a separate explicit `OZON_API_V1` operation.

## Static / protocol validation

Final candidate after cleanup:

- all runtime JavaScript files: `node --check` PASS;
- manifest JSON parse: PASS;
- protocol matrix: **15/15 PASS**;
- all **9** allowlisted operations map to the expected fixed `api-seller.ozon.ru` paths;
- unsupported operation rejected;
- arbitrary URL/headers transport injection rejected;
- non-Ozon command prefix rejected;
- Cyrillic JSON body survives command parse/build/report path.

## Worker manual exactly-once smoke

Node VM with mocked Chrome storage/tabs and Ozon HTTPS transport:

- settings saved;
- connection/settings check performed **0** network requests;
- conversation explicitly bound;
- Manual enabled;
- one accepted `analytics_data` command produced **exactly 1** external request;
- exact `Client-Id` + `Api-Key` headers observed only at transport boundary;
- result started with `OZON_RESULT_V1`;
- secret API key absent from result;
- duplicate same `manual_request_id` returned duplicate state and did not create a second request.

Result: **PASS, external requests = 1**.

## Real Chromium MV3 lifecycle — source tree

Environment: real Chromium MV3, real extension service worker, real content script, real popup/runtime code, ChatGPT DOM mock matching the supported current writing-block adapter, and local HTTPS mock bound to the official Ozon Seller API hostname.

Passed sequence:

1. extension loaded and MV3 service worker appeared;
2. exact ChatGPT conversation identity confirmed;
3. local Ozon credentials/binding/manual state prepared;
4. Manual mode applied and local Copy received the Ozon visual/manual decoration;
5. Manual `product_stocks` produced exactly one external request;
6. result delivered back to the ChatGPT composer/user-turn path;
7. manual operation reached terminal completion;
8. Manual turned off;
9. Autorun Start committed through the real composer/send path;
10. first Autorun command: `analytics_data`;
11. second Autorun command: `finance_transactions`;
12. exactly one external request for each accepted Autorun command;
13. run returned to `waiting_command` with `sequence = 2`;
14. Pause → `paused`;
15. Resume → `waiting_command`;
16. Finish/Stop → `stopped`;
17. total external API requests = **3**: 1 Manual + 2 Autorun;
18. observed paths exactly:
   - `/v4/product/info/stocks`;
   - `/v1/analytics/data`;
   - `/v3/finance/transaction/list`;
19. no duplicate provider request observed;
20. Chromium managed policy was restored after the bounded test.

Result: **PASS**.

### Important correction discovered by the browser test

The first Chromium attempt showed `manual API count 0`. Investigation proved the extension had loaded correctly, but the **test mock writing block was invalid**: it matched neither the supported current writing-block adapter nor the legacy code-block adapter.

The mock was corrected to the real supported structure (`data-writing-block` + `data-testid=writing-block-container` + `data-writing-block-fullscreen-editor-region`). After that correction Manual decoration and dispatch worked without changing the production capture algorithm. This failure therefore remains useful evidence that the capture layer fails closed for an unsupported DOM instead of executing an API request from an ambiguous block.

## Fresh ZIP acceptance

The installable ZIP was extracted into a clean directory and all runtime files were compared against the development source package:

- source ↔ fresh extraction: **14/14 byte-identical**;
- JS syntax from extracted package: PASS;
- protocol matrix from extracted package: **15/15 PASS**;
- worker Manual exactly-once smoke from extracted package: PASS, external requests = 1;
- the **full real Chromium lifecycle above was repeated from the clean extracted ZIP**: PASS;
- fresh-ZIP Chromium total external requests = **3**, with the same three exact paths and no duplicates.

This is the current packaging acceptance artifact. Earlier candidate hashes in historical notes are superseded by the SHA-256 above.

## What this still does NOT prove

This candidate is **not real-account accepted** because:

- no real Ozon Seller `Client-Id` + `Api-Key` have been used;
- real account permissions/scopes are unknown;
- real response schemas and account-specific fields have not yet been observed;
- current Seller API library audit is not complete for catalog, prices/promotions, returns, settlement/reports, warehouse/geography, advertising and reviews/questions;
- real pagination/rate-limit behavior has not yet been exercised.

Therefore roadmap 03A.4 remains `[~]`, not `[x]`.

## Real-account acceptance gate

After the owner enters credentials **locally in the extension popup, never in chat/GitHub**:

1. bind the intended LLM conversation;
2. perform one low-risk explicit read smoke using a confirmed alias;
3. verify HTTP/auth/account permissions;
4. verify the actual response schema and pagination metadata;
5. verify secret values absent from result/diagnostics;
6. run one Manual exactly-once operation;
7. run controlled sequential Autorun operations;
8. stop on any 429/network/unknown-request outcome without hidden retry;
9. persist first raw seller evidence;
10. begin full assortment ingestion only after this gate passes.
