# Ozon Bridge v0.1.6 — reproducible verification evidence

Date: 2026-08-12
Base: immutable `reference-0.1.5/`.

## Production reconstruction

Apply the decoded/gunzipped `OZON_BRIDGE_V0.1.6_PATCH.diff.gz.b64` to the exact v0.1.5 production tree. Expected production file SHA-256 values are recorded below.

```
ecda68875c6793ed5d88a7d511ae285d4bb6495cdc51964a6e3b64fc4d48038a  content_script.js
91d7599bd4413768746719ac8c0f2fb27d9085b3eda3f772cd66ec4b71731cdf  manifest.json
dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5  popup.css
b21c6685825bfbc9e63a7696b06b24b9caed7047a32806c3527a429da66af7a2  popup.html
439345b175dd176edb8b7af34a8163b88544f8d93b35b831396ab0b9486aa801  popup.js
fea21b4adbac29064cd3cfdd4e4a9dccfaa8102af96a06f0892f06ea3cf9d0d9  service_worker.js
dff5265640ec4b848b4dee6019261c7b230d015eeac6f12fd85b9b7c2e93c22c  shared/bridge_autorun_model.js
a6a2b25ea29637b76250a9f29fdcb177b52824a16a193b44ca5603df2494da79  shared/composer_send.js
e56a9f352c4668f47a0f72c2044a943a88457024c4400fa878a974551518114a  shared/conversation_identity.js
81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e  shared/manual_controls.js
46164795ae5d9fbf9e6f58775dec3548528b441507ae7937674bf4f99580bb32  shared/ozon_contract.js
5112b7d69491c8c61fb108fcb60878bfaa3724c92ceddb95fef6e584958ba330  shared/ozon_credentials.js
73f0303a8215909c0159eed774f610713e604ca7c66144f34af12e36b56a6173  shared/ozon_provider.js
5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef  shared/proven_writing_block_capture.js
6343276c7f0055e224b99912cc7bdc85a4eaf7d149471c182ce0c758ff8f2db9  shared/provider_transport_core.js
5f556d90dc06821e76749435813fd4daadcdcbaea4f89de98aac8b7c8c35a756  shared/runtime_names.js
```

## Final automated verification

Repeated locally immediately before handoff:

- source-tree suite: 89/89 PASS; 0 fail; 0 skipped; 0 cancelled;
- changed-line audit: PASS;
- v0.1.5 -> v0.1.6 changed production lines: every new/replaced production line V8-covered or exact-source asserted;
- fresh final ZIP extraction: 16/16 production files byte-identical to source;
- all production JavaScript in fresh extraction passes `node --check`;
- full 89-test suite rerun against fresh ZIP extraction: 89/89 PASS;
- Chromium extension pack check: exit 0;
- release SHA-256: `6ff4a7daab51f05b0beb5942e5f7f6ef155b3ffa29a3a78e69eca9b7b8229242`.

## Boundary-specific tests

The suite explicitly proves:

- depth 40 request accepted where Ozon has no documented generic depth limit;
- >2500 aggregate keys accepted where no provider max is documented;
- >6000 array items accepted on a synthetic no-provider-limit shape;
- >220000-byte request member accepted where no provider body-size max is documented;
- `stocks_current` filter with 6001 product IDs is not rejected by a bridge maxItems cap because supplied Ozon schema has no such maxItems;
- provider-specific documented limits remain enforced for all enabled aliases;
- provider result arrays >10000 preserved;
- >20000 result keys/data items preserved;
- result nesting beyond old depth cutoffs preserved;
- >1.5 MB provider responses accepted through both text fallback and streaming read;
- no bridge 30-second provider timeout remains;
- transport/auth injection remains rejected;
- credentials longer than former local 256/2048 limits are accepted, while CR/LF header injection remains rejected;
- fixed trusted host, read-only registry, PII redaction, one-command/one-request, no hidden retry/pagination/fan-out, durable delivery and v0.1.5 controlled-error behavior remain regression-tested.

No live Ozon brute-force probing was used for undocumented limits; synthetic/mocked tests validate that the extension itself no longer imposes the removed arbitrary caps.
