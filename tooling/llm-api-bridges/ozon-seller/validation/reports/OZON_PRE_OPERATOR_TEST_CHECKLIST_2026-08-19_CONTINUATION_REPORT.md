# Ozon Bridge v0.1.19 — document-only pre-operator checklist report

Repository: `MaksimUnimax/blood_sand`  
Tested branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`  
Tested HEAD / production candidate authority: `9c224401c4b12bdbdb46ce57504c8009b1994f67`  
Checklist: `tooling/llm-api-bridges/ozon-seller/validation/CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md`  
Checklist blob: `f1a67442ce0da14bb7a921d8be1e0149e2704f04`

## Verdict

`OZON_PRE_OPERATOR_TESTS_REJECTED`

B01 passed. B02–B15 were attempted where standard existing means allowed, but the complete current-candidate behavior/browser matrix cannot be executed without creating or modifying test infrastructure, which this document explicitly forbids. These are BLOCKED environment limitations, not production FAIL results. The previous report was not modified. ZIP packaging was not run.

## Candidate reconstruction

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- patch parts used in exact order: `00.patch.part`, `01.patch.part`
- patch bytes: `13648`
- patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- exact mode: `git -c core.autocrlf=false apply --check`, then `git -c core.autocrlf=false apply`
- candidate-A service_worker.js: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- candidate-A content_script.js: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- candidate-B service_worker.js: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- candidate-B content_script.js: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- A_B_BYTE_IDENTICAL: PASS
- production inventory: 17
- changed versus frozen: `service_worker.js`, `content_script.js`
- protected 15: PASS, byte-identical
- production JavaScript syntax: PASS, 14 files checked
- manifest parsing: PASS
- permissions/host_permissions review: completed; no out-of-scope production modification observed
- production modifications by Codex: 0

## B01–B15 status

Only the permitted status values are used.

- B01: PASS
- B02: BLOCKED
- B03: BLOCKED
- B04: BLOCKED
- B05: BLOCKED
- B06: BLOCKED
- B07: BLOCKED
- B08: BLOCKED
- B09: BLOCKED
- B10: BLOCKED
- B11: BLOCKED
- B12: BLOCKED
- B13: BLOCKED
- B14: BLOCKED
- B15: BLOCKED

## Per-block evidence

### B01 — PASS

Performed two fresh candidate reconstructions from the exact frozen artifact, reconstructed the two patch parts in the required order, verified patch size and hash, ran `git -c core.autocrlf=false apply --check` and apply independently, verified both final hashes, 17-file inventories, A/B byte identity, protected-file identity, all production JavaScript syntax, and manifest parsing.

### B02 — BLOCKED

Attempted the available standard current-candidate worker/regression execution paths and direct file checks. The unmodified worker path stops at `worker SHA mismatch`; the unmodified regression path stops at `Step4 worker SHA mismatch`. Missing is an already available unmodified suite with the current candidate hashes that exercises the complete command-discovery and rejection contract. Adapting stale harnesses or creating a replacement is prohibited.

### B03 — BLOCKED

Attempted the available standard worker path. It terminates at its stale integrity precondition before provider/security assertions. Missing is a current-hash, already available executable security path. No credentials or real requests may be introduced.

### B04 — BLOCKED

Attempted the available standard worker path. It terminates before capability/entitlement scenarios. Missing is an unmodified current-candidate path for universal, restricted, restart, mixed, and Performance-only capability behavior.

### B05 — BLOCKED

Attempted the unmodified regression carry-forward path; it exits with `Step4 worker SHA mismatch). Missing is an already available current-candidate planner/coalescing suite. Replacing stale hashes or adapting the harness is forbidden.

### B06 — BLOCKED

Attempted the available worker path; it exits at `worker SHA mismatch` before the required normal cold-cache, persisted quota deadline, countdown, restart, owner, Retry-After, and 65000 ms effective-window sequence. Missing is an already available permitted product path with safe mocked provider responses. Creating an artificial deadline, fixture, or new test code is forbidden.

