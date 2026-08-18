# Ozon live-repair patch manifest

Date: 2026-08-18
Status: implementation candidate V2; NOT frozen until exact detached reconstruction/apply is independently reproduced.

Production base authority:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Repair scope commit:

`4a20160ca5b39ccb99c30cc3ac887d9e488f2b92`

## Superseded V1

The original concat patch was:

- bytes `12381`
- SHA-256 `b30a91128fbbec229d4bf1083f5df94cbdc5ed1b6b951fe4c75333654264a575`

Independent pre-freeze report commit `f659739938dc87588411a5ff1f288a23cfec3c2e` proved exact Step-4 reconstruction `17/17` but `git apply --check` failed because the first worker hunk used pre-Step-4 adjacency and omitted the already accepted Step-4 cache constants from its context. V1 is permanently superseded; its bytes are not rewritten retroactively and it must not be used for freeze or validation.

No repair semantics were changed in V2. Only the first unified-diff hunk context was rebased onto the exact frozen Step-4 top-of-worker context.

## Current V2 raw patch

Concatenation order is lexical by filename.

Total bytes: `12472`

SHA-256:

`8333f70403fb8bd4d1b81900ab6e16110633f68290e0d88db0fd164507810e7d`

Local Git patch parser result:

- `service_worker.js`: +38 / -2
- `content_script.js`: +103 / -0

Exactly two production files are in the repair delta. Manifest and all other production files are intentionally untouched.

## V2 parts

| part | bytes | SHA-256 | Git blob SHA |
|---|---:|---|---|
| `00.patch.part` | 4846 | `0163659825c2a20cd51bda19bf851746fc7bc1e0f0d888b92c4b9e551328d232` | `2a56745a2e9c4870e9bea4212254d28d14810928` |
| `01.patch.part` | 4775 | `7402568c52814d002c649e75f98d00db272c060f7bcc02e94f74564b0572f1e0` | `11d22c70b1986f9be8aeb375da8e7d9dc5eddcc8` |
| `02.patch.part` | 2851 | `dbe2b2c9426eb9259488ab7d1eb7645fe7286176d5cb23da078cdace89d5b8e0` | `3248494436d109174e02f7eb309cc66be37014f2` |

Part 00 differs from V1 only in the first hunk context: the exact frozen Step-4 lines

- `const PROVIDER_RESULT_CACHE_SCHEMA_VERSION = 1;`
- `const ANALYTICS_CACHE_TTL_MS = 60_000;`

are now retained as context immediately after the inserted safety constant. The added production line remains exactly:

`const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;`

Parts 01 and 02 are byte-identical to V1.

## Base/final file hash status

Frozen Step-4 base hashes:

- `service_worker.js`: `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `content_script.js`: `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`

The local exact operator baseline `content_script.js` matched the frozen Step-4 hash byte-for-byte. Applying the repair content-script delta locally gives:

- repaired `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

The repaired `service_worker.js` final SHA is intentionally NOT asserted until V2 is applied to an independently reconstructed exact frozen Step-4 worker. The failed V1 engineering report proved the frozen worker reconstruction itself was exact, so V2 must reuse that same authority and prove exact application rather than fuzzing.

## Semantics encoded by V2

Unchanged from the frozen repair scope:

- nominal analytics quota metadata stays `60000 ms`;
- fixed bridge-owned launch safety is `5000 ms`;
- effective not-before boundary is `65000 ms` from the last real provider attempt;
- old persisted 60-second quota state is migration-guarded using `last_provider_request_at`;
- Retry-After remains extension-only and cannot shorten the guarded boundary;
- no automatic retry is added;
- safe public quota-wait state exposes no account hash/credential scope;
- content script renders an owner-local persistent Ozon quota countdown from durable `next_allowed_at` and switches to a sending state at due time;
- countdown ticks are local UI time calculations and do not poll Ozon.
