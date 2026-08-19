# Ozon Bridge v0.1.19 — pre-operator checklist validation report

Repository: `MaksimUnimax/blood_sand`  
Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`  
Tested commit: `9c224401c4b12bdbdb46ce57504c8009b1994f67`  
Checklist commit: `c7e0da2ca8d47b24303b396e8cbea2e0ac8e16df`

## Verdict

`OZON_PRE_OPERATOR_TESTS_REJECTED`

The exact candidate was reconstructed and B01 passed. The remaining required independent checks could not all be executed with the already available standard environment without creating or modifying test infrastructure, which this checklist forbids. No production failure is claimed from those environment limitations. ZIP packaging was not run.

## Candidate identity

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- exact patch bytes: `13648`
- exact patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- patch mode: `git -c core.autocrlf=false apply --check`, then `git -c core.autocrlf=false apply`
- candidate-A service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- candidate-A content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- candidate-B service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- candidate-B content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- inventory: 17 files in each candidate
- A/B byte identity: PASS
- changed files versus frozen: `service_worker.js`, `content_script.js`
- protected files: 15/15 byte-identical
- production JavaScript syntax: PASS
- manifest parse: PASS

## B01–B15

Only the status values PASS, FAIL, or BLOCKED are used.

- B01 Candidate reconstruction and integrity: PASS
- B02 Command discovery / strict contract: BLOCKED
- B03 Provider and security boundary: BLOCKED
- B04 Seller capability / entitlement: BLOCKED
- B05 Query planner / coalescing / projection: BLOCKED
- B06 Global Seller quota scheduler: BLOCKED
- B07 Response verifier / safe errors: BLOCKED
- B08 Verified analytics cache / prefetch: BLOCKED
- B09 Manual / Autorun common batch engine: BLOCKED
- B10 Delivery FSM, normal empty composer: BLOCKED
- B11 Manual delivery, occupied/missing composer: PASS
- B12 Manual OFF cancellation and OFF→ON readiness: PASS
- B13 UI, bindings, and owner isolation: BLOCKED
- B14 Performance regression boundary: BLOCKED
- B15 Browser/runtime robustness and complete matrix: BLOCKED

### PASS

- B01: fresh independent candidate-A and candidate-B extraction, exact patch application, 17-file inventory, required hashes, A/B comparison, protected-file comparison, syntax, and manifest checks.
- B11: current exact targeted harness execution covered occupied/missing composer wait, persistent plate, clear-to-one-insert, restart restore, and related delivery assertions.
- B12: current exact targeted harness execution covered narrow pending-only cancellation, late insert commit blocking, OFF stopping composer wait, OFF→ON readiness, owner preservation, and zero provider calls on toggle.

### FAIL

None. No direct production-behavior failure was observed in an independently executable current check.

### BLOCKED details

- B02: Attempted the available current-candidate worker/regression execution paths. The standard worker harness stopped at its stale `worker SHA mismatch` precondition. Missing: an already available, unmodified current-hash suite for the complete contract assertions. The checklist forbids modifying that harness or creating a replacement, so the check cannot be physically completed.
- B03: Attempted the same standard worker path. It stopped before provider/security assertions at the stale worker-hash precondition. Missing: a current-hash, already available executable security suite; no credentials or real requests may be introduced.
- B04: Attempted the standard worker path. It stopped before entitlement assertions at the stale precondition. Missing: an unmodified current-candidate worker fixture/command that reaches the block.
- B05: Attempted the unmodified regression carry-forward harness; it stopped with `Step4 worker SHA mismatch`. Missing: an already available harness whose preconditions match this candidate. Modifying or adapting it is prohibited.
- B06: Attempted the standard worker path; it stopped with `worker SHA mismatch` before the required normal persisted-next_allowed_at quota sequence. Missing: an already available permitted fixture/command for the real product sequence. Creating artificial state or modifying the harness is prohibited.
- B07: Attempted the standard worker path; it stopped before verifier continuation. Missing: an already available current-hash executable path; no real provider traffic is allowed.
- B08: Attempted the unmodified regression carry-forward path; it stopped at `Step4 worker SHA mismatch`. Missing: a current-candidate unmodified suite for cache/prefetch continuation.
- B09: The available worker paths stop at stale integrity preconditions. Missing: a permitted current-hash common-engine execution path without creating or adapting test infrastructure.
- B10: The available browser runner reached only a raw-page smoke path and did not execute the required normal empty-composer browser matrix. Missing: an already available qualified browser test that performs the full required matrix without forbidden test-infrastructure changes.
- B13: The available browser runner did not execute the required ChatGPT/Alice/native-Copy and owner-isolation matrix. Missing: an already available complete current-candidate browser path; extending the runner is prohibited.
- B14: No independently executable standard current-candidate Performance boundary check was available without credentials or new mocking/test infrastructure. It was not safe or permitted to synthesize a replacement.
- B15: A qualified raw-CDP substrate was observed with Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`, canonical CFT inventory 308 files, canonical digest `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`, and setup exit code 78. However, the available runner executed only a raw-page smoke phase, not the complete required B10–B13 browser matrix. Missing: an already available full matrix runner that may be used without creating or modifying test infrastructure. Therefore B15 is BLOCKED, not a production FAIL.

## Executed checks

- Read the exact checklist from its pinned commit.
- Freshly extracted the frozen ZIP into two independent candidate directories.
- Materialized the exact two-part patch and verified byte count and SHA-256.
- Applied the patch independently to A and B with `core.autocrlf=false`.
- Verified both candidate hashes, 17-file inventories, A/B byte identity, protected-file identity, JS syntax, and manifest parsing.
- Ran the unmodified available worker harness; it exited 1 at `worker SHA mismatch`.
- Ran the unmodified available regression harness; it exited 1 at `Step4 worker SHA mismatch`.
- Ran the existing qualified raw-CDP browser environment; its substrate smoke passed, but its full browser matrix was not available and is not counted as B15 PASS.
- Ran the exact targeted composer-wait checks; B11/B12 assertions passed.

## Not executed

- Complete independent current-candidate B02–B10 suite.
- Full B13 UI/binding/owner-isolation matrix.
- Full B14 Performance regression boundary.
- Complete B15 browser matrix.
- ZIP packaging and fresh-extract package verification, as explicitly forbidden unless B01–B15 all pass.

## Safety totals

- REAL_OZON_REQUESTS=0
- REAL_PERFORMANCE_REQUESTS=0
- REAL_CHATGPT_REQUESTS=0
- OPERATOR_BROWSER_ACTIONS=0
- production modifications by Codex=0
- candidate modifications by Codex=0
- test-infrastructure modifications by Codex for this checklist run=0
- source CFT modifications=0
- package path: NONE
- package SHA: NONE
- terminal marker: ABSENT
