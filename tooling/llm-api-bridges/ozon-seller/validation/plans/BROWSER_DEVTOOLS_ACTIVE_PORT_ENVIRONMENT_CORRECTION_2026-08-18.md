# Ozon Bridge v0.1.19 — validation-only DevToolsActivePort environment correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

## Trigger

The consolidated pre-operator rerun report at commit:

`c0e1afaa3994d602d411f21989ec346f6451b30f`

classified the terminal failure as:

`ENVIRONMENT_ERROR`

The accepted Windows browser carry-forward harness failed before any browser assertion with:

`EBUSY: resource busy or locked, open '<temp>\\DevToolsActivePort'`

All blocks 1-14 had already passed in that authoritative run. No real Ozon/Performance requests occurred and production was not modified.

## Scope

This correction is validation-only. Production candidate bytes remain immutable:

- gate input checkpoint: `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- repair patch: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- reconstructed `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- reconstructed `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Do not modify production, browser semantics, assertions, extension install route, CFT version, Puppeteer version, user-data isolation, provider interception, or packaging rules.

## Authorized test-only correction

When materializing the pinned accepted browser carry-forward source blob:

`841429741d5ff9144a8a40506e657dc4392fe37c`

replace only its `waitForFile(DevToolsActivePort)` helper with behavior equivalent to:

1. keep the existing bounded overall timeout;
2. if the file does not yet exist, sleep briefly and retry;
3. if `fs.readFileSync(..., 'utf8')` succeeds and trimmed content is non-empty, return success;
4. if reading fails with one of these transient Windows file-lock/access codes, sleep briefly and retry within the same original bounded timeout:
   - `EBUSY`
   - `EPERM`
   - `EACCES`
   - `ENOENT`
5. any other filesystem error remains terminal and must be rethrown immediately;
6. timeout remains terminal and must include captured Chrome stderr as before;
7. after the helper succeeds, the harness must still parse both the port and websocket path from `DevToolsActivePort` and connect normally.

A concise acceptable implementation shape is:

```js
async function waitForFile(p, timeout = 10000) {
  const start = Date.now();
  const transient = new Set(['EBUSY', 'EPERM', 'EACCES', 'ENOENT']);
  while (Date.now() - start < timeout) {
    try {
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf8').trim();
        if (text) return text;
      }
    } catch (error) {
      if (!transient.has(String(error?.code || ''))) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`DevToolsActivePort timeout: ${stderr.slice(-1200)}`);
}
```

If this helper returns the text, reuse that returned text for parsing where practical to avoid an immediate second unlocked-then-locked read race. If the existing harness keeps a second read, that second read must receive the same bounded transient-lock handling rather than creating a new unbounded retry.

## Non-authorized changes

This correction does NOT authorize:

- increasing or removing the global browser assertion timeouts merely to get PASS;
- changing Chrome launch architecture;
- replacing `browser.installExtension()` with `--load-extension`;
- using the operator Chrome profile;
- changing extension permissions or production files;
- weakening browser assertions;
- skipping carry-forward browser tests;
- skipping the new composer-wait browser harness;
- retrying a failed functional browser assertion;
- turning any production/browser assertion failure into an environment PASS.

## Required classification

If `DevToolsActivePort` cannot be read before the existing bounded deadline even with the transient lock handling, report `ENVIRONMENT_ERROR` and stop.

If the browser starts and any behavioral assertion fails, classify according to the actual cause (`PRODUCTION_BEHAVIOR_FAILURE` or `HARNESS_FIXTURE_FAILURE`) rather than masking it as environment.

## Rerun requirement

Because the permanent handoff contract requires one complete consolidated gate, the next authoritative validation must reconstruct the exact candidate from scratch and rerun all applicable blocks 1-16 in one top-level execution. Prior PASS blocks are evidence but cannot be reused as the final umbrella PASS.
