# Ozon Bridge v0.1.5 — post-release changed-line verification

Date: 2026-08-12

This verification does **not** modify the v0.1.5 production artifact or its immutable reference snapshot. It was added after the initial 67/67 acceptance because the required review standard is stricter: every behavior-changing production line must be exercised or explicitly source-asserted, not merely the observed Manual failure path.

The first 67-test run left eight newly-added `service_worker.js` lines unexecuted by V8 coverage: the Manual error-report-construction failure cleanup branch and the Autorun call to the new shared execution-error builder. Two targeted tests close those gaps. The resulting suite is 69/69 PASS.

The final changed-line audit reports:

- `service_worker.js`: 186/186 newly-added/replaced v0.1.5 lines covered by full-file V8 execution;
- `shared/ozon_contract.js`: 1/1 changed line covered;
- `shared/runtime_names.js`: 3/3 changed lines covered;
- behavior-changing `content_script.js` functions are VM-executed by the existing actual-source harnesses (`commandKey()` and `handleCopy()`), and the deleted local Manual parse gate is checked by the architecture invariant test;
- version/display-only lines in `content_script.js`, `manifest.json`, `popup.html`, and `popup.js` are exact-source asserted by package/version tests and this audit;
- production ZIP remains byte-identical with SHA-256 `130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651`.

This is a **changed-line verification**, not a false claim of 100% line coverage over all unrelated legacy extension code.
