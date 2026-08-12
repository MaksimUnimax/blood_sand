# Ozon Bridge v0.1.7 — bounded exactly-once-safe Send retry

Date: 2026-08-12

Release ZIP SHA-256:

`9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`

## Incident addressed

The live collection stopped after Ozon had already returned HTTP 200 and the bridge had staged the `OZON_RESULT_V1`, but before browser-send commit, with the delivery-side condition `DELIVERY_SEND_TARGET_NOT_READY_BEFORE_COMMIT`.

The failure was therefore in the ChatGPT composer/send delivery path, not in Ozon JSON serialization. v0.1.7 does not compact, truncate, rewrite or otherwise alter provider results to work around this incident.

## Design goals

The fix had to satisfy all of the following simultaneously:

- retry transient ChatGPT Send-target readiness failures;
- retry a failed browser click only while there is proof that no click event occurred;
- never grant or perform a second browser Send click once a click event has been observed;
- preserve the worker commit as the irreversible delivery boundary;
- preserve durable delivery reconciliation/recovery;
- never replay the Ozon provider request as a consequence of browser delivery retry;
- fail closed if staged composer text changes, the runtime is superseded, or target validation becomes unsafe.

## Production changes

### `content_script.js`

The old single pre-commit target wait was replaced by bounded validated target reacquisition.

New target retry policy:

- one validated target attempt uses a 5000 ms budget;
- retry delays: `0, 500, 1000, 2000, 4000, 8000` ms;
- every retry resolves the current composer/form/Send target again and validates it against the expected staged text;
- text mutation is terminal rather than retryable;
- runtime supersession is terminal;
- delivery exhaustion is explicit as `DELIVERY_SEND_TARGET_RETRY_EXHAUSTED`;
- autorun-start exhaustion is explicit as `START_SEND_TARGET_RETRY_EXHAUSTED`.

The browser click path was also replaced with bounded exactly-once-safe retry logic.

New click retry policy:

- retry delays: `0, 250, 500, 1000, 2000` ms;
- retryable conditions are limited to target incompleteness/detachment/visibility/disabled/form-mismatch and `BUTTON_CLICK_FAILED` before any click event;
- target is reacquired and revalidated on each retry;
- if `button.click()` returns without a synchronous click event, retry is permitted because no irreversible click evidence exists;
- if a click event is observed, no subsequent `button.click()` call is permitted;
- after an observed click, the code waits for composer settlement and then proceeds through the existing confirmation/reconciliation lifecycle rather than clicking again;
- changed composer text, unexpected errors and exhausted retry budgets are terminal.

The old post-commit loop that could repeatedly invoke `button.click()` until the composer became empty was removed. This aligns the content script with the worker invariant that commit is the irreversible browser-send boundary.

`deliverReport()` and `sendAutoStart()` now follow the same order:

1. stage/stabilize expected composer text;
2. obtain a validated Send target with bounded retry;
3. request worker commit;
4. click only when `click_allowed:true`;
5. after an observed click event, perform settlement/reconciliation only, never a second click.

Manual `auto_send` uses the same safe click retry helper, without introducing an autorun commit side channel.

### `shared/composer_send.js`

`clickSynchronously()` now guarantees click-trace cleanup even if `button.click()` throws.

A thrown browser click becomes `ComposerSendError("BUTTON_CLICK_FAILED", ...)` carrying:

- `method_called:true`;
- method identity;
- pre-click snapshot;
- completed trace;
- `click_event_observed` evidence.

That evidence is the retry safety gate:

- exception before any click event => caller may reacquire and retry;
- exception after a click event => caller must not click again.

### Version surfaces

The following production files changed only to advance the runtime/release version from 0.1.6 to 0.1.7:

- `manifest.json`;
- `popup.html`;
- `popup.js`;
- `service_worker.js`;
- `shared/ozon_contract.js`;
- `shared/runtime_names.js`.

When the version literal is normalized back to 0.1.6, each of those files is otherwise equivalent to the v0.1.6 production file.

No provider-boundary, operation registry, credential, PII, HTTP transport or Ozon request semantics were changed by this release.

## Automated verification

Final source-tree suite: **119/119 PASS**, 0 fail, 0 skipped, 0 cancelled.

The same complete suite was run against a fresh extraction of the final production ZIP: **119/119 PASS**, 0 fail, 0 skipped, 0 cancelled.

New retry-focused tests execute production source and verify at least these cases:

