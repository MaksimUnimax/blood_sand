# WB API currentness note — v0.1.1 — 2026-08-12

Before release, the connection/auth surface was rechecked against current official Wildberries developer documentation.

Confirmed release assumptions:

- API authorization uses `Authorization: Bearer <token>`.
- official connection check is `GET https://common-api.wildberries.ru/ping` (service-specific `/ping` variants also exist);
- `/ping` is a read-only connectivity/token-category check and is rate-limited to 3 requests per 30 seconds per host;
- v0.1.1 removes stale `/v1/roles` wording inherited from the Ozon-oriented test/reference adaptation;
- v0.1.1 run IDs use `wbrun-`, not the stale `ozrun-` prefix.

Official sources used for this pass:

- https://dev.wildberries.ru/en/docs/openapi/api-information
- https://dev.wildberries.ru/knowledge-base/articles/019d50e0-4cd1-7756-809a-274ac5498b6d/pervyi-zapros-k-wb-api
- https://dev.wildberries.ru/knowledge-base/articles/019d49a1-0d73-71e9-be3e-b2c44567470c/sistema-avtorizatsii-wb-api

The complete production endpoint registry is retained in the exact source/tests/evidence bundle; `WB_PRODUCTION_ALLOWLIST_V0.1.1.md` is generated from it.
