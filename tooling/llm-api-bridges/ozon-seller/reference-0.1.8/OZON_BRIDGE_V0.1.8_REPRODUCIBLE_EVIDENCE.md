# Ozon Bridge v0.1.8 — reproducible verification evidence

Date: 2026-08-13

## Release identity

Expected release ZIP:

`ozon-bridge-v0.1.8-extension.zip`

Expected SHA-256:

`79b750b2d16b0f765af674181ea41894681aa778db27e11fb87760960912a5fa`

Expected production file count: **16**.

## Reproduction basis

The accepted v0.1.8 production tree is the exact accepted v0.1.7 production tree plus the reviewed v0.1.7 → v0.1.8 patch stored in this reference directory.

Required v0.1.7 base ZIP SHA-256:

`9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`

Patch evidence is stored as four ordered base64 text parts because the repository connector write path is bounded:

- `OZON_BRIDGE_V0.1.8_PATCH.diff.gz.b64.part01` — SHA-256 `c577dbcbae425916b29297fe2e8100da1310b3bc7c3cec5db9313c2fc5c3ac82`;
- `OZON_BRIDGE_V0.1.8_PATCH.diff.gz.b64.part02` — SHA-256 `55c01f4a2d86a446876591aa73354040dbd8f4bb196fc5a37a7da1532df1ab8a`;
- `OZON_BRIDGE_V0.1.8_PATCH.diff.gz.b64.part03` — SHA-256 `f46a798f02eb1751d277eac36ac1e155f142f970524170bb5380cf4a38d027db`;
- `OZON_BRIDGE_V0.1.8_PATCH.diff.gz.b64.part04` — SHA-256 `fa5fc36cdef6437c7ebc4d9b8d79f6152c9d3015b9e3a8ecedfe7a6e51f1c3a3`.

Concatenate those files in numeric order with no transformation. The concatenated stored-base64 SHA-256 is:

`628d49bceabdb658f607f3cef1243a5044205e8d42d29643146bf551c1de250c`

Decoded patch SHA-256:

`5bfce3cd0d6ecf440f218ce5b90b23b610a7d5541260bb33f321e4003983d3b2`

Deterministic gzip patch SHA-256:

`97f91543070e30f86d7e67bb67460305a1d5f85a80414bdcdc419830f84534e7`

The patch changes exactly these eight production paths:

- `content_script.js`;
- `manifest.json`;
- `popup.html`;
- `popup.js`;
- `service_worker.js`;
- `shared/bridge_autorun_model.js`;
- `shared/ozon_contract.js`;
- `shared/runtime_names.js`.

All other production paths are byte-identical to v0.1.7.

## Patch reconstruction

From an extracted exact v0.1.7 production tree:

1. concatenate `OZON_BRIDGE_V0.1.8_PATCH.diff.gz.b64.part01` through `.part04` in numeric order;
2. verify concatenated SHA-256 `628d49bceabdb658f607f3cef1243a5044205e8d42d29643146bf551c1de250c`;
3. base64-decode the concatenated text;
4. gzip-decompress to `OZON_BRIDGE_V0.1.8_PATCH.diff`;
5. verify decoded patch SHA-256 `5bfce3cd0d6ecf440f218ce5b90b23b610a7d5541260bb33f321e4003983d3b2`;
6. apply from the extension root using `patch -p1 --forward --batch`;
7. verify the 16 SHA-256 values below.

Accepted production hashes:

