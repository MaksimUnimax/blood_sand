# Step 2 query planner + safe coalescing patch manifest

Date: 2026-08-17

Apply this patch only after reconstructing the exact accepted Step-1 candidate from the pinned operator v0.1.19 ZIP plus the accepted Step-1 patch.

Concatenate these files byte-for-byte in lexical order:

1. `patch-parts/00.patch.part` — size `5941`; SHA-256 `a1e762cfe09df399a170aa78fa00c90c3044c64280ba3bc0e7d8feeb6e8f2115`; Git blob `b37f3384c985ffd30ef511e2c9fdf9b9985e527e`
2. `patch-parts/01.patch.part` — size `5915`; SHA-256 `7682ef88f23cbbe1cb17e14aa1899e822cc2ef30fd80adc48d321e00a056c0d2`; Git blob `0d1fb00729c79ab7e1033ec0a87a3088e48f093b`
3. `patch-parts/02.patch.part` — size `5979`; SHA-256 `8d9a5ccbd5a9107257f8644057f6e0760a72668566330f55bed0337dd4772286`; Git blob `c661ff6b9acef9095e8e1345b401060f151e65f0`
4. `patch-parts/03.patch.part` — size `5988`; SHA-256 `1a7402df6eb393a045fc3a9c2cc4c0d03650f28d698a377e1574de70d80de541`; Git blob `56bfed8d9e99cff4a0351f68f90e7c693c886742`
5. `patch-parts/04.patch.part` — size `5941`; SHA-256 `2bbe65a60294187de816a2a8dfd36725ddbf016e0bedaac268119ed86c29648f`; Git blob `afccb900c49c034053a39e03c4991346e17b6818`
6. `patch-parts/05.patch.part` — size `5880`; SHA-256 `82594c1e33aca9f03f2b95f98064016e0dd6925709b039697a3254759d21276a`; Git blob `6a54f6ba6f9a290838ea148f0870c823d589a495`

Expected concatenated patch:

- size: `35644` bytes
- SHA-256: `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`

Expected Step-2 candidate changed production files relative to the accepted Step-1 candidate:

- `service_worker.js` — SHA-256 `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f`
- `shared/ozon_contract.js` — SHA-256 `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac`
- `shared/ozon_provider.js` — SHA-256 `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d`

No other production file may change.
