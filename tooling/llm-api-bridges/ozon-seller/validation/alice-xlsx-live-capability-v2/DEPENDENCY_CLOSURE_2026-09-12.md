# Alice XLSX live capability — dependency closure

Workflow run: `34675305184`
Pre-fix RED run: `34674907242`
Targeted GREEN run: `34675193933`
Exact executable source: `ee80e80443ac10f733cdd58884cfd2dbf12bbefb`
Exact executable tree: `59eda6bee8694603dfc2984a3fafe73175343a08`
Exact package: `OZON_BRIDGE_v0.1.19_ALICE_XLSX_LIVE_CAPABILITY_20260912.zip`
SHA-256: `a770c5501289334154205f4f8f9293daa052d4076ba3518e1de90d96a2cee3da`
Bytes: `259585`
Production files: `32`

| Dependency layer | Closure |
|---|---|
| observed failure | The prior build downloaded the original Ozon `.xlsx` successfully and then rejected it locally as `file_type_not_supported` before Alice attachment delivery. |
| provider boundary | Preserved live diagnostics show `report_file_get` HTTP 200 before local delivery failure; this patch makes no provider request or transport change. |
| live capability evidence | Owner explicitly verified ordinary Alice accepts `.xlsx`; the prior assumption that XLSX support was unproven is superseded. |
| central authority | Alice `accepted_extensions` now includes only the newly proven `xlsx` addition; existing `txt/pdf/doc/docx` remain unchanged. |
| no over-promotion | `.xls` is not promoted; other unknown original-provider formats retain bounded runtime-target verification. |
| consumer closure | Worker and content remain the exact closed set of two consumers of central `fileDispatchDecision`; neither mutates capabilities locally. |
| original bytes | Original provider bytes, filename, MIME metadata, byte length and SHA-256 remain preserved; no XLSX conversion is introduced. |
| artifact provenance | Provider artifacts retain `source_kind=original_provider_file`, `provider:` artifact key and SHA-256 integrity boundary. |
| file size/count | Alice remains bounded to 100 MiB and one file per turn. |
| target transport | Existing `File -> DataTransfer -> dragenter -> dragover -> drop` path is unchanged. |
| target readiness | Existing bounded `attachmentReady` verification remains before Send. |
| send safety | Blocked Send, unknown-outcome no-retry and exactly-once protections remain unchanged and regressed. |
| SPA ownership | Live tab/origin/conversation ownership guards remain unchanged and regressed. |
| persistence | IndexedDB transaction durability remains unchanged and regressed. |
| idle recovery | False idle plaque correction remains unchanged and regressed. |
| Work lifecycle | Durable repeated Start/Finish/Start correction remains unchanged and regressed. |
| report workflow | Explicit report-create/report-info/report-file sequencing remains unchanged and regressed. |
| protocol | Command-envelope and mixed HELP/API behavior remains unchanged and regressed. |
| browser/MV3 | Pinned Chrome validates the new XLSX File/DataTransfer/drop fixture plus existing Alice/browser and MV3 smoke tests. |
| package | Deterministic ZIP is fresh-extracted, re-tested and compared with exact executable Git blobs. |
| cross-platform | Windows independently verifies source behavior, exact package identity, extracted runtime and Git-blob parity. |
| hidden automation | No automatic retry, polling, pagination, fan-out, refetch or resend is added. |
| provider calls during patch | Zero provider calls are made by patch validation. |
| post-install full chain | Exact patched ZIP still needs a real `report_create -> report_info -> report_file_get -> Alice XLSX readiness` run. |
| post-install exactly-once | Exact patched ZIP still needs confirmation that the live XLSX turn sends exactly once with no duplicate/refetch/resend. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **2**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
