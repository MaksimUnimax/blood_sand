# Wildberries Bridge v0.1.0 — official API currentness implementation pass

Date: **2026-08-12**

## Authority

Current Wildberries official API documentation, OpenAPI pages and release notes are the external contract authority. Repository research from 2026-08-10 is context only where the official state has changed.

## Corrections applied before packaging

1. **Finance foundation** — current `/api/finance/v1/...` Sales Reports and Acquiring methods are used. Legacy `GET /api/v5/supplier/reportDetailByPeriod` is not the finance foundation.
2. **Analytics stocks** — current `stocks-report` product/group/size/warehouse surfaces are represented, including `POST /api/v2/stocks-report/products/sizes` for SKU/size-level facts.
3. **Order batch migrations** — current batch metadata/status methods are used where Wildberries deprecated earlier per-order or old-family methods. Example: DBS statuses use `POST /api/marketplace/v3/dbs/orders/status/info`; old `POST /api/v3/dbs/orders/status` is not executable.
4. **Documents download semantics** — document download methods are JSON/base64 contracts, not assumed raw HTTP binary.
5. **Generated Analytics report** — create/status/download/retry are distinct explicit operations. An explicit WB report retry endpoint does not authorize hidden transport retry.
6. **Promotion** — current read statistics/recommendation/media/payment/update history methods are separated from campaign/bid/budget mutations. Historical GET endpoints that cause state changes are classified by effect and excluded.
7. **Buyer/customer PII** — buyer info/chat/courier/pass methods are not admitted merely because they are GET/POST reads.
8. **Deprecated supplier stocks** — old supplier-stock surface is not used as the current inventory foundation.

## Packaging rule

No endpoint is admitted because its HTTP verb “looks read-only”. An operation is executable only when its semantic effect is classified READ/read-derived and the exact host/path/method contract is frozen in `shared/wb_operations.js`.

## Runtime freshness

This release is a contract snapshot. Wildberries API is external and mutable; before a future release changes or expands the registry, current official docs/release notes must be revalidated again.
