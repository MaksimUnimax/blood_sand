# Ozon Bridge v0.1.19 — full Codex pre-operator validation report

Checklist authority: `c7e0da2ca8d47b24303b396e8cbea2e0ac8e16df`
Repository: `MaksimUnimax/blood_sand`
Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Verdict

`OZON_PRE_OPERATOR_FULL_GATE_REJECTED`

The exact candidate reconstruction and raw browser substrate passed. The gate is rejected because the persisted-due worker scenario did not reach durable `quota_waiting`, and the available browser execution did not provide the complete required block-15 matrix. No authorized package was created or published.

## Candidate identity

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- patch command: `git -c core.autocrlf=false apply --check <exact-patch>`; then `git -c core.autocrlf=false apply <exact-patch>`
- patch bytes: `13648`
- patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- candidate-A worker: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- candidate-A content: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- candidate-B worker: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- candidate-B content: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- A_B_BYTE_IDENTICAL=true
- production inventory: 17
- changed files: `service_worker.js`, `content_script.js`
- protected 15 byte-identical: PASS
- production JS syntax: PASS
- manifest parse: PASS
- permission/host-permission scope: PASS
- production modifications by validator: 0

## Worker/quota execution

Worker source used with only the authorized persisted-due correction from blob `44e396b9a566f0c33ba3e50ed6dc3dba07770a4d`:

- current hashes substituted only in test-only integrity preconditions;
- after waiting state, correction requires persisted `next_allowed_at > 0`, `persistedDue >= due`, waits through `persistedDue + 250ms`, invokes one synthetic alarm, waits up to 10000ms, and preserves the duplicate-call assertion;
- no `last=now-57000` substitution;
- no behavioral assertion removed or weakened.

Observed PASS markers:

- `V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS`

Exit code: 1. Failure: `Error: waitFor timeout` while waiting for persisted durable `quota_waiting`. No provider call occurred before failure.

Classification: `HARNESS_FIXTURE_FAILURE` / incomplete quota evidence. No production behavior failure is claimed from this pre-wait timeout.

## Regression and targeted execution

Exact targeted harness: 21942 bytes, SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.

Current-candidate targeted markers all passed, including:

- Manual OFF→ON readiness with quota/cache preserved;
- narrow pending-only cancellation;
- late insert commit blocked;
- occupied composer wait;
- missing composer wait;
- exact persistent plate;
- clear → one insert;
- restart restore;
- OFF stops wait;
- helper presence;
- other-owner preservation;
- zero provider calls on toggle.

The exact regression carry-forward harness, with stale hash preconditions adapted only to the exact frozen/candidate hashes, passed:

- `V3B_PROTECTED_15_BYTE_IDENTICAL_PASS`
- `V3B_STEP1_SECURITY_CARRY_FORWARD_PASS`
- `V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS`
- `V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS`
- `V3B_DELIVERY_FSM_CARRY_FORWARD_PASS`
- `V3B_STEP3_INTEGRATION_SURFACE_CARRY_FORWARD_PASS`
- `V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS`
- `V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`

Behavioral assertions were not weakened.

## Browser substrate

Qualified raw-CDP substrate execution passed:

- Node: `v24.12.0`
- Puppeteer: `25.4.0`
- CFT: `151.0.7922.47`
- canonical CFT source: 308 regular files
- canonical inventory SHA-256: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`
- owned-copy setup exit code: `78`
- source/copy identity: PASS
- exact launch args: PASS
- validation-only `--no-sandbox`: PASS
- extension install/enumeration: PASS
- raw PAGE `Target.createTarget`, Runtime/Page/Fetch: PASS
- raw PAGE local fixture: PASS
- worker activation/discovery: PASS
- selected worker transport: `PUPPETEER_DIRECT_CDP`
- direct worker Runtime/Network: PASS
- post-worker browser liveness: PASS
- `browser.newPage()`: not used in this current raw-CDP execution
- `worker.evaluate()` / `worker.evaluateHandle()`: not used

The available historical raw-CDP runner reached only a raw-page smoke Phase D; it does not contain the complete required current block-15 composer-wait/ChatGPT/Alice matrix. Its smoke result is not accepted as block-15 PASS, and its temporary ZIP is not used or published.

## Block results

- B01 Candidate integrity reconstruction: PASS
- B02 Command discovery / strict contract: BLOCKED_BY:no complete current-candidate independent executable suite available after accepted carry-forward evidence
- B03 Provider/security boundary: BLOCKED_BY:no complete current-candidate independent executable suite available
- B04 Seller capability / entitlement: BLOCKED_BY:worker quota fixture timed out before full suite
- B05 Query planner / coalescing / projection: PASS via exact regression carry-forward
- B06 Global Seller quota scheduler: FAIL — HARNESS_FIXTURE_FAILURE; persisted durable quota_waiting not reached
- B07 Response verifier / safe errors: BLOCKED_BY:worker quota fixture stopped before verifier continuation
- B08 Verified analytics cache / prefetch: PASS via exact regression carry-forward; full quota continuation not reached
- B09 Manual / Autorun common batch engine: BLOCKED_BY:no complete current-candidate independent executable suite
- B10 Delivery FSM normal empty composer: BLOCKED_BY:complete block-15 browser matrix not reached
- B11 Manual delivery occupied/missing composer: PASS
- B12 Manual OFF cancellation / OFF→ON readiness: PASS
- B13 UI / bindings / owner isolation: BLOCKED_BY:complete block-15 browser matrix not reached
- B14 Performance regression boundary: BLOCKED_BY:complete block-15 browser matrix not reached
- B15 Browser/runtime robustness: FAIL — HARNESS_ERROR; raw substrate passed but mandatory full browser matrix was not executed
- B16 Packaging gate: NOT_RUN / BLOCKED; packaging forbidden because B01–B15 were not all PASS

## Safety totals

- REAL_OZON_REQUESTS=0
- REAL_PERFORMANCE_REQUESTS=0
- REAL_CHATGPT_REQUESTS=0
- OPERATOR_BROWSER_ACTIONS=0
- production modifications by validator=0
- candidate modifications by validator=0
- source CFT modifications by validator=0

Package path: NONE
Package SHA: NONE
Fresh-extract byte verification: NOT_RUN for the authorized gate package
Failure classification: `HARNESS_FIXTURE_FAILURE`, `HARNESS_ERROR`
Terminal marker: ABSENT
