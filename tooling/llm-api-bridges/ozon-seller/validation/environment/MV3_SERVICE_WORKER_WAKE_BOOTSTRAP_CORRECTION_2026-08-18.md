# Ozon Bridge — validation-only MV3 service-worker wake bootstrap correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

## Triggering evidence

Full-gate rerun-3 report commit:
`99d8ac14383f548048a8a9ffdc92764848d1f238`

The exact production candidate reconstructed successfully and blocks 01-14 passed. Block 15 failed before browser assertions with Puppeteer `TimeoutError` while waiting 10000 ms for a `service_worker` target after `browser.installExtension(candidateDir)`.

The failure occurred after DevToolsActivePort was read successfully and Puppeteer was connected. No provider request, operator action, or production modification occurred.

## Classification

`ENVIRONMENT_ERROR` / validation bootstrap limitation.

Chrome MV3 service workers are event-driven and may remain stopped after installation until extension activity wakes them. `browser.installExtension()` returning an extension ID is not itself a behavioral requirement that the service-worker target must immediately remain alive.

The gate needs the service-worker CDP target only so the harness can seed synthetic storage, observe extension network activity, and execute existing browser assertions. It must therefore wake the worker through a normal extension event instead of assuming installation alone creates a target.

## Authorized temporary harness correction

Production is immutable.

After:

```js
const extensionId = await browser.installExtension(candidateDir);
```

perform this bounded bootstrap before the existing service-worker `waitForTarget` assertion:

1. First check `browser.targets()` for an already-live target where:
   - `target.type() === 'service_worker'`
   - URL starts with `chrome-extension://${extensionId}/`.
2. If such a target exists, use it immediately. Do not create a wake page.
3. If absent, create one temporary Puppeteer page owned only by the validation harness.
4. Enable request interception on that page before navigation.
5. Navigate the page to a synthetic supported ChatGPT conversation URL such as:
   `https://chatgpt.com/c/00000000-0000-4000-8000-000000000001`
6. Intercept that exact top-level navigation and respond locally with minimal inert HTML containing the matching canonical conversation URL. Abort every other request from that bootstrap page.
7. The installed production content script is expected to initialize on the supported origin and send its normal runtime synchronization message, which is a legitimate MV3 wake event.
8. Wait, within the existing browser-environment bound, for the extension service-worker target.
9. As soon as the target is acquired, close the temporary wake page.
10. Continue the existing browser harness unchanged from service-worker CDP attachment onward.

The bootstrap page is test infrastructure, not an operator action. Record/retain:

`OPERATOR_BROWSER_ACTIONS=0`

## Forbidden changes

Do NOT:

- edit any production file;
- change the candidate SHA or production hashes;
- use a popup click or simulated operator action to wake the worker;
- use the operator Chrome profile;
- add credentials;
- make any real Seller/Performance request;
- replace `browser.installExtension()` with `--load-extension`;
- weaken any browser behavior assertion;
- treat inability of install-alone to expose a worker target as a production failure;
- keep the bootstrap page alive after the worker target is acquired;
- allow bootstrap-page network beyond the locally fulfilled top-level synthetic document.

## Required environment assertion

The temporary runner must emit, before the original browser assertions:

`MV3_SERVICE_WORKER_WAKE_BOOTSTRAP_PASS`

only after:

- extension installation returned an ID;
- an extension service-worker target was acquired either immediately or after the bounded synthetic content-script wake;
- the bootstrap caused zero provider requests;
- the bootstrap required zero operator actions.

This correction is validation-only and must not alter production or the permanent product behavior contract.