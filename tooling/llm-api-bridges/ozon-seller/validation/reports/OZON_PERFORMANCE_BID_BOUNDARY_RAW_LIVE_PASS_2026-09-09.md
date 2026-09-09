# Ozon Performance bid-boundary raw live pass — 2026-09-09

## Verdict

**TRANSPORT / CONTRACT EXECUTION PASS. BID-UNIT BUSINESS INTERPRETATION STILL OPEN.**

A three-command sequential batch exercised the current minimum-bid and campaign competitive-bid read surfaces using only two real SKUs discovered in the immediately preceding paired-campaign diagnostic.

The batch itself is clean. However, this report deliberately does **not** convert the raw campaign/competitive `bid` integer-like values into rubles because the checked-in Bridge contract preserves those provider values as raw strings and the frozen Step-6 matrix does not itself state the numeric scale. The `performance_min_bid_by_sku` surface returns a provider `double` instead. A cross-field unit conversion must not be guessed.

## Batch accounting

- result_count: `3`
- logical business results: `3`
- physical business requests: `3`
- coalesced groups: `0`
- coalesced logical commands: `0`
- capability probe: not performed / not needed

All three operations returned:

- provider HTTP `200`;
- `external_request_executed=true`;
- `exact_request_preserved=true`;
- logical fingerprint = physical fingerprint;
- `command_transformed=false`;
- pagination `null`;
- rate limit `null`.

No hidden retry, polling, pagination, fan-out, or provider chaining was observed.

## Result 1 — minimum bid by SKU

Operation: `performance_min_bid_by_sku`

Request ID: `91ff0967-6aea-45d8-a506-e9d10ea2389c`

Fingerprint: `a05bcd62 = a05bcd62`

Input SKUs:

- `1943215793`
- `2326866320`

Provider result:

- SKU `1943215793`: `bid = 0.23`
- SKU `2326866320`: `bid = 0.23`

Important scope note: this call omitted optional `marketplaceId` and `paymentType`, therefore its returned `0.23` values must not be treated as placement-specific CPC/CPC_TOP minima. The next test will request those variants explicitly.

## Result 2 — competitive bids, campaign 37130638

Operation: `performance_competitive_bids`

Request ID: `c5e0cc5d-07b5-4d30-8d68-0a66ecc9746b`

Fingerprint: `86262877 = 86262877`

Campaign: `37130638`

Provider result:

- SKU `1943215793`: raw `bid = "29000000"`
- SKU `2326866320`: raw `bid = "26000000"`

## Result 3 — competitive bids, campaign 37130609

Operation: `performance_competitive_bids`

Request ID: `d9d77f96-3e4f-4be0-b5fc-d64bda4a79cc`

Fingerprint: `2d52076f = 2d52076f`

Campaign: `37130609`

Provider result:

- SKU `1943215793`: raw `bid = "27000000"`
- SKU `2326866320`: raw `bid = "24000000"`

## Comparison with already observed configured raw bids

The immediately preceding live campaign-products reads returned these raw configured values:

Campaign `37130638`:
- SKU `1943215793`: `"1000000"`
- SKU `2326866320`: `"3000000"`

Campaign `37130609`:
- SKU `1943215793`: `"3000000"`
- SKU `2326866320`: `"6000000"`

Therefore, without applying any undocumented unit conversion, the raw provider relation is:

- `37130638 / 1943215793`: configured `1000000`, competitive `29000000`;
- `37130638 / 2326866320`: configured `3000000`, competitive `26000000`;
- `37130609 / 1943215793`: configured `3000000`, competitive `27000000`;
- `37130609 / 2326866320`: configured `6000000`, competitive `24000000`.

The configured raw values are lower than the corresponding competitive raw values for all four campaign/SKU pairs. This is a scale-free comparison because both values come from string/uint64-style campaign bid surfaces. It still does **not** prove that raising a bid would improve profitability or orders.

## Exact contract evidence available in the project

The accepted exact Performance Step-6 matrix identifies:

- `POST /api/client/min/sku` -> `performance_min_bid_by_sku` -> minimum bid for products by SKU;
- `GET /api/client/campaign/{campaignId}/products/bids/competitive` -> `performance_competitive_bids` -> competitive bids for products;
- `GET /api/client/campaign/{campaignId}/v2/products` -> `performance_campaign_products` -> campaign product list.

The current Bridge contract accepts explicit `marketplaceId`, `paymentType`, and `sku` for the minimum-bid method, with payment types `CPO`, `CPC`, and `CPC_TOP`. The current competitive-bid contract accepts one explicit campaign ID plus up to 200 explicit SKUs.

The checked-in Bridge does not normalize the raw campaign/competitive `bid` values to a named ruble field. No conversion is introduced in this evidence report.

## Next live step

Resolve the placement-specific minimum boundary with current provider semantics rather than inference:

1. read the provider bid-limit surface;
2. request minimum bids explicitly for `MARKETPLACE_ID_RU + CPC`;
3. request minimum bids explicitly for `MARKETPLACE_ID_RU + CPC_TOP`.

This will distinguish search/recommendations and search/top minimums while preserving the one-command/one-request rule.
