# Global idle attachment plaque + repeated Work Start — dependency closure

Workflow run: `34665593546`
Pre-fix RED run: `34606440326`
Targeted materialization run: `34665177275`
Guarded production materializer run: `34665232728`
Exact executable source: `1b3f0961ff9399430c9e5b3b70a4188f1282429d`
Exact executable tree: `a81781774368b2967d0e06547593972d9a9a3123`
Exact package: `OZON_BRIDGE_v0.1.19_GLOBAL_IDLE_WORK_RESTART_20260912.zip`
SHA-256: `78ff3b6681759a308e8aac1debfb8832fa04cc28599859a0979341cce3e4e2ac`
Bytes: `259583`
Production files: `32`

| Dependency layer | Closure |
|---|---|
| observed false plaque | Idle attachment recovery on supported AI tabs escalated `ATTACHMENT_PORT_UNAVAILABLE` into a user-visible delivery error when no active delivery existed. |
| false-plaque root cause | Idle probe and explicit active-delivery wake shared the same user-visible error path. |
| idle recovery | Idle recovery dependency failures are diagnostic-only and do not create a red plaque. |
| active recovery | Explicit wake carries owner/delivery expectation; dependency failure remains visible for the active delivery. |
| attachment ownership | Existing tab/origin/conversation ownership checks and SPA owner guards remain authoritative. |
| attachment transport | Existing original-provider `File -> DataTransfer -> dragenter -> dragover -> drop` path is unchanged. |
| observed Work defect | Existing-conversation `Start` bypassed the durable pending-start transaction, marked `ACTIVE_VISIBLE` before Send acknowledgement, and could lose authority after an irreversible click. |
| Work transaction | New-chat and existing-conversation Start now share worker-owned durable pending intent/revision correlation before irreversible Send. |
| Send commit | Content must obtain a worker-owned commit before click; a lost callback cannot authorize an automatic duplicate click. |
| Send outcome | Acknowledged Send, definitive pre-click failure and unknown post-click outcome are persisted as distinct states. |
| unknown outcome | Unknown post-click outcome is explicitly no-retry/no-duplicate. |
| activation | `ACTIVE_VISIBLE` is not entered before correlated complete assistant-response evidence. |
| correlation | Intent, revision, tab, origin, AI, conversation and generation guards reject stale/delayed events. |
| tab closure | Closing the owner tab cancels the corresponding pending Start without reviving stale work. |
| MV3 recreation | Durable pending state survives service-worker recreation without re-sending the prompt. |
| watcher rehydration | `OZ_CONTENT_READY` can rehydrate the response watcher from worker-owned pending state. |
| generation guard | Rehydrated watcher events are bounded to the expected runtime generation/revision. |
| legacy lifecycle | SHOW/HIDE remain worker routes; Manual UI apply remains content-owned. The legacy verifier was corrected to the existing ownership contract and passes on both baseline and corrected trees. |
| provider transport | No Seller/Performance/report transport behavior or request cardinality changed. |
| provider calls | Patch gates perform zero provider calls. |
| hidden automation | No automatic retry, polling, pagination, fan-out, refetch or resend was added. |
| previous provider-file capability | Runtime verification for original provider file types remains intact and regressed. |
| previous Alice DnD/send | Drag/drop, blocked-send and exactly-once send protections remain regressed. |
| IndexedDB | Transaction durability/abort behavior remains regressed. |
| report workflow | Explicit `report_create -> report_info -> report_file_get` sequencing remains regressed. |
| command envelope | Command-envelope and mixed HELP/API isolation remain regressed. |
| browser/MV3 | Pinned Chrome and MV3 extension smoke are part of the authoritative Linux gate. |
| exact package | Deterministic ZIP is fresh-extracted, re-tested, and compared byte-for-byte with exact Git blobs. |
| cross-platform | Windows independently verifies source behavior, package identity, fresh extraction and exact Git-blob parity. |
| live idle tabs | Real multi-tab idle behavior after extension reload remains live-only. |
| live active delivery | Real active-delivery dependency failure visibility remains live-only. |
| live repeated Start | Real ChatGPT `Start -> Finish -> Start` and first complete response remain live-only. |
| live MV3 restart | Real worker recreation during second Start remains live-only. |
| live uncertain Send | Real uncertain click outcome remains live-only and must show no duplicate prompt. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **5**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
