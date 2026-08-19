# Ozon Bridge v0.1.19 — B01–B15 pre-Codex readiness resolution

Date: 2026-08-19
Status: `B01_B15_EXECUTION_PATHS_READY_FOR_ONE_CONSOLIDATED_CODEX_RUN`
Scope: engineering execution-path readiness only. This document is not a Codex PASS, not a test program, not packaging authority and not a release promotion.

This document supersedes the readiness conclusion in:

`tooling/llm-api-bridges/ozon-seller/validation/engineering-preflight/PRE_CODEX_B01_B15_READINESS_MATRIX_2026-08-19.md`

The older matrix remains historical evidence of the exact gap that was investigated. It is not deleted or rewritten.

## 1. Governing rule

Final test authority remains:

`tooling/llm-api-bridges/ozon-seller/validation/CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md`

Checklist status:

`CODEX_TEST_CHECKLIST_DOCUMENT_ONLY`

Checklist blob at this resolution:

`8bfd8f925eab7c8901fe63585a5fba34e800d6a8`

No new Codex run is permitted unless all B01–B15 have an existing physically executable route that does not require Codex to create/modify test code or test infrastructure.

This resolution performs that route-by-route audit. `READY` below means only that the action is executable with existing allowed means. It does **not** pre-judge the eventual PASS/FAIL result.

## 2. Exact candidate remains unchanged

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch bytes: `13648`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: exactly `17`
- changed production files: exactly `service_worker.js`, `content_script.js`
- remaining `15` production files: byte-identical to frozen ZIP.

No production byte was changed during readiness work.

## 3. Existing browser/runtime substrate

Current environment authority:

`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_WINDOWS_CFT_QUALIFIED_ENVIRONMENT_2026-08-19.md`

