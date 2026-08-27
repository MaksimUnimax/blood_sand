# Patch B18 Pricing Strategy Extended Reads — ACCEPTED

- Candidate: `65374fdff02d2d5c18531109ab524c6b14503350`
- Independent validation: `ed131455b81a3017a2eafd9797acbaa6b8af2cd4`
- Accepted B17 authority: `87626dbe2b9192f8c0c6bc6cd58ebbbce70c76e7`
- Materialized production tree: `300e1fe642cf0bb108f39d3e35fd4f8d97140e60ae4cc76361407685d2b0ad75`
- Independent result: `PATCH_B18_PRICING_STRATEGY_EXTENDED_READS_INDEPENDENT_TEST_PASS`
- Seller business requests during independent validation: `0`
- Performance business requests during independent validation: `0`
- Credentials used during independent validation: `0`
- Tester production modifications: `0`

Accepted B18 read surface:
- `pricing_strategy_competitors` -> `POST /v1/pricing-strategy/competitors/list`
- `pricing_strategy_ids_by_product_ids` -> `POST /v1/pricing-strategy/strategy-ids-by-product-ids`

Pricing-strategy mutations remain excluded. No automatic page following, pagination, retry, product-ID fanout or provider chaining is enabled. Protected runtime remains unchanged.

`PATCH_B18_PRICING_STRATEGY_EXTENDED_READS_ACCEPTED`