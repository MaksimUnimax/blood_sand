# P1 executable comparison and test boundary
Date: 2026-09-12
Baseline for this block: initial-errors WIP at INITIAL_ERRORS_CHECKPOINT.md; popup/native-button code still WB021.

Exact late Ozon source extracted from verified workflow package:
- content_script.js SHA256 fa1c0046a22a61be1b646460baf7bd0a8ce75238e1c85f9b78d028c7b516a5b9. Read 389–714 (structural binding, one Shadow host, extension-owned buttons, geometry, cleanup, global busy state, structural rescan).
- service_worker.js SHA256 64187be955e9946401dd65b8f323f111574ee5f55263fc53c9b9209da56b14b7. Read 825–1035 and 5305–5405 (pending Start, commit/readback, outcome, activation only after correlated response).
- Ozon content Start watcher and Send path read 1750–1828.
- popup.html full 1–81 SHA256 dffb5d7116eedec9a106c32e61220044cbceecfeb6ca4e3747002bef362c8bd9.

WB content read 543–768 and 1582–1614. WB getManualMode currently reads legacy mode map instead of Work; Work visibility message only renders a plaque and does not change manual acceptance. Show/Hide cannot resume inactive but still-bound context; popup has separate controllers. These are code defects, not matters for further owner discovery.

Immediate implementation: independent extension-owned WB action surface, keep native Copy untouched; one per structurally detected assistant block; no command-text scan for discovery; live raw text only after click; current owner/runtime and DOM membership checked; one global execution lock; stale callback cannot unlock newer owner; own Shadow host and controls removed on hide/finish; rescan handles replaced blocks and geometry updates. Work remains sole visibility authority; one popup controller renders matching Work/action/error state and explicit WB-only credential controls. Legacy Autorun entry UI removed, result auto-send retained as a different function.

Tests before/after: actual old decorateBinding must reproduce native Copy interception; late Ozon extracted functions are the behavioral oracle for own-button separation, geometry, no duplicate host/button and structural discovery. Browser tests must execute actions and assert counters/DOM, not just search code strings. Worker tests must prove one Work authority despite stale legacy boolean, hidden/inactive fail-closed, owner isolation and no provider calls on UI actions.

Start transaction dependencies remain P4/P7 and cannot be declared solved by HTML parity. Preserve Start durable intent -> commit -> one click -> acknowledged/unknown outcome -> correlated completed response; no immediate active_visible shortcut in a final build. Full transfer acceptance stays open.
