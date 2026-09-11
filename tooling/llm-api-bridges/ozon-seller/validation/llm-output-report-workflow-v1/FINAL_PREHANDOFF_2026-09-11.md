# LLM output + report workflow — final pre-handoff

Workflow run: `34574880738`
Exact executable source commit: `67af6469a8bbd804c69e6de61323190efd98d4e9`
Exact executable source tree: `3b57365805796112dd8184089fd9d8f8f6799b15`
Exact ZIP: `OZON_BRIDGE_v0.1.19_LLM_OUTPUT_REPORT_WORKFLOW_20260911.zip`
Exact ZIP SHA-256: `073a5da057c7377dc49c59a3518edb2b7c8ce2ce86a787e0a1053b8428a9e298`
Exact ZIP bytes: `254575`
Production files: `32`

## Corrected behavior

- Every Bridge delivery ends with exactly one `OZON_LLM_INSTRUCTIONS_V1` contract.
- The LLM is required to emit at most one fenced `text` command block and group all independent current-step `OZON_API_V1` / `OZON_HELP_V2` envelopes inside it.
- When a command block is emitted, the LLM is instructed to tell the user to press the extension-owned `Ozon` button on that block; manual copy/paste is not required.
- Dependent report/document workflows are explicit and fail closed: fresh create result -> exact next command -> fresh opaque dependency -> exact file-read command.
- No next command is auto-executed by the Bridge; the user remains the explicit admission boundary through the `Ozon` button.
- Direct binary documents remain terminal after their bytes have already been captured; the patch cannot cause a redundant second provider request.

## GATE-01..35

| Gate | Status |
|---|---|
| GATE-01 | PASS — Owner authorization: Specific LLM-output/report-workflow patch explicitly authorized |
| GATE-02 | PASS — Historical evidence preservation: Pre-fix failure and earlier Alice delivery artifacts preserved |
| GATE-03 | PASS — Exact repair scope: Startup/output/report continuation only; no provider business semantics changed |
| GATE-04 | PASS — Pre-fix reproduction: Old startup prompt fails one-command-form requirement before production fix |
| GATE-05 | PASS — Targeted post-fix contract: One block/Ozon/report continuation/direct-binary negatives pass |
| GATE-06 | PASS — Secondary sweep: Audit continued beyond first passing symptom |
| GATE-07 | PASS — Report-create closed set: All 8 current report_*_create operations classified |
| GATE-08 | PASS — Generated-document resolver closed set: All 7 provider URL->opaque-ref resolvers classified |
| GATE-09 | PASS — Command form: At most one text command block per assistant response |
| GATE-10 | PASS — Independent grouping: Independent API/HELP envelopes grouped in one block |
| GATE-11 | PASS — Ozon submit control: Extension-owned Ozon button submits whole raw block |
| GATE-12 | PASS — Manual duplicate guard: Exact busy block is not admitted twice |
| GATE-13 | PASS — Dependent value discipline: code/file_ref/cursor-like dependencies require prior real result |
| GATE-14 | PASS — Fresh report code: Create uses only valid provider-returned REPORT code |
| GATE-15 | PASS — Report status continuation: report_info continuation is exact and explicit |
| GATE-16 | PASS — Fresh opaque file ref: Only safe rpf_s/rpf_p ref is admitted to report_file_get |
| GATE-17 | PASS — Ready-without-ref negative: Fails closed; no fabricated download command |
| GATE-18 | PASS — Pending report semantics: Explicit next report_info; automatic_continuation=false |
| GATE-19 | PASS — Failed report semantics: Terminal/no continuation on failed status/provider result |
| GATE-20 | PASS — Report file terminal: report_file_get success has next_command=null |
| GATE-21 | PASS — Generated document create chain: Fresh operation_id/task_id/etc feed exact documented resolver |
| GATE-22 | PASS — Missing generated dependency negative: No resolver command fabricated when result field missing |
| GATE-23 | PASS — Generated URL redaction: Signed/raw URL is converted to opaque file ref before LLM tail |
| GATE-24 | PASS — Direct binary terminal path: Provider bytes captured once; no redundant report_file_get |
| GATE-25 | PASS — Personal-data policy: Opaque report refs retain personal-data provenance gate |
| GATE-26 | PASS — Entitlement policy: Capability/entitlement planning unchanged |
| GATE-27 | PASS — Request cardinality: One explicit API envelope <= one business request |
| GATE-28 | PASS — No hidden continuation: Output patch contains no fetch/execute/poll/retry path |
| GATE-29 | PASS — Manual/autorun convergence: Both finalize through combined report -> one output-tail boundary |
| GATE-30 | PASS — Delivery integrity: Tail exists before outgoing SHA/commit |
| GATE-31 | PASS — Large-result delivery: Tail participates in final text/document decision; no truncation |
| GATE-32 | PASS — MV3 lifecycle: Worker entry loads wrapper and recovery remains valid |
| GATE-33 | PASS — Default prompt persistence: Stored is_default prompt migrates; custom prompt is preserved |
| GATE-34 | PASS — Exact package parity: Fresh extraction and canonical Git-blob bytes agree |
| GATE-35 | PASS — Security/package/accounting: No secrets/raw URLs; provider_calls_during_patch_gate=0; exact artifact frozen |

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP above.

LIVE-GATE-02: `PENDING POST-INSTALL` — in Alice and ChatGPT verify one LLM command form receives one extension-owned `Ozon` button and one click submits the entire multi-envelope block.

LIVE-GATE-03: `PENDING POST-INSTALL` — execute a real report-create flow and verify the returned fresh code produces the exact `report_info` next command; then a fresh opaque `file_ref` produces the exact `report_file_get` next command.

LIVE-GATE-04: `PENDING POST-INSTALL` — verify the downloaded original provider file is delivered once with zero hidden provider retry/polling/pagination/fan-out/refetch/resend.

LIVE-GATE-05: `PENDING POST-INSTALL` — verify conversation continuation/reload/MV3 recovery after the report file is delivered.

**LIVE CERTIFICATION: PENDING**

No live-only gate is promoted to PASS by deterministic CI.
