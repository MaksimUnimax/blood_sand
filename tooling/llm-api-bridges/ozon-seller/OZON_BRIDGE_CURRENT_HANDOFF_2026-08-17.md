# Ozon Bridge — current handoff / continuation state

Date: 2026-08-17
Status: live handoff document for continuing work in a new ChatGPT conversation

## Repository identity

Repository:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Active development lineage before Step 2:

`dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`

Do not rely on any remembered moving-branch SHA as permanently current. On continuation, fetch live refs first.

Canonical release/evidence lineage currently reaches:

`reference-0.1.11/`

Operator/local candidates v0.1.12+ are development inputs and are not canonical releases merely because they are used for engineering.

## Accepted operator development baseline

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

The operator baseline is an operator/user-supplied development baseline, not a canonical GitHub release declaration.

Exact reproducible reconstruction v2 exists under:

`development/operator-v0.1.19/exact-reconstruction-v2/`

Correct concatenated base64 SHA-256:

`cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

Decoded ZIP remains exactly 100320 bytes with the pinned SHA above and 17 production files.

## Step 0 — CLOSED / ACCEPTED

Windows Codex QA harness is accepted for intermediate development validation.

Accepted route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions/report`

Final correction validation branch:

`validation/codex-puppeteer-launcher-correction-2026-08-17`

Validation commit:

`a5539c8663bb6b48dce197f59e0abfe2d388af93`

Step 0 must not be reopened unless a later concrete harness failure requires it.

## Step 1 — CLOSED / ACCEPTED FOR STEP 2

Step:

**Contract + Capability layer**

Original frozen production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact reconstruction-v2 validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted independent validation branch:

`validation/ozon-step1-contract-capability-retest-v2-2026-08-17`

