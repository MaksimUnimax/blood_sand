# DEFECT-015 — finance products buyout contract sweep — 2026-09-04

Authority:
- source commit `249029b0ba8d9e6f9e26182bf678adf42868c6d6`
- Bridge `v0.1.19`
- operation `finance_products_buyout`
- endpoint `POST /v1/finance/products/buyout`

## Provider contract

Current Ozon Seller OpenAPI:

- request requires `date_from` and `date_to`;
- request example uses calendar dates `YYYY-MM-DD`;
- `date_to` description explicitly states: **maximum period — 31 days**.

## Bridge authority

Current normalizer:

```text
normalizeFinanceProductsBuyoutParams(params)
  -> requireString(date_from)
  -> requireString(date_to)
```

No exact date syntax, real-calendar validation, ordering, or period-length validation is performed.

Registry template:

```json
{"date_from":"2026-08-01","date_to":"2026-08-28"}
```

The current template is inside the provider's 31-day limit and uses the correct lexical shape, so it is not classified as an invalid template from this evidence.

## Verdict

- **MISSING_GUARD — exact/representable `YYYY-MM-DD` date validation**;
- **MISSING_GUARD — interval ordering (`date_from <= date_to`)**;
- **MISSING_GUARD — maximum 31-day period**.

The operation currently allows provider-invalid inputs to pass local preflight and consume a real provider request.

## Required repair when authorized

1. Reuse a strict real-calendar YMD helper rather than `requireString`.
2. Reject reversed intervals locally.
3. Enforce provider maximum period 31 days.
4. Add deterministic positive/boundary/negative tests.
5. Audit guidance, registry examples, source/dist/generated copies, and any template-runnable certification.

Required controls:

- valid <=31-day range -> local pass;
- malformed YMD -> local reject / physical requests 0;
- impossible date -> local reject / physical requests 0;
- reversed range -> local reject / physical requests 0;
- >31-day range -> local reject / physical requests 0;
- exact documented boundary -> deterministic pass test.

STD-06 remains **FROZEN ON LIVE FAIL**. No executable code changes or new Ozon requests are authorized by this evidence file.
