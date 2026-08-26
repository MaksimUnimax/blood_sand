# B11 Catalog Diagnostics / Content — contract closure

B11 adds eight fixed Seller API read aliases under the existing `catalog_products` cluster.

Safety invariants:

- fixed `https://api-seller.ozon.ru` host;
- fixed method/path per alias;
- `READ` only;
- `single_read` workflow role;
- one explicit bridge command builds one physical request object;
- no automatic cursor continuation;
- no retry/fanout/provider chaining;
- no caller-controlled URL, host, path, method, headers or authorization material;
- no new runtime lifecycle code.

Contract decisions:

- all SKU list inputs use strict string-int64 validation;
- product description enforces exactly one of `offer_id` or safe numeric `product_id`;
- upload-quota uses a true no-body POST;
- related-SKU enforces the documented maximum of 200;
- picture-info enforces schema maximum 1000;
- wrong-volume enforces limit 1..1000 and leaves cursor continuation explicit to the caller;
- fields without an exact documented array maximum do not receive an invented maximum;
- picture URLs are returned as inert response data and are never fetched automatically.

All eight operations remain all-account reads and do not trigger a Seller capability probe.
