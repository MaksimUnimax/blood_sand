# Bridge Source Map for Server Architects

Date: 2026-09-03

This file records where to look in the Bridge track when a server design question requires current Bridge evidence. It intentionally does not create a runtime dependency.

## Product/roadmap authority candidates

- `tooling/llm-api-bridges/ozon-seller/README.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRODUCT_DIRECTION_2026-08-13.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_ROADMAP_2026-08-17.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md`

Always read from the current accepted Bridge branch when using these operationally; old/default-branch text may be stale.

## Development baseline provenance

- `tooling/llm-api-bridges/ozon-seller/development/operator-v0.1.19/BASELINE.md`
- `tooling/llm-api-bridges/ozon-seller/development/operator-v0.1.19/ozon-bridge-v0.1.19-extension.zip`

Historical reference only until P11.

## Responsibility areas in Bridge source/artifacts

Current/historical file names indicate these responsibility areas:

### AI adapter / DOM layer

- `shared/ai_adapters.js`
- `shared/composer_send.js`
- `shared/conversation_identity.js`
- content script / UI controls

Questions for server integration:

- AI family/surface/variant identity;
- selector/profile strategy vocabulary;
- conversation binding lifecycle;
- auto-detection hooks;
- remote profile injection boundary;
- safe rebinding semantics.

### Provider / Ozon layer

- `shared/ozon_contract.js`
- `shared/ozon_credentials.js`
- `shared/ozon_provider.js`
- `shared/provider_transport_core.js`

Questions for server integration:

- packaged capability allowlist;
- credential ownership;
- provider quota/cache lifecycle;
- local security boundary;
- operation registry/version exposed to entitlement mapping.

### Bridge execution/delivery layer

- `shared/bridge_autorun_model.js`
- `shared/manual_controls.js`
- `shared/proven_writing_block_capture.js`
- service worker/content script state

Questions for server integration:

- exactly-once ownership;
- durable pending work;
- delivery recovery;
- Manual/automatic control lifecycle;
- restart and active-tab behavior.

## Server rule

Never infer current production behavior solely from this file-name map. At P11 fetch the actual current accepted source/artifact and its tests/evidence.

The server may define a client-facing contract before P11, but any assumption about Bridge internal state ownership must be revalidated at integration time.