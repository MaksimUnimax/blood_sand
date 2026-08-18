# Ozon live-repair V3B targeted behavioral report

Date: 2026-08-18
Scope: targeted engineering completion only; not acceptance, live-provider testing, or release promotion.

## Authority and safety

- Repository: `MaksimUnimax/blood_sand`
- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- V3 concat authority: `aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`
- `REAL_OZON_REQUESTS = 0`
- `REAL_PERFORMANCE_REQUESTS = 0`
- No V4, V3 patch changes, production edits, real credentials, provider requests, fuzzing, reject mode, or manual repair were used.

## Exact bytes

The external exact V3 candidate tree was freshly hash-verified before behavioral checks:

- repaired `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
- repaired `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- 17-file inventory retained;
- protected fifteen files remained byte-identical to frozen Step 4.

## Fresh checks completed

The accepted CFT/Puppeteer architecture was freshly executed with the repaired extension:

`Node child_process.spawn -> Chrome for Testing 151.0.7922.47 -> dynamic DevToolsActivePort -> Puppeteer 25.4.0 -> browser.installExtension()`.

The MV3 service worker was observed. Browser interception failed closed for `api-seller.ozon.ru` and `api-performance.ozon.ru`; observed Seller and Performance requests were both zero.

Fresh repaired-worker checks also passed:

- verified analytics cache semantics, fixed profile and projection;
- cache-hit/coalescing path produced zero quota/provider calls;
- cache provenance/privacy admission checks passed;
- quota VM passed the V3 60000/5000/65000 boundary, migration, account isolation and Retry-After extension-only checks.

## Mandatory V3B items not proven

The following required actual paths were not executed and remain `UNPROVEN`: actual `OZ_GET_MANUAL_STATE` manual public state; actual autorun public state; secret-sentinel privacy through serialized runtime responses; incompatible cache miss to durable guarded wait and actual due resume; actual mocked 429 one-call/zero immediate retry/zero alarm replay/zero startup replay; production content countdown plate; three decreasing displayed MM:SS values; absolute due clock; due sending text; restart restore from durable state; duplicate-click blocking; two-owner/tab isolation; ChatGPT binding; Alice binding; native Copy independence; cross-owner delivery; and the targeted Step-1–4 regression closure including delivery FSM evidence.

These omissions are evidence gaps, not claims of a production defect. No real network/provider request occurred.

## Result

Because the V3B standalone prompt requires every mandatory item to pass and any mandatory `UNPROVEN` forces failure, this report records `PREFREEZE_V3B_FAILED`. It is report-only and does not authorize freeze, acceptance, live rerun, or release promotion.