Standing harness acceptance:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_CODEX_QA_HARNESS_ACCEPTANCE_2026-08-17.md`

Already-executed exact-current-candidate evidence includes:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- validation-owned disposable browser/profile;
- exact extension install and enumeration;
- version `0.1.19`;
- raw PAGE Runtime/Page/Fetch;
- local synthetic-page adapter;
- exact candidate MV3 service-worker discovery/liveness;
- direct generic worker CDP session;
- direct worker Runtime and Network commands;
- zero real Ozon/Performance/ChatGPT requests.

Load-bearing exact-current report:

`9188b934e1c648acecfa390cc5c49074195a3e4b` (RERUN18 browser substrate)

The RERUN18 full-gate verdict remains failed because it did not execute the complete functional matrix. Its substrate evidence is still valid and does not become a full PASS here.

## 4. Root capability resolution

The prior root gap was:

`EXISTING_FILELESS_SAFE_WORKER_PROVIDER_RESPONSE_MOCK_NOT_YET_PROVEN`

It is resolved at the execution-path level by:

`tooling/llm-api-bridges/ozon-seller/validation/environment/FILELESS_WORKER_PROVIDER_INTERCEPTION_PROTOCOL_2026-08-19.md`

Protocol commit:

`99a522f8da01cad1af9f4652af8b4a56460c9f6f`

The mechanism contains no new project test program:

`qualified CFT -> exact installed extension -> exact service worker -> already-proven generic direct CDP session -> built-in service-worker Fetch domain -> request-stage pause -> local fulfill/fail`

The generic direct worker transport was already actually exercised with `Runtime` and `Network` on the exact candidate. Chromium's service-worker DevTools agent attaches both `NetworkHandler` and `FetchHandler`; the standard DevTools `Fetch` domain pauses matching request-stage traffic until the client locally fulfills, fails or continues it. The validation protocol explicitly forbids continuing Seller/Performance traffic to the real provider.

Therefore deterministic controlled Seller/Performance response status/body/headers and transport failure can be produced through an already-existing browser capability without creating a validator/runner/harness/fixture/helper/test file.

## 5. B01–B15 route-by-route re-audit

| Block | Readiness | Existing allowed execution route |
|---|---|---|
| B01 | `READY` | Git/filesystem/hash/ZIP tools; two fresh extracts; `core.autocrlf=false`; `git apply --check`; byte compare; `node --check`; manifest inspection. |
| B02 | `READY` | Existing synthetic ChatGPT/Alice page path + installed exact extension + UI/DOM observation; invalid/pre-execution cases require no successful provider response; worker provider events remain observable. |
| B03 | `READY` | Synthetic page command input + direct worker Network/Fetch observation + fixed provider interception; arbitrary transport attempts can be checked without real network; wrong-owner/binding observed through normal UI/runtime state. |
| B04 | `READY` | Normal product requests + fileless worker `Fetch` interception; controlled `/v1/seller/info` synthetic responses; provider-attempt count from `Fetch.requestPaused`; AI output inspected on synthetic page. |
| B05 | `READY` | Normal multi-command product batch + controlled analytics response matching actual physical metric order; physical request count from worker `Fetch.requestPaused`; logical reports observed in product output. |
| B06 | `READY` | Normal product sequence with real elapsed time; fileless locally fulfilled first/second Seller calls; no artificial storage deadline; countdown/UI observation; normal lifecycle restart; 429/Retry-After supplied by local `Fetch.fulfillRequest`. |
| B07 | `READY` | Worker `Fetch` provides controlled valid 200, malformed-cardinality 200 and 429; `Fetch.failRequest` provides transport failure; pre-fetch credential/storage failures use ordinary product/settings path and must produce no provider pause event. |
| B08 | `READY` | Verified locally fulfilled analytics result creates product cache normally; subsequent cache hit is proven by absence of a second provider pause event; miss/expiry/error cases use the same normal product path and worker request counter. |
| B09 | `READY` | Normal Manual/Autorun batch UI path + worker provider request observation/fulfillment; entry order and final single report observed through product/runtime state; restart/no-replay uses normal lifecycle control. |
| B10 | `READY` | Obtain a real ready Manual report through normal product path with locally fulfilled provider response, then exercise empty-composer delivery on synthetic ChatGPT; no direct fabricated report-storage injection is required. |
| B11 | `READY` | Same normal ready-report route, but synthetic composer starts occupied or absent; DOM mutation/restore and lifecycle restart are standard browser actions; unexpected provider replay is detected by worker provider pause count. |
| B12 | `READY` | Same normal pending pre-insert report route; Manual OFF/ON via extension control; state inspected through existing storage/runtime/DOM tools; quota/cache preservation checked without synthetic deadlines. |
| B13 | `READY` | Existing safe synthetic ChatGPT A/B + Alice page capability, native Copy observation, two-owner UI/runtime state and lifecycle restart. B10–B12 report states are now obtainable without test-state fabrication. |
| B14 | `READY` | Fileless Performance-host worker interception; exact current Performance surface is discovered from actual product/contract, not invented; token step may be fulfilled minimally; business request host/method/auth is observed and can be locally failed; Seller capability/quota/cache state is inspected; real Performance network remains zero. |
| B15 | `READY` | Already-qualified Windows/CFT exact-candidate substrate + complete direct browser execution of B10–B13 + console/runtime/network observation; no new browser-control code is required. |

All fifteen blocks now have an identified existing allowed route.

## 6. Important B06 qualification

`READY` does not authorize shortcutting the quota test.

B06 must still:

- use a genuine first cold-cache product request;
- immediately issue a second cold-cache same-Seller request;
- wait the real interval;
- observe real decreasing countdown;
- permit only one second provider attempt after due time;
- test restart during wait;
- test same Seller / different Seller / API-key rotation;
- test controlled 429/Retry-After;
- preserve `60000 + 5000 = 65000`;
- never write fake `last_provider_request_at` / `next_allowed_at` values merely to manufacture PASS.

## 7. Important B14 qualification

Do not invent a Performance operation, endpoint or business response schema.

Use the exact current product surface. If the actual candidate exposes a Performance command, execute that normal flow. If the current extension exposes Performance only through its existing connection/test surface, use that actual surface. The fileless worker interception observes the real request generated by the exact candidate.

A synthetic token response may contain only the minimum fields the actual current token parser requires. The subsequent Performance business request may be locally failed after host/method/auth boundary observation when B14 does not require a provider business response body.

## 8. Safety invariants for the eventual run

- Seller/Performance `Fetch.requestPaused` must be handled locally; never continue it to external network.
- Existing host-resolver blocking stays active as defense in depth.
- Real Seller credentials: none.
- Real Performance credentials: none.
- Real ChatGPT account/network: none for synthetic browser checks.
- `REAL_OZON_REQUESTS=0`.
- `REAL_PERFORMANCE_REQUESTS=0`.
- `REAL_CHATGPT_REQUESTS=0`.
- Production modifications by Codex: `0`.
- Test-infrastructure modifications by Codex: `0`.
- ZIP packaging by Codex: `0`.

## 9. What READY means and does not mean

This resolution does **not** claim B01–B15 PASS.

It establishes only the required precondition for one independent consolidated Codex run:

- every block has an existing execution route;
- no block requires Codex to create/adapt test code;
- the previous stale-SHA harness failures are not part of the route;
- the previous raw-page-only browser limitation is not part of the route;
- controlled provider responses no longer require a generated VM harness.

The eventual Codex run must still execute every B01–B15 action and may return PASS, FAIL or an objective environment/runtime BLOCKED if the actual existing capability behaves differently from its documented authority.

## 10. Engineering decision

Pre-Codex execution-path gate:

`B01_B15_EXECUTION_PATHS_READY`

Previous root gap:

`RESOLVED_BY_EXISTING_FILELESS_WORKER_CDP_FETCH_CAPABILITY`

Production candidate:

`UNCHANGED`

New test infrastructure required:

`NO`

Next permitted workflow step:

`prepare one complete standalone Codex prompt in chat for one consolidated B01–B15 run`

Do not create a GitHub prompt file or runbook. Do not package before reviewed full PASS.
