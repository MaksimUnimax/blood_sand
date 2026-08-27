# Patch B12 Finance Transactions Sunset — ACCEPTED

Date: 2026-08-27
Status: `PATCH_B12_FINANCE_TRANSACTIONS_SUNSET_ACCEPTED`

## Acceptance authority

- Exact candidate: `78d953ff5483e7483c3e9cb7dea7cc8d28b34b8d`
- Independent validation commit: `6093eac5b1090af5fe1fe3363e1cd5510db70e1b`
- Accepted B11 authority: `8c753d102572f2f46aa0b0d9ab200c74aca7d78a`
- Production file count: `21`
- Production tree before/after B12: `6362eba1469f9e3fdd3a34a27e33ea6db5d3dce82d851955cbdc06b6104b0caa`
- Direct production changes: `0`

## Accepted closure

B12 is intentionally a zero-production-delta closure. The legacy Seller Finance routes `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` are not enabled. Exact Seller Swagger evidence records their shutdown on 2026-09-08 and points to the already accepted replacement reads:

- `finance_accrual_postings` -> `POST /v1/finance/accrual/postings`
- `finance_accrual_types` -> `POST /v1/finance/accrual/types`
- `finance_accrual_by_day` -> `POST /v1/finance/accrual/by-day`

No automatic pagination, retry, fanout, provider chaining or mutation is introduced.

## Validation

GitHub Actions run `33030664983` passed on Linux and Windows. Artifact `9630092616` has GitHub digest `sha256:9c49134e535c1f104e283bb2b5bd7285a47d20eeeb47cc05c5ced1ce955e560e` and materializes the same 21-file production tree.

Independent validation commit `6093eac5b1090af5fe1fe3363e1cd5510db70e1b` is exactly one commit ahead of the candidate and changes only `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B12_FINANCE_TRANSACTIONS_SUNSET_INDEPENDENT_TEST_RESULT_2026-08-27.md`.

Independent result: `PATCH_B12_FINANCE_TRANSACTIONS_SUNSET_INDEPENDENT_TEST_PASS`.

Safety accounting: Seller business requests `0`; Performance business requests `0`; credentials used `0`; tester production modifications `0`.

## Gate

B12 Finance Transactions Sunset is accepted. Subsequent work continues from this authority without changing Autorun, Work-session lifecycle, Manual-mode behavior, provider transport, credentials or unrelated runtime semantics unless separately reviewed and gated.
