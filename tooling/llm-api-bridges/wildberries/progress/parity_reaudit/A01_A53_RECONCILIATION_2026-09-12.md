# Reconciliation of original WB parity authority A01–A53

Date: 2026-09-12
Status: **53/53 RECONCILED AGAINST MATURE OZON**

Legend:

- `CORRECT_CORE` — requirement and implemented core are substantially consistent with mature Ozon within the stated scope.
- `PARTIAL` — useful implementation exists but mature Ozon behavior is not fully reproduced/proven.
- `AUTHORITY_WRONG` — the original requirement itself conflicts with mature Ozon.
- `CONFIRMED_DEFECT` — installed/code evidence proves current WB behavior is wrong.
- `PROVIDER_DEFERRED` — generic framework may exist but WB-specific values must wait for real WB characterization.
- `NON_PROD` — operator has explicitly removed this from the production product requirement.

| A | Status after re-audit | Reconciliation |
|---|---|---|
| A01 Multi-AI adapter | `PARTIAL` | Shared adapter/capability core exists, but late mature Alice repair chains were not used as acceptance oracle. |
| A02 Conversation identity/binding | `CORRECT_CORE` | Shared identity implementation is effectively mature Ozon; installed F-01 cross-chat isolation passed. |
| A03 Canonical command envelope | `CORRECT_CORE` | Strict `{operation,params}`, transport/auth injection rejection and malformed-input guards are valid. |
| A04 Ordered multi-command | `CORRECT_CORE` for API-only | Source-order API batch works; does not justify mixed HELP/API. |
| A05 Manual/Autorun parser unification | `PARTIAL / NON_PROD_AUTORUN` | Unified parser is fine technically; Autorun is not a production product requirement per operator. |
| A06 Mixed HELP/API ordered parsing | `AUTHORITY_WRONG` | Mature Ozon rejects mixed HELP/API with `MIXED_HELP_AND_API`; WB implemented the opposite. |
| A07 Logical/physical model | `PARTIAL` | Counts/fingerprints exist; mature planner/capability/provenance model is richer. |
| A08 Exactly-once/no blind retry | `CORRECT_CORE / PARTIAL_AT_WORK_FILE_BOUNDARIES` | Core provider no-retry paths are good; Work/file recovery transaction parity is incomplete. |
| A09 Sequential batch runtime | `CORRECT_CORE` for API-only | Sequential execution/terminal accounting exists. |
| A10 Batch terminalization | `PARTIAL` | Requesting batch terminalization works, but some pre-execution errors occur before a durable batch exists. |
| A11 Disabled/unsupported local admission | `CONFIRMED_DEFECT` | Provider calls are zero, but local failure is toast-only instead of durable structured chat result. |
| A12 Work Session state machine | `PARTIAL` | Small state model copied; mature worker recovery lifecycle was not. |
| A13 Work Session durability | `PARTIAL` | Custom durability exists but lacks mature recovery-record/provider-phase semantics. |
| A14 Refresh single-flight | `PARTIAL` | Local single-flight guard exists; exact Ozon refresh recovery chain not reproduced. |
| A15 Runtime generation handshake | `PARTIAL` | General stale-runtime guards are good; persisted Work recovery generation handshake is incomplete. |
| A16 Response boundary after refresh | `PARTIAL` | Tested locally; must be retested after exact Work Session parity rewrite. |
| A17 Finish no-Autorun | `PARTIAL / NON_PROD_AUTORUN` | Invariant is sensible; mature Ozon tolerated absent Autorun explicitly. Autorun is not prod scope. |
| A18 Work resume vs provider status | `INCOMPLETE` | Mature dedicated fix semantics were not faithfully reproduced. |
| A19 Operation Registry framework | `PARTIAL / PROVIDER_DEFERRED` | Packaged WB registry exists; live currentness/entitlement/schema authority still deferred. |
| A20 Guidance/HELP | `PARTIAL` | Registry-derived HELP V1 works locally; mature HELP V2/guidance result system absent. |
| A21 Personal Data Gate | `PARTIAL + ERROR_DELIVERY_DEFECT` | Generic gate exists; rejection is not guaranteed to become Ozon-style durable structured chat result. |
| A22 Entitlement framework | `PROVIDER_DEFERRED / PLACEHOLDER` | WB authority hardcodes unknown/not-required baseline; mature entitlement/capability semantics not transferred. |
| A23 Semantic effect classifier | `CORRECT_PRINCIPLE / PROVIDER_DEFERRED` | Effect is registry-based, not HTTP method; real WB recertification remains deferred. |
| A24 Provider response verifier | `PARTIAL` | Safe/structural verification exists; mature capability/schema/semantic verifier paths are richer. |
| A25 Global quota scheduler | `PARTIAL / PROVIDER_DEFERRED` | Generic scope/Retry-After/no-retry exists; mature quota wait/resume/countdown orchestration incomplete. |
| A26 Cache engine | `SAFE_FRAMEWORK_ONLY` | Correctly disabled before characterization; not mature cache parity. |
| A27 Coalescing planner | `SAFE_FRAMEWORK_ONLY` | Default none is correct; no mature reviewed WB rules yet. |
| A28 Semantic prefetch | `SAFE_FRAMEWORK_ONLY` | Disabled by default; should not be called complete parity. |
| A29 Dynamic schema/metadata compiler | `PARTIAL / PROVIDER_DEFERRED` | Generic schema/LKG primitives exist; trusted WB source refresh/compiler integration absent. |
| A30 Last-known-good authority | `PARTIAL` | Primitive exists, but not mature Ozon metadata refresh/diff/operator surface. |
| A31 Effective Date Contract | `PROVIDER_DEFERRED` | Generic validators exist; no real WB date rules enabled. |
| A32 Report/document workflow | `INCOMPLETE / PROVIDER_DEFERRED` | No hidden polling principle retained; mature task/report parsing/delivery engine not fully ported. |
| A33 Opaque artifact/file refs | `CORRECT_CORE` | IndexedDB opaque refs, owner metadata and bounded storage exist. |
| A34 Browser file attachment primitive | `CORRECT_CORE / LIVE_UNPROVEN` | Native File/DataTransfer path exists; installed parity still must be retested. |
| A35 MIME-aware delivery | `PARTIAL` | AI file-type capability exists, but mature provider/report parsing/source policy not fully ported. |
| A36 Named runtime Port | `CORRECT_CORE` | `WB_FILE_V1` named Port exists. |
| A37 Chunked transfer | `CORRECT_CORE` | Bounded chunks, per-chunk and full SHA checks exist. |
| A38 Attachment wake worker | `PARTIAL` | Wake behavior exists in custom runtime, not mature dedicated Ozon wake protocol. |
| A39 Startup pending attachment recovery | `PARTIAL` | Some recovery exists; commit/reconcile parity not proven. |
| A40 Provider truth on artifact failure | `PARTIAL_GOOD` | WB tests preserve provider truth/no refetch; full mature delivery transaction outcomes not proven. |
| A41 Mixed text+file completeness | `PARTIAL` | Implemented/tested in custom model; must be differential-tested against mature Ozon. |
| A42 Large result -> document | `CORRECT_PRIMITIVE / LIVE_UNPROVEN` | Full result can be materialized as TXT; exact live parity not proven. |
| A43 Per-AI thresholds | `PARTIAL` | Capability policy exists; values/behavior must be checked after exact adapter parity. |
| A44 Alice oversized TXT | `PARTIAL / LIVE_UNPROVEN` | Local behavior exists; mature Alice live acceptance not inherited. |
| A45 Alice blocked-send guard | `PARTIAL / LIVE_UNPROVEN` | Synthetic guard exists; mature first-party blocked-state repair chain not used as oracle. |
| A46 Alice auto-send closed-set | `NON_PROD_AUTORUN / PARTIAL` | Auto-send helper may remain, but Autorun is not production scope. |
| A47 New-chat/bootstrap | `PARTIAL` | Custom implementation exists; mature editable-before-identity lifecycle not proven. |
| A48 Composer readiness wait | `CORRECT_CORE / CONTEXT_PARITY_RETEST` | Shared composer send/readiness logic largely transferred; retest after popup/Work rewrite. |
| A49 XLSX implicit cell ref | `CORRECT_CORE` | Known Ozon parser repair is present. |
| A50 XLSX namespace tolerance | `CORRECT_CORE` | Known Ozon parser repair is present. |
| A51 Fail-closed mixed HELP/API | `CORRECT_REQUIREMENT_BUT_NOT_IMPLEMENTED` | This matches mature Ozon and contradicts A06; implementation followed A06 instead. |
| A52 Diagnostics/audit log | `PARTIAL` | Structured diagnostics/redaction exist; mature Ozon diagnostics around planning/delivery/recovery are broader. |
| A53 Deterministic QA/materializers | `PROCESS_CORRECT / ORACLE_WRONG` | Reproducibility/evidence discipline was strong, but several tests validated the wrong or incomplete parity oracle. |

## Bottom line

Of 53 original requirements:

- a meaningful core is reusable;
- multiple items are safe frameworks intentionally awaiting WB characterization;
- **A06/TA-008 were outright wrong versus mature Ozon**;
- A11's implementation violates its own structured-error requirement;
- Work/file/guidance parity was materially overstated;
- A53 process discipline cannot compensate for an incorrect behavioral oracle.

This matrix must be used together with `WB021_PARITY_GAPS_2026-09-12.md` and the superseding patch authority.