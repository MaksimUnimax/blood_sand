# Ozon Bridge Step 4 — independent synthetic validation

- tested SHA: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- exact detached target checkout was clean before testing.
- environment: Windows `Microsoft Windows NT 10.0.26200.0`, Git `2.40.1.windows.1`, Python `3.12.13`, Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`.

## Reconstruction and patch integrity

- reconstruction-v2 operator baseline: size `100320`, SHA `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`, exact 17-file inventory.
- accepted Step 1 concat SHA: `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`.
- accepted Step 2 concat SHA: `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`.
- accepted Step 3 concat SHA: `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`.
- all six Step 4 raw Git parts matched manifest size/SHA; concat size `29136`, SHA `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`; patch applied cleanly.
- final production delta was exactly `service_worker.js`, `shared/ozon_contract.js`, and `shared/runtime_names.js` with manifest hashes. The other fourteen production files were byte-identical to Step 3.

## Cache identity, semantics and admission

- fixed storage key: `ozmb_provider_result_cache_v1`; fixed TTL: `60000` ms.
- same Seller Client-Id with rotated Api-Key reused the account-scoped cache; a different Client-Id missed. Raw credentials and account hash were absent from persisted cache and cache metadata.
- verified cache VM matrix passed exact and safe metric-superset hits, requested metric order projection, object-key normalization, and misses for date, dimensions/order, offset, limit/window, account, expiry and missing metrics.
- cache admission accepted only `ok=true` verified analytics responses; provider errors and malformed cardinality were rejected. Corrupt persisted entries failed closed to a miss.
- actual worker queue cache-hit path was exercised with mocked storage/cache: single logical hit and two-member coalesced hit completed with `quota acquire = 0`, `provider calls = 0`, `external_request_executed = false`, null current physical request id and explicit cache provenance.

## Fixed acquisition profile and integration

- `analytics_basic_metrics_v1` applied only to universal `revenue`/`ordered_units` subsets and physically requested exactly `revenue + ordered_units`; restricted metrics did not activate it and query semantics remained unchanged.
- actual prefetch projection returned only the logical requested metric while preserving verified response semantics and acquisition profile metadata.
- source ordering proves cache lookup precedes Step 3 quota acquisition; cold/incompatible misses retain the existing quota path. No automatic retry was introduced.
- synthetic ChatGPT/Alice-style independent owner identities exercised cache fanout without a global current-conversation state; delivery ownership remained per owner.

## Protected surfaces and regressions

- brace-aware function-body comparison passed for Step 1/2/3 planners, quota/verifier/cache prerequisites, and finalize/delivery FSM functions. `processBatchQueue` was the only intended integration point changed.
- manifest permissions and host permissions were byte-identical to Step 3. All 17 production JavaScript files passed `node --check`; manifest parsed; `git diff --check` passed.
- security scan found no automatic retry, hidden pagination/report polling, arbitrary cache policy/TTL/key control, semantic alias, transport-surface expansion or canonical-release/live-acceptance claim.

## Browser and live boundary

- accepted browser route passed: Node `child_process.spawn`, CFT `151.0.7922.47`, dynamic `--remote-debugging-port=0`, `DevToolsActivePort`, Puppeteer `25.4.0`, `browser.installExtension()`, dedicated QA profile, fixed extension ID during run, MV3 service worker and alarms API.
- `OPERATOR_BROWSER_ACTIONS = 0`.
- all provider behavior was mocked and no Ozon endpoint was contacted: `REAL_OZON_REQUESTS = 0`.
- final real-profile ChatGPT/Alice/Ozon acceptance remains a separate controlled gate; this report does not claim live acceptance or canonical release promotion.
