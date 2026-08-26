# Patch B8 Supply / Replenishment — candidate manifest

Date: 2026-08-26

- accepted B7 authority: `3769590c49e3deb5951769b3a27c79706a4f3ba9`
- B7 production tree: `dbac8600c41367ad7ba270f5391b48e11e2244c1d8fa0d1018baa712c0d0627c`
- B8 raw patch: `b3b685b928857d31bc2de6bf65f761c39ab66391c439ce8a65ecb38f7e83ec86`
- B8 gzip patch: `2b407798ee27593c88239131234780b7a7d8dcf29ed7a7104f439a41a64f26b7`
- B8 production tree: `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`
- production files: `21`
- exact Seller Swagger: `3933043` bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`

Changed production files:

- `shared/ozon_operation_registry.js` -> `a2ecd81db1862281bd5dc12284a16c46e1ad61cab48a4c7406b50245d8dcd796`
- `shared/ozon_contract.js` -> `49dfac7276311b391bc9918348edca0086e5832de359a693c10e6d912487e447`
- `shared/ozon_entitlements.js` -> `cee472cfe526776a774c173033f1c94769b79d926668ffe892194fb4dbaab6bc`

B8 acceptance requires successful Linux + Windows CI and independent validation. Autorun, Work-session lifecycle, Manual mode, provider transport, credentials and quota runtime are protected and unchanged.
