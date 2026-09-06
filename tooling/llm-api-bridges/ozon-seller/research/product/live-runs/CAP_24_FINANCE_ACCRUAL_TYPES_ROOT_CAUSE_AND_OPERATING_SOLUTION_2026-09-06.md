# CAP-24 — finance_accrual_types 429 root cause and operating solution (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime observed: `ozon-llm-api-bridge v0.1.19`
- Provider method: `POST /v1/finance/accrual/types`
- Status: `ROOT_CAUSE_CLASS_ESTABLISHED__OPERATING_SOLUTION_ESTABLISHED__NO_EXECUTABLE_PATCH_AUTHORIZED`

## Executive conclusion

The CAP-24 `finance_accrual_types` 429 is not a general Seller API outage, not an entitlement failure, not a shared hard block of the new finance-accrual family, and not a Bridge-generated error.

The evidence converges on Ozon's **method-specific protection state for the beta reference endpoint `/v1/finance/accrual/types`**, triggered/maintained by repeated identical access to the same method. The most specific evidence-supported classification is:

`METHOD_SPECIFIC_ANTI_REPEAT_CIRCUIT_OR_DYNAMIC_METHOD_QUOTA__FINANCE_ACCRUAL_TYPES`

This is consistent with Ozon's current method-workflow rules:

- Ozon warns that many identical or erroneous requests may cause Seller API access to be restricted without warning;
- the common error `Circle is open` is documented as a method block caused by a large number of requests, recovering after several minutes;
- the common rate-limit description states that, in addition to the general Client-ID limit, restrictions of individual methods are also taken into account;
- `/v1/finance/accrual/types` is currently in the `BetaMethod` section, and beta methods are documented as potentially unstable.

The exact internal numeric threshold/window is not published in the current method card and must not be invented.

## Live evidence chain

### 1. `/types` can work

Run 02:

- operation: `finance_accrual_types`
- request_id: `6ceb04e1-5721-4d61-9f54-021c3c9f062d`
- fingerprint: `405f0634`
- HTTP `200`
- returned a dictionary of 124 accrual types.

Therefore the method is not permanently forbidden or missing for this seller/account.

### 2. The exact same method/fingerprint later receives provider 429

Runs 03, 04 and 07:

- same operation: `finance_accrual_types`
- same command fingerprint: `405f0634`
- exactly one physical provider request per explicit command;
- provider HTTP `429`;
- provider code `8`;
- `Retry-After: 1`;
- no automatic retry;
- entitlement remained `SUPPORTED_AND_ENTITLED`;
- command was not transformed.

The standard gRPC status code `8` is `RESOURCE_EXHAUSTED`, which is consistent with quota/resource protection. This supports the rate-limit/circuit interpretation but is not used to invent a numeric threshold.

### 3. Provider-wide Client-ID hard block is rejected

Run 05 executed a different Seller API surface while `/types` was in the failing state:

- `POST /v3/product/list`
- HTTP `200`
- one physical request.

Therefore the observed failure is not a hard block affecting all Seller API methods for the Client ID.

### 4. Shared hard block of all `/v1/finance/accrual/*` methods is rejected

Run 06 executed a neighboring method in the same new finance-accrual family:

- `POST /v1/finance/accrual/by-day`
- HTTP `200`
- one physical request.

Run 07 then immediately executed `/v1/finance/accrual/types` and received HTTP `429` again.

Therefore `/by-day` remained operational while `/types` was rejected. A hard quota/block shared by the entire finance-accrual family is not the primary explanation.

### 5. A simple one-second cooldown is not the full rule

The observed 429 responses contain `Retry-After: 1`, but a later `/types` request after a much longer operator quiet interval also returned 429. Ozon's general documentation separately describes a method-level `Circle is open` condition that can last **several minutes**. Therefore `Retry-After: 1` must not be treated as proof of a universal one-second `/types` quota or as the complete circuit-reset rule.

## External authority / currentness evidence

### Current `/types` method card

A current parse of Ozon Seller API documentation identifies:

- `POST /v1/finance/accrual/types`
- `operationId: GetFinanceAccrualTypes`
- tag: `BetaMethod`
- purpose: reference dictionary of accrual types.

Source:
https://github.com/Slimpers/Ozon-API-parser-MD/blob/main/md/seller/operations/BetaMethod/POST%20v1-finance-accrual-types.md

### Ozon method-workflow rules and common errors

A current documentation mirror records the Ozon workflow rules:

- many identical or erroneous requests may lead to Seller API restriction without warning;
- general limit: 50 requests/second per Client ID;
- `Circle is open`: many requests cause the system to block the **method**, which resumes after several minutes;
- `You have reached request rate limit per second`: the general Client-ID limit applies, and individual-method restrictions are also taken into account;
- beta methods may work unstably.

Source:
https://github.com/etozhearut/ozon-seller-api/blob/main/docs/00-overview.md

Official Ozon Seller API notification channel separately confirms:

- 2025-05-22: general limit increased to 50 requests/second per Client ID;
- 2025-06-05: common error `You have reached request rate limit per second` added for all methods;
- 2026-07-14: sellers instructed to migrate from `/v3/finance/transaction/list|totals` to `/v1/finance/accrual/postings`, `/types`, `/by-day` by 2026-09-08.

Sources:
https://t.me/s/OzonSellerAPI
https://t.me/s/OzonSellerAPI?before=501
https://t.me/s/OzonSellerAPI?before=678

No current official numeric quota specifically for `/v1/finance/accrual/types` was found in the checked method card or Ozon notifications.

## Why repeated `/types` calls are the wrong operating pattern

