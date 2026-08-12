# Ozon Bridge v0.1.7 — reproducible verification evidence

Date: 2026-08-12

## Release identity

Expected release ZIP:

`ozon-bridge-v0.1.7-extension.zip`

Expected SHA-256:

`9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`

Expected production file count: **16**.

## Reproduction basis

v0.1.7 is the v0.1.6 production extension plus the reviewed v0.1.6 -> v0.1.7 patch contained in this reference directory.

Patch files:

- `OZON_BRIDGE_V0.1.7_PATCH.diff.gz.b64`
- decoded patch SHA-256: `2f3db9c11c6549da71e20c7f045a99cebb9c48977e523a5859258ebae73631f3`
- encoded gzip/base64 evidence SHA-256: `67df682414a83ce45453e9c4745e00474ae597548cda52a0f587e0f822d7bd10`

The patch changes only:

- `content_script.js`;
- `manifest.json`;
- `popup.html`;
- `popup.js`;
- `service_worker.js`;
- `shared/composer_send.js`;
- `shared/ozon_contract.js`;
- `shared/runtime_names.js`.

Of those, only `content_script.js` and `shared/composer_send.js` contain behavior changes; the remaining six paths are version-only changes.

## Verification commands used

Production JavaScript syntax was checked with `node --check` for every `.js` file in the release tree.

The full Node test suite was executed once against the source production tree and once after extracting the final ZIP into a fresh directory.

Both runs completed:

- tests: 119;
- pass: 119;
- fail: 0;
- cancelled: 0;
- skipped: 0.

Changed-line audit result:

- `content_script.js`: 104/104 mapped;
- `shared/composer_send.js`: 15/15 mapped;
- every version-only changed line mapped to exact equivalence/package/version tests;
- unchanged production files byte-identical to v0.1.6.

Fresh package validation:

- 16/16 production files byte-identical to the tested source tree;
- no test/evidence files inside release ZIP;
- all production JS syntax checks pass;
- Chromium headless extension-pack command exits 0.

Determinism validation:

- a second release ZIP was built independently from the same final production tree;
- the second ZIP is byte-identical to the first;
- both SHA-256 values are `9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`.

## Safety properties specifically reproduced

The test suite proves the retry is bounded and does not become an uncontrolled click loop:

- target retries stop after the configured finite budget;
- click retries stop after the configured finite budget;
- changed staged text fails closed;
- superseded runtime fails closed;
- worker commit remains before browser click;
- rejected or already-used commit permission yields zero click;
- `button.click()` failure is retryable only when no click event was observed;
- once a click event is observed, the implementation never performs another `button.click()` for that send attempt;
- provider requests are not replayed by browser delivery retry/recovery.

## Limitation

Chromium packing validates extension package integrity, not authenticated ChatGPT UI behavior. A live installed-browser run is still required for final field acceptance of the original `DELIVERY_SEND_TARGET_NOT_READY_BEFORE_COMMIT` incident.
