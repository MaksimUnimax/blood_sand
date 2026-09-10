# START_PROMPT_CURRENT

Status: CURRENT runtime authority mirror for Ozon Seller Bridge v0.1.19 candidate.
Executable authority: `dist-step7-candidate/shared/runtime_names.js` → `DEFAULT_AUTO_START_TEXT`.

## Mandatory semantics

- Command boundary is an envelope, not an assistant response, Markdown code block, or Manual UI capture.
- API envelope is `OZON_API_V1` plus the next JSON object with top-level `operation` and `params` only.
- HELP envelope is `OZON_HELP_V2` plus the next JSON object containing `cluster` and optional `section`; V1 is compatibility fallback.
- Multiple independent API and HELP envelopes may coexist in one assistant response and are processed sequentially in source order.
- HELP is local guidance: `external_request_executed=false`, `physical_business_request_count=0`.
- One explicit API command creates at most one physical provider business request.
- Hidden retry, automatic pagination, polling and fan-out are forbidden.
- Dependent workflows are never pre-batched. `code`, `file_ref`, `cursor`, `offset`, `last_id`, `page` and other opaque dependencies must come fresh from the immediately relevant prior result.
- Transport/auth fields are not supplied by the assistant.
- Bridge operations are read-only; privacy and entitlement blocks fail closed.
- After each result, analyze evidence before producing the next read. When no further Ozon read is needed, answer `сбор закончен.`

CI must reject drift between this mirror and the executable startup prompt for the envelope-boundary, mixed HELP/API, HELP-zero-provider, fresh-dependency and no-hidden-request rules.
