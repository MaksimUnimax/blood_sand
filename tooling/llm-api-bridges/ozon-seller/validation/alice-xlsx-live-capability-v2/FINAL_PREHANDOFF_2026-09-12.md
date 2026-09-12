# Alice XLSX live capability — final pre-handoff

Workflow run: `34675305184`
Exact executable source: `ee80e80443ac10f733cdd58884cfd2dbf12bbefb`
Exact executable tree: `59eda6bee8694603dfc2984a3fafe73175343a08`
Exact ZIP: `OZON_BRIDGE_v0.1.19_ALICE_XLSX_LIVE_CAPABILITY_20260912.zip`
Exact ZIP SHA-256: `a770c5501289334154205f4f8f9293daa052d4076ba3518e1de90d96a2cee3da`
Exact ZIP bytes: `259585`
Production files: `32`

## GATE-01..35

| Gate | Status |
|---|---|
| GATE-01 | PASS — Owner explicitly authorized the Alice XLSX corrective executable patch. |
| GATE-02 | PASS — Owner supplied live evidence that ordinary Alice accepts XLSX attachments. |
| GATE-03 | PASS — The old executable is preserved by an intentional RED run that fails on missing Alice XLSX capability. |
| GATE-04 | PASS — Provider diagnostics establish that the report file was already returned HTTP 200 before the local type rejection. |
| GATE-05 | PASS — Root cause is isolated to stale central Alice file capability metadata, not Ozon report transport. |
| GATE-06 | PASS — Executable scope is exactly one production file: shared/ai_delivery_capabilities.js. |
| GATE-07 | PASS — Alice accepted_extensions adds xlsx without removing txt/pdf/doc/docx. |
| GATE-08 | PASS — Unverified xls is not promoted together with xlsx. |
| GATE-09 | PASS — Alice runtime verification policy remains for still-unknown original-provider types. |
| GATE-10 | PASS — Alice max file size remains 100 MiB. |
| GATE-11 | PASS — Alice max files per turn remains one. |
| GATE-12 | PASS — Alice attachment strategy remains drag_drop_v1. |
| GATE-13 | PASS — XLSX with application/octet-stream is verified-supported. |
| GATE-14 | PASS — XLSX with canonical XLSX MIME is verified-supported. |
| GATE-15 | PASS — Unknown original-provider CSV continues through bounded runtime-target verification rather than false static support. |
| GATE-16 | PASS — Opaque provider .bin remains fail-closed. |
| GATE-17 | PASS — Oversized XLSX remains fail-closed before target dispatch. |
| GATE-18 | PASS — Worker and content remain the exact two central dispatch-decision consumers. |
| GATE-19 | PASS — No worker/content local capability mutation is introduced. |
| GATE-20 | PASS — Provider artifact source provenance and provider: key boundary remain intact. |
| GATE-21 | PASS — Provider artifact SHA-256 integrity boundary remains intact. |
| GATE-22 | PASS — Original provider file bytes are not converted, rewritten or regenerated. |
| GATE-23 | PASS — Alice File/DataTransfer/dragenter/dragover/drop browser primitive passes for XLSX. |
| GATE-24 | PASS — Alice bounded attachment readiness check remains before Send. |
| GATE-25 | PASS — Alice blocked-Send and exactly-once protections remain regressed. |
| GATE-26 | PASS — Unknown target attachment outcome remains no-retry/no-duplicate. |
| GATE-27 | PASS — Alice SPA owner/tab/origin/conversation guards remain regressed. |
| GATE-28 | PASS — IndexedDB durable artifact commit behavior remains regressed. |
| GATE-29 | PASS — Global idle false-plaque correction remains regressed. |
| GATE-30 | PASS — Repeated Work Start lifecycle correction remains regressed. |
| GATE-31 | PASS — Report workflow sequencing and file-delivery accounting remain regressed. |
| GATE-32 | PASS — Command envelope and mixed HELP/API isolation remain regressed. |
| GATE-33 | PASS — No provider calls or hidden retry/polling/pagination/fan-out/refetch/resend are introduced by this patch. |
| GATE-34 | PASS — Linux and Windows exact-source/fresh-package/Git-blob parity pass. |
| GATE-35 | PASS — Exact ZIP identity and remaining live-only checks are recorded without promoting LIVE certification. |

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP and repeat a real Ozon report workflow through `report_create -> report_info -> report_file_get`; the original XLSX must be attached to Alice and reach attachment readiness without `file_type_not_supported`.

LIVE-GATE-02: `PENDING POST-INSTALL` — on that exact XLSX delivery verify one and only one Send, no duplicate drop/message, and no automatic provider refetch/retry/resend.

**LIVE CERTIFICATION: PENDING**