`/v1/finance/accrual/types` does not contain transaction facts. It is a **reference dictionary** used to interpret `type_id` values returned by operational finance methods.

The actual changing finance facts are obtained from:

- `/v1/finance/accrual/by-day`;
- `/v1/finance/accrual/postings`.

A current open-source Ozon finance integration uses exactly this separation: `accrual_types()` is cached and reused, while `/by-day` is the workhorse for regular finance data acquisition.

Source:
https://github.com/Alzork/ozon-analytics/blob/main/finance_accrual.py

This third-party implementation is not Ozon authority, but it independently demonstrates the correct data-access shape: fetch the reference dictionary once, then reuse it rather than re-requesting `/types` for every finance read.

## Root-cause statement

The best-supported causal statement for CAP-24 is:

> Repeated identical requests to Ozon's beta reference method `POST /v1/finance/accrual/types` entered a method-specific resource-protection state (anti-repeat circuit and/or dynamic method quota). Ozon continued to serve unrelated Seller API methods and the sibling finance-accrual `/by-day` method, while rejecting `/types` with HTTP 429 / provider code 8. The exact internal threshold and reset algorithm are not published.

This is materially different from the earlier, incorrect diagnosis that Bridge's lack of a local finance `next_allowed_at` caused the incident.

## Explicit correction: no Bridge rate-limit handling defect is proven here

The earlier claim that Bridge must refuse later explicit `/types` commands because it saw `Retry-After` is withdrawn.

Bridge cannot obtain current provider data without making a provider request. In every supplied run it preserved the intended invariant:

- one explicit command;
- at most one physical provider request;
- no hidden retry;
- provider 429 surfaced to the caller.

A locally invented static `1s`, `60s`, or other `/types` interval would be unsupported and could block a legitimate explicit request without knowing whether Ozon had actually recovered.

Therefore:

`NO_BRIDGE_RATE_LIMIT_CONTROL_DEFECT_PROVEN_FOR_THIS_INCIDENT`

## Separate observability limitation

There is one distinct diagnostic limitation that affects how precisely the provider's own label can be recovered.

Current Bridge transport receives the raw provider body, but the model-visible provider error intentionally replaces the raw provider message with:

`Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.`

The current service-worker diagnostics are payload-free and preserve status/operation/request metadata rather than the raw provider `message`. Therefore the historical 429 results do not allow us to distinguish with literal-message certainty between Ozon returning `Circle is open` and another method-specific `RESOURCE_EXHAUSTED` quota message.

This does **not** cause the 429 and does **not** require blocking requests. It is an observability limitation only.

No executable observability patch is authorized in this record.

## Operating solution — root-cause aligned

The solution is not to stop using Ozon. The solution is to stop using the reference dictionary as if it were transactional data.

### Reference dictionary policy

1. Obtain `/v1/finance/accrual/types` only when the dictionary is actually needed.
2. Persist the successful dictionary locally together with:
   - provider source path;
   - fetch timestamp;
   - request_id;
   - command fingerprint;
   - dictionary contents / known type IDs.
3. Use the persisted dictionary to interpret `type_id` values from `/by-day` and `/postings`.
4. Do not refresh `/types` for every day, page, posting or business question.
5. Refresh the dictionary only on an evidence-based trigger, for example:
   - a `type_id` appears that is absent from the stored dictionary;
   - the user explicitly requests a taxonomy refresh;
   - a later Ozon contract update proves the taxonomy changed and a refresh is required.
6. If that explicit refresh receives 429:
   - do not loop or hidden-retry;
   - keep using the last provider-derived dictionary for already known IDs;
   - mark unknown IDs as `TYPE_DICTIONARY_REFRESH_PENDING` rather than inventing a label;
   - retry only as a later explicit command after provider recovery.
7. Do not invent a fixed TTL or fixed request interval unless Ozon publishes one.

### Transaction-data policy

Use `/v1/finance/accrual/by-day` and `/v1/finance/accrual/postings` for changing finance facts. These are the data sources needed for CAP-24 unit economics.

Run 06 already proves `/by-day` supplies target-SKU-attributable:

- sale commission;
- delivery/logistics service amounts;
- acquiring/item fees;
- posting/SKU attribution.

Account-level `NON_ITEM` charges remain separate unless a defensible SKU attribution key exists.

## CAP-24 immediate consequence

The `/types` 429 no longer blocks the CAP-24 business job:

- a successful 124-row type dictionary has already been captured from Ozon in Run 02;
- the target-SKU type IDs already observed in Run 06 are present in that provider-derived dictionary;
- `/by-day` is operational and carries the actual changing finance facts.

Therefore the next CAP-24 finance work should consume the preserved dictionary and continue explicit `/by-day` / `/postings` evidence acquisition for August 2026. It should **not** call `/types` again unless an unknown type ID or an explicit refresh requirement appears.

## Final state

Provider root-cause class:

`METHOD_SPECIFIC_ANTI_REPEAT_CIRCUIT_OR_DYNAMIC_METHOD_QUOTA__FINANCE_ACCRUAL_TYPES`

Operational resolution:

`REFERENCE_DICTIONARY_FETCH_ONCE_AND_REUSE__TRANSACTION_DATA_FROM_BY_DAY_OR_POSTINGS__REFRESH_ONLY_ON_EVIDENCE_TRIGGER`

Bridge incident classification:

`NO_BRIDGE_RATE_LIMIT_CONTROL_DEFECT_PROVEN`

Remaining diagnostic uncertainty:

`EXACT_PROVIDER_MESSAGE_NOT_PRESERVED__NUMERIC_METHOD_QUOTA_NOT_PUBLISHED`

No executable Bridge patch was made or authorized by this record.
