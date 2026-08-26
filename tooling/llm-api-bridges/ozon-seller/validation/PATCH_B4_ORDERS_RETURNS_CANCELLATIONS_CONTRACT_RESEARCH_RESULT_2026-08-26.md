# Patch B4 — Orders / Returns / Cancellations contract research result

Date: 2026-08-26
Result: `PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_CONTRACTS_CONFIRMED`

Exact operator Swagger `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40` closes the pure-read contracts required for B4.

Key decisions:
- current FBS list versions are `/v4/posting/fbs/list` and `/v4/posting/fbs/unfulfilled/list`;
- existing `/v3/posting/fbo/list` and `/v3/posting/fbs/get` aliases are retained and revalidated rather than duplicated;
- `/v1/cancel-reason/list` is a POST with no body;
- FBS list/unfulfilled and rFBS returns expose personal-data fields and remain default-OFF gated;
- `/v2/report/returns/create` is explicitly excluded from B4 because hidden report creation/polling would violate `single_read`;
- official Swagger/compiler gives ordinary `ALL_ACCOUNTS` entitlement for every enabled B4 endpoint;
- no missing field, enum, pagination rule, subscription or report lifecycle is guessed.

Production implementation is permitted only within the B4 closure document and accepted runtime protections.
