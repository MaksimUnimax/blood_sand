# C09 — correction of obsolete mixed HELP/API audit conclusion

Date: 2026-09-12. Continuous authorized corrective execution. Existing P1/C04/C06/C08 code is preserved.

## Exact authority and cause

Pinned Ozon executable source 1b3f0961ff9399430c9e5b3b70a4188f1282429d, package OZON_BRIDGE_v0.1.19_GLOBAL_IDLE_WORK_RESTART_20260912.zip SHA-256 78ff3b6681759a308e8aac1debfb8832fa04cc28599859a0979341cce3e4e2ac. Reference files extracted locally and compared, not inferred from branch names.

shared/mixed_batch_discovery.js scans complete API, HELP V1 and HELP V2 envelopes in source order. Markers inside an already balanced JSON string are not separate commands. service_worker.js discoverBatchEntries around lines 2890-2960 delegates to this module and converts invalid HELP to local guidance-error entries. At lines 3680-3775 guidance/pre-execution-error entries are durably completed and iteration continues to the next explicit entry. Thus the late executable ALLOWS mixed HELP/API; it does not blanket-reject MIXED_HELP_AND_API. No additional API command is invented by guidance.

The previous re-audit, SUPERSEDING_PATCH_AUTHORITY P3 and its mixed-rejection acceptance row are obsolete on this point. Preserve those historical documents and failures, but this source-backed correction supersedes the blanket mixed rejection for the current migration. The C08 next-action note already identified this unresolved contradiction. WBCommandProtocol currently still rejects mixed source, while runtime_names startup already says mixed is allowed: actual contradiction to repair.

## Port boundaries

Port the exact ordered-discovery and versioned guidance flow under WB prefixes. Adapt cluster/section catalog to existing WB registry families/read kinds, NOT Ozon clusters, aliases, endpoints or entitlement values. Retain legacy WB_HELP_V1 operation=catalog/describe compatibility and add cluster-based HELP V1/V2. Guidance and invalid HELP have zero physical marketplace requests and safe bounded descriptors. Templates are never executed as a consequence of HELP. WB_API_V1 strict envelope/transport restrictions and WB 188/172/16 registry remain unchanged.

Explicit local malformed/disabled/unknown entries get durable structured errors/guidance; other separate valid explicit envelopes follow the pinned late source's order. Global source/count budget failure remains a local fail-closed result. Existing no hidden retry, owner cancellation, provider-error stopping, and provider-success/delivery distinction remain.

## Verification before implementation and handoff

Use actual pinned Ozon discovery/guidance as differential oracle with WB metadata adapter. Compare ordered scanning, parse outcomes and hierarchical choices; explicitly document WB-only legacy-help compatibility and safer sensitive-descriptor projection. Include escaped quoted markers, multiple code blocks, malformed entries, disabled templates, V1/V2 markers, malicious transport fields, unknown family/section, catalog accounting, full worker execution with exact explicit provider-call count, and content-side detection. Old tests asserting mixed rejection must be kept as historical evidence and updated with this explicit authority—not silently treated as still-correct tests.

No real provider calls, installed acceptance or release claim in this entry. Next: run RED, implement, save exact source and actual RED/GREEN outputs, continue remaining error and attachment transaction parity.
