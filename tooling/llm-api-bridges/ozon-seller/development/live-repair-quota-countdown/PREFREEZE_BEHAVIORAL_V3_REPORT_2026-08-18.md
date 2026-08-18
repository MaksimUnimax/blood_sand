# Ozon live-repair V3 behavioral completion report

Date: 2026-08-18
Scope: behavioral completion engineering gate only; not independent acceptance, live-provider testing, or release promotion.

## Authority and safety

- Repository: `MaksimUnimax/blood_sand`
- Frozen base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- V3 checkpoint: `88a20984c55da1f813ca1184bd90089823f51883`
- V3 concat: `aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`
- `REAL_OZON_REQUESTS = 0`
- `REAL_PERFORMANCE_REQUESTS = 0`
- No real Seller/Performance credentials, provider requests, V4, V3 patch changes, production fixes, fuzzing, reject application, or manual repair were used.

## Exact repaired candidate

The previously established exact V3 reconstruction was re-used only as an external diagnostic tree and re-verified:

- frozen Step-4 inventory: 17/17;
- repaired `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
- repaired `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- exactly two production files differ from frozen Step 4;
- the protected fifteen files remain byte-identical.

## Accepted CFT/Puppeteer route

The required architecture was executed:

`Node child_process.spawn -> Chrome for Testing -> dynamic DevToolsActivePort -> Puppeteer -> browser.installExtension`.

Chrome version: `151.0.7922.47`. The actual repaired unpacked extension installed successfully and its MV3 service worker was observed. Browser request interception denied `api-seller.ozon.ru` and `api-performance.ozon.ru`; observed provider requests were zero. A local synthetic page loaded successfully. This route did not use an operator profile.

## Completed behavioral evidence

Actual repaired-worker cache integration tests passed:

- verified analytics cache semantics and fixed profile behavior;
- cache-hit-before-quota path: logical result successful, `external_request_executed=false`, zero quota/provider calls;
- coalesced cache fan-out: zero quota/provider calls and no physical request;
- cache provenance and metric projection checks passed.

The repaired worker quota VM previously passed nominal 60000 ms, internal bridge safety 5000 ms, effective 65000 ms, boundary/migration, account isolation, and Retry-After extension-only checks with mocked storage/credentials/provider.

## Required gates not proven

The following mandatory actual-path gates were not completed in this run: repaired worker public `OZ_GET_MANUAL_STATE` manual and autorun privacy exercise with secret sentinels; actual mocked 429 one-call/zero-replay integration; production content countdown plate with three distinct displayed seconds, absolute due clock, due sending state, restart restoration, duplicate-click block, and two-owner isolation; ChatGPT/Alice structural binding and native Copy browser assertions; and the complete Step-1–4 regression matrix against the repaired bytes. These remain `UNPROVEN` and are not converted to PASS.

No provider or Performance request occurred while these gates remained unproven.

## Result

Because the standalone prompt requires every mandatory gate to pass and any required `UNPROVEN` forces failure, this is a report-only `PREFREEZE_V3_BEHAVIORAL_FAILED` result. It does not authorize a live rerun, acceptance, freeze, or release promotion.
