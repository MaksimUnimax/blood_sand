# Yandex Search API overlay — acceptance evidence

Дата: 2026-08-12  
Статус: **BUILD/STATIC ACCEPTED — live provider probe pending local reload**

## Scope

Derived extension overlays official Yandex Search API `webSearch` and `genSearch` support on top of the accepted Wordstat Bridge 1.1.5 lifecycle without mutating the canonical `reference-1.1.5` tree.

Allowlisted protocol only:

- command prefix: `YANDEX_SEARCH_API_V1`;
- result prefix: `YANDEX_SEARCH_RESULT_V1`;
- `webSearch` -> `POST /v2/web/search`;
- `genSearch` -> `POST /v2/gen/search`;
- no arbitrary URL/method/body passthrough.

## Static/contract acceptance

Covered by `test_overlay.mjs`:

- original Wordstat `getTop` remains accepted;
- original Wordstat endpoint and `WORDSTAT_RESULT_V1` prefix remain unchanged;
- mobile XML WebSearch request contract;
- desktop HTML WebSearch request contract;
- GenSearch request contract;
- rejection of `DEVICE_ALL` for WebSearch;
- rejection of undocumented region/device controls for GenSearch;
- rejection of arbitrary methods;
- Search result envelope prefix.

## CI acceptance

Workflow:

`.github/workflows/yandex-search-overlay.yml`

Run:

- run id: `31574779725`;
- head SHA: `bd9b7b43efbf4bd19b105a8ceb138b2776a772c1`;
- conclusion: `success`;
- run attempt: 1.

Successful CI stages:

1. checkout;
2. Node setup;
3. Python setup;
4. protocol overlay tests;
5. Python compile checks for builder and in-place patcher;
6. derived extension build;
7. manifest/import/version verification;
8. ZIP packaging;
9. artifact upload.

## Build artifact

GitHub Actions artifact:

- artifact id: `9132714767`;
- name: `yandex-search-bridge-1.1.6`;
- Actions wrapper size: 72,011 bytes;
- Actions artifact digest: `sha256:56bc3b10c3ce4742ab8c2a54df839418635b39c37a6ae920e845bb84568f5deb`;
- expires: 2026-09-11.

Downloaded CI artifact contains:

- `yandex-search-bridge-1.1.6.zip`;
- `yandex-search-bridge-1.1.6.zip.sha256`.

Verified inner extension ZIP SHA-256:

`371a7f0f2cd36ce6ffbbe4f921344207a1e441bf7be6c26f4cb731bfd27e02b9`

The SHA printed by CI and independently recomputed after artifact download matched exactly.

## Derived extension contents

Verified derived package includes:

- `manifest.json` version 1.1.6;
- base Wordstat UI/lifecycle files;
- `shared/wordstat_protocol.js` unchanged base protocol;
- `shared/yandex_search_protocol_overlay.js` loaded immediately after the base protocol;
- `service_worker.js` loading base protocol -> Search overlay -> autorun model;
- `content_script.js` version 1.1.6;
- same Search API host permission already present in 1.1.5.

## Storage/installation caveat

A separately loaded unpacked Chrome extension can receive a different extension identity/storage namespace. Preserving storage key names in the derived package does **not** guarantee automatic migration of the locally stored API key/folder ID across a new extension identity.

Preferred operational path for an already installed unpacked Wordstat Bridge:

- use `apply_in_place.py` against the current unpacked extension directory;
- patch in place;
- keep the directory/extension identity unchanged;
- reload the same extension in `chrome://extensions`;
- the patcher does not read/export/modify credentials.

The patcher creates a local backup before changes unless `--no-backup` is explicitly supplied.

## Remaining acceptance gate

Build/static acceptance is complete. Provider acceptance requires exactly one live `webSearch` probe after the overlay is loaded locally.

The live probe must:

- use a primary roadmap query;
- use Russia region 225;
- use `DEVICE_PHONE`;
- use first-page XML with 10 groups;
- fresh-check the official Yandex tariff immediately before the request;
- execute exactly one Yandex API request;
- never auto-retry an authorization/provider failure;
- preserve the returned envelope as raw evidence.

Only after that probe succeeds may the primary mobile SERP pass continue.
