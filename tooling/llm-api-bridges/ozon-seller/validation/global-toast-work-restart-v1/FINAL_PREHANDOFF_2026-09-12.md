# Global idle attachment plaque + repeated Work Start — final pre-handoff

Workflow run: `34665593546`
Exact executable source: `1b3f0961ff9399430c9e5b3b70a4188f1282429d`
Exact executable tree: `a81781774368b2967d0e06547593972d9a9a3123`
Exact ZIP: `OZON_BRIDGE_v0.1.19_GLOBAL_IDLE_WORK_RESTART_20260912.zip`
Exact ZIP SHA-256: `78ff3b6681759a308e8aac1debfb8832fa04cc28599859a0979341cce3e4e2ac`
Exact ZIP bytes: `259583`
Production files: `32`

## GATE-01..35

| Gate | Status |
|---|---|
| GATE-01 | PASS — Owner explicitly authorized this corrective executable patch. |
| GATE-02 | PASS — Both defects are preserved by an intentional pre-fix RED run on the prior executable. |
| GATE-03 | PASS — False-plaque root cause is isolated to idle recovery being escalated through a user-visible error path. |
| GATE-04 | PASS — Repeated-Start root cause is isolated to existing-conversation Start bypassing durable pending authority before Send. |
| GATE-05 | PASS — Production correction is restricted to the four dependency-closed runtime consumers. |
| GATE-06 | PASS — Idle probe dependency failure no longer creates a false user-visible plaque. |
| GATE-07 | PASS — Explicit active-delivery wake dependency failure remains user-visible. |
| GATE-08 | PASS — Attachment owner/tab/origin/conversation security guards remain unchanged. |
| GATE-09 | PASS — Existing attachment transport and provider-original byte semantics remain unchanged. |
| GATE-10 | PASS — Existing-conversation Start creates durable worker-owned pending authority before irreversible Send. |
| GATE-11 | PASS — Work session is not prematurely promoted to ACTIVE_VISIBLE before correlated completion. |
| GATE-12 | PASS — Content obtains worker commit before clicking Send. |
| GATE-13 | PASS — Lost primary callback after Send cannot trigger a duplicate Send. |
| GATE-14 | PASS — Unknown post-click outcome is preserved as no-retry/no-duplicate. |
| GATE-15 | PASS — Definitive pre-click failure terminalizes the Start without fabricating success. |
| GATE-16 | PASS — Intent/revision/tab/origin/AI/conversation correlation guards reject stale events. |
| GATE-17 | PASS — Three consecutive Start generations pass without cross-generation contamination. |
| GATE-18 | PASS — Owner-tab closure cancels the matching pending Start. |
| GATE-19 | PASS — Service-worker recreation preserves durable Start authority without duplicate prompt. |
| GATE-20 | PASS — Response watcher rehydrates after worker recreation. |
| GATE-21 | PASS — Watcher revision/runtime-generation guard rejects stale watcher completion. |
| GATE-22 | PASS — Legacy Work lifecycle verifier passes on both prior baseline and corrected executable. |
| GATE-23 | PASS — No Seller/Performance/report provider transport or request cardinality is changed. |
| GATE-24 | PASS — Provider calls during patch validation are zero. |
| GATE-25 | PASS — No hidden retry/polling/pagination/fan-out/refetch/resend is introduced. |
| GATE-26 | PASS — Previous original-provider runtime-capability regressions pass. |
| GATE-27 | PASS — Previous Alice SPA attachment-owner regressions pass. |
| GATE-28 | PASS — IndexedDB transaction durability regressions pass. |
| GATE-29 | PASS — Alice large-result, drag/drop and blocked-send regressions pass. |
| GATE-30 | PASS — Direct-binary/provider attachment isolation regressions pass. |
| GATE-31 | PASS — Explicit LLM report workflow regressions pass. |
| GATE-32 | PASS — Command-envelope and mixed HELP/API isolation regressions pass. |
| GATE-33 | PASS — Pinned Chrome browser and MV3 extension lifecycle checks pass. |
| GATE-34 | PASS — Linux and Windows deterministic package/Git-blob byte parity pass after fresh extraction. |
| GATE-35 | PASS — Exact ZIP identity and live-only boundaries are recorded without promoting LIVE certification. |

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — open multiple supported AI tabs, reload/restart the extension/background worker while no attachment delivery is active, and verify there are zero false red attachment-delivery plaques.

LIVE-GATE-02: `PENDING POST-INSTALL` — during a real active attachment delivery, cause/observe a genuine delivery dependency failure and verify the active owner context still surfaces the error while idle tabs do not.

LIVE-GATE-03: `PENDING POST-INSTALL` — in an existing ChatGPT conversation execute `Start -> Finish -> Start`; the second prompt must be sent exactly once and the session may become active only after the correlated complete assistant response.

LIVE-GATE-04: `PENDING POST-INSTALL` — recreate the MV3 worker after the second Start click while the first response is pending; the prompt must not be sent again and the watcher must rehydrate and complete the same transaction.

LIVE-GATE-05: `PENDING POST-INSTALL` — exercise an uncertain Send outcome and verify no automatic retry, duplicate prompt, provider refetch or resend occurs.

**LIVE CERTIFICATION: PENDING**
