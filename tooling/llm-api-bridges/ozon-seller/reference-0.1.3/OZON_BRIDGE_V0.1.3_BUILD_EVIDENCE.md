# Ozon Bridge v0.1.3 — build/test evidence

Build date: 2026-08-11
Candidate: v0.1.3

## Change under test

Status cards in `content_script.js` now include a manually clickable close button:

- text: `×`
- aria-label/title: `Закрыть`
- removes the concrete status item;
- removes the keyed map entry when applicable;
- does not mutate autorun/request state.

## Source test run

Final:

- tests: 228
- pass: 228
- fail: 0

The first post-change run intentionally was not accepted as final because two test assertions still expected version 0.1.2. Those assertions were corrected to 0.1.3 and the full suite was rerun cleanly.

## Coverage

Final aggregate:

- lines: 99.28%
- branches: 92.83%
- functions: 94.66%

## Production byte integrity

The production extension contains exactly 16 files.

Source → extension tree → unpacked final ZIP comparison:

- 16/16 byte-exact
- all exact: true

## Final ZIP regression

Procedure:

1. build production-only extension directory;
2. zip it;
3. unpack into a new directory;
4. verify production bytes against source;
5. inject only the existing test harness into the temporary test copy;
6. run the complete Ozon suite against unpacked ZIP production files.

Result:

- 228/228 PASS
- 0 FAIL

## Syntax

All production `.js` files from the unpacked final ZIP passed `node --check`.

## Wordstat regression

Canonical `wordstat-bridge-v1.1.5-full-function-environment-audit` was freshly unpacked and tested.

Result:

- 283/283 PASS
- 0 FAIL

## Chromium packaging

`/usr/bin/chromium --headless=new --no-sandbox --disable-gpu --pack-extension=...`

Result:

- exit 0

Temporary CRX/PEM were deleted after validation.

## Final artifact

File: `ozon-bridge-v0.1.3-extension.zip`

- size: 79343 bytes
- SHA-256: `fe535cbe1f34d7a1e7684346ca7cad0a71c3ff6ac1018854cde03dd26fe6c5a9`

No credentials, tests, evidence or private key are included in the distributed production ZIP.

## Acceptance boundary

Automated tests prove the close-button behavior in the emulator and exact production ZIP regression. A user-side Chrome smoke test is still required to visually confirm placement/hit target in the real ChatGPT UI.
