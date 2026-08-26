# Patch B5 — Finance / Realization contract research result

Date: 2026-08-26
Result: `PATCH_B5_FINANCE_REALIZATION_READ_CORE_CONTRACTS_CONFIRMED`

Exact operator Swagger `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40` closes the request contracts for the five B5 pure-read operations.

Key decisions:

- the three current accrual methods replace dependence on retired `/v3/finance/transaction/list` and `/totals`;
- `/v1/finance/accrual/types` is a no-body POST;
- `/v1/finance/accrual/by-day` requires caller-controlled `date` + `last_id`; no automatic continuation;
- `report_list` and `report_info` read only already-created report metadata; response `file` links are redacted and never fetched;
- `/v1/report/realization/posting/create` is outside B5;
- `/v1/finance/realization/posting` is deferred because its Kazakhstan contract restriction cannot be truthfully evaluated by the current subscription entitlement model;
- no missing quota, eligibility, pagination or report lifecycle is guessed.

Production implementation is permitted only for the five enabled reads in the B5 closure.
