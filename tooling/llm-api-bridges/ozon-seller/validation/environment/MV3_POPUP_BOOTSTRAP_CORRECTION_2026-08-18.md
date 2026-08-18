# Ozon Bridge v0.1.19 — validation-only MV3 popup bootstrap correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

## Trigger

Rerun 4 report commit:
`c24470526dfafb932d5259c5a178a0f010b32648`

The accepted Windows CFT/Puppeteer route successfully reached `browser.installExtension()` and the prior DevToolsActivePort corrections were no longer the failing point. The remaining failure was a timeout waiting for the MV3 service-worker target before any browser behavior assertion.

The prior synthetic `https://chatgpt.com` wake page did not deterministically start the installed extension service worker in this CFT route. Do not keep increasing that timeout and do not keep adding synthetic web-page retries.

## Production status

No production change is authorized by this correction.

Immutable candidate remains:
- worker SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- content SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- inventory `17`
- protected other `15` files byte-identical

The package contains the protected production files `popup.html` and `popup.js`; they are part of the frozen 17-file inventory and are not changed by the composer-wait repair.

## Authorized bootstrap

After `browser.installExtension(candidateDir)` returns the installed extension id:

1. First check whether a matching `service_worker` target already exists. If yes, use it and do not open the popup bootstrap.
2. If not, create one temporary Puppeteer page and navigate exactly to:
   `chrome-extension://<installed-extension-id>/popup.html`
3. Do not click anything in the popup.
4. Do not type into anything in the popup.
5. Do not change Manual/Autorun/settings/credentials.
6. Do not inject script into popup production code.
7. Allow normal `popup.js` initialization to run. This is an extension-origin lifecycle bootstrap, not an operator action.
8. Wait within one bounded timeout for the matching `service_worker` target:
   - target type must be `service_worker`;
   - target URL must start with `chrome-extension://<installed-extension-id>/`.
9. Once the worker target is acquired, close only the temporary bootstrap popup page and continue the existing browser assertions unchanged.
10. Emit `MV3_SERVICE_WORKER_POPUP_BOOTSTRAP_PASS` only after the matching worker target is acquired.

If popup navigation itself fails, popup initializes with a terminal extension/runtime error, or the matching worker target still does not appear within the bounded timeout, classify `ENVIRONMENT_ERROR` and stop the consolidated gate. Do not change production to compensate.

## Safety

This bootstrap must preserve:
- `OPERATOR_BROWSER_ACTIONS=0`;
- real Ozon requests `0`;
- real Performance requests `0`;
- production modifications `0`.

Opening the extension's own popup page without user interaction is a validation environment bootstrap and is not a substitute for any browser behavior assertion.

## Forbidden alternatives

Do not:
- increase timeouts repeatedly without a lifecycle change;
- use the operator Chrome profile;
- load unpacked extension through a different mechanism;
- replace `browser.installExtension()`;
- call provider APIs;
- seed credentials;
- click popup controls;
- weaken or skip browser assertions;
- mark block 15 PASS merely because the worker was bootstrapped.

All original browser/runtime assertions still have to execute and pass after bootstrap.