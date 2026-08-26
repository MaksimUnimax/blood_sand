# Patch B7 Analytics / Search — candidate manifest

Date: 2026-08-26

- accepted B6 authority: `d6ec73e48e3ad51da23323016b2dcdf34f21ef0c`
- B6 production tree: `2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57`
- B7 raw patch: `4c1de93a97938f9541936cd1edf8060a21b93acf19b296f16cf81a4994cfeac4`
- B7 gzip patch: `a3d88d1be345254aa99522f148c01907111bbd3d87463b22d632f5ea0f15fb3a`
- B7 production tree: `dbac8600c41367ad7ba270f5391b48e11e2244c1d8fa0d1018baa712c0d0627c`
- production files: `21`
- exact Seller Swagger: `3933043` bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`

Changed production file only:

- `shared/ozon_entitlements.js` -> `c22377e2224564646ca29637491e9cb719a466adee68d1ca2bebf0a80b3c7530`

B7 acceptance requires successful Linux + Windows CI and independent validation. Autorun, Work-session lifecycle, Manual mode, provider transport, credentials and quota runtime are protected and unchanged.
