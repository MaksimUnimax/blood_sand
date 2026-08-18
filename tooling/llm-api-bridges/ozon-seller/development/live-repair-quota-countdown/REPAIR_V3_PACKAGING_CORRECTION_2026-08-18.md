# Ozon Bridge v0.1.19 — V3 packaging correction

Date: 2026-08-18
Status: `V3_CANDIDATE_CHECKPOINT_READY_FOR_PREFREEZE`

## Authority

Frozen production base remains exactly:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Repair scope remains exactly commit:

`4a20160ca5b39ccb99c30cc3ac887d9e488f2b92`

Rejected live acceptance remains report commit:

`888b12a`

Prior pre-freeze failures remain authoritative negative evidence:

- V1 report commit `f659739938dc87588411a5ff1f288a23cfec3c2e` — `PREFREEZE_CHECK_FAILED`
- V2 report commit `70cbaf4f105e2ec6b2a620235189e9c3630243af` — `PREFREEZE_V2_CHECK_FAILED`

The V2 report text contains a transcription typo in its displayed frozen-base SHA (`...7ab4be...`). It nevertheless reconstructed and verified the authoritative frozen Step-4 file hashes and was run from the V2 plan whose authority is the correct base `4ce190c8bbdc438dcdf407abbe4dbecd846736df`. The typo does not create a new base authority. V3 MUST use only the correct 40-character base above.

## Root cause of V1/V2 patch failures

The repair worker patch was initially generated from a shortened proxy containing selected quota/public-state functions. That proxy was sufficient for local semantic VM checks but not a valid source for full-file unified-diff hunk positions/adjacency.

V1 failed where Step 4 had accepted cache constants between quota constants and the delivery comment.

V2 fixed that first constants context but later proxy-derived worker hunks still encoded shortened-file locations/adjacency; exact full Step-4 application therefore failed again.

No repaired production candidate was produced by V1 or V2. No semantic gate was downgraded. `REAL_OZON_REQUESTS = 0` in both.

## V3 correction method

V3 does NOT alter the repair requirements or business behavior.

Instead of progressively editing V2 hunk context, V3 regenerates the worker packaging around complete, stable functions/blocks in full-file order. In particular, `publicQuotaWait` is inserted by anchoring on the complete `publicManualOperation` function itself, so it does not assume which accepted helper function precedes `publicManualOperation` in the full worker.

V3 patch authority is exclusively:

`development/live-repair-quota-countdown/PATCH_PARTS_V3.md`

Concat SHA-256:

`aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`

Concat bytes:

`16517`

Production delta represented:

- `service_worker.js`: +38 / -2
- `content_script.js`: +103 / -0

No other production file.

V1 concat `b30a91128fbbec229d4bf1083f5df94cbdc5ed1b6b951fe4c75333654264a575` is superseded.

V2 concat `8333f70403fb8bd4d1b81900ab6e16110633f68290e0d88db0fd164507810e7d` is superseded.

Neither may be used for any new reconstruction or validation.

## Local V3 packaging evidence

The V3 patch was tested against a deliberately full-worker-shaped synthetic fixture that contained unrelated helper functions between the quota functions and public manual state, specifically to remove the shortened-proxy adjacency assumption that caused V1/V2 failures.

PASS:

- V3 unified-diff parse
- V3 `git apply --check` on the full-worker-shaped synthetic fixture
- V3 exact synthetic apply
- post-apply worker JS syntax
- exact frozen content-script patch application and JS syntax
- expected quota safety code present
- expected public wait code present
- expected Russian countdown presentation code present

No Ozon/provider network request was made.

`REAL_OZON_REQUESTS = 0`

## Freeze discipline

This commit is only the V3 implementation-candidate checkpoint. It is NOT a frozen production implementation SHA and NOT acceptance.

The next gate must independently:

1. reconstruct exact frozen Step 4 from the accepted lineage and verify all 17 frozen hashes;
2. fetch raw V3 parts from this checkpoint and verify every byte/hash;
3. concatenate to exact V3 SHA `aa247ed1...`;
4. run `git apply --check` against the exact frozen full tree with no fuzz/manual repair;
5. apply once;
6. prove exactly two changed production files and fifteen byte-identical protected files;
7. report exact post-repair worker/content hashes;
8. run the mocked quota/countdown/security/regression gates;
9. keep `REAL_OZON_REQUESTS = 0`.

Only a fully passing V3 pre-freeze report can unlock ChatGPT freezing a repaired implementation target and preparing a later independent acceptance validation.