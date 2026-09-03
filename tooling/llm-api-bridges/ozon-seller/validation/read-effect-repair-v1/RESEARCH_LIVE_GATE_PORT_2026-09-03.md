# Ozon READ repair -> product-demand research port — 2026-09-03

Status: `PORTED_AWAITING_BROWSER_PACKAGE_CERTIFICATION`

Research branch:
`research/ozon-product-demand-2026-09-02`

Original STD-10 block commit:
`20ae735cc3de5ae776d122d52d32fed6997bda44`

Certified repair authority branch:
`repair/ozon-read-effect-reclassification-2026-09-02`

Certified repair closure commit:
`72c5e972b2b122231509ce8e9199c341fd60f5f4`

Certified installable nodebundle commit in repair lineage:
`8e0a4707ba437318bcf2e0034a6f697b048504b0`

Targeted runtime port commit:
`81f5a71a2ae416a4ffc23e63f79c061237e3ad73`

Browser-package workflow/gate port commit:
`4d2de7dce389ef4343e6c243c0824853f566dfe8`

Classifier provenance correction commit:
`c6e8bfa63e165020ab58225f86fbd44a156c1588`

The port intentionally did not merge the diverged repair branch. It copied only the certified repaired runtime payload into the research lineage:

- `dist-step7-candidate/shared/ozon_operation_registry.js`
- `dist-step7-candidate/shared/ozon_contract.js`
- `dist-step7-candidate/shared/ozon_entitlements.js`
- `dist-step7-candidate/shared/ozon_provider.js`
- `dist-step7-candidate/shared/provider_transport_core.js`
- `dist/ozon-seller-mcp-nodebundle.js`

The exact repair validation gates and the repaired Step7 READ classifier were then copied from the certified repair lineage.

Expected certified surface before live STD-10 resumes:

- Seller enabled READ aliases: `271`
- exact repaired READ schemas: `26`
- full repaired workflows E2E: `26/26`
- required historical-stock investigation operation: `report_placement_by_products_create` -> `POST /v1/report/placement/by-products/create`

First browser-package CI run `33706796136` correctly failed after confirming `seller_enabled_reads=271`, because the research lineage still had the pre-repair terminal-matrix classifier. Commit `c6e8bfa63e165020ab58225f86fbd44a156c1588` ports the exact repaired classifier and this marker triggers a fresh package certification run.

Do not mark STD-10 unblocked until the browser extension package passes Linux + Windows + deterministic cross-platform certification.