Accepted report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Report path:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP1_CONTRACT_CAPABILITY_RETEST_V2_2026-08-17.md`

Final verdict:

`STEP1_ACCEPTED_FOR_STEP2`

Independent evidence passed all load-bearing gates:

- exact reconstruction v2 and pinned operator ZIP hash;
- raw Step-1 patch-part hashes and concatenated patch hash;
- exactly three intended production files changed from operator baseline;
- fourteen protected production files byte-identical;
- JavaScript syntax/load sanity;
- strict `analytics_data`, `product_queries`, `product_queries_details` contract validation;
- zero business requests on pre-execution rejection;
- internal-only `/v1/seller/info` capability resolver and seller-info privacy;
- entitlement matrix and partial analytics behavior;
- one capability probe maximum per relevant clicked batch;
- zero probes for universal/performance-only batches;
- no blind capability re-probe after worker restart with unknown in-flight outcome;
- logical/physical provenance;
- security, Seller and Performance regressions;
- MV3 browser sanity through the accepted harness;
- `OPERATOR_BROWSER_ACTIONS = 0`;
- `REAL_OZON_REQUESTS = 0`.

The two earlier Step-1 rejected reports were reconstruction-artifact blockers and did not demonstrate a production-logic failure. They remain historical evidence and must not be rewritten.

## Accepted Step-1 production delta

Exactly these production files differ from the operator baseline:

- `service_worker.js`;
- `shared/ozon_contract.js`;
- `shared/ozon_provider.js`.

Expected accepted candidate SHA-256 values:

- `service_worker.js` — `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`;
- `shared/ozon_contract.js` — `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`;
- `shared/ozon_provider.js` — `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`.

All other fourteen production files remain byte-identical to the operator baseline for Step 1.

## Step-1 load-bearing behavior to preserve

Planning order before business execution:

`parse whole clicked batch -> strict contract validation -> resolve Seller capability once if needed -> entitlement-plan each logical command -> business execution`

Preserve:

- relevant batch: at most one internal `POST /v1/seller/info` capability probe;
- universal/performance-only batch: zero Seller capability probes;
- capability probe is not an AI-callable operation and not an extra logical result item;
- raw seller-info company/INN/OGRN/rating data never goes to the AI;
- operation/field entitlement matrix rather than a global boolean;
- partial analytics metric execution only where removing unavailable metrics preserves remaining query semantics;
- restricted dimensions/sort/filter are rejected rather than silently altered;
- UNKNOWN capability never means “no subscription”;
- worker restart after an in-flight capability probe with unknown outcome must not trigger a blind second probe;
- logical and physical command fingerprints/provenance remain distinct where planning transforms the request.

## Step 2 — IN PROGRESS

Step:

**Query planner + safe coalescing**

Goal: reduce compatible physical provider requests while preserving one logical result per original command and preserving exact semantics/provenance.

### In scope

- conservative batch query planner after Step-1 capability/entitlement planning;
- safe `analytics_data` metric-union coalescing;
- deterministic compatibility key preserving date range, dimensions, filters, sort, offset and window semantics;
- metrics union maximum 14;
- one physical request per compatible coalescing group;
- logical result projection back to every original command;
- original logical metric order and Step-1 omitted/restricted metric metadata preserved;
- explicit logical-to-physical request/fingerprint provenance;
- incompatible commands continue through the existing serial executor.

### Conservative limit rule

For this Step-2 implementation, different `limit` values are not coalesced. Larger-window fetch + local slicing is deferred until separately proven safe for top-N/order/completeness semantics.

### Out of scope

- no global/provider quota scheduler;
- no `/v1/analytics/data` one-per-minute temporal enforcement redesign;
- no Retry-After scheduler/retry behavior;
- no cross-turn cache/prefetch;
- no semantic aliases;
- no cross-tab provider-request dedupe;
- no redesign of response-error policy beyond what is minimally necessary to project a coalesced response safely;
- no ChatGPT/Alice DOM/composer/delivery rewrite.

## Step 2 protected production surfaces

The Step-2 implementation must not modify unless an independently justified necessity is discovered:

- `content_script.js`;
- `manifest.json`;
- `popup.css`;
- `popup.html`;
- `popup.js`;
- `shared/ai_adapters.js`;
- `shared/bridge_autorun_model.js`;
- `shared/composer_send.js`;
- `shared/conversation_identity.js`;
- `shared/manual_controls.js`;
- `shared/ozon_credentials.js`;
- `shared/proven_writing_block_capture.js`;
- `shared/provider_transport_core.js`;
- `shared/runtime_names.js`.

The proven ChatGPT delivery FSM and exact-code-block binding semantics are protected. Planner/coalescer work belongs worker/provider-side.

## Step 2 key safety rules

`analytics_data` commands may coalesce only after Step-1 planning and only when executable semantics match:

- same operation;
- same `date_from` / `date_to`;
- same ordered dimensions;
- same normalized filters;
- same normalized sort;
- same offset;
- same limit/window semantics;
- total physical metrics union <= 14.

Do not blindly merge different dimensions, filters, dates, sort, offset/window or aggregation shapes.

Do not derive cross-dimension/cross-window facts, locally aggregate non-additive metrics, or infer rows hidden by top-N truncation.

If deterministic response projection cannot be established, fail closed rather than guess.

## Step 3 remains blocked

After independently accepted Step 2:

### Step 3 — Global provider quota scheduler + response verifier + safe errors

Implement persistent Seller-account/method quota coordination, especially `/v1/analytics/data` one-per-minute behavior across tabs/AIs, plus response-shape verification and sanitized structured errors.

## Step 4 remains blocked

### Step 4 — Cache/prefetch + semantic acquisition profiles + integrated acceptance

Implement safe reusable provider cache/prefetch, deterministic high-level semantic aliases where reviewed, then integrated multi-tab/multi-AI and controlled final live acceptance.

## Standing protected invariants

- Native Copy of exact code block is the structural binding anchor.
- Ozon button exists for every code block independent of contents; parser alone decides whether `OZON_API_V1` commands exist.
- No block identity by text fingerprint/content.
- One extension-owned top-level Shadow DOM overlay.
- Multi-tab/conversation ownership is independent; no global current conversation.
- AI cannot inject arbitrary provider transport/auth fields.
- Credentials stay isolated.
- Read-only provider surface; mutations blocked.
- `posting_fbs_get` remains blocked because of customer PII.
- No hidden provider retry/pagination/fan-out/report polling.
- No arbitrary generic bridge byte/depth/item/time caps or silent result truncation.
- Proven ChatGPT delivery FSM must not be rewritten by provider/planner work.
- Alice adapter/lifecycle corrections stay separate from ChatGPT delivery semantics.

## Immediate next action

1. Create a dedicated Step-2 development branch from the accepted/documented development state.
2. Reconstruct exact accepted Step-1 candidate from the pinned operator ZIP plus the accepted Step-1 patch.
3. Implement one coherent conservative Step-2 planner/coalescer.
4. Run local syntax/VM/unit/regression checks against actual reconstructed production code.
5. Record changed production files and hashes plus protected-byte-identity evidence.
6. Freeze an exact Step-2 implementation SHA.
7. Only after freeze, add a full standalone Codex Step-2 validation plan in a later documentation commit.
8. Do not begin Step 3 until the Step-2 validation report is independently reviewed and accepted.

## Working-method authority

For working method read:

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

For current architecture and remaining steps read:

`OZON_BRIDGE_ROADMAP_2026-08-17.md`
