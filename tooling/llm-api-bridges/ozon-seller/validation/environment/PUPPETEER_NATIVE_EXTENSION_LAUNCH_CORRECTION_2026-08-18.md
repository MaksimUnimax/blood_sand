# Ozon Bridge — native Puppeteer extension launch correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit.

## Evidence

Rerun 6 report commit:
`10af2e6938e60430c1feab30e1ecb4dd9ce6f687`

The exact candidate reconstructed correctly and blocks 01-14 passed again. Browser block failed before any browser behavior assertion. The validation harness had been manually spawning Chrome for Testing, connecting to its DevToolsActivePort, then calling Puppeteer runtime extension APIs. Even after switching worker discovery to the Puppeteer Extension API, the installed candidate extension worker was not obtained.

Official Puppeteer 25.4.0 extension documentation defines the runtime install path as a Puppeteer-launched browser with extension support enabled, followed by `browser.installExtension(path)`. Puppeteer troubleshooting also documents that extensions are disabled by default unless extension support is explicitly enabled.

## Superseding browser launch architecture

For the next authoritative validation run, supersede the manual Chrome `spawn()` + DevToolsActivePort + `puppeteer.connect()` fixture path.

Use the already-qualified exact environment versions and executable, but launch through Puppeteer itself:

```js
const browser = await puppeteer.launch({
  executablePath: exactCftExecutable,
  headless: false,
  enableExtensions: true,
  userDataDir: freshTemporaryProfile,
  args: [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--metrics-recording-only',
    '--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0'
  ]
});
```

Requirements:

- exact Node remains `v24.12.0`;
- exact Puppeteer remains `25.4.0`;
- exact Chrome for Testing remains `151.0.7922.47`;
- use the existing QA project's installed Puppeteer; do not install/update dependencies;
- use a fresh temporary user-data directory; never use the operator Chrome profile;
- `enableExtensions:true` is mandatory;
- do not add `--disable-extensions`;
- do not use `--load-extension` as a substitute for runtime `browser.installExtension()`;
- install the exact reconstructed candidate with `browser.installExtension(candidateDir)`;
- after install, require `browser.extensions()` to contain exactly the returned candidate extension id;
- log extension id/name/version/enabled/path before any worker wait so future environment failures are diagnosable;
- use `extension.workers()` as the primary candidate-worker discovery API;
- if no candidate worker is initially active, one `extension.triggerAction(page)` validation automation is allowed, then bounded polling of `extension.workers()`;
- if the extension cannot be enumerated after `installExtension()`, or no candidate worker can be obtained after the one bounded action wake, classify `ENVIRONMENT_ERROR` and stop without changing production.

## DevToolsActivePort corrections superseded

Because Puppeteer owns browser launch and connection in this architecture, the previous validation-only DevToolsActivePort helpers are no longer part of the authoritative browser path:

- `5e9bd081424903095df854807f309615f27e4450`
- `5dfe724341d9bd2080cd132eb99599269abc81bc`

They remain historical evidence only.

The following remain applicable where relevant:

- worker fixture correction `d9d62a44a812b555d23490acc042ac744a2e3c45`;
- Puppeteer Extension API worker-discovery semantics from `d9c42e2cbffca37fc84cd14f294d455e423da542`.

Do not use the failed synthetic ChatGPT or popup-only bootstraps as primary discovery mechanisms.

## Assertions remain unchanged

This correction changes only the validation browser launch/attachment mechanism.

Do not change or weaken:

- any production byte;
- candidate reconstruction or hashes;
- command/contract/security assertions;
- Seller capability/planner/quota/verifier/cache/common-batch assertions;
- 60000/5000/65000 timing semantics;
- existing quota countdown/browser behavior assertions;
- ChatGPT/Alice structural binding assertions;
- native Copy assertions;
- normal delivery one-Send/Microphone assertions;
- occupied/missing composer wait assertions;
- Manual OFF/ON narrow cancellation and quota/cache preservation assertions;
- provider/network counters;
- packaging/fresh-extraction requirements.

Hard counters remain:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`

If browser launch itself fails, classify `ENVIRONMENT_ERROR`. If the extension loads and browser assertions execute, any assertion failure must be classified according to actual evidence and must not be relabeled environment merely because earlier reruns had environment failures.