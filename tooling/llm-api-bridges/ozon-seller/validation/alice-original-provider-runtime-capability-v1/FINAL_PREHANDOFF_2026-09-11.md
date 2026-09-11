# Alice original provider file runtime capability — final pre-handoff

Workflow run: `34600532631`
Exact executable source: `4fb9c1a859ce7245101e47ffa6e189026e386d8f`
Exact executable tree: `b770c8245449bc7ea0951b47085797cfca050e41`
Exact ZIP: `OZON_BRIDGE_v0.1.19_ALICE_PROVIDER_FILE_RUNTIME_CAPABILITY_20260911.zip`
Exact ZIP SHA-256: `1e7f031f5503cc72dff2482ab47cb5c9ef5b4461997b1446cd9068f8048a2dee`
Exact ZIP bytes: `255763`
Production files: `32`

## GATE-01..35

| Gate | Status |
|---|---|
| GATE-01 | PASS — Owner explicitly authorized this corrective executable patch. |
| GATE-02 | PASS — Historical screenshot/log boundary preserved: report_file_get succeeded and Bridge blocked XLSX locally. |
| GATE-03 | PASS — Pre-fix run intentionally reproduces static-allowlist rejection before target runtime. |
| GATE-04 | PASS — Root cause is closed at the shared capability decision, not by a one-off XLSX allowlist entry. |
| GATE-05 | PASS — Production diff is restricted to capability policy plus its two consumers. |
| GATE-06 | PASS — `supportsFile()` remains truthful static capability evidence. |
| GATE-07 | PASS — `fileDispatchDecision()` separates static support from permission to perform bounded runtime verification. |
| GATE-08 | PASS — Runtime verification exception is provenance-bound to original provider files. |
| GATE-09 | PASS — Worker-owned `provider:` artifact key is required. |
| GATE-10 | PASS — SHA-256-backed artifact integrity is required. |
| GATE-11 | PASS — Concrete extension and MIME are required; generic binary fails closed. |
| GATE-12 | PASS — File-size guard dominates runtime type verification. |
| GATE-13 | PASS — Generated Bridge files do not receive the provider-original exception. |
| GATE-14 | PASS — Caller/untrusted artifact keys do not receive the exception. |
| GATE-15 | PASS — Alice XLSX is not hardcoded into `accepted_extensions`. |
| GATE-16 | PASS — A second non-preverified provider type proves policy is generalized rather than XLSX-specific. |
| GATE-17 | PASS — Preverified Alice TXT remains statically verified. |
| GATE-18 | PASS — ChatGPT XLSX behavior remains statically verified and unchanged. |
| GATE-19 | PASS — Worker pre-commit consumer uses canonical dispatch authority. |
| GATE-20 | PASS — Content pre-File consumer uses canonical dispatch authority. |
| GATE-21 | PASS — Exact closed set of stale static-only consumers is zero. |
| GATE-22 | PASS — Browser File/DataTransfer/drop preserves original provider filename/size/MIME. |
| GATE-23 | PASS — Target UI attachment readiness remains the success authority after dispatch. |
| GATE-24 | PASS — Unknown post-commit attachment outcome remains no-retry/no-re-attach. |
| GATE-25 | PASS — Provider artifact capture and request accounting regressions pass. |
| GATE-26 | PASS — IndexedDB transaction durability regressions pass. |
| GATE-27 | PASS — Alice large-result and drag/drop regressions pass. |
| GATE-28 | PASS — Alice blocked-send and exactly-once send regressions pass. |
| GATE-29 | PASS — Alice SPA attachment-owner regressions pass. |
| GATE-30 | PASS — Direct-binary original-file isolation regressions pass. |
| GATE-31 | PASS — Explicit LLM report workflow regressions pass. |
| GATE-32 | PASS — Command-envelope and mixed HELP/API isolation regressions pass. |
| GATE-33 | PASS — Pinned Chrome and MV3 packaged-runtime checks pass. |
| GATE-34 | PASS — Linux and Windows deterministic package/Git-blob parity pass. |
| GATE-35 | PASS — No provider call, hidden retry/polling/pagination/fan-out/refetch/resend is introduced during patch validation. |

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — install this exact ZIP and repeat the real Alice XLSX report-file scenario. PASS only if Bridge actually dispatches the original XLSX to Alice UI, Alice accepts it, the attachment becomes ready, and the message is sent exactly once. If Alice itself rejects XLSX, record that provider/UI fact; do not silently convert, retry, re-download or fabricate support.

**LIVE CERTIFICATION: PENDING**
