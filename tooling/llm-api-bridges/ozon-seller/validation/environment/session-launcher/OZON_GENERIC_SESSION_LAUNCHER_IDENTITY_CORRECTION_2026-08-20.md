# Ozon generic session launcher — current identity correction

Date: 2026-08-20
Status: `CURRENT_VALIDATION_AUTHORITY_CORRECTION`

This correction supersedes only stale launcher identity and CFT digest values in `OZON_GENERIC_SESSION_LAUNCHER_CONTRACT_2026-08-20.md`. All functional and safety requirements of that contract remain unchanged.

## Current launcher

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER.mjs`

Current Git blob:
`3d8c15cb112c268935e875a019b8ad7e95784029`

Current checked-out LF bytes:
`18811`

Current SHA-256:
`475e4c2b2f99b0813a35fb93b29a1bf106d789461a53dd2dc30979be500724e6`

The prior launcher SHA-256 `0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600` and Git blob `1cbd85f244f8dc54c51ac9a044e36b13b0bd0320` identify the historical launcher before the CFT authority typo was corrected. They are not the current launcher identity.

## Canonical qualified CFT identity

Chrome for Testing: `151.0.7922.47`

Regular files: `308`

Canonical inventory SHA-256:
`d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`

The shorter value previously embedded in the launcher/contract was an authority transcription error. The canonical value above is the existing repository authority from `CFT_INVENTORY_CANONICAL_ALGORITHM_AND_GATE_STATUS_CORRECTION_2026-08-19.md`; no CFT source byte changed.

## Engineering verification already required before final gate

The ordinary repository regression must require all of the following before any final Codex run:

- launcher `node --check` PASS on Node `v24.12.0`;
- launcher SHA-256 exactly `475e4c2b2f99b0813a35fb93b29a1bf106d789461a53dd2dc30979be500724e6`;
- patch/test/browser authority files have their pinned LF bytes and hashes;
- exact candidate reconstruction retains the required worker/content hashes;
- ordinary composer-wait targeted regression PASS.

This correction is validation-only. Production candidate bytes are unchanged.
