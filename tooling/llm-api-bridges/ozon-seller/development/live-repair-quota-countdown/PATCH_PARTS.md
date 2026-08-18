# Ozon live-repair patch manifest

Date: 2026-08-18
Status: implementation candidate; NOT frozen until exact detached reconstruction/apply is independently reproduced.

Production base authority:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Repair scope commit:

`4a20160ca5b39ccb99c30cc3ac887d9e488f2b92`

## Raw patch

Concatenation order is lexical by filename.

Total bytes: `12381`

SHA-256:

`b30a91128fbbec229d4bf1083f5df94cbdc5ed1b6b951fe4c75333654264a575`

Git numstat of the syntactically parsed concat patch:

- `service_worker.js`: +38 / -2
- `content_script.js`: +103 / -0

Exactly two production files are in the repair delta. Manifest and all other production files are intentionally untouched.

## Parts

| part | bytes | SHA-256 | Git blob SHA |
|---|---:|---|---|
| `00.patch.part` | 4755 | `e41635878f52c5c880daae0fb6539f72d93d395cbac888dc258a08e2436ff0bf` | `4d3f9462b8e25f80cfafed5db9870168979d4c58` |
| `01.patch.part` | 4775 | `7402568c52814d002c649e75f98d00db272c060f7bcc02e94f74564b0572f1e0` | `11d22c70b1986f9be8aeb375da8e7d9dc5eddcc8` |
| `02.patch.part` | 2851 | `dbe2b2c9426eb9259488ab7d1eb7645fe7286176d5cb23da078cdace89d5b8e0` | `3248494436d109174e02f7eb309cc66be37014f2` |

All three Git blob SHAs were fetched back from live GitHub after upload and matched the local raw bytes exactly.

## Base/final file hash status

Frozen Step-4 base hashes:

- `service_worker.js`: `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `content_script.js`: `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`

The local exact operator baseline `content_script.js` matched the frozen Step-4 hash byte-for-byte. Applying the repair content-script delta locally gives:

- repaired `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

The repaired `service_worker.js` final SHA is intentionally NOT asserted here because this runtime no longer has the full reconstructed frozen Step-4 worker bytes. The next engineering checkpoint must reconstruct exact `4ce190c8...`, verify its frozen worker SHA, apply this exact concat patch, and publish the resulting worker SHA before any implementation freeze.

## Semantics encoded by the patch

- nominal analytics quota metadata stays `60000 ms`;
- fixed bridge-owned launch safety is `5000 ms`;
- effective not-before boundary is `65000 ms` from the last real provider attempt;
- old persisted 60-second quota state is migration-guarded using `last_provider_request_at`;
- Retry-After remains extension-only and cannot shorten the guarded boundary;
- no automatic retry is added;
- safe public quota-wait state exposes no account hash/credential scope;
- content script renders an owner-local persistent Ozon quota countdown from durable `next_allowed_at` and switches to a sending state at due time;
- countdown ticks are local UI time calculations and do not poll Ozon.
