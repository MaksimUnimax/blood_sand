# Ozon live-repair V2 prefreeze reconstruction report

Date: 2026-08-18
Scope: V2 engineering reconstruction only; not acceptance and not a live-provider test.

## Authority and safety

- Repository: `MaksimUnimax/blood_sand`
- Frozen production base: `4ce190c8bbdc438dcdf407ab4be4dbecd846736df`
- V2 candidate checkpoint: `df8e0a898cfa19d9eb66de19280a6b1b8bbbe0c7`
- V1 concat was not used.
- `REAL_OZON_REQUESTS = 0`.
- No credentials, provider calls, production edits, fuzzing, or manual repair were used.

## Frozen Step-4 reconstruction

The exact frozen Step-4 diagnostic reconstruction was verified as 17/17, including the authoritative frozen hashes:

- `service_worker.js`: `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `content_script.js`: `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json`: `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `shared/ozon_contract.js`: `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js`: `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

The remaining frozen files were also hash-verified: `popup.css`, `popup.html`, `popup.js`, `shared/ai_adapters.js`, `shared/bridge_autorun_model.js`, `shared/composer_send.js`, `shared/conversation_identity.js`, `shared/manual_controls.js`, `shared/ozon_credentials.js`, `shared/ozon_provider.js`, `shared/proven_writing_block_capture.js`, and `shared/provider_transport_core.js`.

## V2 raw transport

Raw Git blob extraction from the V2 checkpoint matched the authority:

| part | bytes | SHA-256 | Git blob |
|---|---:|---|---|
| `00.patch.part` | 4846 | `0163659825c2a20cd51bda19bf851746fc7bc1e0f0d888b92c4b9e551328d232` | `2a56745a2e9c4870e9bea4212254d28d14810928` |
| `01.patch.part` | 4775 | `7402568c52814d002c649e75f98d00db272c060f7bcc02e94f74564b0572f1e0` | `11d22c70b1986f9be8aeb375da8e7d9dc5eddcc8` |
| `02.patch.part` | 2851 | `dbe2b2c9426eb9259488ab7d1eb7645fe7286176d5cb23da078cdace89d5b8e0` | `3248494436d109174e02f7eb309cc66be37014f2` |

Lexical V2 concatenation: 12472 bytes, SHA-256 `8333f70403fb8bd4d1b81900ab6e16110633f68290e0d88db0fd164507810e7d`.

Parts 01 and 02 are byte-identical to V1. The V1-to-V2 delta is limited to the first worker hunk context/header; the repair-added lines and Step-4 cache constants are unchanged. The V1 concat was not used for application.

## Exact apply gate

`git apply --check` was run against the exact frozen Step-4 reconstruction with no fuzz and no manual edits. It failed at the next worker hunk (`service_worker.js:106`). That hunk expects the pre-Step-4 quota-function layout, while the exact frozen Step-4 worker contains accepted cache helper functions before `normalizedQuotaState`/`safeQuotaMetadata`.

The failure occurs before any repaired candidate is produced. No V2 patch repair or alternate application was attempted.

Therefore post-repair hashes, production-file delta, protected-file identity, quota behavior, public privacy, countdown behavior, and regression gates are not proven and are intentionally not claimed.

## Result

- Frozen Step-4 reconstruction 17/17: PASS.
- V2 raw parts: PASS.
- V2 concat: PASS.
- V1-to-V2 context-only delta: PASS.
- Exact V2 patch application: FAIL.
- Repaired `service_worker.js` SHA: NONE.
- Repaired `content_script.js` SHA: NONE; expected value was not produced by an exact apply.
- Real Ozon/provider requests: 0.

This is a report-only prefreeze result. It is not acceptance, not a live test, not a release promotion, and does not authorize a rerun.
