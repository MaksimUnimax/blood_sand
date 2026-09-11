# IndexedDB transaction durability — final pre-handoff

Workflow run: `34576974909`
Exact executable source commit: `07a9cce24c0c011fd3898453c8c4e6445220fd43`
Exact executable source tree: `920afda7b4455ca7dd10b2db4b9a2ea676eaff92`
Exact ZIP: `OZON_BRIDGE_v0.1.19_INDEXEDDB_TRANSACTION_DURABILITY_20260911.zip`
Exact ZIP SHA-256: `c6e7321d2bfe9d7b9be86c2b8a49725655cbc5631de6899abe0fee581f90c537`
Exact ZIP bytes: `254809`
Production files: `32`

## Corrected behavior

- `IDBRequest.success` is no longer treated as durable persistence for artifact writes.
- Direct binary refs/raw-byte redaction are promoted only after the artifact transaction fires `complete`.
- The common artifact store captures `request.result` on request success but resolves callers only after transaction `complete`.
- A transaction abort after request success rejects the write and cannot be turned into a successful durable-artifact result.
- The common transaction helper now covers generated TXT, original provider files, inline provider documents, reads and cleanup deletes with one commit boundary.
- No hidden Ozon retry, polling, pagination, fan-out, refetch or resend was introduced.

## GATE-01..35

| Gate | Status |
|---|---|
| GATE-01 | PASS — Owner authorization: Specific IndexedDB transaction-durability patch explicitly authorized |
| GATE-02 | PASS — Historical evidence preservation: Pre-fix request-success -> late transaction-abort race preserved as negative evidence |
| GATE-03 | PASS — Exact repair scope: Only two IndexedDB durability implementations changed; provider business semantics unchanged |
| GATE-04 | PASS — Direct-binary pre-fix reproduction: Old writer published generated_file_ref and discarded raw bytes before transaction outcome |
| GATE-05 | PASS — Common-store pre-fix reproduction: Old idbRequest resolved request.result on IDBRequest success before transaction completion |
| GATE-06 | PASS — Direct abort boundary: Request success leaves promise pending; later transaction abort rejects |
| GATE-07 | PASS — Direct commit boundary: Successful result is published only after transaction.oncomplete |
| GATE-08 | PASS — No premature ref: No generated_file_ref is published before durable transaction commit |
| GATE-09 | PASS — No premature byte discard: Provider base64 is not discarded before durable transaction commit |
| GATE-10 | PASS — Exactly-one provider request: Abort/commit tests do not add provider retry/refetch |
| GATE-11 | PASS — Common abort boundary: Common idbRequest rejects a late transaction abort after request success |
| GATE-12 | PASS — Common commit boundary: Common idbRequest returns saved request.result only after transaction complete |
| GATE-13 | PASS — Request-result preservation: Readonly/readwrite helper preserves the request result across the commit boundary |
| GATE-14 | PASS — IndexedDB implementation closed set: All 2/2 production IndexedDB implementations audited |
| GATE-15 | PASS — Shared DB authority: Both implementations use the same DB/store/version authority |
| GATE-16 | PASS — Direct writer authority: Direct artifact writer has transaction-complete success boundary |
| GATE-17 | PASS — Common writer authority: Common artifact helper has transaction-complete success boundary |
| GATE-18 | PASS — Common put consumers: All 3/3 common artifact put callsites await putArtifact |
| GATE-19 | PASS — Common delete consumers: All 2/2 delete callsites remain routed through transaction helper |
| GATE-20 | PASS — Common read consumers: All 3 get + 1 getAll consumers remain routed through transaction helper |
| GATE-21 | PASS — Captured provider artifact: Original provider bytes are returned as local artifact only after committed put |
| GATE-22 | PASS — Inline provider document: Inline provider materialization returns only after committed put |
| GATE-23 | PASS — Generated large-result TXT: Generated Bridge text artifact returns only after committed put |
| GATE-24 | PASS — Artifact cleanup: Deletes use the same transaction-complete helper; late abort is not reported as successful deletion |
| GATE-25 | PASS — Trusted-report capture failure semantics: Storage failure preserves provider success but later delivery fails closed; hidden re-download remains forbidden |
| GATE-26 | PASS — Direct binary formats: CSV/ZIP/PDF/PNG capture, redaction and opaque refs remain valid |
| GATE-27 | PASS — Personal-data provenance: Personal-data opaque ref policy remains unchanged |
| GATE-28 | PASS — Request cardinality: One explicit API envelope remains <= one physical business request |
| GATE-29 | PASS — No hidden continuation: No retry/poll/pagination/fan-out/refetch/resend added by durability patch |
| GATE-30 | PASS — LLM report workflow isolation: One-command-form and explicit report continuation behavior remains unchanged |
| GATE-31 | PASS — Alice delivery isolation: Alice attachment transport and Send state machine remain unchanged |
| GATE-32 | PASS — Large-result isolation: Complete-text document threshold/delivery remains unchanged |
| GATE-33 | PASS — MV3 lifecycle: Patched worker modules load in packaged MV3 runtime |
| GATE-34 | PASS — Exact package parity: Fresh extraction and canonical Git-blob bytes agree with exact executable source |
| GATE-35 | PASS — Security and accounting: No secrets/raw auth; provider_calls_during_patch_gate=0; exact artifact frozen |

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP above.

LIVE-GATE-02: `PENDING POST-INSTALL` — run a real Ozon document/direct-binary flow and verify the returned file is attached once and remains retrievable through delivery.

LIVE-GATE-03: `PENDING POST-INSTALL` — verify a large generated-result TXT persists and is attached through the same durable artifact store.

LIVE-GATE-04: `PENDING POST-INSTALL` — verify reload/MV3 recovery can read the committed artifact without a provider refetch.

LIVE-GATE-05: `PENDING POST-INSTALL` — verify exactly-once delivery and cleanup after confirmation.

**LIVE CERTIFICATION: PENDING**

No live-only gate is promoted to PASS by deterministic CI.
