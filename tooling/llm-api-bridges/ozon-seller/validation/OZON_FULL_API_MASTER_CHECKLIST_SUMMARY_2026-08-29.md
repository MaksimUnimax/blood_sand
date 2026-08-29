# Ozon full API master checklist — generated inventory

Date: 2026-08-29  
Roadmap step: 2

## Result

- Seller operation rows: **463**
- Performance operation rows: **48**
- Total current API rows: **511**
- Performance unique paths: **47**
- Current canonical registry aliases total: **42**
- Current API rows already present in the canonical registry: **39**
- Preserved current-registry compatibility routes outside the current API inventory: **3**
- Rows still requiring semantic/exact-schema classification: **472**

The current operation universe is complete at method+path level: 463 Seller + 48 Performance = 511 current API rows. It was reconstructed from pinned audited GitHub indexes whose blob identities are verified by the generator.

## Preserved compatibility routes outside the current 48-operation Performance inventory

- `performance_campaign_product` → `GET /api/client/statistics/campaign/product/json`
- `performance_daily` → `GET /api/client/statistics/daily/json`
- `performance_expense` → `GET /api/client/statistics/expense/json`

These three routes remain part of the accepted compatibility registry, but they are not counted as additional current Performance Swagger operations. They are tracked separately so the 42-alias canonical registry reconciles cleanly as 39 current-inventory matches + 3 compatibility routes.

## Critical provenance rule

The project-accepted exact Swagger identities remain:

- Seller: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; 463 operations.
- Performance: 304,771 bytes; SHA-256 `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`; 47 paths / 48 operations.

The bundled OpenAPI JSON files in the pinned public mirror are **not byte-identical** to those accepted snapshots. Therefore the pinned indexes are used only for the complete `method + path + purpose` universe. Exact schema, request, response, deprecation, workflow and safety decisions must be reconciled against the accepted exact Swagger evidence/snapshot before implementation or final terminal classification.

No Ozon business API request is made by this generator.