- `content_script.js` `0f448b88ef8d0bcb166678e30397012dc283e89bad8307036bd48b4dd4d839a0` (104709 bytes)
- `manifest.json` `c7376dd832aac5688042e270d3ec76f7b6317114e88812251dfd99081da51b7d` (1159 bytes)
- `popup.css` `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5` (5116 bytes)
- `popup.html` `9a2826246456e27e39856469b3641047f5ee8697240a7f2f8220afda949758c5` (10331 bytes)
- `popup.js` `c9b9a7f7f28ae0c9090a8ebade79a54b8ab015003e4b844a057897cff445e665` (31248 bytes)
- `service_worker.js` `859e9d5b6c3b17885792bff0685644621358e007a49edd15126827abdc804c4c` (142446 bytes)
- `shared/bridge_autorun_model.js` `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5` (12012 bytes)
- `shared/composer_send.js` `96d687cbd18c2d550b93618a3a587711184ec72b2c92498ac16a171eda7894a2` (7612 bytes)
- `shared/conversation_identity.js` `e56a9f352c4668f47a0f72c2044a943a88457024c4400fa878a974551518114a` (1955 bytes)
- `shared/manual_controls.js` `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e` (10269 bytes)
- `shared/ozon_contract.js` `4b141f03d17764463a7b144d308075e007b291eaa0c4f53ffeec07265b1ed194` (29445 bytes)
- `shared/ozon_credentials.js` `5112b7d69491c8c61fb108fcb60878bfaa3724c92ceddb95fef6e584958ba330` (2033 bytes)
- `shared/ozon_provider.js` `73f0303a8215909c0159eed774f610713e604ca7c66144f34af12e36b56a6173` (4717 bytes)
- `shared/proven_writing_block_capture.js` `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef` (14614 bytes)
- `shared/provider_transport_core.js` `6343276c7f0055e224b99912cc7bdc85a4eaf7d149471c182ce0c758ff8f2db9` (3714 bytes)
- `shared/runtime_names.js` `b5eba853a637bd3364dfbc6fe3f253c22b7a380af9e0bb50f93ee12e73cb2c45` (4127 bytes)

## Test reproduction evidence

Source production-tree run:

- tests: 174;
- pass: 174;
- fail: 0;
- cancelled: 0;
- skipped: 0.

Fresh final ZIP extraction run:

- tests: 174;
- pass: 174;
- fail: 0;
- cancelled: 0;
- skipped: 0.

One initial fresh-package shell invocation reported process exit 1 despite Node reporting `fail: 0`; the cause was an inherited historical test cleanup invoking terminal clearing with `TERM` unset. Re-running the identical test set with `TERM=xterm` produced `174/174 PASS` and process exit 0. This infrastructure artifact did not require or cause a production code change.

## Package determinism

The release ZIP is constructed from the sorted 16 production paths only, using DEFLATE level 9, file mode 0644 and fixed ZIP entry timestamp `2026-08-13 00:00:00`.

A second independent build from the same accepted source tree was byte-identical to the first:

`79b750b2d16b0f765af674181ea41894681aa778db27e11fb87760960912a5fa`

Fresh extraction contains exactly the expected 16 production files. Tests/evidence are not packaged.

Every production `.js` file passes `node --check`. Chromium 144 `--pack-extension` returned exit 0 for the accepted production tree.

## Safety properties reproduced

- full-message structural command discovery is independent of Markdown/writing-block formatting;
- later valid markers survive malformed earlier material;
- provider concurrency is one;
- no intermediate ChatGPT delivery occurs while collecting;
- completed provider results are not replayed;
- unknown in-flight provider outcome after worker restart is never automatically retried;
- final combined report is inserted once;
- final batch path does not inspect report/composer contents after insertion;
- disabled Send, Stop, Unknown and Microphone are never clicked;
- active Send is re-resolved/reclassified before each click attempt;
- Microphone alone confirms success after the initial blind wait;
- delivery watcher is single-owner/event-scoped and destroyed at success;
- no separate batch storage key/history store is created;
- Ozon operation registry and READ effects are unchanged;
- host/permission surface is unchanged;
- provider requests are not replayed because of UI delivery retry/recovery.

## Limitation

Chromium packaging validates extension package/manifest integrity, not authenticated ChatGPT behavior. The Chrome Extension Lab connector was unavailable and local headless CDP did not expose an MV3 service-worker target. A live installed, logged-in ChatGPT continuation run is still required for field acceptance of the new final-delivery UI state machine.
