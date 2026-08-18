# Ozon live-repair V3 prefreeze reconstruction report

Date: 2026-08-18
Scope: V3 engineering reconstruction/check only; not acceptance, live test, or release promotion.

## Authority and safety

- Repository: `MaksimUnimax/blood_sand`
- Frozen production base: `4ce190c8bbdc438dcdf407ab4be4dbecd846736df`
- V3 candidate checkpoint: `88a20984c55da1f813ca1184bd90089823f51883`
- V1 and V2 patch/concat artifacts were not used.
- `REAL_OZON_REQUESTS = 0`.
- No credentials or provider/network requests were used.
- No reconstructed tree or production logic was edited to force application.

## Frozen Step-4 reconstruction

The frozen Step-4 tree was reconstructed and verified as 17/17. The key frozen hashes matched authority:

- `service_worker.js`: `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `content_script.js`: `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json`: `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `shared/ozon_contract.js`: `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js`: `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

## V3 raw transport and exact apply

Raw Git blob extraction from the V3 checkpoint matched all authority metadata:

| part | bytes | SHA-256 | Git blob |
|---|---:|---|---|
| `00.patch.part` | 4549 | `1290c5b5f0fe0801aed948776a2d22ef0a3fc49aada1fbad4ec2de7e146399c1` | `9f40efac96ccf403100a36cf99b19b0c683d29e0` |
| `01.patch.part` | 4599 | `5df178a8f3f5df16d2b331dff55a7e71a733d8019d68755034d3a3c97964e1cf` | `ebba55b2b7a69cfb84cc56b169f7f9bd56f0d0a6` |
| `02.patch.part` | 4552 | `70016e06881a4e3b09728d5f63ffdde3ca4e8bffca89cd74dc0d850843d7fc7e` | `a8519f1e294cf3c3902cd1ebc2007e25b5f5dede` |
| `03.patch.part` | 2817 | `4a79138663792bfea940658b7ac61c73efe7d49bc6a12869e10f6e2a8bb7c22c` | `cd64942fb79de623d9c5e40023bfcc5b39ffaa9b` |

The lexical concat is 16517 bytes with SHA-256 `aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`.

`git apply --check` passed with the exact V3 concat and no fuzz, reject mode, manual context changes, or alternate patch. The patch was applied exactly once. The resulting delta contains exactly `service_worker.js` and `content_script.js` (+38/-2 and +103/-0). The other fifteen production files, including the manifest, remained byte-identical.

## Post-repair hashes

All 17 post-repair production hashes:

- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- `manifest.json`: `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `popup.css`: `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html`: `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js`: `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
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

## Checks

All production JS files passed `node --check`; manifest JSON parsing passed; exact delta and protected-file hash checks passed. An actual V3 worker VM with mocked storage/credentials/provider passed quota guard checks for nominal 60000 ms, internal bridge safety 5000 ms, effective 65000 ms, T+60001/T+64999 denial, T+65000 acquisition, legacy migration guard, different-account independence, and Retry-After extension-only behavior (`QUOTA_V3_VM_PASS`). The 5000 ms value is an internal bridge safety margin motivated by rejected live evidence, not an Ozon-documented quota.

The required accepted synthetic Chrome/Puppeteer DOM route and the full actual public manual/autorun state-path exercise were not executed in this check. Therefore countdown UI, restart/two-owner rendering, duplicate-click behavior, public wait privacy, cache-hit-before-quota, and the full Step-1–4 behavioral regression matrix remain unproven here. No provider request was made.

## Result

Exact V3 reconstruction and application passed, but the prefreeze gate is not complete because required browser/public-state/regression evidence remains unproven. This report is report-only and does not authorize acceptance, live testing, or release promotion.
