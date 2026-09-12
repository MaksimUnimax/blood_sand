# NEXT PATCH AUTHORITY — WB popup parity with Ozon reference

Date: 2026-09-12
Status: REQUIRED_FOR_NEXT_PATCH / DO_NOT_IMPLEMENT_DURING_CURRENT TEST PASS

## Operator decision

Before any next WB release, bring the Wildberries Bridge popup to functional/structural parity with the current Ozon Bridge popup, while keeping WB-specific wording and styling the page-injected WB button in Wildberries visual style.

Current test pass must continue first. Do not patch popup now; collect all installed defects, then apply them together in the next patch.

## Confirmed reference mismatch

Compared local packaged Ozon Bridge v0.1.19 popup with installed WB Bridge v0.2.1 popup.

Ozon reference has one authority for the page/manual button under `Работа с текущим диалогом`: Work Session controls own Start/Refresh/Show button/Finish. Its popup explicitly says: `Кнопка Ozon управляется только блоком «Работа с текущим диалогом» выше. Autorun остаётся отдельным режимом.`

WB v0.2.1 incorrectly exposes both:

1. Work Session control `work-toggle` (`Показать/скрыть`), and
2. a separate `manualMode` switch (`Ручной режим Wildberries`).

Those are duplicate operator controls for the same manual/page-button concept and must be reconciled to the Ozon reference model. The next patch must have one manual/page-button authority, not two competing controls.

## Required next-patch popup work

- Rebuild WB popup structure/functionality against the actual Ozon Bridge popup reference rather than the simplified WB popup.
- Keep WB-specific API wording and WB safety boundaries.
- Remove the duplicate manual-mode vs Work Session show/hide authority; Work Session must be the single owner of page-button visibility/manual-mode lifecycle, matching Ozon reference semantics.
- Match Ozon Work Session presentation/controls: `Начать работу / Отправить начальный prompt`, `Обновить`, `Показать кнопку` / hide counterpart, `Завершить работу`, plus coherent session meta.
- Bring AI adapter section, binding presentation and other shared popup controls to Ozon parity unless a WB-specific reason is documented to differ.
- Page-injected Wildberries button must be designed in Wildberries visual style, not copied with Ozon visual identity.
- Do not reintroduce Autorun as a production requirement; operator stated Autorun is not planned for production. Existing Autorun code may remain during current diagnostics, but the next production-oriented popup should not make it the primary operator path.
- Fix stale status synchronization seen in installed UI-06A: after Work Session successfully reaches `active_visible`, stale red `WORK_NOT_ACTIVE` banner must be cleared. UI must never simultaneously show active session and WORK_NOT_ACTIVE.

## Current installed evidence

UI-06A installed screenshot/result: Work Session state showed `active_visible` after Start, proving backend/session start occurred, while top status simultaneously remained `WORK_NOT_ACTIVE`. Classify as `FAIL_UI_STATE_SYNC`, not Work Session backend-start failure.

## Test-pass policy

Continue every planned installed test that can still yield useful evidence. Do not patch now. Mark tests that are invalidated purely by the known popup-authority design issue as deferred/superseded and move to the next independent test one at a time. After all planned tests, produce one consolidated patch covering popup parity plus every discovered defect.
