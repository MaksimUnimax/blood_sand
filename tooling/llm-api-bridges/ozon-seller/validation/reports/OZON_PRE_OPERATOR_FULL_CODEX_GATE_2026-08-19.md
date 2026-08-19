# Ozon Bridge v0.1.19 — Codex pre-operator full validation report

Checklist authority: `16563e10b9e5648878dfc3dc97bfd9ccc031b33b`
Repository: `MaksimUnimax/blood_sand`
Candidate branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Verdict

`OZON_PRE_OPERATOR_FULL_GATE_REJECTED`

The exact candidate was reconstructed independently as candidate-A and candidate-B. A/B identity passed. Current targeted composer-wait behavior passed. The full gate is rejected because the independent quota/legacy regression/browser evidence did not complete; block 16 was not run.

## Candidate identity

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- patch bytes: `13648`
- patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- clean one-time patch application: candidate-A PASS; candidate-B PASS
- candidate-A worker SHA-256 / CURRENT_WORKER_SHA256: `a943160760e21df0f04b9ef3787350a7527205d5ae67cea105349d033bf8f95e`
- candidate-A content SHA-256 / CURRENT_CONTENT_SHA256: `82f7d75e4c954e26a2b984e49b8ef9cbdafaa81cfab4681f8bbd015d808092dc`
- candidate-B worker SHA-256: `a943160760e21df0f04b9ef3787350a7527205d5ae67cea105349d033bf8f95e`
- candidate-B content SHA-256: `82f7d75e4c954e26a2b984e49b8ef9cbdafaa81cfab4681f8bbd015d808092dc`
- A_B_BYTE_IDENTICAL=true
- production inventory: 17 files
- changed files: `service_worker.js`, `content_script.js`
- protected 15 files byte-identical: PASS
- production JS syntax: PASS, 14/14
- manifest JSON: PASS
- production modifications by Codex: 0

Historical metadata discrepancy: historical `dfc101f6...` and `ab3408a2...` were not used as gate preconditions and differ from the independently derived current identity.

## Executed current-candidate evidence

### Targeted composer-wait harness

Exact reconstructed harness bytes: 21942; SHA-256:
`ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`

PASS markers observed:

- `TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS`
- `TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS`
- `TARGETED_QUOTA_CACHE_PRESERVED_PASS`
- `TARGETED_OTHER_OWNER_PRESERVED_PASS`
- `TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS`
- `TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS`
- `TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS`
- `TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS`
- `TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS`
- `TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS`
- `TARGETED_MANUAL_COMPOSER_WAIT_HELPER_PRESENT_PASS`
- `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`
- `TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`

### Worker/quota harness

Command: `node V3_WORKER_ACTUAL_PATH_HARNESS.mjs <candidate-A>`

Test-only adaptations: stale worker/content integrity preconditions were replaced with CURRENT hashes; the timing fixture `last=now-64800` was changed to `last=now-57000` to avoid the historical sub-second race. Behavioral assertions were not changed.

Observed PASS markers before failure:

- `V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS`

Exit code: 1

Relevant failure:
`Error: waitFor timeout` at the incompatible-cache-miss / durable quota-wait assertion. No provider request was emitted before failure.

Classification: `HARNESS_FIXTURE_FAILURE` / incomplete quota evidence; not classified as production behavior failure.

### Regression carry-forward harness

Command: `node V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs <exact-frozen-ZIP-dir> <candidate-A>`

Test-only adaptation: stale Step-4 worker precondition was replaced by the exact frozen ZIP worker hash. Behavioral assertions were not changed.

Observed:
`V3B_PROTECTED_15_BYTE_IDENTICAL_PASS`

Exit code: 1

Failure:
`Error: protected worker function drift: buildBatchQueryPlan`

Classification: `HARNESS_FIXTURE_FAILURE`; the historical carry-forward function fixture is incompatible with the exact current frozen base. No production code was modified.

### Browser/runtime harness

Command:
`node V3_BROWSER_COUNTDOWN_HARNESS.mjs <candidate-A> <CFT-exe>`

Test-only adaptations: current candidate hashes only; execution from existing QA project context so existing Puppeteer 25.4.0 / CFT 151.0.7922.47 could resolve. Synthetic interception configured; no operator profile/actions.

Exit code: 1

Failure:
Puppeteer `TimeoutError: Timed out after waiting 10000ms`

The harness did not reach its behavioral markers. Classification: `ENVIRONMENT_FAILURE` / browser substrate timeout, not production behavior failure.

## Block results

- B01 Candidate integrity: PASS
- B02 Command discovery / strict contract: BLOCKED_BY:no complete current-candidate executable evidence after downstream harness failure
- B03 Provider/security boundary: BLOCKED_BY:no complete current-candidate executable evidence
- B04 Seller capability / entitlement: BLOCKED_BY:full worker evidence timed out
- B05 Query planner / coalescing / projection: BLOCKED_BY:no complete current-candidate executable evidence
- B06 Global Seller quota scheduler: BLOCKED_BY:worker quota-wait assertion timeout
- B07 Response verifier / safe errors: BLOCKED_BY:worker harness did not reach verifier suite
- B08 Verified analytics cache / prefetch: BLOCKED_BY:worker quota/cache suite timeout
- B09 Manual / Autorun common batch engine: BLOCKED_BY:no complete current-candidate executable evidence
- B10 Delivery FSM normal empty composer: BLOCKED_BY:browser/runtime substrate timeout
- B11 Manual delivery occupied/missing composer: PASS
- B12 Manual OFF cancellation / OFF→ON: PASS
- B13 UI / bindings / owner isolation: BLOCKED_BY:browser/runtime substrate timeout
- B14 Performance boundary: BLOCKED_BY:browser/runtime substrate timeout
- B15 Browser/runtime: FAIL — ENVIRONMENT_FAILURE
- B16 Packaging: NOT_RUN / BLOCKED; forbidden because B01–B15 were not all PASS

## Counters and packaging

- REAL_OZON_REQUESTS=0
- REAL_PERFORMANCE_REQUESTS=0
- REAL_CHATGPT_REQUESTS=0
- OPERATOR_BROWSER_ACTIONS=0
- ZIP created: no
- package path/SHA: not applicable
- fresh-extract byte verification: not run

No production candidate or production files were modified. No dependencies were installed or updated.
