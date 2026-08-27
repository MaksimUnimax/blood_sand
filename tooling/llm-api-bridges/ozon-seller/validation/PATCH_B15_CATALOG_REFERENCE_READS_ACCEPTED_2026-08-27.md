# Patch B15 Catalog Reference Reads — ACCEPTED

- Candidate: `efd4bd964392c686ff48b5d4d260d070a274055b`
- Independent validation: `b2fc6c8979dab2bdb60ef1eae4fee9f524cf82c6`
- Accepted B14 authority: `b3f16b6d9cc318aa1721fd12c52efc1b2714e9a1`
- Materialized production tree: `401692a486696189cc9bf81f58fd2066fe3babfb087747a7ccbb8519bacce07f`
- Independent result: `PATCH_B15_CATALOG_REFERENCE_READS_INDEPENDENT_TEST_PASS`
- Seller business requests during independent validation: `0`
- Performance business requests during independent validation: `0`
- Credentials used during independent validation: `0`
- Tester production modifications: `0`

Accepted B15 read surface:
- `description_category_tree` -> `POST /v1/description-category/tree`
- `description_category_attributes` -> `POST /v1/description-category/attribute`
- `description_category_attribute_values` -> `POST /v1/description-category/attribute/values`
- `description_category_attribute_values_search` -> `POST /v1/description-category/attribute/values/search`

No automatic `last_value_id` following, pagination, retry, fanout or chaining is enabled. Protected runtime remains unchanged.

`PATCH_B15_CATALOG_REFERENCE_READS_ACCEPTED`
