# UI-06A — installed WB 0.2.1 Work Session Start

Date: 2026-09-12
Status: FAIL_UI_STATE_SYNC / BACKEND_SESSION_START_OBSERVED

Operator screenshot after pressing Start Work Session showed:
- Work Session state: `active_visible`, so session start/state transition occurred.
- Top red status simultaneously remained `WORK_NOT_ACTIVE: WORK_NOT_ACTIVE`.

This is a real UI consistency defect. The installed popup must not show active session and WORK_NOT_ACTIVE simultaneously. Classify as stale status/banner synchronization defect, not as failure of the underlying session-start transition.

No patch is applied during the current installed test pass. This defect is included in NEXT_PATCH_POPUP_PARITY_AUTHORITY_2026-09-12.md along with the larger popup-parity redesign.
