# Ozon Bridge v0.1.8 — multi-command sequential collection + single final delivery

Date: 2026-08-13

Release ZIP SHA-256:

`79b750b2d16b0f765af674181ea41894681aa778db27e11fb87760960912a5fa`

Base release: v0.1.7 (`9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`).

## Mandate implemented

v0.1.8 implements the governed checkpoint `OZON_BRIDGE_BATCH_QUEUE_DELIVERY_WIP_2026-08-13.md` without changing the Seller API allowlist, provider host, credentials boundary, mutation policy, or one-command/one-request provider safety rule.

The bridge now treats one completed assistant message as a possible ordered batch of `OZON_API_V1` commands. It discovers all markers structurally, stores the ordered queue and collected results inside the existing current autorun state, executes external requests strictly one at a time, then creates one combined report and performs one final ChatGPT delivery.

## Three architecture candidates and decision

Three materially different designs were emulated before production implementation.

### Candidate A — worker-owned queue embedded in the existing durable `auto_run` state — SELECTED

- discovery enters one existing run into `collecting`;
- worker owns ordered queue, current index, per-entry stored result and in-flight marker;
- no separate batch storage key or batch/run/command identifier hierarchy;
- provider request state is persisted before request and result persisted before advancing;
- existing run recovery owns collection and final delivery.

Emulation result: PASS. Maximum provider concurrency = 1; already stored results were not replayed; an old-worker in-flight request failed closed; one final delivery occurred after collection.

### Candidate B — content-script-owned queue

- content script would discover/advance commands and ask worker to execute each item.

Emulation result: REJECTED. A content/runtime restart can lose acknowledgement of a completed request and replay an already-executed provider call. This violates the durable no-replay requirement.

### Candidate C — separate durable batch store with explicit batch IDs

- independent batch storage object, batch identity and per-command identity separate from the existing autorun run.

Emulation result: safety behavior can be made correct, but REJECTED as unnecessary complexity. It adds persistent storage and identifier hierarchy specifically prohibited unless required; the existing run object is sufficient.

Candidate A was selected because it is the simplest design that preserves worker ownership, sequential execution, durable stored results and fail-closed recovery without creating a historical data store.

## Production changes

Exactly eight of the sixteen production files changed from v0.1.7.

### `shared/ozon_contract.js`

- runtime version advanced to 0.1.8;
- added balanced-brace JSON-object extraction that respects quoted strings, escapes and nested objects;
- added full-message `discoverCommands(text)` scanning for every literal `OZON_API_V1` marker in appearance order;
- malformed/missing/contract-invalid entries are represented locally while scanning continues from later safe markers;
- every valid extracted object still passes the existing strict `parseCommand()` contract and allowlist.

### `shared/bridge_autorun_model.js`

- added `collecting` run status;
- added batch delivery insertion phases `insert_committed` and `inserted`;
- added recovery decisions for collection resume, unknown in-flight request outcome, pending delivery watch and unknown insertion outcome;
- confirmed delivery/stop clears transient batch state instead of retaining completed result history.

### `service_worker.js`

- worker now accepts the complete assistant text through `OZ_AUTO_MESSAGE_READY`;
- discovery results are stored as an ordered `run.batch.entries` array inside the existing autorun record;
- `processAutoBatch()` is worker-owned and single-flight;
- one entry is persisted as `requesting` before the provider request; the result is persisted as `complete` before the index advances;
- provider execution uses an awaited serial loop, never parallel requests;
- pre-execution malformed/validation entries create canonical error reports with `external_request_executed:false` and perform no provider fetch;
- an entry already marked `complete` is skipped during recovery;
- an in-flight entry owned by a previous worker session fails closed as `REQUEST_OUTCOME_UNKNOWN_NO_RETRY` and is not replayed;
- after every entry is complete, one `OZON_BATCH_RESULT_V1` text is constructed with ordered canonical per-item `OZON_RESULT_V1` reports;
- only then is one delivery claimed;
- final insertion uses commit-before-insert, inserted acknowledgement and Microphone-only completion;
- no new persistent batch storage key was added.

### `content_script.js`

- autorun discovery now stabilizes the full completed assistant message rather than depending on one writing block;
- the complete assistant text is handed to the worker; content script no longer parses one autorun command locally;
- final batch delivery inserts the combined text exactly once after worker insertion commit;
- after insertion, the batch path does not read/compare/hash/sample composer contents and does not inspect attachments;
- new event-scoped `delivery-watch`: blind wait 2 s, then 2 s checks indefinitely while pending;
- every check reacquires the current composer controls from current DOM;
- classification is limited to active Send, disabled Send, Stop, Microphone or Unknown;
- only active strictly recognized Send may be clicked, after immediate fresh reclassification and connected/visible/enabled checks;
- repeated Send attempts are allowed if Send is still active on later checks;
- disabled Send, Stop, Unknown and Microphone are never clicked;
- Microphone is the sole delivery-success marker and destroys the watcher immediately;
- duplicate watcher ownership for the same delivery is deduplicated;
- Manual/legacy delivery and Start contours remain separate and retain their prior behavior.

