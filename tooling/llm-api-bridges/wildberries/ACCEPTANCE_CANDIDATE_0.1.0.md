# Wildberries Bridge candidate 0.1.0 — acceptance evidence

Дата: 2026-08-10
Статус: **candidate accepted in mock/packaging environment; REAL SELLER ACCOUNT NOT YET ACCEPTED**

## Artifact

`wb-bridge-v0.1.0-candidate.zip`

SHA-256:

`612f0509003ef6bdbdba565d377ac61a29e2b361bb20bca9bf04e51b53b1b989`

ZIP size: 71,381 bytes.

## Package verification

- files in extension package: 13;
- source → fresh ZIP extraction byte comparison: **13/13 identical**;
- manifest JSON parse: PASS;
- Manifest V3, version `0.1.0`;
- JavaScript `node --check`: **10/10 PASS**;
- marketplace source scan found no stale Yandex/Wordstat API transport dependency.

## Current official-API corrections already in provider core

Before browser acceptance the WB provider was rechecked against current official documentation and corrected so that:

- token is sent as `Authorization: Bearer <token>`;
- promotions calendar uses `dp-calendar-api.wildberries.ru`;
- promotions calendar uses Prices and Discounts credential category;
- finance `reportId` path parameter is numeric int64-only.

Current correction note:

`WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md`.

## Shared provider regression

Latest Ozon + WB protocol/transport/durable-runtime/execution suite:

**38/38 PASS**.

Covered guarantees include:

- fixed official host aliases;
- hard read-only operation allowlist;
- arbitrary URL/host/method/header/token injection rejected;
- typed path parameters and path traversal rejection;
- Bearer token attachment only inside worker/provider layer;
- credential redaction from evidence;
- exactly one external fetch per accepted operation;
- no automatic 429/network/timeout retry;
- binary analytics download remains explicitly binary;
- durable operation ownership/recovery;
- old-session unknown request is never replayed;
- exact committed delivery recovery;
- duplicate-tab ownership protection.

## Real Chromium MV3 load smoke

Unpacked candidate loaded in real Chromium with:

- MV3 service worker loaded;
- popup loaded;
- popup token/version fields present;
- no manifest/extension load errors observed.

Managed Chromium policy was restored after the test.

## Full mocked Chromium lifecycle

The extension was tested with real popup + real content script + real MV3 service worker while WB official API hostnames were routed to a local HTTPS mock. Test token was fake; no WB account was contacted.

Passed flow:

1. bind ChatGPT conversation;
2. save local WB test token;
3. popup connection test → one local mock `/ping` call;
4. mock captured exact `Authorization: Bearer ...` form;
5. Manual `cards_list` → exactly one provider request;
6. exact `WB_RESULT_V1` delivery back into ChatGPT mock;
7. Manual OFF;
8. Autorun Start;
9. autorun operation 1: `cards_list`;
10. autorun operation 2: `sales_funnel_products`;
11. exactly one provider request per accepted command;
12. run returns to `waiting_command`, `sequence=2`;
13. Pause → `paused`;
14. Resume → `waiting_command`;
15. Finish → `stopped`.

Total WB mock API requests observed: **4** = 1 `/ping` + 1 Manual + 2 Autorun. No duplicate request observed.

## Fresh ZIP extracted Chromium acceptance

The same full lifecycle was repeated from a clean directory extracted from the **fresh candidate ZIP**, not the development source directory.

Result: PASS.

## What this does NOT prove

This candidate is **not production-accepted yet** because:

- no real WB token/account has been tested;
- actual enabled token categories are unknown until owner creates/inserts the token;
- Jam-restricted search analytics may be unavailable to the seller account;
- real API rate limits/account-specific response shapes have not yet been exercised;
- full store pagination and binary generated-report workflow have not yet been run against the real account.

## Real-account acceptance gate

After the owner creates/inserts the token locally:

1. official `/ping` connection test;
2. `cards_list` real read smoke;
3. page/cursor continuation if needed;
4. price/warehouse/stock read smoke according to enabled categories;
5. analytics/funnel read smoke;
6. promotion read smoke if category is enabled;
7. finance read smoke if category is enabled;
8. verify secrets absent from all result/diagnostics;
9. verify exactly-once Manual and sequential Autorun against real API;
10. persist first raw seller evidence for assortment ingestion.

Until then roadmap 03A.6 remains `[~]`, not `[x]`.
