# Alice SPA attachment owner — final pre-handoff

Workflow run: `34596596005`
Exact executable source commit: `7c801b04ada1f5bfda87931bc0bf8320e31a21c2`
Exact executable source tree: `c9f63520cb70649239e50386e159c4be2616c99b`
Exact ZIP: `OZON_BRIDGE_v0.1.19_ALICE_SPA_ATTACHMENT_OWNER_20260911.zip`
Exact ZIP SHA-256: `726262a63c37290a8a748199c2594d6ea0b37ee25be910da3430d7226ca85a6f`
Exact ZIP bytes: `255204`
Production files: `32`

## Corrected behavior

- A Runtime Port may be opened before Alice SPA creates/navigates to Chat A without freezing the attachment owner to the old route path.
- Immutable sender tab and origin remain transport trust anchors; current confirmed content-side conversation supplies the SPA-aware conversation identity.
- All 9 attachment RPCs use the same fail-closed ownership authority.
- Recovery ownership errors are visible and can no longer masquerade as “no pending recovery”.
- No Ozon provider transport, policy, entitlement, request cardinality or automatic continuation semantics changed.

## GATE-01..35

| Gate | Status |
|---|---|
| GATE-01 | PASS — Owner authorization: this specific Alice SPA attachment-ownership patch was explicitly authorized. |
| GATE-02 | PASS — Historical negative evidence: corrected packaged-runtime pre-fix run 34593942864 is preserved as an intentional FAIL. |
| GATE-03 | PASS — Exact repair scope: executable commit changes exactly two production files; Ozon provider business semantics are untouched. |
| GATE-04 | PASS — Pre-fix reproduction: persisted Chat A plus frozen root sender path reproduces ATTACHMENT_CONVERSATION_MISMATCH. |
| GATE-05 | PASS — SPA boundary: frozen sender path is no longer used as conversation identity after in-tab route change. |
| GATE-06 | PASS — Live identity producer: every attachment RPC requires a current confirmed content-side conversation identity. |
| GATE-07 | PASS — Reserved ownership field: internally generated live_owner is written after caller payload and cannot be overridden by it. |
| GATE-08 | PASS — Live origin normalization: live owner origin must be a parseable exact HTTPS origin. |
| GATE-09 | PASS — Conversation normalization: live conversation id must pass the configured provider path parser. |
| GATE-10 | PASS — Immutable tab trust anchor: sender tab must equal persisted owner tab. |
| GATE-11 | PASS — Immutable origin trust anchor: Runtime Port sender origin must equal persisted owner origin. |
| GATE-12 | PASS — Positive SPA control: stale root sender path plus matching live Chat A owner is accepted. |
| GATE-13 | PASS — Missing live-owner negative control: all attachment RPCs fail closed. |
| GATE-14 | PASS — Malformed live-owner negative control: invalid conversation identity fails closed. |
| GATE-15 | PASS — Non-HTTPS live-owner negative control: invalid origin fails closed. |
| GATE-16 | PASS — Cross-tab negative control: non-owner tab is rejected. |
| GATE-17 | PASS — Cross-origin negative control: sender from another AI origin is rejected. |
| GATE-18 | PASS — Cross-conversation negative control: Chat B cannot act on Chat A delivery. |
| GATE-19 | PASS — Attachment RPC closed set: all 9/9 RPC message types are guarded by live ownership. |
| GATE-20 | PASS — Recovery authority: OZ_ATTACHMENT_RECOVERY_GET uses the same persisted-owner/live-owner comparison. |
| GATE-21 | PASS — Operational authority: the other 8 RPCs remain routed through centralized ownerForMessage validation. |
| GATE-22 | PASS — Delivery authority: delivery_id mismatch guard remains active and unchanged. |
| GATE-23 | PASS — State/storage isolation: owner records, storage schema and artifact persistence semantics are unchanged. |
| GATE-24 | PASS — Recovery visibility: ownership/recovery errors are surfaced instead of silently becoming null recovery. |
| GATE-25 | PASS — Attachment state-machine regression: recovery, single-flight send commit and safe rollback remain valid. |
| GATE-26 | PASS — Capture/accounting regression: provider-file capture/accounting invariants remain valid. |
| GATE-27 | PASS — Mixed-batch and wake lifecycle regressions: attachment delivery continuation behavior remains valid. |
| GATE-28 | PASS — Direct-binary isolation: original provider file delivery and opaque artifact semantics remain valid. |
| GATE-29 | PASS — IndexedDB durability isolation: prior late-abort transaction durability gate remains PASS. |
| GATE-30 | PASS — No hidden provider continuation: retry/polling/pagination/fan-out/refetch/resend were not added. |
| GATE-31 | PASS — Command/report isolation: command-envelope and explicit report/output workflow gates remain PASS. |
| GATE-32 | PASS — MV3/browser lifecycle: packaged worker and attachment browser primitive execute in pinned Chrome. |
| GATE-33 | PASS — Linux exact package parity: fresh extraction equals exact executable Git blobs byte-for-byte. |
| GATE-34 | PASS — Windows exact package parity: same deterministic ZIP SHA/bytes and canonical Git-blob parity are verified. |
| GATE-35 | PASS — Security/accounting/freeze: negative controls pass, provider_calls_during_patch_gate=0, exact package identity is frozen. |

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP above.

LIVE-GATE-02: `PENDING POST-INSTALL` — on Alice start from a route where the port can predate Chat A, create/navigate to Chat A, and verify a real file attachment recovers without ATTACHMENT_CONVERSATION_MISMATCH or silent hang.

LIVE-GATE-03: `PENDING POST-INSTALL` — verify the file is attached/sent exactly once and the expected attachment state transitions complete.

LIVE-GATE-04: `PENDING POST-INSTALL` — reload/recreate the MV3 worker during an in-progress Chat A attachment and verify persisted recovery remains bound to Chat A without provider refetch.

LIVE-GATE-05: `PENDING POST-INSTALL` — verify a different tab/origin/conversation cannot claim Chat A attachment ownership while normal Chat A delivery still succeeds.

**LIVE CERTIFICATION: PENDING**

No live-only gate is promoted to PASS by deterministic CI.
