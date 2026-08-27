# Patch B12 — Finance Transactions Sunset Closure

B12 is intentionally validation-only.

The exact Seller Swagger states that `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` will be disabled on 8 September 2026 and points to the already accepted `/v1/finance/accrual/*` replacements.

B12 therefore does **not** add the legacy transaction routes. It verifies:

- neither legacy v3 transaction route is enabled in the bridge;
- `finance_accrual_postings`, `finance_accrual_types`, and `finance_accrual_by_day` remain enabled current fixed reads;
- one command remains one physical request;
- no automatic continuation/pagination/retry/fanout/chaining is introduced;
- production bytes are exactly the accepted B11 bytes.

Production delta: **0 files / 0 bytes**.
