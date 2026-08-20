# Ozon Bridge v0.1.19 — composer-wait final regression freeze

Date: 2026-08-20
Status: `REGRESSION_PASS_CANDIDATE_FROZEN_FOR_ONE_FINAL_CODEX_RUN`

## Tested repository commit

The ordinary targeted regression was executed by GitHub Actions against exact repository commit:

`bb65fc18b2c8ae6dbfb99e536c29b35717ee66de`

Published regression evidence:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_COMPOSER_WAIT_REGRESSION_LAST_RUN.txt`

Result:

`OZON_COMPOSER_WAIT_REGRESSION_PASS`

## Frozen production candidate

Starting frozen ZIP SHA-256:

`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Composer-wait repair patch:

- bytes: `13648`
- SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Final production identities:

- `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- version: `0.1.19`
- production inventory: `17` regular files
- production delta versus starting ZIP: exactly `service_worker.js` and `content_script.js`

No production bytes were modified by the regression infrastructure commits.

## Regression scope that passed

The one-command targeted regression proved the changed path and direct dependencies, including:

- Manual OFF -> ON returns ready state while preserving quota timing;
- only cancellable pending pre-insert Manual delivery is removed;
- provider quota state and verified cache are preserved;
- unrelated Manual and Autorun owners remain unchanged;
- toggle/cancellation causes zero provider requests;
- late insert commit is blocked after Manual OFF;
- occupied composer enters durable wait without changing operator draft;
- clearing composer inserts the report exactly once;
- restart restores waiting without duplicate insertion;
- Manual OFF stops the waiter and prevents cancelled report resurrection;
- temporarily missing composer enters the same recoverable wait;
- changed worker/content JavaScript syntax passes;
- frozen ZIP, patch, starting hashes and final hashes match authority.

## Freeze rule

From this point until the independent final Codex result is reviewed:

- production candidate bytes above are frozen;
- no production edit is permitted;
- any production edit invalidates this freeze and requires a new ordinary regression pass;
- no additional partial Codex validation run is authorized;
- the next Codex execution is intended to be one consolidated final pre-operator run and one report only.

Packaging remains forbidden until that final report is reviewed as PASS.
