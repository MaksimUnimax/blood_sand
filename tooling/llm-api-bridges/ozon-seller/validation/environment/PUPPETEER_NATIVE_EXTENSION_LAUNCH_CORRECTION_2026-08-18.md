# Ozon Bridge — native Puppeteer extension launch correction

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This document authorizes no production edit.

## Evidence

Rerun 6 report commit:
`10af2e6938e60430c1feab30e1ecb4dd9ce6f687`

The exact candidate reconstructed correctly and blocks 01-14 passed again. Browser block failed before any browser behavior assertion. The validation harness had been manually spawning Chrome for Testing, connecting to its DevToolsActivePort, then calling Puppeteer runtime extension APIs. Even after switching worker discovery to the Puppeteer Extension API, the installed candidate extension worker was not obtained.

## Official Puppeteer 25.4.0 facts that are now authority

The browser harness must follow Puppeteer 25.4.0's documented extension lifecycle instead of inferring it from target timing:

1. Runtime extension installation is documented as `puppeteer.launch({ enableExtensions: true })` followed by `browser.installExtension(path)`.
2. `enableExtensions:true` is the launch prerequisite that removes Puppeteer's default browser arguments which otherwise prevent extensions from being enabled.
3. `browser.extensions()` is the documented API for enumerating the runtime-installed extension.
4. For MV3, Puppeteer's own Chrome-extension guide also documents ordinary service-worker target discovery with `browser.waitForTarget(target => target.type() === 'service_worker' && ...)` when the extension has been launched with extension support enabled.
5. `Extension.workers()` is a valid additional extension-scoped API, but failure of earlier `workers()`/target discovery runs must not be treated as evidence about production when the browser itself was not launched through the documented extension-enabled path.

Therefore the root environment correction is the launch architecture. Do not keep changing worker-wake strategies or increasing timeouts before first proving that the extension is actually installed/enabled in a Puppeteer-launched browser.

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
- immediately enumerate `browser.extensions()` and require the returned extension id to exist, be enabled, and report the expected version/path before any service-worker wait;
- emit deterministic extension id/name/version/enabled/path diagnostics before any worker discovery;
- only after extension enumeration succeeds may the harness discover the MV3 worker using either the documented `browser.waitForTarget(...service_worker...)` route scoped to the returned extension id/URL or `extension.workers()`;
- worker discovery must remain bounded, but do not compensate for failed extension enablement by timeout inflation;
- do not add synthetic ChatGPT/popup/action wake hacks unless a separately demonstrated MV3 lifecycle requirement makes one necessary after successful extension enumeration;
- if enumeration fails after `installExtension()`, classify `ENVIRONMENT_ERROR` immediately with diagnostics; do not wait for a worker and do not modify production.

## DevToolsActivePort corrections superseded

Because Puppeteer owns browser launch and connection in this architecture, the previous validation-only DevToolsActivePort helpers are no longer part of the authoritative browser path:

- `5e9bd081424903095df854807f309615f27e4450`
- `5dfe724341d9bd2080cd132eb99599269abc81bc`

They remain historical evidence only.

The worker fixture correction `d9d62a44a812b555d23490acc042ac744a2e3c45` remains applicable to the non-browser quota harness.

The earlier synthetic ChatGPT, popup-only, and action-wake attempts remain historical failed environment experiments and are not primary discovery mechanisms in the authoritative path.

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

If browser launch itself fails, classify `ENVIRONMENT_ERROR`. If extension enumeration fails after a documented extension-enabled launch, preserve launch/extension diagnostics and classify the environment failure without changing production. If the extension loads and browser assertions execute, any assertion failure must be classified according to actual evidence and must not be relabeled environment merely because earlier reruns had environment failures.
