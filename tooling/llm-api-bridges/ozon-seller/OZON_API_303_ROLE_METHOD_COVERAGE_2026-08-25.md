# Ozon Seller API — 303 live-role account snapshot

Date: 2026-08-25  
Status: **current-account/key evidence; not global implementation authority**  
Branch: `docs/ozon-api-complete-coverage-2026-08-25`  
Source: live `POST /v1/roles` response for the configured Seller API credentials  
Bridge baseline used for comparison: `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`

## 1. What this file proves

The captured key returned **303 exact method/path grants** at the time of the live request.

The machine snapshot remains:

`OZON_API_303_ROLE_METHOD_CLASSIFICATION_2026-08-25.json`

This snapshot is useful for:

- proving what this key exposed at capture time;
- comparing current Bridge coverage against one real account;
- testing role refresh/capability presentation;
- detecting later account/key access changes.

It does **not** define the complete Ozon Seller API and does **not** define the complete Bridge read target.

The global implementation authority is now:

`OZON_BRIDGE_FULL_READ_DYNAMIC_ENTITLEMENTS_AND_CLUSTERS_SPEC_2026-08-25.md`

and:

`OZON_BRIDGE_TARGET_READ_SURFACE_2026-08-25.json` (`V2`).

## 2. Why 303 cannot be the global target

The current Ozon Seller Swagger snapshot contains **463 paths / 463 operations**.

`/v1/roles` answers which methods are granted to **this key now**. A different seller subscription, account type, role configuration or later Ozon policy can change that result.

Therefore:

```text
current Swagger/OpenAPI -> global implementation inventory
/v1/roles              -> current key capability snapshot
/v1/seller/info        -> current seller subscription snapshot
```

Using the 303 list as the implementation universe would incorrectly omit methods that are valid Ozon API operations but are not currently granted to this key.

## 3. Captured account metadata

The live capture identified the account as Free/non-Premium at that moment and returned 303 role grants.

This must not be interpreted as a Premium entitlement map.

In particular, the fact that a method appears in `/v1/roles` does not prove that every metric, field, history window, sort or feature inside that method is available on the current subscription.

Likewise, absence from the current role snapshot does not prove that the method should not be implemented globally.

## 4. Premium interpretation — corrected

The earlier wording “Free grants all ten Premium methods” was too coarse and is retired.

Correct interpretation:

- some methods granted to the current key are grouped/documented by Ozon in Premium-related API sections;
- `/v1/roles` is method-level key authorization data;
- `/v1/seller/info` reports the current seller subscription;
- endpoint/feature Premium requirements come from the current Ozon contract and can change independently;
- the Bridge must maintain refreshable entitlement metadata instead of treating the current role list or a static tier array as permanent truth.

No inference of the form:

```text
method listed in roles => all features available
method absent from roles => Ozon API does not support it
HTTP 403 => definitely Premium
```

is allowed.

## 5. Historical classification value

The existing 303 machine classification recorded this account-specific split:

| Class | Count |
| --- | ---: |
| READ_SAFE | 98 |
| READ_CONDITIONAL | 65 |
| READ_PII_BLOCKED | 19 |
| MUTATION_BLOCKED | 84 |
| LEGACY_AUTHORIZED_NOT_TARGET | 37 |

These counts remain useful evidence for the captured key and explain why the narrow v0.1.19 registry was incomplete for that account.

They are **not** the final counts for the full 463-operation Seller API. The new full-read coverage compiler must classify the complete current Swagger inventory and produce zero `PENDING` / zero `UNCLASSIFIED` rows before release.

## 6. Current Bridge comparison retained

At the capture baseline the Seller side of Bridge exposed these enabled aliases:

- `analytics_data`;
- `product_queries`;
- `product_queries_details`;
- `stocks_current`;
- `posting_fbo_list`;
- `supply_order_get`;
- `supply_order_details`;
- `roles`.

The Performance provider remained separate with four enabled read aliases.

The observed stock test still proves a real coverage gap: current key access includes warehouse/stock surfaces that were not visible in the old `stock_inventory` guidance. This is evidence that guidance/registry coverage was incomplete, not evidence that Ozon lacked those capabilities.

## 7. Stock/history findings retained

Proven current-account facts remain:

- `POST /v4/product/info/stocks` works through `stocks_current`;
- `filter:{}` worked and enumerated current inventory;
- the key also exposed warehouse/analytics stock methods not present in the old Bridge guidance;
- current stock methods alone do not prove exact historical stock-at-an-arbitrary-date capability.

The new full-read design therefore implements the complete current stock/warehouse read family first and treats historical reconstruction as a contract question, not as a conclusion derived from old Bridge coverage.

## 8. Safety meaning of the old classes

Plain-language interpretation remains valid:

- `READ_SAFE`: normal information retrieval candidate;
- `READ_CONDITIONAL`: information/report/document workflow that needs explicit handling;
- `READ_PII_BLOCKED`: raw response can contain customer/contact/message/user data and is not exposed until a safe projection exists;
- `MUTATION_BLOCKED`: the method can change seller/Ozon state and is outside the read-only Bridge;
- `LEGACY_AUTHORIZED_NOT_TARGET`: the key exposed a path that did not have a sufficiently current exact contract in the compared snapshot.

The new global compiler uses updated terminal classes from the full-read specification, but this file remains a valid audit record of the account-specific 303-method pass.

## 9. Standing conclusion

Keep this snapshot as evidence. Do not delete it and do not promote it to the global API catalog.

`ROLE_303_SNAPSHOT_RETAINED_AS_ACCOUNT_CAPABILITY_EVIDENCE`