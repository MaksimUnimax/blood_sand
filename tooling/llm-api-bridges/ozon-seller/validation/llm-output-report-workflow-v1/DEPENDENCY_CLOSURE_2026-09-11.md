# LLM output + report workflow — dependency closure

Exact executable source commit: `67af6469a8bbd804c69e6de61323190efd98d4e9`
Exact executable source tree: `3b57365805796112dd8184089fd9d8f8f6799b15`
Final CI workflow run: `34574880738`

| # | Dependency | Authority/path | Verified behavior | Status |
|---|---|---|---|---|
| 01 | Owner authorization | `current project chat` | Specific LLM-output/report-workflow patch explicitly authorized | `PASS` |
| 02 | Historical evidence preservation | `branch history` | Pre-fix failure and earlier Alice delivery artifacts preserved | `PASS` |
| 03 | Exact repair scope | `production diff` | Startup/output/report continuation only; no provider business semantics changed | `PASS` |
| 04 | Pre-fix reproduction | `CI 34573663496` | Old startup prompt fails one-command-form requirement before production fix | `PASS` |
| 05 | Targeted post-fix contract | `targeted gate` | One block/Ozon/report continuation/direct-binary negatives pass | `PASS` |
| 06 | Secondary sweep | `secondary CI 34574291816` | Audit continued beyond first passing symptom | `PASS` |
| 07 | Report-create closed set | `runtime registry audit` | All 8 current report_*_create operations classified | `PASS` |
| 08 | Generated-document resolver closed set | `provider map audit` | All 7 provider URL->opaque-ref resolvers classified | `PASS` |
| 09 | Command form | `startup + result tail` | At most one text command block per assistant response | `PASS` |
| 10 | Independent grouping | `startup + result tail` | Independent API/HELP envelopes grouped in one block | `PASS` |
| 11 | Ozon submit control | `content_script + source audit` | Extension-owned Ozon button submits whole raw block | `PASS_UNCHANGED` |
| 12 | Manual duplicate guard | `content_script` | Exact busy block is not admitted twice | `PASS_UNCHANGED` |
| 13 | Dependent value discipline | `startup + workflow tail` | code/file_ref/cursor-like dependencies require prior real result | `PASS` |
| 14 | Fresh report code | `workflow gate` | Create uses only valid provider-returned REPORT code | `PASS` |
| 15 | Report status continuation | `workflow gate` | report_info continuation is exact and explicit | `PASS` |
| 16 | Fresh opaque file ref | `provider + workflow gate` | Only safe rpf_s/rpf_p ref is admitted to report_file_get | `PASS` |
| 17 | Ready-without-ref negative | `workflow gate` | Fails closed; no fabricated download command | `PASS` |
| 18 | Pending report semantics | `workflow gate` | Explicit next report_info; automatic_continuation=false | `PASS` |
| 19 | Failed report semantics | `workflow gate` | Terminal/no continuation on failed status/provider result | `PASS` |
| 20 | Report file terminal | `workflow gate` | report_file_get success has next_command=null | `PASS` |
| 21 | Generated document create chain | `workflow gate + provider map` | Fresh operation_id/task_id/etc feed exact documented resolver | `PASS` |
| 22 | Missing generated dependency negative | `workflow gate` | No resolver command fabricated when result field missing | `PASS` |
| 23 | Generated URL redaction | `provider + source audit` | Signed/raw URL is converted to opaque file ref before LLM tail | `PASS` |
| 24 | Direct binary terminal path | `direct-binary regression` | Provider bytes captured once; no redundant report_file_get | `PASS` |
| 25 | Personal-data policy | `provider/ref policy regressions` | Opaque report refs retain personal-data provenance gate | `PASS_UNCHANGED` |
| 26 | Entitlement policy | `existing regressions + no provider diff` | Capability/entitlement planning unchanged | `PASS_UNCHANGED` |
| 27 | Request cardinality | `mixed/command regressions` | One explicit API envelope <= one business request | `PASS` |
| 28 | No hidden continuation | `source audit` | Output patch contains no fetch/execute/poll/retry path | `PASS` |
| 29 | Manual/autorun convergence | `service_worker source audit` | Both finalize through combined report -> one output-tail boundary | `PASS` |
| 30 | Delivery integrity | `service_worker source audit` | Tail exists before outgoing SHA/commit | `PASS` |
| 31 | Large-result delivery | `Alice large-result regressions` | Tail participates in final text/document decision; no truncation | `PASS` |
| 32 | MV3 lifecycle | `extension worker smoke + wake regressions` | Worker entry loads wrapper and recovery remains valid | `PASS` |
| 33 | Default prompt persistence | `service_worker source/regression` | Stored is_default prompt migrates; custom prompt is preserved | `PASS` |
| 34 | Exact package parity | `Linux + Windows final CI` | Fresh extraction and canonical Git-blob bytes agree | `PASS` |
| 35 | Security/package/accounting | `final CI` | No secrets/raw URLs; provider_calls_during_patch_gate=0; exact artifact frozen | `PASS` |

Pre-fix negative control: **PASS** — run `34573663496` failed before production changes on the missing one-command-form contract.
Post-fix targeted control: **PASS** — run `34573978803` passed the targeted contract after the authorized production change.
Secondary closed-set sweep: **PASS** — run `34574291816`; report-create `8/8`, generated-document resolvers `7/7`, ordinary instruction tail `520` UTF-8 bytes.

Performance async report generation is not silently added by this patch: the current Performance authority keeps its server-side generation endpoints terminal/unexposed; existing explicit status/list/download reads remain unchanged. Direct documented CSV/ZIP reads continue through the existing direct-binary attachment path.

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies: **5**, all explicitly `PENDING POST-INSTALL`.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**

No post-install behavior is promoted by deterministic CI.
