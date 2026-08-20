# Ozon Bridge v0.1.19 — manual composer-wait repair byte manifest

Date: 2026-08-18
Status: `TARGETED_ENGINEERING_BYTES_PINNED`

Repository: `MaksimUnimax/blood_sand`

Development branch:
`dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Starting authority

Published frozen repair artifact:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

Artifact publication commit:
`5245551cb4ff01e388146397b1a0075c0e0f013b`

Artifact SHA-256:
`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Frozen production hashes before this repair:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

The full v0.1.19 logged-in live suite remains pending. Nothing in this document changes that status.

## Production repair patch

The repair is represented by exactly two UTF-8 patch parts in lexical order:

1. `patch-parts/00.patch.part`
   - bytes: `6957`
   - SHA-256: `ef09ba13d67a9d04fc7be8ac1fc18e67b37812afb78597b8abd6cdc5336b839c`
   - Git blob SHA: `4b4578995156cafd60221f8d57f678b99b0b00ff`
2. `patch-parts/01.patch.part`
   - bytes: `6691`
   - SHA-256: `65e2de64e97859599aeab9fb42e89e614e8bb22cb95feb43af05b3b1f9917b03`
   - Git blob SHA: `98feec99e459332df60aae879fa8f2530856c2d0`

Reconstruct exactly:

```bash
cat patch-parts/00.patch.part patch-parts/01.patch.part > MANUAL_DELIVERY_COMPOSER_WAIT.patch
```

Expected complete patch:

- bytes: `13648`
- SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Authorized production delta represented by this patch is exactly:

- `content_script.js`
- `service_worker.js`

No popup, contract, provider, credentials, transport, runtime-names, manifest, AI-adapter, composer-send or other production file is included in the repair patch.

## Targeted executable regression harness

The canonical GitHub test bytes are the concatenation of these four files exactly as stored in GitHub. They intentionally define the authority; do not substitute a local pre-upload copy.

1. `targeted-test-parts/00.mjs.part`
   - bytes: `7975`
   - SHA-256: `31d76f7b370395860d911b4fa0717168c1cf803c7160d5798796e0f80959403e`
   - Git blob SHA: `ced9b470a6d4dd143303144b3db76888924358c2`
2. `targeted-test-parts/01.mjs.part`
   - bytes: `7907`
   - SHA-256: `244479f2ee3556dcbf2e993cd63155114cc874224dc2f16f4a861d618bc1c9b5`
   - Git blob SHA: `401fbe78bbe921affa3adb6f1ddf0cf973a899e2`
3. `targeted-test-parts/02.mjs.part`
   - bytes: `4234`
   - SHA-256: `8d44fc9bb0ac49d7341a11159ba20d07fcd7ffa0f2ab30c7a604636f27cfc570`
   - Git blob SHA: `10638ac5c70d07af7f68e51259113e8be63289f4`
4. `targeted-test-parts/03.mjs.part`
   - bytes: `1826`
   - SHA-256: `68f34f7d43955d33649547b34bb773dc9424923b1fc5519ab77092c368cd530a`
   - Git blob SHA: `42a8e9ee07138eadf62cad80fa584fa532cfc65f`

Reconstruct exactly:

```bash
cat targeted-test-parts/00.mjs.part targeted-test-parts/01.mjs.part targeted-test-parts/02.mjs.part targeted-test-parts/03.mjs.part > TARGETED_COMPOSER_WAIT_REGRESSION.mjs
```

Expected canonical harness:

- bytes: `21942`
- SHA-256: `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`

Run:

```bash
node --check TARGETED_COMPOSER_WAIT_REGRESSION.mjs
node TARGETED_COMPOSER_WAIT_REGRESSION.mjs <candidate-production-dir>
```

## Required targeted terminal markers

A passing repaired candidate must emit all of:

- `TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS`
- `TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS`
- `TARGETED_QUOTA_CACHE_PRESERVED_PASS`
- `TARGETED_OTHER_OWNER_PRESERVED_PASS`
- `TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS`
- `TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS`
- `TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS`
- `TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS`
- `TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS`
- `TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS`
- `TARGETED_MANUAL_COMPOSER_WAIT_HELPER_PRESENT_PASS`
- `TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`

## Exact frozen-content compatibility evidence

Step 1 through Step 4 kept `content_script.js` byte-identical to the operator baseline. The accepted V3 quota/countdown repair is therefore the only later content-script delta before this repair.

Reconstructing that accepted V3 content delta produced exactly:

`d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

which matches the published frozen repair content hash.

The repair patch passed `git apply --check` against that exact frozen content with no fuzz/manual repair. After applying the repair, the expected `content_script.js` SHA-256 is:

`ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

`node --check` passed on that repaired exact frozen content.

## Worker compatibility boundary

Step 1/Step 2/Step 3/Step 4/V3 evidence and raw patch hunks were reviewed for overlap with the three worker areas changed by this repair:

- pre-insert Manual cancellation helper adjacent to Manual-operation persistence;
- `setManualMode`;
- `commitManualBatchDeliveryInsert`.

The later provider/planner/quota/cache work changes other worker regions. The V3 repair changes quota functions/public quota state, not these Manual delivery functions. A V3-shaped worker context with the accepted public-quota insertion and large line displacement passed `git apply --check` for this repair without manual editing, and the targeted harness passed after application.

This is targeted compatibility evidence for the composer-wait repair.

## Test-stage boundary

This manifest is for development/repair targeted testing and milestone validation. It may be used whenever the composer-wait stage is changed or independently revalidated.
