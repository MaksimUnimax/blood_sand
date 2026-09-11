# Alice live attachment transport — failure authority

Date: 2026-09-11
Branch: `repair/ozon-alice-drag-drop-transport-2026-09-11`
Baseline branch: `repair/ozon-alice-large-result-document-delivery-2026-09-10`
Baseline HEAD: `afb88b9d3a6227a0bdca0753ba3fb2af8a6d66ad`

## Authorization

Owner explicitly authorized the corrective patch in chat: `делай патч ... и правила патча не нарушай`.

## Historical package status

The previous deterministic package remains preserved as historical evidence. Its deterministic pre-handoff gate passed, but the installed live Alice flow failed before attachment mutation with:

`Target AI file-input attachment surface is unavailable.`

Therefore the previous Alice attachment implementation is superseded for live use.

## Proven root defect

Current Bridge code models Alice as `attachment_strategy = file_input_v1` and requires `attachmentSurface().input` before `OZ_ATTACHMENT_COMMIT`.

Owner-provided live Alice HTML snapshot (release `release-v1.139.0-2026.09.09`) proves a different first-party model:

- composer textarea: `data-testid="inputbase-textarea"`;
- plus control: `data-testid="InputControls-Plus-Button"`, `aria-label="Добавить файл"`;
- picker helper creates a temporary `input[type=file]`, sets `data-testid="pick-file-input-element"`, appends it to `document.body`, calls `click()`, then removes it after selection/cancel;
- first-party file-drop code installs capture listeners on `body` for `dragenter`, `dragover`, `dragleave`, and `drop`;
- its `onDrop` passes the dropped files to `inputFilesStore.addFiles(..., "drag_and_drop")`.

Thus a persistent composer-local file input is not the live Alice transport contract.

## Patch boundary

This corrective patch is restricted to Alice post-result attachment transport and intersecting shared abstractions/tests.

Before any production executable change:

1. run a transport-only browser probe using the proven Alice DOM markers and the proven body-level `DataTransfer` drop contract;
2. provider calls = 0;
3. no Ozon request, auth, entitlement, command-envelope, pagination, retry, or business-operation change;
4. if the transport probe fails, production repair is blocked.

Live attachment rendering/readiness remains a separate post-install verification boundary unless it can be deterministically derived from captured live DOM evidence.
