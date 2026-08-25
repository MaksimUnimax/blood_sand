# Patch B0 Full Read Core — independent retest after Git-apply LF repair

## Authority tested

- Branch: `feature/ozon-full-read-core-b0-2026-08-25`
- Exact tested HEAD before this result commit: `d6789436902995ffba924d568fee186f10c2b6f7`
- Transport-repair anchor: `e806f0eb947844678a21f59f00e6ec416f1a8545` (confirmed ancestor).
- Git-apply LF repair: `6344deabf0070987f7dc66ed430e89e9dcafe698`.
- The commits after the transport anchor were reviewed as validation/handoff-only; no production candidate file was changed by this tester.

## Exact materialization: PASS

The required materializer was run once into a new directory. The resulting 21-file production tree SHA-256 was exactly:

`d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

Inherited A.5 markers:

- `PATCH_A5_A4_BASE_IDENTITY_PASS`
- `PATCH_A5_PROVIDER_STATUS_SCOPE_PASS`
- `PATCH_A5_RUNTIME_ERRORS_DIAGNOSTIC_ONLY_PASS`
- `PATCH_A5_RESUME_WITHOUT_PROMPT_PASS`
- `PATCH_A5_FINISH_BINDING_PRESERVED_PASS`
- `PATCH_A5_POPUP_INACTIVE_BOUND_RESUME_PASS`
- `PATCH_A5_POPUP_SHA256_PASS`
- `PATCH_A5_SERVICE_WORKER_SHA256_PASS`
- `PATCH_A5_PRODUCTION_FILE_COUNT_19_PASS`
- `PATCH_A5_TREE_MANIFEST_SHA256_PASS`

Required B0 markers:

- `PATCH_B0_A5_BASE_IDENTITY_PASS`
- `PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS`
- `PATCH_B0_PATCH_APPLY_PASS`
- `PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS`
- `PATCH_B0_CHANGED_FILE_IDENTITIES_PASS`
- `PATCH_B0_TREE_MANIFEST_SHA256_PASS`

All were observed.

## Deterministic regression: FAIL

The mandated command was run exactly once against the materialized candidate:

```text
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_REGRESSION_2026-08-25.mjs D:\codex\Test\ozon-b0-retest2-candidate-20260825
```

Node `v24.12.0` stopped before any assertion with this exact validation-program error:

```text
file:///D:/codex/Test/ozon-b0-retest2-20260825/tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_REGRESSION_2026-08-25.mjs:106
};
^
SyntaxError: Unexpected token '}'
```

Therefore none of the required deterministic markers was emitted:

- `B0_REGISTRY_GUIDANCE_PASS`: NOT_EMITTED
- `B0_PERSONAL_DATA_CONTRACT_PASS`: NOT_EMITTED
- `B0_ENTITLEMENT_EXACT_REQUEST_PASS`: NOT_EMITTED
- `B0_DYNAMIC_SWAGGER_COMPILER_PASS`: NOT_EMITTED
- `B0_COMPATIBILITY_CLUSTER_ALIASES_PASS`: NOT_EMITTED
- `B0_PROTECTED_A5_RUNTIME_IDENTITIES_PASS`: NOT_EMITTED
- `B0_POLICY_BEFORE_CAPABILITY_PASS`: NOT_EMITTED

This is a validation-test-program syntax failure. It is not evidence of a B0 production assertion failure; the tester did not repair the program.

## Syntax checks: PASS

`node --check` was run for every materialized production `.js` file: `ALL_PRODUCTION_JS_SYNTAX_PASS`.

## Browser attempt — synthetic, isolated environment

Environment: temporary Chrome profile; Chrome for Testing `151.0.7922.47`; Puppeteer `25.4.0`; exact unpacked materialized candidate; synthetic ChatGPT Work DOM; extension-worker `Fetch` interception. No operator profile, credentials, or real Ozon business request was used.

- A.5 Start/Hide/Show button-surface proof: FAIL in the synthetic fixture. The fixture did not receive an extension-owned button despite a successful Start route; this is not classified as a production failure.
- A.5 Finish → inactive bound → Resume without prompt: PASS (`active_visible`).
- A.5 stale `CONVERSATION_NOT_CONFIRMED` diagnostic / Autorun surface: PASS (12 diagnostics; no stale status).
- Work submit and dictation proof: NOT_EXECUTED_ENVIRONMENT_ONLY after the synthetic fixture entered the incomplete button-surface state.
- Guidance V1/V2: BLOCKED_BY synthetic fixture delivery remained `delivering`; later commands correctly returned `MANUAL_OPERATION_ACTIVE`.
- Personal OFF, Personal ON explicit request, and invalid-parameter browser flows: BLOCKED_BY the same incomplete synthetic delivery; no provider assertion was executed.
- Premium exact subscription condition: NOT_EXECUTED_ENVIRONMENT_ONLY — no authenticated test account with a known insufficient subscription condition was available.
- Seller API metadata failure preservation: PASS. Intercepted official metadata fetch failed safely with `SELLER_METADATA_FETCH_FAILED`; the previous last-known-good snapshot was preserved.

The synthetic attempt recorded `REAL_OZON_SELLER_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, synthetic Seller requests `0`, and automatic replay `no`. It cannot substitute for the mandatory deterministic gate or the complete required browser matrix.

## Integrity and decision

- OFF provider request count: `0` (no personal OFF request reached provider; full OFF assertion was blocked by fixture delivery state).
- ON provider request count: `0` (explicit ON request did not reach provider because its prerequisite delivery was blocked).
- Automatic replay observed: `no`.
- Metadata refresh evidence: safe intercepted failure, `SELLER_METADATA_FETCH_FAILED`, previous snapshot preserved.
- Production code modifications by tester: `0`.
- Candidate rebuild/repackage: `0`.

Final decision: `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

Reason: the required deterministic regression cannot parse, so all mandatory deterministic markers are absent. Browser evidence above is retained without attributing its fixture-dependent blocked cases to production.
