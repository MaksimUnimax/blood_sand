# Alice SPA attachment owner — dependency closure

Workflow run: `34596596005`
Exact executable source commit: `7c801b04ada1f5bfda87931bc0bf8320e31a21c2`
Exact executable source tree: `c9f63520cb70649239e50386e159c4be2616c99b`
Exact ZIP: `OZON_BRIDGE_v0.1.19_ALICE_SPA_ATTACHMENT_OWNER_20260911.zip`
Exact ZIP SHA-256: `726262a63c37290a8a748199c2594d6ea0b37ee25be910da3430d7226ca85a6f`
Exact ZIP bytes: `255204`
Production files: `32`

## Closure chain

| Dependency layer | Closure |
|---|---|
| producer/origin | Content-side live owner is produced from the current confirmed AI conversation identity; immutable Runtime Port sender still anchors tab and origin. |
| creation | `live_owner` is created for every attachment-port request after the SPA route has been resolved by current-page identity. |
| normalization | Worker normalizes origin and conversation id; origin must be an exact HTTPS origin for a supported AI provider and conversation id must pass the provider path parser. |
| validation | Persisted owner is matched against immutable sender tab, immutable sender origin, and current live conversation. Missing/malformed live ownership fails closed. |
| comparisons/branches | Exact closed set is 9/9 attachment RPCs; recovery plus all state-changing/read artifact RPCs pass the same ownership authority. |
| readers/consumers | Recovery, metadata, chunks, commit, ready, send commit/rollback, confirm and fail are covered. |
| state | Persisted autorun/manual owner state and delivery-id authority are unchanged; only admission identity changes. |
| storage | No storage schema, artifact bytes, IndexedDB database/store/version or storage-session authority changed. |
| restoration | Recovery is SPA-aware and ownership failures are surfaced instead of being collapsed into an ordinary null recovery. |
| MV3/module boundaries | Frozen `port.sender.url` path is explicitly modeled; packaged service-worker/runtime loading is regression-tested in pinned Chrome. |
| permissions | No manifest permission or host permission change is required or made. |
| policy | Privacy/personal-data/report-file policy is unchanged. |
| entitlement | Seller/Performance/report-file entitlement logic is unchanged. |
| planning | Request planner and one-envelope cardinality rules are unchanged. |
| transport/request | No Ozon transport code changed; no hidden retry, polling, pagination, fan-out, refetch or resend is introduced. |
| parsing/transformation | Provider parsing, file parsing and result transformation are unchanged. |
| output/result | Only local attachment ownership admission/recovery error visibility changes. |
| redaction/security | Cross-tab, cross-origin, cross-conversation, missing, malformed and non-HTTPS live-owner controls fail closed. |
| accounting/metadata | Provider request accounting is untouched; deterministic patch/final gates execute zero Ozon provider calls. |
| tests | Correct historical pre-fix FAIL is preserved; targeted post-fix, attachment, report/output and durability regressions pass. |
| packaged runtime | Exact executable is pinned; deterministic ZIP is fresh-extracted and compared byte-for-byte to exact Git blobs on Linux and Windows. |
| live workflow | Live browser interaction remains intentionally pending until owner installs this exact ZIP. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **5**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
