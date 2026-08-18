# Ozon live-repair prefreeze reconstruction report

Date: 2026-08-18
Scope: engineering reconstruction only; not acceptance and not release promotion.

## Authority and safety

- Repository: `MaksimUnimax/blood_sand`
- Frozen production base (canonical 40-character Git object resolved locally): `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Implementation candidate checkpoint: `ae64d944c90eac70be6cf88784b822a281dca3c5`
- `REAL_OZON_REQUESTS = 0`
- No Ozon credentials were used and no provider/network request was executed.
- No production logic was repaired or edited in this validation branch.

## Reconstruction result

The exact frozen Step-4 operator reconstruction was verified before attempted modification:

- 17 production files: `17/17` present and hash-verified.
- Frozen `service_worker.js`: `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`.
- Frozen `content_script.js`: `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`.

The three repair blobs were fetched from the candidate checkpoint and verified:

| part | bytes | SHA-256 |
|---|---:|---|
| `00.patch.part` | 4755 | `e41635878f52c5c880daae0fb6539f72d93d395cbac888dc258a08e2436ff0bf` |
| `01.patch.part` | 4775 | `7402568c52814d002c649e75f98d00db272c060f7bcc02e94f74564b0572f1e0` |
| `02.patch.part` | 2851 | `dbe2b2c9426eb9259488ab7d1eb7645fe7286176d5cb23da078cdace89d5b8e0` |

The lexical concatenation is 12381 bytes with SHA-256 `b30a91128fbbec229d4bf1083f5df94cbdc5ed1b6b951fe4c75333654264a575`.

`git apply --check` does not pass against the exact frozen Step-4 bytes. The first hunk of the supplied repair patch expects the quota constants to be immediately followed by the delivery comment; the exact Step-4 worker has the accepted cache constants between them. Therefore the supplied raw patch cannot be applied exactly to the exact frozen Step-4 reconstruction. No fuzzing, manual repair, or production-code alteration was used to mask this mismatch.

Consequently, no repaired service-worker SHA can be truthfully reported, and the required post-apply behavioral claims remain unproven.

## Frozen 17-file hash inventory

The verified frozen inventory was:

- `content_script.js`: `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json`: `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `popup.css`: `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html`: `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js`: `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
- `service_worker.js`: `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ai_adapters.js`: `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9`
- `shared/bridge_autorun_model.js`: `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/composer_send.js`: `3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736`
- `shared/conversation_identity.js`: `939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57`
- `shared/manual_controls.js`: `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_contract.js`: `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/ozon_credentials.js`: `286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d`
- `shared/ozon_provider.js`: `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/proven_writing_block_capture.js`: `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef`
- `shared/provider_transport_core.js`: `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/runtime_names.js`: `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

## Required gate status

Because exact patch application failed, all gates requiring the repaired candidate are `FAIL`/`UNPROVEN`, with no downgrade to acceptance:

- frozen Step-4 reconstruction: PASS
- raw repair parts and concat: PASS
- exact patch apply: FAIL
- exactly two changed files after apply: UNPROVEN
- protected fifteen byte-identical after apply: UNPROVEN
- repaired worker SHA: NONE
- repaired content-script SHA: NONE (the documented expected value is `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`, but it was not produced by an exact apply)
- quota guard, countdown, privacy, provider-surface and regression gates: UNPROVEN

This report is report-only. It does not alter production logic, repair the patch, promote a release, or authorize a live rerun.
