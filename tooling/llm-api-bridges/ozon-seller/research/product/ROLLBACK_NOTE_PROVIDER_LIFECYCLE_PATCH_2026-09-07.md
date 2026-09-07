# Rollback — provider lifecycle terminalization patch — 2026-09-07

Operator instruction: roll back the provider-lifecycle terminalization patch after installed live acceptance failed.

Rollback target for production runtime bytes:
`74e0589b5034581664c17727b8efba18ed0711d0`

Runtime files restored exactly from that pre-patch authority:
- `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/service_worker.js`
- `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js`

The failed patch remains recorded in history and in `REG_P0_PROVIDER_LIFECYCLE_01_LIVE_FAIL_2026-09-07.md`; it is not certified.
