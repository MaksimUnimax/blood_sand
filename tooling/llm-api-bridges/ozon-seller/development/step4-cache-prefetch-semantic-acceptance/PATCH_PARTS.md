# Step 4 cache/prefetch + semantic acquisition patch manifest

Date: 2026-08-18

Apply this patch only after reconstructing the exact accepted Step-3 candidate frozen at:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Concatenate the following files byte-for-byte in lexical order:

1. `patch-parts/00.patch.part` — size `5163`; SHA-256 `b047ace2c1c74d0da39ec52343ce2107355ab32d52c6356d3f02d56cac9cdfa7`; Git blob `df48fca99ea27aea43663bc71adbff15106bc896`
2. `patch-parts/01.patch.part` — size `5099`; SHA-256 `c3d3b3017097fd0d036049a594c4a366df5b8b81a0dde02b5ff863824890f9c4`; Git blob `d6207c283b2b7d5e9b10b78904b33802e4d3c303`
3. `patch-parts/02.patch.part` — size `5199`; SHA-256 `6e0c783e988192b4221ad444e0f38cd0170b60b4b9d30236317f141250eaad0f`; Git blob `99ed88f49ec2618736d7deef7a49390caed4ce03`
4. `patch-parts/03.patch.part` — size `5195`; SHA-256 `77b6a40ff13316c1e307270aaea2b7597956563f8051c50cef51b627c6ac0830`; Git blob `b990747c2e4fa4e01a4a24b0422ff45712655447`
5. `patch-parts/04.patch.part` — size `5188`; SHA-256 `51350ae1756b1d198884dbcb566d1585b9d64ad7d09d61bfbe278ee250b4dcb8`; Git blob `119eabf4c4828c6e4099aeb0756b1407d6b2f5f5`
6. `patch-parts/05.patch.part` — size `3292`; SHA-256 `30521308e1c264669ca618548182c29e91b74b98aed6132abee0011ce4db5eb1`; Git blob `723e7ae208d27b7e111a40291fd8878d0e5e4961`

Expected concatenated patch:

- size: `29136` bytes
- SHA-256: `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Exactly three production files differ from accepted Step 3:

- `service_worker.js`: `bfe2aa15b09f48dffb2dd7ff913f6b527c07fca09e462759dffb30d9dd72c514` -> `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js`: `e303b74b266c685f1ae20b9e3b726211f7b65c56490a3ed09693b84489e58b45` -> `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js`: `f66a4fc004a59981c59f715ba335c4b2b4b8f750789befb17b045894bb55ac24` -> `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

The other fourteen production files must remain byte-identical to accepted Step 3.
