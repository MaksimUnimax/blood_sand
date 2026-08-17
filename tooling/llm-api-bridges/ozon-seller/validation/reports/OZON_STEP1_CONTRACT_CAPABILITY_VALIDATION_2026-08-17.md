# Ozon Step 1 Contract + Capability Validation

## Validation identity

- Target SHA: `370e45a1803976f43d27d5a9d4b5613e09a91623`
- Operator baseline commit: `06bbed6649b11c6fd4b81b224ef41d8833ea267c`
- Checkout status before report: clean, detached at the exact target SHA
- Validation mode: fail-closed reconstruction gate
- Real Ozon requests: `0`
- Credentials, accounts, tokens, cookies, and auth material used: none

## Reconstruction gate

Validation stopped before extracting or executing a candidate because the immutable reconstruction inputs did not match their authoritative hashes.

Baseline ZIP:

- Path: `tooling/llm-api-bridges/ozon-seller/development/operator-v0.1.19/ozon-bridge-v0.1.19-extension.zip`
- Expected SHA-256: `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`
- Observed SHA-256: `e1a81dd566bdc5cf82f6844d78c53a8d941dbfad322184848df07bb095a1935e`
- Result: `FAIL`

Patch parts were checked byte-for-byte against `PATCH_PARTS.md`:

| Part | Expected SHA-256 | Observed SHA-256 |
|---|---|---|
| 00 | `8146303b3ac046f07d841873257d0207117490a3b3977fac523b5dc572c5292b` | `e64e4a1beff3d5935501ce7588817b2aa0801dfce6def0d03611d99c0b427f3f` |
| 01 | `4d20c05d750adb43863a6d5d386eb6647539e78b5f495e5c8b9eed3af02e6f28` | `8bff5022c7369aba3f801d5f21b6fcd0a4d3beb1a1dfba60630e904ceeb2afac` |
| 02 | `23dc7cc98b0877f97c67358263097e66f44f17fe5b55c88d8a3a09f283dddf61` | `6278bbf8ee8496cb0dfa45eb3076e2639ddf5b7685482a547627fba1caa5770e` |
| 03 | `49e248a74638e51bb39e5d6f33929b1faf71b80b5db9ceedb00e767c95fa654d` | `181e7366002099c149000336d84574a3f91dce91fbfd8f44b8d67f5fe1dfc6cf` |
| 04 | `508c42a05f872a24bc7d8d279cd7777b95158b1a3fe76cbe58731663865f35f1` | `69d77d971a395c4c903f9f66ecf95ea4f3ff65870e357c7aef4c8a6012327a58` |
| 05 | `5906016f7c72b660ba0debd99c7c758ef4f7b60c609dbce11bb08e1fc03504c0` | `874fcc22de2788a67a1c741a313445703075ed249e323190314dc2e995d9c3a2` |
| 06 | `5dfd53ac85b8d28b637010dc5a61910d25e5e539a52687deeef796411fe8570d` | `6d6e7ce9bcad03c1535e6322dbb4c366c7ff9eabb9fd648e57a4a13a966621bc` |
| 07 | `f752e2176c5a58b690dbf287d44d06fec92ede2ad89ce149baf484bc38bcd1d5` | `e17629c45a3584f1fca8ae775416834c6cde9d39f58a662fcaa7fbc92760626a` |

The expected concatenated patch SHA-256 was `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`. Concatenation and patch application were intentionally not performed after the input-hash failure.

Required reconstruction result:

```text
RECONSTRUCTION = FAIL
PATCH_RECONSTRUCTION_FAIL
PRODUCTION_CHANGED_FILES = 0 (no candidate reconstructed)
PROTECTED_14_FILES_BYTE_IDENTICAL = NOT_EXECUTED
```

## Execution gate

No reconstructed candidate was available, so the following were not executed and cannot be claimed PASS:

- production syntax and manifest/security audit;
- protected AI/DOM/composer source and delivery FSM diff audit;
- strict contract validation;
- capability resolver and seller-info privacy tests;
- entitlement planner matrix;
- one-probe, universal/performance zero-probe, and restart/no-retry tests;
- logical/physical provenance;
- security, Performance, and Seller baseline regressions;
- MV3 browser sanity.

No provider transport, Ozon endpoint, browser login, or real account was used. `REAL_OZON_REQUESTS = 0`.

## Required answers

```text
STRICT_CONTRACT_VALIDATION = FAIL
CAPABILITY_RESOLVER = FAIL
SELLER_INFO_PRIVACY = FAIL
SELLER_INFO_NOT_AI_CALLABLE = FAIL
ENTITLEMENT_PLANNER_MATRIX = FAIL
ONE_CAPABILITY_PROBE_PER_RELEVANT_BATCH = FAIL
ZERO_PROBE_FOR_UNIVERSAL_OR_PERFORMANCE_BATCH = FAIL
PROBE_RESTART_NO_RETRY = FAIL
LOGICAL_PHYSICAL_PROVENANCE = FAIL
AI_DOM_COMPOSER_PROTECTED = FAIL
DELIVERY_FSM_PROTECTED = FAIL
SECURITY_REGRESSION = FAIL
PERFORMANCE_REGRESSION = FAIL
SELLER_BASELINE_REGRESSION = FAIL
MV3_BROWSER_SANITY = FAIL
```

The FAIL values above mean “not accepted because the required exact reconstruction gate failed”; they do not assert a defect in the untested implementation.

Final verdict: `STEP1_REJECTED`
