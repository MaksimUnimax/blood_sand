# Full provider-neutral package: actual source checkpoint before tests

Date: 2026-09-11. Operator reiterated: implement all possible without real WB API characterization, run available tests ourselves, then deliver a build. Do not delegate QA or make live WB requests now.

Base: byte-exact WB0.1.4, SHA256 725c7e4bccb22d132b9e624f4acaa3a79a4f502635f3ff64da2b600124f32f8f. Existing blocks001-007 are preserved. No restart from WB012.

The 8 parts store the actual 143791-byte git source diff (xz/base64), SHA256 642ae881a9bef89518f6667ce9cfb9b86405610475476fcf76559aff9c519472. All 8 blob hashes were verified against local payloads before this checkpoint. Local source commit: 229008dcb3b0c71b788857273abbc27a3d0d06b9.

Implemented in this WIP source: ChatGPT/Alice adapters and identity; Manual/Autorun integration; binding-revision guard; persistent Work Session actions and refresh boundary; new-context bootstrap; runtime settings popup; generic privacy/entitlement/date/schema/LKG/quota/cache/planner engines with WB optimizations disabled; worker-owned IndexedDB artifacts; opaque binding/account-scoped file references; named-port chunk transfer with per-chunk and full hashes; file attachment helpers; composer waiting; provider-success preservation on artifact failure; large text document delivery; implicit-cell/namespace-safe local XLSX reader.

Original operation registry, credentials and transport request construction are not expanded. Provider response handling and request dispatch wrapper do change and need complete tests. The 16 previously blocked operations remain blocked even with Personal Data ON. No speculative WB quota/date/entitlement values are introduced.

A real syntax failure in the initial multi-AI integration was saved locally then corrected. Current JavaScript source passes node syntax checks, but behavioral/dependency acceptance has NOT yet been completed. This is a recovery checkpoint, NOT a release or a PASS claim. Real WB calls=0.

Next: run the preserved old suites plus new real-worker/real-Chromium synthetic tests; fix observed defects; save raw per-assertion results; freeze package, rerun on exact extracted bytes; publish final source/test delta and installation archive. Live-only user-profile verification remains post-install; its absence does not prevent building the candidate.
