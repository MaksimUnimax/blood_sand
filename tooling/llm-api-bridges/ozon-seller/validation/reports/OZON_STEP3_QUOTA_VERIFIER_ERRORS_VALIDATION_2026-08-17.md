# Ozon Bridge Step 3 — independent validation

- tested SHA: `eae8988f5baf8c7ead5a82371c9b1057295c906d`
- target tree was clean before testing; validation used a detached exact checkout.
- environment: Windows `Microsoft Windows NT 10.0.26200.0`, Git `2.40.1.windows.1`, Python `3.12.13`, Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`.

## Reconstruction and patch integrity

- reconstruction-v2: `RECONSTRUCTION_V2_PASS`; base64 size/SHA `133760 / cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`; ZIP size/SHA `100320 / 2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`; exact 17-file inventory.
- Step 1 raw patch concat: size `61758`, SHA `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`.
- Step 2 raw patch concat: size `35644`, SHA `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`.
- Step 3: all eight raw Git blob parts matched manifest sizes/SHA values; concat size `42730`, SHA `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`; patch applied cleanly.
- Step 2 baseline hashes before Step 3 matched accepted values. Step 3 changed exactly six production files with manifest hashes; the other eleven were byte-identical.

## Scheduler, verifier, privacy and errors

- `seller.analytics_data.v1` uses `60000` ms; unrelated Seller and Performance operations bypass this family.
- deterministic identity tests: same Client-Id with rotated Api-Key produced the same account bucket and a different credential revision; different Client-Id produced an independent bucket. Raw credentials were absent from persistent state and AI-facing rate metadata exposed no account hash.
- concurrent same-account acquire: exactly `1` permit and `1` durable wait; `next_allowed_at = dispatch + 60000 ms`. Different account acquired independently.
- Retry-After `120` extended the persisted window; shorter `30` did not shorten it; valid HTTP-date was honored; invalid value produced no invented wait; `automatic_retry` remained false.
- durable owner transition to `quota_waiting` persisted family/timing/group metadata; storage failure returned `PROVIDER_QUOTA_STATE_UNAVAILABLE` with `external_request_executed:false`; missing credentials skipped scheduling and performed no provider call.
- actual provider verifier: valid data-only, totals-only and combined metric surfaces passed; malformed cardinality failed with `PROVIDER_RESPONSE_CONTRACT_MISMATCH` after exactly one transport attempt. Non-analytics remained sanitization-only.
- mocked 429 errors and bridge/transport errors were structured and sanitized with `automatic_retry:false`; raw body, secret, email, phone and credentials did not reach AI output. No provider retry was performed.
- all provider behavior was mocked. `REAL_OZON_REQUESTS = 0`.

## Regression and browser gates

- Step 1 capability planner, Step 2 query planner, Step 2 coalescing inputs, and checked delivery/finalization FSM bodies were byte-identical; `processBatchQueue` was checked as the intended integration point.
- manifest host permissions were unchanged; only `alarms` was added. MV3 alarm listener and startup resume path were present. No Step 4 cache/prefetch/semantic-alias implementation was found.
- all 17 production JavaScript files passed `node --check`; manifest parsed; `git diff --check` passed; security scans found no automatic retry or hidden pagination/report polling additions.
- accepted browser route passed: Node `spawn`, dynamic `--remote-debugging-port=0`, `DevToolsActivePort`, Puppeteer `25.4.0`, CFT `151.0.7922.47`, `browser.installExtension()`, dedicated profile, fixed extension ID during run, MV3 service worker, alarms API, and `OPERATOR_BROWSER_ACTIONS = 0`.
