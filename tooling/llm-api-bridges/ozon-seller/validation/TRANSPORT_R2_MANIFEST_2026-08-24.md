# Patch A browser candidate — Transport R2 manifest

Branch: `test/ozon-work-session-lifecycle-patch-a-browser-candidate-2026-08-24`

## Canonical candidate identity

- Candidate: `OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A_BROWSER_CANDIDATE_2026-08-24.zip`
- Exact ZIP size: `136504` bytes
- SHA-256: `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`
- Git blob SHA-1 of exact ZIP bytes: `7292fbbc4133ddad046da050c11d67adf9419183`
- Base64 length: `182008` characters
- Transport part count: `21`
- Production file count after clean extraction: `19`
- ZIP integrity check: PASS

## Important

The file at `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A_BROWSER_CANDIDATE_2026-08-24.zip` is the known-bad first binary handoff. It is truncated to 10818 bytes and MUST NOT be used for R2 testing.

R2 is the canonical transport for this candidate. It transports the exact original candidate bytes as ordered base64 text chunks and does not rebuild or modify production code.

## Verified GitHub transport parts

| Part | Size | Verified Git blob SHA-1 |
|---|---:|---|
| `part-000.b64` | 9000 | `a542aa84826164d9e337058ccc19a3abb4b7b6c5` |
| `part-001.b64` | 9000 | `339825b4876bf7789fc371b9026996f77bd1fad3` |
| `part-002.b64` | 9000 | `bc708ff8ff4f7ada33e4e8ace550bd3b7bfa9142` |
| `part-003.b64` | 9000 | `54a9106bf03379ae2a75207e253cc758ba8b6f61` |
| `part-004.b64` | 9000 | `e5c531f22993b7f36008f38956d4a78c032cedca` |
| `part-005.b64` | 9000 | `9e5b3b45fbac561e86ceb59942068e4ea7c73adb` |
| `part-006.b64` | 9000 | `39090c3eb82e7c5410d2df2592c048f1dbd6470e` |
| `part-007.b64` | 9000 | `9fa0eba4c96b90b198568c1b13cab3654cee347f` |
| `part-008.b64` | 9000 | `6e19301d41a14f588539ee78a6c61d529bcf6d4c` |
| `part-009.b64` | 9000 | `5896c2eafcff4fba087ff5fc74ee9ec778d87998` |
| `part-010.b64` | 9000 | `ec8e94f4076a847ecaadc4285f59fb6c0f479c9c` |
| `part-011.b64` | 9000 | `bd36f8e88786d644ce57e76a5fce0d88efe4abb5` |
| `part-012.b64` | 9000 | `57cf680942cb0440ad0c92e7c37b860462167a39` |
| `part-013.b64` | 9000 | `8d4d1622d7bcc5ba27b6e17a2db7bfafe85a9c5d` |
| `part-014.b64` | 9000 | `3bca140d0ab6d6064a40129617c9ee2e1d49b9e1` |
| `part-015.b64` | 9000 | `0cc38d62c30e0ea67657317948bffc075cbba873` |
| `part-016.b64` | 9000 | `d593125b6c1953083138695f5cc596adb20ae121` |
| `part-017.b64` | 9000 | `019cfc95331bc1e21e86dcedb3454e772a17f15a` |
| `part-018.b64` | 9000 | `b648a537ff11df40a7be517c9acc16918bb750a8` |
| `part-019.b64` | 9000 | `297d3de0a980f56580979c442f1733d0a0172f51` |
| `part-020.b64` | 2008 | `b2246e92a868c1093caabc603c7a62c073f272d8` |

All 21 GitHub blob SHAs and sizes were re-read from the branch and matched against a manifest regenerated from the canonical 136504-byte candidate.

## Reconstruction

Use only files under:

`tooling/llm-api-bridges/ozon-seller/validation/transport-r2/part-*.b64`

Concatenate `part-000.b64` through `part-020.b64` in lexical order without separators or added newlines, then base64-decode the concatenated text.

The reconstructed result MUST satisfy all of these before any browser test starts:

- size = `136504`
- SHA-256 = `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`
- Git blob SHA-1 = `7292fbbc4133ddad046da050c11d67adf9419183`
- fresh extraction = `19` production files
- ZIP integrity test = PASS

If any condition differs, stop before browser testing and report transport/preflight failure. Do not repair or rebuild the candidate.

## Production inventory

1. `content_script.js`
2. `manifest.json`
3. `popup.css`
4. `popup.html`
5. `popup.js`
6. `service_worker.js`
7. `shared/ai_adapters.js`
8. `shared/bridge_autorun_model.js`
9. `shared/composer_send.js`
10. `shared/conversation_identity.js`
11. `shared/manual_controls.js`
12. `shared/ozon_contract.js`
13. `shared/ozon_credentials.js`
14. `shared/ozon_guidance.js`
15. `shared/ozon_provider.js`
16. `shared/proven_writing_block_capture.js`
17. `shared/provider_transport_core.js`
18. `shared/runtime_names.js`
19. `shared/work_session_model.js`

`TRANSPORT_R2_PREFLIGHT_PASS`
