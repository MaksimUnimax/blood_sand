# Live Alice source trace — attachment transport authority

Date: 2026-09-11

Owner-provided saved page:

- source filename: `Правила форматирования ответов Ozon Bridge.html`
- saved URL: `https://alice.yandex.ru/chat/01a08b50-3c38-4000-a691-6fa5ee65b023/`
- page release: `release-v1.139.0-2026.09.09`
- source bytes: `1628833`
- SHA-256: `95c0e6ee75d0fcbdd23428f973d44f07b83d44e690b74229cc340e3681deeda7`

## Directly evidenced clean composer markers

- `textarea[data-testid="inputbase-textarea"]`
- controls root `data-testid="input-controls-root"`
- plus control `data-testid="InputControls-Plus-Button"`
- plus control `aria-label="Добавить файл"`
- plus control `aria-haspopup="dialog"`
- `.Standalone-FileOverlay`

## Directly evidenced first-party picker semantics

The saved Alice bundle creates a temporary file input, rather than exposing a persistent composer-local file input:

1. `document.createElement("input")`
2. `type = "file"`
3. `style.display = "none"`
4. `data-testid = "pick-file-input-element"`
5. append to `document.body`
6. call `input.click()` for the user picker
7. remove the temporary input after selection/cancel

Therefore a permanent `input[type=file]` adjacent to the composer is not accepted as Alice transport authority.

## Directly evidenced first-party drag/drop semantics

The saved Alice bundle installs capture listeners on `document.body` for:

- `dragenter`
- `dragover`
- `dragleave`
- `drop`

The drop path consumes `event.dataTransfer.files` and routes the files into Alice's input file store with ingress label `drag_and_drop`.

This is the authority for corrective Bridge strategy `drag_drop_v1`.

## Explicitly not proven by the clean snapshot

The saved page was captured without a newly attached corrective-test file. Therefore the exact post-drop chat attachment preview DOM, its final ready marker, and any upload-progress/error wrapper class remain **NOT PROVEN** by this snapshot.

Bridge readiness logic must remain conservative/fail-closed and final live certification must capture the actual attached-file DOM after installing the corrective ZIP.
