# CAP-22 Run 04 — pricing_strategy_competitors — competitor source directory

Date: 2026-09-06
Status: `COMPETITOR_SOURCE_DIRECTORY_PASS_NO_TARGET_PRODUCT_LINKAGE`

Target own product authority:
- SKU `1636048691`
- Seller product_id `1119965443`
- offer_id `Печать Велеса`

Operation: `pricing_strategy_competitors`
Request ID: `00dedc06-2e6b-491a-bc1e-81fe6764c4bc`
Provider surface: Seller API `POST /v1/pricing-strategy/competitors/list`
Logical request: `page=1`, `limit=20`

Execution evidence:
- HTTP `200`
- external request executed: `true`
- capability probe: not needed / not executed
- logical business result count: `1`
- physical business request count: `1`
- exact request preserved: `false`
- command transformed: `true`
- logical command fingerprint: `b359b99d`
- physical command fingerprint: `d0313f73`

Bridge entitlement metadata at execution time:
- status: `SUPPORTED_AND_ENTITLED`
- reason: `all_accounts`
- capability_required: `false`
- rule source: `reviewed-openapi-463-2026-08-19`

Provider result:
- total competitor-source records: `31`
- first page returned `20` records

Returned page-1 competitor sources:
1. `3664464` — `market.yandex.ru`
2. `16942991` — `wildberries.ru (после скидки постоянного покупателя)`
3. `16646491` — `ozon.ru`
4. `12969542` — `lavka.yandex.ru`
5. `13656165` — `5ka.ru`
6. `13656167` — `samokat.ru`
7. `16942293` — `citilink.ru`
8. `16942296` — `dns-shop.ru`
9. `16942328` — `goldapple.ru`
10. `16942297` — `mvideo.ru`
11. `16942294` — `vseinstrumenti.ru`
12. `16942300` — `sbermarket.ru`
13. `19` — `holodilnik.ru`
14. `24` — `eldorado.ru`
15. `13656211` — `lenta.com`
16. `13656212` — `online.metro-cc.ru`
17. `13656215` — `vkusvill.ru`
18. `37` — `mts.ru`
19. `58` — `amag.ru`
20. `73` — `leroymerlin.ru`

Interpretation:
- Run 04 proves that the active seller/API-key context can read Ozon's pricing-strategy competitor-source directory;
- the returned objects are source/site definitions (`id` + domain-like `name`), not concrete competitor product cards and not competitor product URLs;
- this result therefore does NOT prove that any listed source contains a competitor for target seller product `1119965443`;
- it does NOT prove that `ozon.ru` record `16646491` is a specific Ozon competitor product;
- page 1 already establishes the response object class needed for CAP-22: source directory rather than target-product discovery. Fetching the remaining 11 directory rows would not create target-product linkage by itself;
- Run 03 independently showed both visible pricing strategies have `products_count=0`; direct `pricing_strategy_product_info` returned no competitor linkage for the target product; direct product-to-strategy resolution was provider-denied with HTTP 403;
- no manual competitor selection is permitted.

Commercial-value significance:
- the Bridge can expose pricing-strategy competitor-source topology, which is useful diagnostic/context capability;
- however the commercially stronger job requested by CAP-22 — independently identifying a concrete relevant competitor product for the selected seller SKU and then benchmarking that public card — remains unproven in this seller context;
- the distinction matters for truthful product positioning: a competitor-source directory is not equivalent to automated competitor-product discovery.

CAP-22 implication:
- no Ozon-proven specific competitor product URL/card has been discovered after the allowed direct and alternate discovery chain;
- under the frozen CAP-22 method, the row should close with explicit `COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` rather than hand-picking a marketplace card.
