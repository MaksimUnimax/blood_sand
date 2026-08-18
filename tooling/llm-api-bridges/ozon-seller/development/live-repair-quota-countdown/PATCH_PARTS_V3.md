# Ozon live-repair V3 patch manifest

Date: 2026-08-18
Status: `V3_IMPLEMENTATION_CANDIDATE_NOT_FROZEN`

Production base authority:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Repair scope remains unchanged from:

`4a20160ca5b39ccb99c30cc3ac887d9e488f2b92`

## Why V3 exists

V1 and V2 pre-freeze checks both reconstructed frozen Step 4 correctly but failed exact patch application because the worker patch had originally been generated from a shortened quota/public-state proxy rather than from a full worker-shaped context. V1 exposed stale Step-4 cache adjacency. V2 corrected the first constants hunk but the later proxy-derived hunk locations/adjacency remained invalid for the full worker.

V3 does not change repair semantics. It repackages the same intended worker edits into full-function anchored hunks in actual file order:

- Step-4 constants block;
- complete `safeQuotaMetadata` function;
- complete `acquireAnalyticsProviderQuota` function;
- complete `extendAnalyticsQuotaFromRetryAfter` function;
- complete `publicManualOperation` function with `publicQuotaWait` inserted immediately before that function without assuming what helper precedes it;
- complete `publicRun` function.

The content-script delta is byte-identical to the previously tested repair content delta.

## V3 raw patch

Concatenation order:

1. `patch-parts-v3/00.patch.part`
2. `patch-parts-v3/01.patch.part`
3. `patch-parts-v3/02.patch.part`
4. `patch-parts-v3/03.patch.part`

Concat bytes:

`16517`

Concat SHA-256:

`aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`

Git numstat of the complete V3 concat:

- `service_worker.js`: +38 / -2
- `content_script.js`: +103 / -0

Exactly two production files are represented. Manifest and all other production files are untouched by the patch.

## Raw parts

| part | bytes | SHA-256 | Git blob SHA |
|---|---:|---|---|
| `00.patch.part` | 4549 | `1290c5b5f0fe0801aed948776a2d22ef0a3fc49aada1fbad4ec2de7e146399c1` | `9f40efac96ccf403100a36cf99b19b0c683d29e0` |
| `01.patch.part` | 4599 | `5df178a8f3f5df16d2b331dff55a7e71a733d8019d68755034d3a3c97964e1cf` | `ebba55b2b7a69cfb84cc56b169f7f9bd56f0d0a6` |
| `02.patch.part` | 4552 | `70016e06881a4e3b09728d5f63ffdde3ca4e8bffca89cd74dc0d850843d7fc7e` | `a8519f1e294cf3c3902cd1ebc2007e25b5f5dede` |
| `03.patch.part` | 2817 | `4a79138663792bfea940658b7ac61c73efe7d49bc6a12869e10f6e2a8bb7c22c` | `cd64942fb79de623d9c5e40023bfcc5b39ffaa9b` |

All four Git blob SHAs were independently read back from live GitHub and match the local raw bytes exactly.

## Semantics unchanged from frozen repair scope

- quota family stays `seller.analytics_data.v1`;
- nominal `min_interval_ms` stays `60000`;
- internal bridge launch safety stays fixed `5000`;
- effective same-Seller not-before boundary is `65000` from the last real provider attempt;
- stale persisted +60000 state is guarded from `last_provider_request_at`;
- Retry-After remains extension-only;
- no automatic retry/replay is introduced;
- cache-hit-before-quota behavior is not changed;
- public wait state exposes no account hash, credential revision or credentials;
- content countdown uses durable `next_allowed_at`, local one-second ticking, and no provider/network polling.

## Local V3 packaging checks

A synthetic full-worker-shaped fixture was deliberately constructed with additional helper functions between `extendAnalyticsQuotaFromRetryAfter` and `publicManualOperation`, reproducing the adjacency class that broke V1/V2.

Results:

- `git apply --check` V3 concat: PASS
- exact V3 apply to synthetic full-worker-shaped fixture: PASS
- repaired synthetic worker `node --check`: PASS
- repaired exact frozen content script `node --check`: PASS
- worker semantics present: PASS
- countdown semantics present: PASS
- `REAL_OZON_REQUESTS = 0`

This synthetic result is packaging evidence only. V3 is not frozen until an independent exact detached reconstruction of frozen Step 4 applies this exact V3 concat without fuzz or manual repair and reports post-repair hashes.