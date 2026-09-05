# CAP-01 — Catalog / product inventory

Canonical question:
`Какие товары сейчас есть в моём кабинете Ozon? Составь полный список карточек с SKU и моим артикулом, не проси меня вручную перечислять товары.`

Status: PASS

Evidence summary:
- operation: `seller_product_list`
- HTTP 200
- exactly one logical business result and one physical business request
- `exact_request_preserved=true`, `command_transformed=false`
- provider returned `total=76` cards in one response with `limit=1000`; no continuation needed
- each row includes seller `offer_id` and Ozon `sku`, so the full catalog can be produced without operator-supplied SKU inventory

Checkpoint: `CAP_01_PASS_CAP_02_READY`