### `shared/runtime_names.js`

- runtime/version text advanced to 0.1.8;
- added independent persistent Microphone binding profile key;
- default autorun prompt documents multiple commands in ordinary assistant text and one combined final delivery.

### `popup.html` / `popup.js`

- version advanced to 0.1.8;
- added independent Microphone bind/rebind/clear controls;
- UI recognizes `collecting` status.

### `manifest.json`

- version advanced to 0.1.8 and description updated;
- permissions and host permissions are byte-for-byte equivalent as sets to v0.1.7; no `downloads` permission was added.

Unchanged production files remain byte-identical to v0.1.7, including provider transport, provider operation implementation, credentials, Manual controls, conversation identity, composer-send legacy helper, and writing-block capture helper.

## Automated verification

Final source-tree suite: **174/174 PASS**, 0 fail, 0 skipped, 0 cancelled.

Fresh extraction of the final production ZIP: **174/174 PASS**, 0 fail, 0 skipped, 0 cancelled.

The 174-test acceptance is composed of:

- 132 compatible retained regression tests covering existing delivery single-flight, Manual behavior, popup/runtime, shared modules, worker recovery, contract, credentials, provider, transport and worker environment;
- 22 exhaustive content-runtime tests; the historical exact-version assertion was updated from 0.1.3 to 0.1.8, with all other behavior tests passing against v0.1.8 production bytes;
- 6 new full-message parser/autorun-model tests;
- 5 new worker batch integration/recovery tests;
- 4 new batch delivery/Microphone DOM-FSM tests;
- 5 new static/package/security invariants.

New batch-focused tests prove at least:

- commands adjacent, separated by prose/newlines/ordinary formatting, multiline/nested JSON, braces in strings and escaped string material are discovered in order;
- malformed earlier marker does not erase later valid markers;
- missing JSON and unsupported operation do not erase later valid markers;
- 1200-command discovery completes exactly;
- valid/malformed/valid batch performs exactly two provider requests and stores one local pre-execution result;
- 25 valid commands execute with observed maximum provider concurrency = 1;
- no `OZ_AUTO_DELIVERY_AVAILABLE` is pushed before all provider results are durably stored;
- duplicate assistant turn is ignored;
- recovery of completed+pending state executes only the pending request;
- previous-worker `requesting` state performs zero provider fetch and fails closed;
- insertion commit grants programmatic insertion once; a second grant is blocked;
- inserted acknowledgement is actor-bound;
- non-Microphone completion basis does not complete delivery;
- Microphone completion increments sequence, clears batch/delivery state and returns to `waiting_command`;
- explicit stop clears transient batch/delivery state;
- disabled Send, Stop and Unknown are never clicked;
- active Send can be clicked again only after a fresh later recognition;
- watcher deduplicates for the same delivery;
- built-in Microphone detection and manual fallback both work;
- a 2 MB report is inserted once, with no post-insertion composer-content verification in the batch path.

Static/security checks prove:

- production package surface is exactly the expected 16 files;
- permissions/hosts do not expand from v0.1.7;
- Ozon operation aliases/methods/paths/effects/execution flags are unchanged and every enabled operation remains READ;
- no new Blob/ObjectURL/File/download mechanism was introduced by this release; pre-existing popup export mechanisms are unchanged in count and are not used by batch delivery;
- content/worker batch path creates no Blob/File/download;
- no separate persistent batch store key exists;
- final batch delivery contains no post-insertion composer/report verification or attachment inspection.

## Package/build verification

- production ZIP contains exactly 16 production files and no test/evidence files;
- fresh extraction was the input for the second complete 174-test run;
- every production JavaScript file passes `node --check`;
- `manifest.json` parses successfully;
- Chromium 144 `--pack-extension` exits 0 on the exact production tree;
- deterministic second ZIP rebuild is byte-identical to the release ZIP;
- release ZIP SHA-256: `79b750b2d16b0f765af674181ea41894681aa778db27e11fb87760960912a5fa`.

Production file SHA-256 values:

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

## Patch identity

v0.1.7 → v0.1.8 decoded patch SHA-256:

`5bfce3cd0d6ecf440f218ce5b90b23b610a7d5541260bb33f321e4003983d3b2`

Deterministic gzip patch SHA-256:

`97f91543070e30f86d7e67bb67460305a1d5f85a80414bdcdc419830f84534e7`

Stored base64 evidence SHA-256:

`628d49bceabdb658f607f3cef1243a5044205e8d42d29643146bf551c1de250c`

The patch was applied with `patch -p1` to a copy of the exact v0.1.7 production tree and the result compared byte-for-byte with the accepted v0.1.8 production tree.

## Scope limitation

This release has deterministic source, isolated architecture emulation, production-source VM/integration tests, compatible regression, fresh-package acceptance and Chromium packaging evidence.

The Chrome Extension Lab connector failed before browser work and local headless Chromium did not expose an MV3 service-worker target through CDP. No logged-in live ChatGPT field continuation with v0.1.8 was therefore performed in this session. This release does not claim that field acceptance.
