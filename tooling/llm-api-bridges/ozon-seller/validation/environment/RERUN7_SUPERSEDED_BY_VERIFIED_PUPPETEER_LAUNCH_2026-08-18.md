# Rerun7 superseded after Puppeteer 25.4.0 API verification

Date: 2026-08-18
Status: `RERUN7_DO_NOT_DISPATCH`

Do not dispatch or accept the previously prepared rerun7 plan at commit `02d60d9502b284772a966badb0a78bdab9f98531`.

Reason: the earlier validation loop changed worker-discovery/wake behavior before first proving the documented browser launch prerequisite for runtime extension installation.

Official Puppeteer 25.4.0 authority now used by this project:

- runtime `browser.installExtension(path)` requires a Puppeteer-launched browser with `enableExtensions:true`;
- Puppeteer otherwise passes default browser arguments that can disable extensions;
- after `installExtension`, `browser.extensions()` must first prove that the returned extension id exists and is enabled;
- only after that proof may MV3 service-worker discovery begin;
- Puppeteer's Chrome-extension guide supports MV3 service-worker discovery with `browser.waitForTarget(... service_worker ...)` when extensions were enabled at launch;
- do not add synthetic ChatGPT wake, popup-only wake, action-trigger wake, or timeout inflation to compensate for an extension that was never proved enabled.

Production candidate remains immutable:
- worker SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- content SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Blocks 01-14 from prior failed full-gate executions are evidence only; no operator handoff is authorized. A new full-gate dispatch must be prepared from the verified launch architecture and must still run blocks 01-16 once from scratch.