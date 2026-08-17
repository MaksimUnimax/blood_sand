# Ozon Bridge Step 2 — independent validation

- tested target: `93c1eae13f518d92d53bbf1af4793b35d26bc5d3`
- reconstruction: accepted Step 1 candidate plus raw Step 2 patch parts; all six part hashes, concat SHA, and three changed-file hashes matched the manifest.
- changed production files: exactly `service_worker.js`, `shared/ozon_contract.js`, `shared/ozon_provider.js`; fourteen protected production files were byte-identical.
- planner: compatibility key preserves normalized non-metric parameters; arrays remain ordered; duplicate metrics are ineligible; contiguous metric union is first-occurrence ordered and capped at 14.
- worker: independent VM tests covered 30-command union planning, incompatible limits, non-analytics separation, coalesced durable ownership, one physical call with logical fanout, provider error fanout, thrown execution, restart no-retry, and migration fail-closed.
- projection: valid logical metric projection passed; malformed physical response failed closed with no retry and shared physical provenance.
- Step 1 regression: capability-planning function and all checked delivery/finalization FSM bodies remained identical; entitlement metadata path remained intact.
- browser: accepted local route passed with Node child-process spawn, CFT `151.0.7922.47`, dynamic remote port `60748`, `DevToolsActivePort`, Puppeteer `25.4.0`, `browser.installExtension()`, dedicated QA profile, MV3 service worker, and operator browser actions `0`.
- security/scope: provider behavior was fully mocked; no real Ozon endpoint or credentials were used; no Step 3 scheduler, automatic retry, or temporal quota state was added; `REAL_OZON_REQUESTS = 0`.

## Evidence commands

- `node step2_independent_tests.mjs` — PASS
- `node hash_guard.mjs` — PASS (Step 1 capability body identical)
- `node --check` on all candidate JavaScript files — PASS
- `git diff --check` — PASS
- `node mv3_step2_sanity.mjs` — PASS
