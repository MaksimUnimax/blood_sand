# Patch A candidate transport R2 integrity PASS

Branch: `test/ozon-work-session-lifecycle-patch-a-browser-candidate-2026-08-24`

Purpose: preserve the exact already-built Patch A browser candidate bytes after the original binary GitHub handoff was truncated. This is transport reconstruction only. It is not a rebuild, repack, or production-code change.

## Canonical candidate identity

- filename: `OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A_BROWSER_CANDIDATE_2026-08-24.zip`
- byte size: `136504`
- SHA-256: `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`
- Git blob SHA of the canonical ZIP bytes: `7292fbbc4133ddad046da050c11d67adf9419183`
- base64 length: `182008`
- transport parts: `21`

## GitHub transport layout

Directory:
`tooling/llm-api-bridges/ozon-seller/validation/transport-r2/`

Concatenate `part-000.b64` through `part-020.b64` in lexical order with no inserted separators or newlines, then base64-decode the result.

Expected part sizes and Git blob SHAs:

| part | size | git blob SHA |
|---|---:|---|
| 000 | 9000 | `a542aa84826164d9e337058ccc19a3abb4b7b6c5` |
| 001 | 9000 | `339825b4876bf7789fc371b9026996f77bd1fad3` |
| 002 | 9000 | `bc708ff8ff4f7ada33e4e8ace550bd3b7bfa9142` |
| 003 | 9000 | `54a9106bf03379ae2a75207e253cc758ba8b6f61` |
| 004 | 9000 | `e5c531f22993b7f36008f38956d4a78c032cedca` |
| 005 | 9000 | `9e5b3b45fbac561e86ceb59942068e4ea7c73adb` |
| 006 | 9000 | `39090c3eb82e7c5410d2df2592c048f1dbd6470e` |
| 007 | 9000 | `9fa0eba4c96b90b198568c1b13cab3654cee347f` |
| 008 | 9000 | `6e19301d41a14f588539ee78a6c61d529bcf6d4c` |
| 009 | 9000 | `5896c2eafcff4fba087ff5fc74ee9ec778d87998` |
| 010 | 9000 | `ec8e94f4076a847ecaadc4285f59fb6c0f479c9c` |
| 011 | 9000 | `bd36f8e88786d644ce57e76a5fce0d88efe4abb5` |
| 012 | 9000 | `57cf680942cb0440ad0c92e7c37b860462167a39` |
| 013 | 9000 | `8d4d1622d7bcc5ba27b6e17a2db7bfafe85a9c5d` |
| 014 | 9000 | `3bca140d0ab6d6064a40129617c9ee2e1d49b9e1` |
| 015 | 9000 | `0cc38d62c30e0ea67657317948bffc075cbba873` |
| 016 | 9000 | `d593125b6c1953083138695f5cc596adb20ae121` |
| 017 | 9000 | `019cfc95331bc1e21e86dcedb3454e772a17f15a` |
| 018 | 9000 | `b648a537ff11df40a7be517c9acc16918bb750a8` |
| 019 | 9000 | `297d3de0a980f56580979c442f1733d0a0172f51` |
| 020 | 2008 | `b2246e92a868c1093caabc603c7a62c073f272d8` |

All 21 GitHub objects above were verified against the same 136504-byte canonical candidate by recomputing the Git blob SHA for each exact base64 chunk. Every object matches.

Therefore the repository transport is byte-preserving: concatenating the exact chunk bytes produces the canonical 182008-character base64 payload, and decoding that payload must produce the canonical 136504-byte candidate with SHA-256 `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`.

## Important negative identity

Do NOT use this repository file as the candidate source:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A_BROWSER_CANDIDATE_2026-08-24.zip`

That historical GitHub binary handoff is known to be truncated to `10818` bytes. It is retained only as audit evidence of the failed first transport.

## Decision

`PATCH_A_CANDIDATE_TRANSPORT_R2_INTEGRITY_PASS`
