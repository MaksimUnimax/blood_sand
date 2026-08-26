# Patch B7 Analytics / Search — implementation result

Date: 2026-08-26
Status: candidate pending independent validation

- accepted B6 authority: `d6ec73e48e3ad51da23323016b2dcdf34f21ef0c`
- accepted B6 production tree: `2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57`
- B7 raw patch SHA-256: `4c1de93a97938f9541936cd1edf8060a21b93acf19b296f16cf81a4994cfeac4`
- B7 gzip SHA-256: `a3d88d1be345254aa99522f148c01907111bbd3d87463b22d632f5ea0f15fb3a`
- B7 production tree: `dbac8600c41367ad7ba270f5391b48e11e2244c1d8fa0d1018baa712c0d0627c`
- production file count: `21`

Exactly one production file changes:

- `shared/ozon_entitlements.js` -> `c22377e2224564646ca29637491e9cb719a466adee68d1ca2bebf0a80b3c7530`

Protected B6 production identities include:

- registry `d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b`
- contract `e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7`
- service worker `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- Autorun model `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- Work-session model `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`

Author-side B7 deterministic regression passed both with and without the exact Seller Swagger. Exact authority gate emitted `B7_ANALYTICS_SEARCH_EXACT_SWAGGER_PASS` and `B7_ANALYTICS_ENTITLEMENT_COMPILER_EXACT_PASS`.

Seller requests: `0`. Performance requests: `0`. Credentials used: `0`.
