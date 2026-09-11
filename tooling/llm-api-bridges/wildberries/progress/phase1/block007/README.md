# Block007 — WB0.1.4 exact package checkpoint

2026-09-11. **WIP / SCOPED_REGRESSIONS_PASS / FULL_PHASE1_INCOMPLETE**.

Actual artifact: `wildberries-bridge-v0.1.4-phase1-WIP.zip`, **94498 bytes**,19 files, SHA256 `725c7e4bccb22d132b9e624f4acaa3a79a4f502635f3ff64da2b600124f32f8f`.

This checkpoint finishes restoration, version freeze and exact-package testing of blocks001–006. It is NOT a full53-feature migration or live WB certification.

## Actual repeated final results

- Contract/request fixtures:197/197.
- Protocol/HELP:47/47.
- Previous worker:9/9.
- Batch worker:38/38.
- Previous synthetic browser:7/7.
- Manual capture:5/5.
- Autorun capture:10/10, executed as5+5 bounded groups.
- Exact ZIP/manifest/syntax/reconstruction:40/40.

Total **313 behavioral +40 package**,0FAIL. All completed subprocesses exit0. All these groups ran in this continuation on files extracted from the final0.1.4 ZIP. The earlier chat claim of313 is not being reused as evidence.

One aggregate browser attempt hit an outer-tool timeout after8 successful assertions. Its raw partial evidence is preserved, not counted again. The same10 Autorun checks then passed in two bounded groups on unchanged production; no page errors. This is not a production bug or discarded progress.

The browser is real Chromium but pages and Chrome messaging are synthetic; provider traffic is mocked. Real WB calls=0. Actual installed/live checks remain pending.

## Saved raw evidence

Three snapshot.partNN files contain97 actual UTF-8 files: raw JSONL, launch intents, stdout/stderr, exit receipts, new executed test runners, manifests and the reconstructor. The decoded JSON is95715 bytes, SHA256 `db7d4042998ef4d7d2b03f697e8729239c83d59074dbb52f27077fb306aa97d8`.

```sh
python -X utf8 RESTORE_SNAPSHOT.py NEW_EVIDENCE_DIRECTORY
```

Restoration of all97 files was executed and verified locally. Historical source recipes/test runners remain in blocks001–006 and are not replaced with a narrative.

## Exact candidate reconstruction

```sh
python -X utf8 REBUILD_V014.py wildberries-bridge-v0.1.3-phase1-WIP.zip ../ NEW_OUTPUT.zip
```

Second argument is phase1/ containing blocks004–006, NOT block007. Standard-library-only script checks pinned0.1.3, snapshot006, all19 pre-bump hashes, updates only7 version files, builds ZIP and verifies final SHA256. A second actual run reproduced the identical94498-byte archive. Another zlib version may change compressed bytes; the script fails honestly rather than certifying a mismatching ZIP.

## Continuation

`../../EXECUTION_CURSOR.json` and `CURRENT_PROGRESS.json` now point to0.1.4 and this result. Older recovery-time ledgers are historical, not authority to restart completed work. Next bounded block: pinned Ozon multi-AI and conversation-identity donor → all affected WB consumers → A01/A02 implementation → tests → WIP checkpoint/readback. Do not enable new WB-specific operations/policies or start real acquisition. Full dependency closure of the whole migration is pending.
