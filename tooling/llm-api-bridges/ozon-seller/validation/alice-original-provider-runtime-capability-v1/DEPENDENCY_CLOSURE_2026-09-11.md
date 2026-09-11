# Alice original provider file runtime capability — dependency closure

Workflow run: `34600532631`
Pre-fix FAIL run: `34599185323`
Targeted materialization run: `34599433719`
Exact executable source: `4fb9c1a859ce7245101e47ffa6e189026e386d8f`
Exact executable tree: `b770c8245449bc7ea0951b47085797cfca050e41`
Exact package: `OZON_BRIDGE_v0.1.19_ALICE_PROVIDER_FILE_RUNTIME_CAPABILITY_20260911.zip`
SHA-256: `1e7f031f5503cc72dff2482ab47cb5c9ef5b4461997b1446cd9068f8048a2dee`
Bytes: `255763`
Production files: `32`

| Dependency layer | Closure |
|---|---|
| observed failure | Real Ozon XLSX reached local delivery and was rejected by Bridge's own static Alice type allowlist before browser File/DataTransfer/drop. |
| pre-fix reproduction | Dedicated baseline run intentionally fails because no runtime-aware dispatch decision exists. |
| capability truth | `supportsFile()` remains a static/preverified statement; XLSX is not falsely added to Alice `accepted_extensions`. |
| dispatch authority | New `fileDispatchDecision()` is the single decision boundary for both worker and content attachment preflights. |
| provenance | Runtime verification is available only for `source_kind=original_provider_file`, worker-owned `provider:` artifact keys, concrete MIME/extension, and SHA-256-backed artifacts. |
| size guard | Existing Alice max-file-size boundary remains enforced before runtime type verification. |
| ambiguous binary | `.bin` / `application/octet-stream` remains fail-closed. |
| worker consumer | Pre-commit worker preflight uses the same canonical dispatch decision. |
| content consumer | Pre-File content preflight uses the same canonical dispatch decision. |
| transport | Existing browser `File -> DataTransfer -> dragenter -> dragover -> drop` path is unchanged. |
| runtime verification | Success still requires target UI attachment preview/readiness; static policy no longer fabricates a negative capability result for trusted originals. |
| unknown outcome | After commit/drop, unknown result remains no-retry/no-re-attach. |
| state/storage | Artifact DB schema, delivery state schema, ref ownership and transaction durability are unchanged. |
| exact bytes | Original provider bytes, filename, MIME, byte length and SHA-256 remain preserved. |
| SPA owner | Current live conversation ownership and tab/origin security guards are unchanged. |
| send | Blocked-send guard, one Send commit, one click and no automatic resend are unchanged. |
| provider transport | No Seller/Performance/report transport behavior or request cardinality is changed. |
| report workflow | `report_create -> report_info -> report_file_get` remains explicit; no hidden continuation is added. |
| privacy/entitlement | No privacy, credentials, entitlement or permissions logic is changed. |
| security | Runtime type verification does not admit caller-generated or integrity-less files. |
| regression | Large text, DnD, auto-send, SPA owner, IndexedDB, direct-binary, report workflow and command-envelope gates are re-run. |
| packaged runtime | Deterministic ZIP is compared byte-for-byte against exact Git blobs and re-tested after fresh extraction on Linux and Windows. |
| live | Actual Alice acceptance/rejection of XLSX remains live-only and must be observed after installing this exact package. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **1**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
