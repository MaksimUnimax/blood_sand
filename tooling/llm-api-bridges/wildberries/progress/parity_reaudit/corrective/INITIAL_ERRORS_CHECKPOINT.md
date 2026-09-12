# Initial error correction — exact WIP checkpoint
Date: 2026-09-12
Status: INITIAL PATHS IMPLEMENTED / TARGETED OFFLINE PASS / NOT INSTALLABLE RELEASE

## Actual production changes
Four WB021 files changed: `service_worker.js`, `content_script.js`, `shared/wb_command_protocol.js`, `shared/wb_batch_runtime.js`.
- Manual command admission records local rejection as durable batch/report rather than throwing before manual-operation persistence.
- Malformed command JSON in the selected manual block reaches the authoritative worker instead of terminating with a content-only toast.
- Mixed HELP/API is rejected locally as `MIXED_HELP_AND_API`, including malformed mixed input, matching the extracted actual Ozon discovery function.
- Local results include bridge_error/pre_execution_error, HTTP 0, zero physical calls, safe code/stage/message, no automatic retry; report proceeds through existing owner-bound delivery.
- All manual singles now use the durable batch path. Fixed WB hosts/registry/request serialization/credentials are untouched.

## Exact recoverable patch
`INITIAL_ERRORS.patch.gz.b64`, commit `9e5ef9bd4bb1671c54967b1ef9e237ab37a1649c`.
Remote content blob read back: `9b6a8ee2c938c3aa9b7570ce8bafa03f32a2fa27`, equal to locally computed Git blob.
Decode Base64, decompress gzip. Expected uncompressed diff: 12715 bytes; SHA256 `c689d0401a4f73b33e018dd8b39534e71e1682b250f35ef532f6dc442d307d28`.
Apply only to a COPY of the exact original WB021 extraction, never to an unverified working tree or an installed extension.
Original ZIP: 128734 bytes; SHA256 `ceeadd4d4302de5fe8989f27fe0be1f0363665e49ef19b56d8e4075e8a956a23`.
Post-patch SHA256:
- service_worker.js: 5919238ec62cdb74660b4368098b96e4d4601951d4a83301e58d9cc4c5c2e20c
- content_script.js: 3e8ba4f19d39483d8252ec3252d45819ef2a2f0cb6058ee7fc910c2d992c26fb
- shared/wb_command_protocol.js: e5fdfebe9f886e615c1417d94407b6c0f2c09f1a760e9b0bf505fe8fae6cd4f8
- shared/wb_batch_runtime.js: 6e98e4ef4a8c5e9310e7d2ea1a88aca5af580ae114ae2c3bd990106e53c53bfd

## Actual tests, not installed acceptance
Canonical exact runners and raw results are inside `evidence_parts/part01.b64` through `part06.b64`. Concatenate in order, remove whitespace, decode Base64; result is a gzip tar archive, 12190 bytes, SHA256 `b3cfb84b58b78cba8522cf86da4373fb81895a6a3fdb960d70922a4d007a9a60`, containing 29 files.
All six remote blobs were read from directory metadata at `e5346d7786698a986b6dbb373e3c9d7f401deba9` and equal the locally computed exact Git blobs:
1. 7f54e943569472927d397978cac8f1a7b0a795b0 (3001 bytes)
2. 299745c2ca8b431d641cdaaaed1a17bda36a72f4 (3001 bytes)
3. b2feeb7ea7642cfcaeea2a8549d155643c5aa986 (3001 bytes)
4. 887c8611892681066d5330cbcc450344355d5dea (3001 bytes)
5. 7d78b692f30a76dbd7b8338cc723e54b583aa1fb (3001 bytes)
6. 83b772faad4631aef478a60a009bb22bd4f73982 (1257 bytes)

Evidence matrix:
| Suite | Original WB021 | Corrected WIP | Meaning |
|---|---:|---:|---|
| tests/parity_error_worker.mjs | 3 PASS / 19 FAIL | 22 PASS / 0 FAIL | Exact worker/importScripts in mocked VM; includes real extracted Ozon mixed-discovery oracle, ownership and recovery assertions. |
| tests/manual_error_content.mjs | 3 PASS / 1 FAIL | 4 PASS / 0 FAIL | Exact handleCopy flow with injected worker/delivery; malformed JSON now reaches worker and report delivery. |
| previous_work/legacy/tests/contract.mjs | Separate original 0.1.2 comparator used | 197 PASS / 0 FAIL | Includes serialization and one-request-per-explicit-call for all 172 enabled WB operations; no real WB traffic. |

Four changed JavaScript files also passed node --check. Total targeted assertions on corrected WIP: 223 PASS, 0 FAIL. This is NOT P1–P9 completion, NOT full differential parity, NOT logged-in/browser installed delivery proof.
The separate `INITIAL_ERROR_REGRESSION.mjs` committed at b0d18d393c0f7e9e6de11624d8881ca5409e9770 is a reduced portable draft, NOT the canonical 22-case runner and NOT the source of these counts.

## Retained harness/publication incidents
- First quota fixture tried to override a frozen engine: invalid fixture, replaced by actual observeRetryAfter persistence. Use red-error-worker-r2, not the initial invalid quota attempt.
- First content fixture omitted URL/URLSearchParams: invalid mixed fixture, corrected. Use red-error-content-r2.
- First apply script had a Python quoting SyntaxError; the shell then ran the unchanged baseline in misleadingly named green-01 directories. These are APPLY/HARNESS_ERROR_BASELINE_NOT_PATCHED, not corrected-candidate GREEN. Actual corrected tests are green-error-worker-02 and green-error-content-02; script was compiled, then run under set -e.
- Single large Base64 evidence write at e7d804f478c51cbb34263337d152c787be62e746 did not match the intended bytes (remote blob dd2e797da7bac5dc1843445ffd06382760e2c1ad vs intended 30fd90ece3078b6b7522851005895f753b23b972). Withdrawn by 437407ad5ff26e9eebf3785835a9ea5e461dd59f; history retained. Replaced with six small hash-verified parts. Never reconstruct from the withdrawn file.

## Next exact action / remaining scope
P1 popup is still unmodified: unify Work/button authority, remove production Autorun/manual switch, clear stale plaques through one renderer, adopt mature Ozon operator structure with WB styling. Add RED/GREEN worker plus popup/DOM assertions before installing anything.
P2 remains partial: competing manual requests and all remaining early/transport/storage branches need reconciliation; wrong-owner delivery remains forbidden. Full HELP V2 (P3), mature recovery (P4), attachment transactions (P5), Multi-AI/Alice (P6), bootstrap (P7), framework/parsing reconciliation (P8–P9) are still open.
No new manual owner tests, no R1–R8, no real marketplace calls, no business mutations. Installed ZIP stays WB021 baseline; do not present this WIP as final v0.2.2.
