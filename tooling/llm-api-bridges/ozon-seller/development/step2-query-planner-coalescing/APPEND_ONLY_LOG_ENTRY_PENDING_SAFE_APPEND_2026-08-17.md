# Pending safe append entry — Ozon Bridge Step 1 acceptance / Step 2 freeze

Date: 2026-08-17
Status: pending byte-safe append into `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md`.

## Why this file exists

`OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` is canonical and strictly append-only. Its current size is larger than the text-write size that has already been observed to truncate payloads through the active GitHub connector during the Step-1 reconstruction incident.

Rewriting the whole canonical append-only file through that unsafe transport would risk corrupting historical evidence. Therefore the canonical log is deliberately left untouched until a byte-preserving append/write route is available.

This file is NOT a replacement for the canonical append-only log. It preserves the exact new entry that must later be appended byte-for-byte (or semantically identically) to the end of the canonical log. Do not delete it until the canonical append has been completed and independently checked.

---

## 2026-08-17 — Step 1 Contract + Capability accepted; Step 2 Query planner + safe coalescing frozen for validation

### Step 1 acceptance

Original Step-1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact reconstruction-v2 validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Independent accepted validation branch:

`validation/ozon-step1-contract-capability-retest-v2-2026-08-17`

Independent report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Final verdict:

`STEP1_ACCEPTED_FOR_STEP2`

All load-bearing Step-1 gates passed, including exact operator-baseline reconstruction, raw patch reconstruction, exact three-file production delta, protected byte identity, strict contract validation, seller capability/privacy, entitlement matrix, one-probe invariant, worker-restart no-retry behavior, logical/physical provenance, security/Seller/Performance regressions and MV3 browser sanity.

`OPERATOR_BROWSER_ACTIONS = 0`

`REAL_OZON_REQUESTS = 0`

The earlier rejected Step-1 reports remain historical reconstruction-artifact failures; they did not establish a production-logic defect and are not rewritten.

Canonical release/evidence lineage remains v0.1.11. Acceptance of the operator v0.1.19 development candidate does not make it a canonical release.

### Step 2 implementation

Step-2 development branch:

`dev/ozon-v0.1.19-step2-query-planner-coalescing-2026-08-17`

Branch base / Step-1 acceptance decision:

`c8d6a10b63b7c02095a6cc6626f5aa508e16a8bd`

Frozen Step-2 implementation target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Step-2 patch SHA-256:

`93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`

Exactly three production files differ from the accepted Step-1 candidate:

- `service_worker.js` — SHA-256 `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f`;
- `shared/ozon_contract.js` — SHA-256 `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac`;
- `shared/ozon_provider.js` — SHA-256 `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d`.

The other fourteen production files remain byte-identical to accepted Step 1. The Step-1 `ensureBatchCapabilityAndPlanning` function body and protected delivery/finalization bodies checked by local evidence remain byte-identical.

Step 2 implements only conservative post-entitlement `analytics_data` coalescing:

- only contiguous compatible logical analytics commands are coalesced;
- compatibility preserves all normalized executable request semantics except metrics;
- different limits remain incompatible;
- ordered first-seen metric union is capped at 14;
- one physical request produces one logical result per original command;
- Step-1 omitted/restricted entitlement metadata remains attached to the correct logical command;
- explicit logical-to-physical request/fingerprint/group provenance is recorded;
- metric projection preserves each logical executable metric order;
- inconsistent/ambiguous provider metric cardinality fails closed without retry;
- durable requesting state prevents blind replay after MV3 worker restart.

Step 2 intentionally does not implement the Step-3 global quota scheduler, temporal one-per-minute coordination, sleeps/waits, Retry-After retry, cache/prefetch or AI DOM/delivery redesign.

Local mocked executable tests and a fresh patch reconstruction passed. No real Ozon request was made.

Standalone Step-2 validation plan:

`validation/plans/OZON_STEP2_QUERY_PLANNER_COALESCING_CODEX_VALIDATION_2026-08-17.md`

Validation-plan documentation commit:

`f628f5c6bd85e925ddf96bea672f6aa080ff5377`

Expected report-only validation branch:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Step 3 remains blocked until the full independent Step-2 GitHub report is reviewed and Step 2 is explicitly accepted.
