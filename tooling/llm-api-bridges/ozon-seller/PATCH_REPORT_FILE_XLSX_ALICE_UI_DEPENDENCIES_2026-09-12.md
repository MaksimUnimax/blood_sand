# Combined dependency closure — report expiry + XLSX attachment + status close

Executable `aafd23cca6cb657ed8c453c54c6a0b70b5bf21f3`; tree `550e5881534563f7482b49eca6cb20517bed73f8`; final CI `34690423195`.

| ID | Dependency | Rule / proof | Status |
|---|---|---|---|
| D01–D24 | Report lifetime/provenance/session/transport/output | Inherited expiry authorities rerun on the exact combined ZIP | PASS |
| D25 | Provider response bytes → parsed format | The existing single-fetch parser result is passed to artifact classification; no refetch | PASS |
| D26 | Opaque XLSX transport metadata | Parser-proven xlsx canonicalizes generic octet-stream/ZIP transport to .xlsx + OOXML MIME; exact bytes and SHA remain unchanged | PASS |
| D27 | Unknown/concrete file types | Concrete provider MIME remains authoritative; unknown generic/unparsed content remains fail-closed .bin | PASS |
| D28 | Attachment UI status lifecycle | All attachment info/success/error statuses share one closeable plate; × removes visual DOM only and never mutates delivery state | PASS |

## Exact production scope

Changed relative to baseline `0cc968ee4b76d41e9c0361a905812fe49f313585`:
- `shared/ozon_provider.js`
- `shared/llm_output_report_workflow_patch.js`
- `shared/file_delivery_port_worker.js`
- `attachment_delivery_port_content.js`

28 other production files are byte-identical to the baseline. A deliberate fifth-file mutation is rejected by the same scope gate.

{
  "checked_paths": 28,
  "unaccounted_pre_handoff_dependencies": 0,
  "stale_active_assumptions": 0,
  "available_but_unverified_pre_handoff_dependencies": 0,
  "live_gates_pending": 5
}

LIVE-GATE-01..05 remain PENDING POST-INSTALL.
