# R4 — Stage 06 Wildberries seller-side channel discovery — 2026-09-07

Status: **06.5 ACTIVE — ACCEPTED READ CHANNEL FOUND; FRESH COMPLETE CATALOG PASS REQUIRED**

## Why this checkpoint exists

Stage 06 requires an explicit Wildberries seller-side coverage status. The initial repository-only search did not expose a canonical WB bridge directory in `blood_sand/main`, so the user's retained source library was checked rather than incorrectly classifying WB as unavailable.

## Direct retained runtime artifact

A retained extension artifact was found and inspected directly:
- file: `wildberries-bridge-v0.1.2-extension.zip`;
- bridge manifest name: `Wildberries Bridge — ChatGPT ↔ WB Seller API`;
- manifest version: `0.1.2`;
- command prefix: `WB_API_V1`;
- result prefix: `WB_RESULT_V1`;
- ZIP SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`;
- `manifest.json` SHA-256: `676f2400b47e92733fc6c869caddb10b4f7572d3c5faebfe78ef7be38bec0413`;
- `shared/wb_operations.js` SHA-256: `08e8a2ad1f325a4bdc0a909b37220b7abaa0be1d94d6b53192666ed5f22c2c75`;
- `shared/wb_contract.js` SHA-256: `406e926bf015a913e616f842f67c063c8da641912dbef294ec1e60c491ef0c46`.

The inspected registry directly enables:
- alias `cards_list`;
- host `content` → `https://content-api.wildberries.ru`;
- method `POST`;
- path `/content/v2/get/cards/list`;
- `body_required=true`;
- effect `READ`;
- `execution_enabled=true`;
- `current=true`.

The command parser explicitly accepts top-level `body` when `params` is absent, so the exact bridge envelope for this operation is:

```text
WB_API_V1
{"operation":"cards_list","body":{...Wildberries request body...}}
```

## Current official request semantics used for the fresh pass

For an all-card page:
- `settings.cursor.limit = 100`;
- `settings.filter.withPhoto = -1` returns cards regardless of photo state under the current 2026 schema;
- explicit pagination must use the returned cursor `updatedAt` + `nmID` in the next request;
- no automatic pagination is performed by the bridge.

We will use newest-first sorting (`ascending=false`) so the first page is the freshest seller catalog state; pagination completeness, not sort order, determines closure.

## Preserved direct historical WB evidence

A prior successful seller-side result exists:
- bridge: `wildberries-llm-api-bridge` v0.1.2;
- request id: `2dbd77b1-df36-459c-b677-a13524475438`;
- operation: `cards_list`;
- HTTP 200;
- direct card fields include `nmID`, `imtID`, `nmUUID`, subject, vendorCode, brand, title, description, photos, dimensions, characteristics and size/SKU data.

That retained page contains exactly 100 cards and is **not terminal**. Its returned cursor ends with:
- `updatedAt = 2025-08-11T02:44:38.675204Z`;
- `nmID = 481155639`;
- `total = 100`.

Therefore the historical WB catalog evidence is useful but cannot be treated as a complete seller-catalog census.

## Other WB seller-side evidence already retained

The same bridge has direct `promo_fullstats` advertising evidence. A separate completed zodiac analysis contains 12 months September 2025 through August 2026 and 196 advertising-attributed zodiac orders. That is advertising/performance evidence, not a substitute for a complete current seller catalog.

## Stage 06 decision

WB is **not** `NOT_AVAILABLE`.

Current classification before fresh pass:

`WB_SELLER_SIDE_CHANNEL = AVAILABLE_AND_DIRECT`  
`WB_CURRENT_CATALOG_COMPLETENESS = NOT_YET_PROVEN`

Next exact action: run one fresh `cards_list` page with `limit=100`, all photo states, newest first. Save the result. If the returned page is full and cursor is non-terminal, continue explicitly using that exact returned cursor until a terminal page is proven.
