# Canonical V2 B1 candidate manifest

- base commit: `3795359959c965fc5cd1837b9a1c978493ae2ac5`
- B0 production tree: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- raw patch SHA-256: `5485652cb41ea68d27285ba1678a23a4325037f1909426c933c60bdeabacf11f`
- gzip patch SHA-256: `e02d68c233067c258b3a115132296a4b25bdd1ab43ed061a030843fbbf475261`
- canonical B1 production tree: `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`
- production files: `21`
- production JavaScript files: `18`
- total registry operations: `42`
- canonical B1 reads: `30` = `6 stocks_inventory + 24 warehouse_logistics`

Changed production identities:

- `shared/ozon_operation_registry.js` `5c957a8766e42df8863dd8320fe48c476a92c3fca9abc28c92c7f28e1d694ed6`
- `shared/ozon_contract.js` `b48e23ebb0c4ed9d38022500600d2c31c8deb93750b2138f5876ac4087013af2`
- `shared/ozon_entitlements.js` `e3d6aab926840bb36c6be058bd7550bef0549a2924f4ad6b0c93c6f8e4b6eb2c`
- `service_worker.js` `a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3`

Preserved protected identities include content script, popup, Autorun model, Work-session model, provider transport, Ozon provider, Manual controls, Guidance and runtime names. The only runtime change is the reviewed separate quota family required by exact Swagger for `stock_turnover_analytics`.
