# STD-08 Run 2 — warehouse stock page 2

Date: 2026-09-02
Question: `Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему.`

Operation: `stock_on_warehouses_v2`
Request id: `34e4592b-206b-40ac-ada3-98d7d0a831ac`
Logical fingerprint: `6807ca61`
Physical fingerprint: `d634ac0b`
HTTP: `200`
Elapsed: `1401 ms`
External request executed: `true`
Physical business request count: `1`
Command transformed: `true`
Pagination metadata: `null`

Requested page:
- warehouse_type `ALL`
- limit `100`
- offset `100`

Observed result:
- second full-size page returned;
- `pagination=null` again, so Bridge does not tell the AI whether another page exists;
- under the explicit no-hidden-pagination invariant, the AI must issue another explicit continuation request rather than treating the first 200 rows as complete;
- next required read is the same logical operation with `offset=200`.

Business semantics:
- this surface is Ozon warehouse/FBO stock analytics;
- do not describe it as total seller FBO+FBS inventory;
- final warehouse ranking must be computed only after a terminal short page is observed.

Product gap reconfirmed:
`DO_NOT_REQUIRE_MODEL_INTELLIGENCE_TO_INFER_PAGINATION_FROM_ROW_COUNT`

Checkpoint:
`STD_08_RUN2_SECOND_FULL_PAGE_PAGINATION_NULL_OFFSET200_NEXT`