- normal click event and trace cleanup;
- `button.click()` throws before an event => retry-safe evidence and listener cleanup;
- `button.click()` throws after an event => observed-click evidence and no retry;
- expected text changes before click => click blocked;
- pre-commit target unavailable twice then becomes ready;
- target retry budget exhaustion => no commit and no click;
- runtime supersession => abort;
- stale initial target => reacquire then exactly one actual click;
- click method returns without click event => bounded retry;
- observed click event => no further click calls;
- observed click with composer still nonempty after settlement => still no second click;
- missing composer that later reappears;
- composer already empty => zero click calls;
- all explicitly retryable target codes accepted;
- non-retryable text mutation and unexpected errors rejected;
- actual `deliverReport()` ordering target -> commit -> click;
- actual `sendAutoStart()` ordering target -> commit -> click;
- rejected/already-committed worker commit => zero browser click;
- Manual auto-send reuse of safe retry helper.

The retained regression suite also verifies provider constraints, Manual/Autorun pre-execution error observability, durable delivery recovery, conversation/binding security, PII behavior, fixed host/auth isolation, and exactly one Ozon provider fetch for a valid single command.

## Changed-line audit

`content_script.js`:

- 104 changed/new production lines;
- **104/104** mapped to exact-source runtime/integration/version tests.

`shared/composer_send.js`:

- 15 changed/new production lines;
- **15/15** mapped to full-module production-source tests.

Version-only files:

- `manifest.json`: 1/1 changed line mapped;
- `popup.html`: 1/1;
- `popup.js`: 2/2;
- `service_worker.js`: 1/1;
- `shared/ozon_contract.js`: 1/1;
- `shared/runtime_names.js`: 2/2.

All other production files are byte-identical to v0.1.6.

The audit deliberately does not claim fabricated 100% V8 line coverage for VM-extracted `content_script.js` slices. Instead, every changed production line is mapped to an exact production-source runtime/integration test or a version-only equivalence assertion. `shared/composer_send.js` is executed as the full production module.

## Package/build verification

- production ZIP contains exactly 16 production files and no tests/evidence;
- fresh extraction matches the tested source tree 16/16 byte-for-byte;
- every production JavaScript file passes `node --check`;
- Chromium headless `--pack-extension` check exits 0;
- deterministic rebuild is byte-identical to the release ZIP;
- release ZIP SHA-256: `9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`.

Production file SHA-256 values:

- `content_script.js` `5f6739c9dc5de45f33d4be0aeb4688d8d9a6ac68c2fa068ed1d3a41f0750febf`
- `manifest.json` `889b5684a21fa1164db91f3b06e29d3a82ccfc469ea1ae6b6640d59812157bdb`
- `popup.css` `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html` `0b99e02c765ac718f8826e937032dc0b66823737c52236eb36dc97c00e893250`
- `popup.js` `f5f8546e65e5c2df070d308788d7cf173801fec021f51ff1311a05da56871409`
- `service_worker.js` `61480645f60100ba7b93e260c113150c89374e143e0da507708ee3e8bc0aacc7`
- `shared/bridge_autorun_model.js` `dff5265640ec4b848b4dee6019261c7b230d015eeac6f12fd85b9b7c2e93c22c`
- `shared/composer_send.js` `96d687cbd18c2d550b93618a3a587711184ec72b2c92498ac16a171eda7894a2`
- `shared/conversation_identity.js` `e56a9f352c4668f47a0f72c2044a943a88457024c4400fa878a974551518114a`
- `shared/manual_controls.js` `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_contract.js` `cb5e06283dfab6ee0efe61cd7f627d971108ffbe7d1435cb4b2dc48fca54b282`
- `shared/ozon_credentials.js` `5112b7d69491c8c61fb108fcb60878bfaa3724c92ceddb95fef6e584958ba330`
- `shared/ozon_provider.js` `73f0303a8215909c0159eed774f610713e604ca7c66144f34af12e36b56a6173`
- `shared/proven_writing_block_capture.js` `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef`
- `shared/provider_transport_core.js` `6343276c7f0055e224b99912cc7bdc85a4eaf7d149471c182ce0c758ff8f2db9`
- `shared/runtime_names.js` `eed121d7c21a9d84bfa03d501520ebd970a9bbf584dd437509c8050eed223edc`

## Scope limitation

This release has deterministic source, unit/integration, fresh-package and Chromium packaging evidence. It has not yet been proven by a logged-in live ChatGPT browser run after installation of v0.1.7. Live acceptance therefore requires installing the ZIP and reproducing the previously failing delivery sequence without a second browser click or provider replay.
