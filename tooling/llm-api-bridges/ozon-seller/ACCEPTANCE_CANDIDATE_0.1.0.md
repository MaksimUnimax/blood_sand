# Ozon Bridge candidate 0.1.0 — acceptance evidence

Дата: 2026-08-10
Статус: **candidate accepted in mock/packaging environment; REAL SELLER ACCOUNT NOT YET ACCEPTED**

## Artifact

`ozon-bridge-v0.1.0-candidate.zip`

SHA-256:

`5a50cbd79d0e5710d40410d921a189af602dbe337add07c50d36270b8270d2ac`

ZIP size: 70,142 bytes.

## Package verification

- files in extension package: 13;
- source → fresh ZIP extraction byte comparison: **13/13 identical**;
- manifest JSON parse: PASS;
- Manifest V3, version `0.1.0`;
- JavaScript `node --check`: **10/10 PASS**;
- marketplace source scan found no stale Yandex/Wordstat API transport dependency.

## Shared provider regression

Latest Ozon + WB protocol/transport/durable-runtime/execution suite after current WB corrections:

**38/38 PASS**.

Covered guarantees include:

- hard symbolic operation allowlist;
- arbitrary URL/host/method/header/credential injection rejected;
- credentials loaded only after durable request claim;
- one accepted operation invokes external `fetch` at most once;
- concurrent duplicate request does not execute second HTTP request;
- 429/timeout/network failure has no hidden retry;
- response size limit / HTTPS / host match / redirect error;
- durable `requesting → delivering → completed/failed` state;
- worker restart during old-session `requesting` → `REQUEST_OUTCOME_UNKNOWN`, no replay;
- worker restart during `delivering` recovers exact stored delivery;
- duplicate live tab cannot steal operation owner;
- owner can rebind only after prior owner loss;
- delivery id/operation id mismatch cannot complete another operation.

## Real Chromium MV3 load smoke

Unpacked candidate loaded in real Chromium with:

- MV3 service worker loaded;
- popup loaded;
- popup fields/version present;
- no manifest/extension load errors observed.

Managed Chromium URL/extension blocking policy was temporarily relaxed only for the test and restored after execution.

## Full mocked Chromium lifecycle

The extension was tested with real popup + real content script + real MV3 service worker while `api-seller.ozon.ru` was routed to a local HTTPS mock. Test credentials were fake; no marketplace account was contacted.

Passed flow:

1. bind ChatGPT conversation;
2. save local `Client-Id` + `Api-Key` test credentials;
3. Manual mode command → exactly one mock Seller API request;
4. exact `OZON_RESULT_V1` delivery back into ChatGPT mock;
5. Manual OFF;
6. Autorun Start;
7. autorun operation 1: `analytics_data`;
8. autorun operation 2: `product_stocks`;
9. exactly one provider request per accepted autorun command;
10. run returns to `waiting_command`, `sequence=2`;
11. Pause → `paused`;
12. Resume → `waiting_command`;
13. Finish → `stopped`.

Total provider requests observed: **3** = 1 Manual + 2 Autorun. No duplicate request observed.

## Fresh ZIP extracted Chromium acceptance

The same full lifecycle was then repeated by loading the extension from a **clean directory extracted from the fresh candidate ZIP**, not from the development source directory.

Result: PASS.

## What this does NOT prove

This candidate is **not production-accepted yet** because:

- no real Ozon Seller account credentials have been tested;
- no real Ozon HTTP response/schema/account permissions have been observed;
- Ozon API capability audit still has exact-method gaps because the official interactive Seller API library is currently inaccessible in the research environment through a redirect loop;
- full product/catalog, current prices/promotions, returns, realization/reporting, seller warehouse/geography and advertising read allowlist still requires exact official-library completion where not already confirmed;
- real-account pagination/rate-limit behavior has not been exercised.

## Real-account acceptance gate

After the owner creates/inserts read-only Seller API credentials locally in the extension, acceptance requires harmless real read operations using only already officially confirmed methods, checking:

- authentication succeeds;
- exact response schema is captured;
- no secret appears in result/diagnostic;
- one `OZON_API_V1` = one provider request;
- manual delivery works;
- autorun sequential operations remain exactly-once;
- HTTP 4xx/429/5xx do not trigger automatic replay;
- provider output can be stored in project evidence pipeline.

Until then roadmap 03A.4 remains `[~]`, not `[x]`.
