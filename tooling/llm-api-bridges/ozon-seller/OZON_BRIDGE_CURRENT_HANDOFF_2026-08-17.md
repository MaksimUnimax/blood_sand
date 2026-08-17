# Ozon Bridge — current handoff / continuation state

Date: 2026-08-17
Status: live handoff document for continuing work in a new ChatGPT conversation

## Repository identity

Repository:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Canonical working branch HEAD immediately before this documentation refresh:

`1e433a27959e11df7687fb65ae1d012eb2e9f432`

Do not rely on that SHA as permanently current. On continuation, always fetch the live branch ref first.

Canonical release/evidence lineage currently reaches:

`reference-0.1.11/`

Operator/local candidates v0.1.12+ are not canonical releases merely because they are used for active development.

## Accepted operator development baseline

The exact operator v0.1.19 baseline used for current development is preserved on the development branch.

Development branch:

`dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Operator baseline ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

This baseline is an operator/user-supplied development baseline, not a canonical GitHub release declaration.

## Step 0 — closed

Windows Codex QA harness is accepted for intermediate development validation.

Accepted route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions/report`

Final correction validation branch:

`validation/codex-puppeteer-launcher-correction-2026-08-17`

Validation commit:

`a5539c8663bb6b48dce197f59e0abfe2d388af93`

Accepted evidence:

- R1/R2/R3 PASS;
- zero operator browser actions;
- runtime unpacked extension install PASS;
- stable extension identity PASS;
- content scripts PASS;
- MV3 service worker PASS;
- multi-tabs PASS;
- console/network PASS;
- persistent localStorage PASS;
- persistent cookie PASS;
- `QA_HARNESS_ACCEPTED_FOR_DEV`.

Intermediate engineering validation therefore does not require manual ZIP downloads/reinstallations.

## Step 1 — implementation frozen, independent validation in progress

Step:

**Contract + Capability layer**

Frozen implementation SHA to validate:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Implementation is reconstructed from the exact operator v0.1.19 ZIP. The candidate intentionally remains version `0.1.19`; it is not a v0.1.20 release declaration.

Exactly three production files differ from the operator baseline:

- `service_worker.js`;
- `shared/ozon_contract.js`;
- `shared/ozon_provider.js`.

Protected AI DOM/composer/delivery dependencies outside those changed files remain byte-identical where recorded in Step 1 evidence.

Step 1 implementation/evidence document:

`tooling/llm-api-bridges/ozon-seller/development/step1-contract-capability/STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`

Step 1 standalone Codex validation plan:

`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_STEP1_CONTRACT_CAPABILITY_CODEX_VALIDATION_2026-08-17.md`

The plan was added on development branch commit:

`32fa8c5fb118e8ff4da3d23a06fd0260891f26d9`

The operator has already sent that full standalone prompt to Codex.

Expected validation branch/report if Codex completes successfully:

Branch:

`validation/ozon-step1-contract-capability-2026-08-17`

Report path:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP1_CONTRACT_CAPABILITY_VALIDATION_2026-08-17.md`

## Immediate next action in a new conversation

1. Connect to live GitHub.
2. Fetch current refs for:
   - `work/ozon-data-collection-2026-08-11`;
   - `dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`;
   - `validation/ozon-step1-contract-capability-2026-08-17` if it exists.
3. Read this handoff, the development workflow, current roadmap, Step 1 implementation/evidence and Step 1 validation plan.
4. If the validation report exists, read the **full report**, verify its base/tested SHA/report-only discipline/evidence, and decide `STEP1_ACCEPTED_FOR_STEP2` or reject Step 1 with a bounded specific repair.
5. If the report does not yet exist, do not invent results and do not start Step 2. Wait for the operator to provide the Codex result or for the validation branch to appear.

## Step 1 load-bearing behavior

Step 1 adds this planning order before business execution:

`parse whole clicked batch -> strict contract validation -> resolve Seller capability once if needed -> entitlement-plan each logical command -> existing serial business executor`

Key invariant:

- relevant batch: at most one internal `POST /v1/seller/info` capability probe;
- universal/performance-only batch: zero Seller capability probes;
- capability probe is not an AI-callable operation and not an extra logical result item;
- raw seller-info company/INN/OGRN/rating data never goes to the AI;
- operation/field entitlement matrix is used rather than a global boolean;
- partial analytics metric execution is allowed only where removing restricted metrics preserves the remaining query semantics;
- restricted dimensions/sort/filter semantics are rejected rather than silently altered;
- unknown capability never means “no subscription”;
- worker restart after an in-flight capability probe with unknown outcome must not trigger a blind second probe.

Contract hardening includes reviewed validation for `analytics_data`, `product_queries`, and `product_queries_details` including metric/dimension/date-time/SKU/sort/provider-limit checks.

## Important provider facts for later steps

`/v1/analytics/data`:

- universal metrics include `revenue` and `ordered_units`;
- advanced metrics/dimensions are subscription-restricted;
- up to 14 metrics;
- limit 1..1000;
- documented method frequency: no more than one request per minute.

Current operator runtime previously did not enforce that temporal one-minute limit before fetch; this is reserved for the later quota-scheduler step.

`/v1/seller/info`:

- used internally for capability planning;
- returns subscription info but also sensitive business identity/rating fields;
- raw response must never be AI-visible.

## Remaining major roadmap

After Step 1 acceptance:

### Step 2 — Query planner + safe coalescing

Implement logical-command planning and safe merge/coalescing for compatible provider requests, especially analytics-data metric unions, without changing query semantics or proven delivery behavior.

### Step 3 — Global quota scheduler + response verifier + safe errors

Implement persistent Seller-account/method quota coordination, especially `/v1/analytics/data` one-per-minute behavior across tabs/AIs, plus response-shape verification and sanitized structured errors.

### Step 4 — Cache/prefetch + semantic acquisition profiles + integrated acceptance

Implement safe cross-turn reusable cache/prefetch, optional deterministic semantic aliases/acquisition profiles, then integrated multi-tab/multi-AI and controlled final live acceptance.

Do not split these into dozens of micro-steps unless a concrete failure requires a bounded repair within the current step.

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

## Working-method authority

For how to continue development, read:

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

For current architecture and remaining steps, read:

`OZON_BRIDGE_ROADMAP_2026-08-17.md`
