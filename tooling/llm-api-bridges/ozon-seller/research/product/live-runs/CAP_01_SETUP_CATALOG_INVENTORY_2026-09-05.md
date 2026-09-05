# CAP-01 setup — catalog / product inventory

Date: 2026-09-05

Frozen canonical question:
`Какие товары сейчас есть в моём кабинете Ozon? Составь полный список карточек с SKU и моим артикулом, не проси меня вручную перечислять товары.`

Capability target: catalog / product inventory.

Selected Bridge surface: `seller_product_list` (`POST /v3/product/list`).

First read: full catalog page with empty filter and limit 1000. Continue pagination only if provider result proves it is needed.

Checkpoint: `CAP_01_READY_RUN_1`
