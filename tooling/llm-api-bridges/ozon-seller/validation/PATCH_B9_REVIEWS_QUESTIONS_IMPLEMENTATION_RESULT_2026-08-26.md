# Patch B9 Reviews / Questions — implementation result

Date: 2026-08-26
Status: candidate pending CI and independent validation

## Base

- accepted B8 authority: `600a6922fd3f339fb2d57bc3828d51ecba1670d7`
- accepted B8 production tree: `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`

## Production delta

Exactly three production files differ from B8:
- `shared/ozon_operation_registry.js` -> `e157dfa70ecddc2d473d5968e045448f8d5693ed6553063798b417743a1d88eb`
- `shared/ozon_contract.js` -> `e80b3d07f6deef12412e8ddfc99dad4ad62236b932ed2a7246b8afb90c9ef674`
- `shared/ozon_entitlements.js` -> `8f006b298fb4bdff969ba4cca54f796821bacc124c078203d6e2f49fd418df70`

Production file count remains `21`.

B9 production tree:
`d955dbfd1a667e40ea0cb04374b31e0cfe95bbf75b3b355d11c50d10f748a6d5`

## Patch transport

- raw patch SHA-256: `b938688273bbf66732d9c45b4765e7a87db94f5e1d6a1a5ce2ccc1060aa4bb8a`
- deterministic gzip SHA-256: `5974889dffd45003b505d8be4d088366fdd5118578ca96358d609e0797704e7f`

## Local gates

Observed:
- `B9_REVIEWS_QUESTIONS_REGISTRY_PASS`
- `B9_REVIEWS_QUESTIONS_EXACT_REQUEST_PASS`
- `B9_REVIEWS_QUESTIONS_CONTRACTS_PASS`
- `B9_REVIEWS_QUESTIONS_PERSONAL_DATA_GATE_CONTRACT_PASS`
- `B9_REVIEWS_QUESTIONS_ENTITLEMENT_PLANNING_PASS`
- `B9_B8_SUPPLY_AND_B7_ENTITLEMENT_SEMANTICS_CARRY_FORWARD_PASS`
- `B9_REVIEWS_QUESTIONS_GUIDANCE_ZERO_REQUEST_PASS`
- `B9_REVIEWS_QUESTIONS_EXACT_SWAGGER_CURRENTNESS_PASS`
- `B9_REVIEWS_QUESTIONS_EXACT_ENTITLEMENTS_PASS`
- `B9_REVIEWS_QUESTIONS_PROTECTED_RUNTIME_IDENTITIES_PASS`

B8 regression also passes against the B9 tree without its exact-Swagger identity assertion. All 18 production JavaScript files pass `node --check`.

Seller business requests during deterministic tests: `0`.
Performance business requests during deterministic tests: `0`.
Credentials used: `0`.
