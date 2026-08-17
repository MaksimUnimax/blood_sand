# Step 3 quota scheduler + verifier + safe errors patch manifest

Date: 2026-08-17

Apply this patch only after reconstructing the exact accepted Step-2 candidate whose frozen implementation target is:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Concatenate the following files byte-for-byte in lexical order:

1. `patch-parts/00.patch.part` — size `5767`; SHA-256 `b53384b63b105a9146b535c89dbb202c8da2425dfe518046c8081953e827bcad`; Git blob `4a8686ce013ca428f807432ac8db332e8a81e373`
2. `patch-parts/01.patch.part` — size `5767`; SHA-256 `8e571f418220327f0c04a82d646ef56fd6e39a7f3dffe8d0b454f878d0d0cbdb`; Git blob `44be59e5f4b2521685135f859b33c52d555ed6d5`
3. `patch-parts/02.patch.part` — size `5743`; SHA-256 `6ea75bcfd88ab9f6cfae064bd742a583668ec502b5bb9cf80994e14a8e8412ee`; Git blob `43c53e18e31874b63be6073ca07a22d906ab45df`
4. `patch-parts/03.patch.part` — size `5795`; SHA-256 `3c257a41104f74401b00ef1a5d6e2444d8b938d98372c959fd39e08ae388c266`; Git blob `4c3057a61ab10f3ac09bfb40a746773d7f65987a`
5. `patch-parts/04.patch.part` — size `5760`; SHA-256 `e71abd19c2f2b38ee904de1d6abf1ad9026aa64f4daee1ad6dd3a243c5dcce05`; Git blob `28bc836cacfd08fae7fc1a9f381e43f3905e4001`
6. `patch-parts/05.patch.part` — size `5798`; SHA-256 `4c42e88ca3a34c36a17993847d049f7555de2438e9e8c312e5b738be775378dc`; Git blob `fbe9ed6b03c9946a5f08215e4fbff4f2b78a76f3`
7. `patch-parts/06.patch.part` — size `5799`; SHA-256 `2ce324ea439b9091026caa9e9f5e349e27b3590abe8c601a645fe538f49aa839`; Git blob `ee4933c230006eb5f44184b0002389efaa767d11`
8. `patch-parts/07.patch.part` — size `2301`; SHA-256 `f4d6d55ed35b6576863fc724919b6c5779cf1f7f6061d22506987fcbc9ca00f8`; Git blob `9a911af589ae4834d242a0850f4ae8914418dc66`

Expected concatenated patch:

- size: `42730` bytes
- SHA-256: `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`

Exactly six production files differ from accepted Step 2:

- `manifest.json`: Step 2 `6ed5ecc768cc980d256b5bfb69f00c9a4006ec2eb2bd6c96f9d261d7a018e0fb` -> Step 3 `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `service_worker.js`: Step 2 `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f` -> Step 3 `bfe2aa15b09f48dffb2dd7ff913f6b527c07fca09e462759dffb30d9dd72c514`
- `shared/ozon_contract.js`: Step 2 `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac` -> Step 3 `e303b74b266c685f1ae20b9e3b726211f7b65c56490a3ed09693b84489e58b45`
- `shared/ozon_provider.js`: Step 2 `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d` -> Step 3 `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js`: Step 2 `9c33c7c2448959f75eb5d0c2b36137bba68085c4b93a90a8c67d1ee86de4aa39` -> Step 3 `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/runtime_names.js`: Step 2 `2abc73a8c6f5ba29e71c352c452fcc4da1cbf278de988fdc070dc5414d908292` -> Step 3 `f66a4fc004a59981c59f715ba335c4b2b4b8f750789befb17b045894bb55ac24`

No other production file may change.
