# VK chat date-picker inline keyboard policy

Status: `STAGING_PROBE_REQUIRED` before release.

The live historical owner event at 07:50 reached `WAITING_DATE/YEAR_RANGE`,
but VK `messages.send` rejected its oversized keyboard with error `911`
(`Keyboard format is invalid`).  The outbox correctly classified it terminal;
the application builder was the defect.

The application policy is `VK_INLINE_MAX_BUTTONS = 10`, pending the required
direct transport-only staging boundary capture: 10 ordinary text buttons must
be accepted and 11 must return error 911.  If the factual boundary differs,
this policy and release are blocked for revision.

- `ERROR_911 = KEYBOARD_FORMAT_INVALID`
- `CHAT_DATE_PICKER_PAGINATED = yes`
- `LARGE_INLINE_KEYBOARDS = forbidden`
- `MINIAPP_DATE_PICKER_ACTIVE = no`

Every active date-picker keyboard is inline, `one_time=false`, ordinary text
payload transport only, and locally validated before outbox persistence.
Year ranges are paginated (modern decades first), months are split January–June
and July–December, and days use bands followed by at most ten exact days.  The
31st is a direct completion action, preventing an eleven-button exact-day row.
