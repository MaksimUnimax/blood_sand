# Ozon post-B10 catalog diagnostics audit — 2026-08-26

Accepted base: `6c6ce7adab35b199b444a96e0e3ae7ecc3b20e33`.
Accepted production tree: `b5af358d19c5e4a720b34f61a6487a20bc07c82c7689a205fde96853c26d46b6`.

Exact Seller Swagger authority: 3,933,043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 paths.

`OZON_IMPLEMENTATION_CONTRACT_QUEUE_V2_2026-08-26.json` places `P0_catalog_diagnostics_content` immediately after the accepted B10 seller-health priority. B11 is assigned to this priority.

All eight selected endpoints are present in the exact Swagger, are non-deprecated on 2026-08-26, and are read-only retrieval operations:

- `POST /v1/product/rating-by-sku`
- `POST /v1/product/info/description`
- `POST /v4/product/info/limit`
- `POST /v1/product/info/subscription`
- `POST /v1/product/related-sku/get`
- `POST /v2/product/pictures/info`
- `POST /v1/product/info/wrong-volume`
- `POST /v1/product/info/discounted`

The exact entitlement compiler classifies all eight as all-account reads with no Seller subscription capability probe.

The picture-info response contains image URLs. B11 exposes those URLs only as response data; it does not fetch image content, follow URLs, or create secondary requests.

`wrong-volume` exposes an explicit cursor. B11 never follows that cursor automatically. Related-SKU is capped at the documented 200 SKU per request; pictures-info is capped by the schema at 1000 product IDs; wrong-volume limit is exactly 1..1000. No undocumented array maximum is invented for request fields whose exact schema does not provide one.
