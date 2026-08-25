# Patch B0 Full Read Core — ACCEPTED

Status: `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `feature/ozon-full-read-core-b0-2026-08-25`
- Exact tested HEAD: `a48e06b331bb959856808aff0b8697cb9834807c`
- Independent tester result commit: `cc6413d25dd794a12fd61b71728aaac9702bc6de`
- Result file: `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_CODEX_RESULT_2026-08-25.md`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

## Identity evidence

The accepted run used the previously materialized exact candidate and re-verified it in the current run with Node. Required identity markers all passed:

- `B0_NODE_PRODUCTION_FILE_COUNT_21_PASS`
- `B0_NODE_CHANGED_FILE_IDENTITIES_PASS`
- `B0_NODE_TREE_MANIFEST_SHA256_PASS`

The exact tree matched `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`.

The tester result commit was compared directly to the exact tested HEAD. It is ahead by one commit and changes only the B0 result/evidence file. No production candidate file changed after the tested HEAD.

## Deterministic acceptance

Regression syntax: PASS.

All seven deterministic markers passed:

- `B0_REGISTRY_GUIDANCE_PASS`
- `B0_PERSONAL_DATA_CONTRACT_PASS`
- `B0_ENTITLEMENT_EXACT_REQUEST_PASS`
- `B0_DYNAMIC_SWAGGER_COMPILER_PASS`
- `B0_COMPATIBILITY_CLUSTER_ALIASES_PASS`
- `B0_PROTECTED_A5_RUNTIME_IDENTITIES_PASS`
- `B0_POLICY_BEFORE_CAPABILITY_PASS`

All 18 production JavaScript files passed syntax checking.

## Browser acceptance

Accepted executed browser evidence:

- A.5 Start / Hide / Show / Finish / inactive+bound Resume: PASS.
- Resume sent no additional startup prompt: PASS.
- No stale `CONVERSATION_NOT_CONFIRMED` provider status: PASS.
- No B0 Autorun surface regression observed: PASS.
- Guidance V1 compatibility aliases and local-only behavior: PASS.
- Guidance V2 sections and `posting_fbs_get` conditional card: PASS.
- Personal Data OFF: PASS, zero provider requests.
- Enabling Personal Data did not replay the blocked command: PASS.
- Personal Data ON explicit resubmit: PASS, exactly one synthetic intercepted `POST /v3/posting/fbs/get`.
- Caller-controlled URL/method/header/auth override rejected by fixed transport contract: PASS.
- Invalid personal-data parameters rejected locally: PASS.
- Diagnostics scrubbed personal sentinels: PASS.
- Confirmed delivery cleared durable outgoing personal payload and did not replay: PASS.
- Seller API metadata failure preservation: PASS; `SELLER_METADATA_FETCH_FAILED`, last-known-good snapshot retained, zero Seller/Performance business requests caused by refresh.

Environment-only cases retained and explicitly not treated as product failures:

- Premium insufficient-subscription preservation: `NOT_EXECUTED_ENVIRONMENT_ONLY` because no authenticated account with a known insufficient subscription was available.
- Unrestricted analytics: `NOT_EXECUTED_ENVIRONMENT_ONLY` because the synthetic credential fixture could not establish genuine authenticated Seller entitlement.

## Protected semantics

B0 acceptance does not authorize redesign of existing A.5 Work-session lifecycle, Autorun timers/state, provider quota/cache/history, credentials, transport ownership, or delivery/no-replay semantics. Those remain protected baseline behavior for subsequent work unless explicitly scoped otherwise.

## Gate for subsequent work

B0 is now the accepted Full Read Core baseline. B1-B8 work may begin only from this accepted authority (or an explicitly byte-equivalent materialization of the accepted production tree), with B0 protected behaviors preserved by regression gates.
