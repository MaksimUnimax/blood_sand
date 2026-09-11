# Actual bounded checkpoint: policy, artifacts and worker tests

2026-09-11. Local source/test commit a7f35d585477c611899cbcb69d4cfe80080e0e24. Snapshot14files,50339JSONbytes; SHA256e23948dc4b8494032e37c3a189241b9389727415609af624711f57cab4eaa578. All3 uploaded blob hashes matched local files.

Actual results on this source: policy/artifact/identity61PASS; new WorkSession/delivery/provider-path34PASS; existing batch worker38PASS; previous worker9PASS. All synthetic/injected-network; WBcalls0. No installed/live claim. Per-assertion JSONL and actual test runners included. Source patch preserves local dispatch/storage errors instead of rewriting them to transport errors; prior batch run37PASS/1FAIL is also preserved. New tests include UI-only settings authority, both AI identities, multiworker file persistence, full large text, original blocked aliases staying blocked with PersonalDataON, revision guard, mixed files/text and storage failure preserving HTTP200 provider truth.

Two harness-only invocation failures were observed separately: contract runner initially called without required original-baseline argument, then with WB013 instead of required originalWB012 RED-control source. Neither is a product failure. Rerun against correct originalWB012 before final freeze.

Next: real Chromium synthetic-page tests of adapters/native file delivery/Work Session UI/XLSX; fix observed regressions and persist; final exact ZIP rerun. This checkpoint does not certify full Phase1.
