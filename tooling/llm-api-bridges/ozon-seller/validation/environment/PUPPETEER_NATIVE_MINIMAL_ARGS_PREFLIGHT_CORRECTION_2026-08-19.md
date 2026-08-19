# Ozon Bridge — native Puppeteer minimal-args environment correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit and no functional full-gate execution by itself.

## Evidence

Preflight2 report commit:
`f830003051a454ea5ee94a786351fb0f2771a44b`

Preflight3 report commit:
`bda57d53410a11373bfe41dbc89ed9adb0e3e745`

Historical browser carry-forward source blob:
`841429741d5ff9144a8a40506e657dc4392fe37c`

The historical source launched the same qualified Chrome for Testing by direct Node `spawn()` with a deliberately small argument set, successfully connected Puppeteer, successfully returned from `browser.installExtension(candidateDir)`, and only then waited for the candidate service-worker target. Therefore that exact minimal Chrome argument surface is already evidence that runtime extension installation can be reached in this Windows QA environment.

By contrast, the native `puppeteer.launch()` preflights used Puppeteer's default Chrome arguments. Preflight2 launched but Chrome later terminated while `Extensions.loadUnpacked` was pending; preflight3 added `--disable-gpu` and Chrome terminated before `launch()` completed. Both showed repeated GPU-process exits with Windows status `-1073741790` and Chrome fatal `GPU process isn't usable. Goodbye.`

The `--disable-gpu` experiment is superseded and must not be retained.

## Authorized preflight architecture

Keep Puppeteer ownership of process lifecycle, but suppress Puppeteer's default Chrome arguments and pass only the exact historical minimal argument set already used by the browser carry-forward harness.

Use Puppeteer 25.4.0:

```js
const browser = await puppeteer.launch({
  executablePath: exactCftExecutable,
  headless: false,
  enableExtensions: true,
  ignoreDefaultArgs: true,
  waitForInitialPage: false,
  dumpio: true,
  timeout: 20000,
  args: [
    `--user-data-dir=${freshTemporaryProfile}`,
    '--remote-debugging-port=0',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--metrics-recording-only',
    '--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0',
    'about:blank'
  ]
});
```

Requirements:

- exact Node remains `v24.12.0`;
- exact Puppeteer remains `25.4.0` from the existing QA project;
- exact CFT remains `151.0.7922.47`;
- `ignoreDefaultArgs:true` is mandatory for this environment preflight;
- do not add `--disable-gpu`;
- do not add `--no-sandbox`, `--disable-gpu-sandbox`, crash-limit bypasses, software-rasterizer switches, or any other Chrome switch;
- do not use operator Chrome profile;
- do not install/update dependencies;
- before extension installation, inspect `browser.process().spawnargs` (or equivalent actual spawned command line) and require the Chrome arguments, after the executable, to match the authorized set above exactly;
- any Puppeteer-injected or wrapper-injected extra Chrome switch is a preflight failure, not permission to broaden the argument set.

## Staged environment test only

After exact launch-argument verification:

1. call `browser.installExtension(candidateDir)` once;
2. require it to return an extension id;
3. call `browser.extensions()` once;
4. require the returned candidate id to be enumerable;
5. call `extension.workers()` once;
6. record the initial worker count and URLs.

A zero initial worker count is allowed and is not a failure of this environment preflight. Do not wake the worker, trigger the action, open popup, create ChatGPT/Alice fixtures, or execute production behavior assertions.

Each async operation must have a marker immediately before and after it and a bounded timeout. On failure, capture exact error plus Chrome dumpio tail and stop without retry.

## Why this is not assertion weakening

This preflight changes no production bytes and does not claim functional acceptance. It only isolates the browser launch/runtime-install environment using a Chrome argument set already proven to reach `browser.installExtension()` in the historical accepted browser harness.

Hard counters remain:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`

Only after this environment preflight passes may a later authority prepare one new consolidated full gate 01–16.