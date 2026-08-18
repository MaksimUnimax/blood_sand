# Ozon Bridge v0.1.19 — repair V3 exact reconstruction evidence

Date: 2026-08-18
Status: `EXACT_RECONSTRUCTION_PASS_BEHAVIORAL_COMPLETION_REQUIRED`

## Authority

Frozen production base remains exactly:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

V3 implementation-candidate checkpoint:

`88a20984c55da1f813ca1184bd90089823f51883`

V3 prefreeze engineering report:

- branch `engineering/ozon-live-repair-prefreeze-reconstruction-v3-2026-08-18`
- commit `82b8ec53830047902b8bfcc2886519ae6161fcaf`
- file `development/live-repair-quota-countdown/PREFREEZE_RECONSTRUCTION_V3_REPORT_2026-08-18.md`

The report contains a typographical error in the human-readable frozen-base line (`...7ab4be...`). That typo is NOT authority. The exact base used by project governance, the V3 plan, reconstruction lineage, frozen file hashes and this decision remains the 40-character SHA above: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`.

## Report-only lineage review

Independent ChatGPT live-GitHub review confirmed:

- base: `88a20984c55da1f813ca1184bd90089823f51883`
- head: `engineering/ozon-live-repair-prefreeze-reconstruction-v3-2026-08-18`
- status: ahead
- ahead_by: 1
- behind_by: 0
- merge base: exact `88a20984c55da1f813ca1184bd90089823f51883`
- only changed file: `PREFREEZE_RECONSTRUCTION_V3_REPORT_2026-08-18.md`

No production or repair artifact was changed on the engineering report branch.

## Exact V3 transport and apply — accepted engineering evidence

V3 concat:

- bytes: `16517`
- SHA-256: `aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`

The report independently proved:

- frozen Step-4 reconstruction: 17/17 exact;
- all four V3 raw parts match their Git blobs and expected hashes;
- exact `git apply --check`: PASS;
- exact apply once: PASS;
- changed production files: exactly 2;
- protected production files: 15/15 byte-identical;
- manifest unchanged;
- all production JS syntax checks PASS;
- manifest JSON parse PASS;
- `REAL_OZON_REQUESTS = 0`.

## Exact post-repair production hashes

Changed files:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Protected fifteen:

- `manifest.json`: `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `popup.css`: `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html`: `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js`: `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
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

## Quota behavior already proven from actual repaired worker

The V3 worker VM proved:

- quota family remains `seller.analytics_data.v1`;
- nominal interval remains `60000 ms`;
- internal launch safety is `5000 ms`;
- effective same-account boundary is `65000 ms`;
- T+60001 denied;
- T+64999 denied;
- T+65000 may acquire;
- legacy persisted +60000 state is migration-guarded from `last_provider_request_at`;
- different Seller accounts remain independent;
- usable Retry-After only extends, never shortens.

The 5000 ms value remains an internal bridge safety margin motivated by rejected live evidence; it is not asserted as an Ozon-documented endpoint limit.

## Why the V3 prefreeze verdict remains failed

The V3 report did NOT execute the required accepted synthetic Chrome/Puppeteer route or the complete actual public manual/autorun state-path exercise. Therefore the following are still `UNPROVEN`, not `FAIL`:

- cache-hit-before-quota actual integration;
- zero-auto-retry full integration regression;
- visible countdown plate;
- live MM:SS decrement;
- absolute due clock;
- due sending-state transition;
- restart restore;
- duplicate-click protection during wait;
- two-tab/two-owner isolation;
- ChatGPT/Alice binding regression;
- public wait privacy through actual runtime state endpoints;
- full accepted Step-1–4 regression matrix.

No new production patch is justified by these `UNPROVEN` fields. The next step is a behavioral-completion engineering gate against the exact same V3 candidate bytes.

## Freeze rule

Do NOT freeze yet.

The exact V3 candidate may be frozen only after a standalone behavioral-completion prefreeze report proves every remaining required gate with `REAL_OZON_REQUESTS = 0` and ChatGPT independently verifies that report from live GitHub.