### B07 — BLOCKED

Attempted the available standard worker path; verifier scenarios are not reached because of the stale precondition. Missing is an unmodified current-hash execution path for malformed 200, 429, provenance, no-retry, and pre-fetch rejection behavior.

### B08 — BLOCKED

Attempted the unmodified regression path; it exits at `Step4 worker SHA mismatch`. Missing is an already available current-candidate cache/prefetch sequence covering TTL, projection, seller separation, incompatibility, expiry, errors, and quota preservation.

### B09 — BLOCKED

The available worker paths do not reach the common batch engine because of stale integrity guards. Missing is an already available unmodified current-candidate path for ordering, serialization, continuation, replay prevention, final reporting, and ownership isolation.

### B10 — BLOCKED

Attempted the existing qualified browser substrate. It provided browser launch/raw-page substrate evidence but not the required exact empty-composer product matrix. Missing is an already available browser execution path that performs all B10 observations without creating or modifying browser test infrastructure.

### B11 — BLOCKED

The existing available browser execution did not provide the complete current-candidate occupied/missing-composer matrix as a direct product run. Missing are the required observable occupied draft preservation, exact Russian plate, delayed clear, one insert/report, restart, and duplicate prevention checks through the product. The stale/adapted harnesses are not used as substitutes.

### B12 — BLOCKED

The existing available browser execution did not provide the complete direct product Manual OFF/ON lifecycle matrix. Missing are the required pending cancellation, state preservation, owner isolation, quota/cache/timestamp preservation, deadline obedience, and zero-call checks through the product. No synthetic state or replacement test code was created.

### B13 — BLOCKED

The available browser runner did not execute the required complete ChatGPT/Alice/native Copy, busy/ready, two-owner, cross-owner, and restart-isolation matrix. Missing is an already available qualified browser path for these current-candidate observations; extending the runner is prohibited.

### B14 — BLOCKED

No already available standard Performance-only synthetic/mocked flow was accessible that could verify host/auth semantics, zero Seller probes, and Seller quota/cache separation without credentials or new test infrastructure. No real Performance request was made.

### B15 — BLOCKED

The existing qualified substrate was available with Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`, fresh validation profile, and raw CDP capability. Its smoke-level extension loading/runtime evidence does not satisfy the required full B10–B13 browser matrix, lifecycle, network, and console/runtime evidence. Missing is an already available complete matrix execution that may be used without modifying test infrastructure.

## Complete executed checks

- Read README and its ordered mandatory documents from live GitHub.
- Read the three repair documents and the pinned checklist blob.
- Read the previous report at commit `88adb2bb0a401d532afd877857e9dfbcb55be5a4`.
- Freshly reconstructed candidate A and B.
- Verified frozen ZIP identity, exact patch bytes/SHA, exact patch mode, final hashes, inventory, A/B equality, protected files, JavaScript syntax, and manifest.
- Attempted unmodified existing worker and regression paths; both stopped at stale SHA guards.
- Inspected available qualified browser environment and its limitations.
- No production, candidate, source CFT, or test-infrastructure files were changed for this run.

## Not executed

- Complete current-candidate B02–B10 functional suites.
- Direct full B11/B12 browser product sequences.
- Full B13 ChatGPT/Alice/native Copy and owner-isolation matrix.
- Full B14 Performance boundary.
- Full B15 browser matrix.
- ZIP packaging and fresh extraction, forbidden because B01–B15 were not all PASS.

## Safety

`REAL_OZON_REQUESTS=0`  
`REAL_PERFORMANCE_REQUESTS=0`  
`REAL_CHATGPT_REQUESTS=0`  
`production modifications by Codex=0`  
`test infrastructure modifications by Codex=0`  
`ZIP=NOT_BUILT`  
`OZON_PRE_OPERATOR_TESTS_PASS`: not emitted
