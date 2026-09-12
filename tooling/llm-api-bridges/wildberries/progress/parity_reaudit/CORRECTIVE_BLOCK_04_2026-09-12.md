# Corrective parity — block 04
Date: 2026-09-12
Status: INITIAL CORRECTION IN PROGRESS / NOT RELEASED

## Readback and exact identity correction
Block 03 read back at 735aa5cc85262f12dfe395bbe8225407185501e7, blob f29ef4265064d4a23a16384a2046c8b31fa1c310.
The non-hash placeholder in block 03 is not evidence and is superseded by this computed exact value: WB021 service_worker.js SHA256 `dacce4e7b286fc97d83b8176d72902ef5dcf049a85df15be285a2853266eaa00`.

## Additional inspected source
- WB shared/wb_batch_runtime.js: full 1–73, SHA256 32cdf6cb7f5e19ab04c2b33f0f3445cd8863d0b8bd5b0da27011455b094f1ca0. Existing durable snapshots can represent blocked local entries, but render lacks pre-execution flags and safe stage/message detail. canContinue currently blocks local-error delivery when manual is off, so removing the early throw alone is insufficient.
- WB shared/wb_command_protocol.js: full 1–114, SHA256 05fdc2321e6f865642328de2de70e532ff02360ccc69b3b65bf72f2d75a9236a. Mixed HELP/API source order is explicitly an invented rule; only HELP V1 markers are recognized.
- WB shared/runtime_worker.js: 1–88, SHA256 39529c4a92a7be14f84c96abf073f31e27d57fcfa8632f055690edeede02602b. Work start changes Work state but not legacy manual visibility authority; refresh has a simplified lifecycle. Read remainder 89–162 next before modifying dependent provider paths.
- WB service_worker.js: 750–895. Public popup state has no Work session; executeWorkPlan reparses source, stores batch checksum and owner, but manual-mode eligibility is checked even for local-only entries. Existing single API path is preserved unless a directly tested correction requires otherwise.
- Ozon service_worker.js: 2660–2735. discoverBatchEntries explicitly rejects mixed HELP/API with MIXED_HELP_AND_API and zero external calls. Local guidance/version selection is separate from provider execution.
- Existing batch_worker.mjs: fixture/VM dispatcher 1–65 inspected; remaining long combined output was truncated. Harness injects Chrome storage/tabs and mocked fetch, loads exact service_worker/importScripts, persists assertion rows with fsync. No operator browser or real token is required.

## Next exact step
Read remaining provider wrapper, content manual execute/deliver path and popup controller. Reuse the proved VM route for red tests of local error report + durable operation + no network + correct owner. Add independent popup assertions derived from Ozon Work model, not previous WB UI. Then implement and checkpoint actual patch/runner/results together. No additional owner tests and no R1–R8 calls.

Runtime production changes: 0. New test executions: 0. Real provider calls: 0. Full P1–P9 acceptance remains open.
