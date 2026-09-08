# Ozon multi-AI file delivery — corrective LIVE-GATE-02 PASS

Date: 2026-09-08

Status: `LIVE_GATE_02_CORRECTIVE_RETEST_PASS`

Scope: live ChatGPT manual-ingress delivery of one oversized generated Bridge result after the named-Port attachment-delivery corrective build.

## Build authority

- production implementation: `00af53dffe7e02f62a3a218038b70177fed5a17b`
- final tested harness/package source commit: `3a9586a354b4fd86109ce29051bc8d5605d78a5d`
- successful GitHub Actions run: `34196266412`
- installable ZIP: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_3a9586a354b4.zip`
- ZIP SHA-256: `21b0b4b10baaff0dd9fa7b0c1dc829c7856dab585420797e51473f665aebfbdf`

## Live request evidence

- operation: `performance_campaigns`
- request id: `1ae01058-d937-4b5d-ac06-b8cab1205dab`
- result count: `1`
- logical business result count: `1`
- physical business request count: `1`
- provider HTTP status: `200`
- capability probe: not performed
- exact request preserved: true

## Live delivery evidence

Bridge marker:

- `delivery_representation=ATTACHED_COMPLETE_TEXT_DOCUMENT`
- delivery id: `manual-delivery-a0345532-19aa-4e03-8951-a442fc4a0d3c`
- `complete=true`
- attachment filename: `ozon-bridge-result-manual-delivery-a0345532-19aa-4e03-8951-a442fc4a0d3c.txt`
- MIME: `text/plain;charset=utf-8`
- source kind: `generated_bridge_text`
- Unicode characters: `1,091,591`
- UTF-8 bytes: `1,098,880`
- SHA-256: `7fdaf4ff08c4a2130659e87e77850b189d80ef1a61141a2f629088c163478e39`

Independent readback of the actually attached file in the resulting ChatGPT user turn matched the Bridge marker byte length and SHA-256 exactly. The file begins with `OZON_BATCH_RESULT_V1` and contains the complete single-result response with the provider result closing normally.

## Verdict

`LIVE-GATE-02 = PASS`.

This live run proves for this oversized generated-text case:

1. the successful Ozon business request remained exactly one logical / one physical request;
2. the provider returned HTTP 200;
3. the >1,048,000-character Bridge result was not delivered as megabytes of plain composer text;
4. Bridge materialized the complete generated result as a TXT document;
5. that TXT document was attached to the ChatGPT user turn;
6. the delivered file bytes and SHA-256 match the Bridge marker exactly;
7. the matching user turn reached ChatGPT with the attachment, with no operator copy/cut/paste/file-creation/attach/Send action used in this run.

This does **not** by itself prove the post-send Bridge `READY` state because no diagnostic state snapshot for that phase was captured in this evidence set.

## Next gate

`LIVE-GATE-03 = REAL_PROVIDER_FILE_DOWNLOAD_ATTACH_AUTO_SEND_CONFIRM`.

Required next proof: a real Ozon-generated provider file (XLSX/CSV/other original report artifact) must be fetched once from its provider file reference, preserved byte-complete, attached as the original document rather than reserialized as generated TXT, automatically sent into the current AI turn, and read back with matching identity/integrity evidence.

CAP-24 remains frozen at `2200 / 9519` until the global delivery/file completion gate is satisfied.
