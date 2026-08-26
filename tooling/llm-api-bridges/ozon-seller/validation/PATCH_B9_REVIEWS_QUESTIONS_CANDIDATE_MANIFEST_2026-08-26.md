# Patch B9 Reviews / Questions — candidate manifest

Date: 2026-08-26

- accepted B8 authority: `600a6922fd3f339fb2d57bc3828d51ecba1670d7`
- B8 production tree: `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`
- B9 raw patch SHA-256: `b938688273bbf66732d9c45b4765e7a87db94f5e1d6a1a5ce2ccc1060aa4bb8a`
- B9 gzip patch SHA-256: `5974889dffd45003b505d8be4d088366fdd5118578ca96358d609e0797704e7f`
- B9 production tree SHA-256: `d955dbfd1a667e40ea0cb04374b31e0cfe95bbf75b3b355d11c50d10f748a6d5`
- production files: `21`
- exact Seller Swagger: `3933043` bytes
- exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`

Changed production files:
- `shared/ozon_operation_registry.js` -> `e157dfa70ecddc2d473d5968e045448f8d5693ed6553063798b417743a1d88eb`
- `shared/ozon_contract.js` -> `e80b3d07f6deef12412e8ddfc99dad4ad62236b932ed2a7246b8afb90c9ef674`
- `shared/ozon_entitlements.js` -> `8f006b298fb4bdff969ba4cca54f796821bacc124c078203d6e2f49fd418df70`

B9 acceptance requires successful Linux + Windows CI and independent validation. Protected runtime remains byte-identical to B8.
