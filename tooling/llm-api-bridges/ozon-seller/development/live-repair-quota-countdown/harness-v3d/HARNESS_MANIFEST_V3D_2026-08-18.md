# V3D harness manifest

Date: 2026-08-18
Scope: test-only corrections for V3C fixture race and Puppeteer module location. No production changes.

## Production authority

- exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- repaired worker SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- repaired content SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

## V3C source harness authority

Worker source harness:

- path: `development/live-repair-quota-countdown/harness/V3_WORKER_ACTUAL_PATH_HARNESS.mjs`
- Git blob: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- raw bytes: `14382`
- SHA-256: `92818e7348212f13a06a806ebb5e86776a877171d8344964ffc1dfbd66355d78`

Browser source harness:

- path: `development/live-repair-quota-countdown/harness/V3_BROWSER_COUNTDOWN_HARNESS.mjs`
- Git blob: `841429741d5ff9144a8a40506e657dc4392fe37c`
- raw bytes: `12384`
- SHA-256: `05c8ce0d0799b4891b79f73cf1201a2ed187f0527128b35802286280988ea534`

Regression harness remains unchanged from V3C and already passed:

- Git blob: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`
- SHA-256: `10d6f1a9c71ed36054b25f4155806b40fcfa5d04f2cd5ff25ae6d9ac13521ef0`

## V3D runners

### Worker race correction runner

Path:

`development/live-repair-quota-countdown/harness-v3d/V3D_WORKER_RACE_CORRECTION_RUNNER.mjs`

- Git blob: `541b38acd7d4f3a933d1130052562a6340084064`
- raw bytes: `2419`
- SHA-256: `cdfc1ff6a16dc4ca0f1213545a7b1851f756af118c9466cb0f38eccee2af1e6f`
- local `node --check`: PASS before publication.

It verifies the exact V3C worker harness SHA and performs exactly one test-only source replacement:

from:

`const now=Date.now(); const last=now-64800; const due=last+65000;`

to:

`const now=Date.now(); const last=now-57000; const due=last+65000;`

This changes the intended future guarded wait from approximately 200 ms to approximately 8000 ms. No production source is changed. The runner asserts exactly one source line differs.

### Browser module-location runner

Path:

`development/live-repair-quota-countdown/harness-v3d/V3D_BROWSER_MODULE_LOCATION_RUNNER.mjs`

- Git blob: `05ac3864c852aa1a44744bf8f207596476ee6b53`
- raw bytes: `2345`
- SHA-256: `fb6ae0600168970943a4eff59ee62d2c6c165661f3144e231496799f3e73191f`
- local `node --check`: PASS before publication.

It verifies the exact V3C browser harness SHA, verifies an existing Puppeteer/Puppeteer-core package under the supplied QA project root, copies the exact browser harness bytes unchanged into that project root, re-verifies the SHA, and executes there. No harness semantic change and no production source change.

## Safety

- real Ozon requests must remain `0`;
- real Performance requests must remain `0`;
- no real credentials;
- no operator browser profile;
- no V4;
- no V3 patch change;
- no production source mutation.
