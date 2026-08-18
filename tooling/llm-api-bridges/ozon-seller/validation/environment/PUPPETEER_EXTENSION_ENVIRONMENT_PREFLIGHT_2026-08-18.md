# Ozon Bridge — staged Puppeteer extension environment preflight

Date: 2026-08-18
Status: `VALIDATION_ENVIRONMENT_PREFLIGHT_ONLY`

This is NOT a production test, NOT a full gate, and NOT operator handoff acceptance.
Production candidate bytes must not be modified.

## Why this preflight exists

RERUN7 report commit:
`02b6612941c4dc2aacbabbe849854b0bbdbb978c`

RERUN7 correctly used the native Puppeteer launch contract (`enableExtensions:true`), but its report emitted no browser-stage stdout before a generic 30s timeout. Therefore the evidence does NOT identify whether the timeout occurred in:

- `puppeteer.launch()`;
- `browser.installExtension()`;
- `browser.extensions()`;
- candidate extension lookup;
- service-worker discovery.

Do not classify a future timeout as a worker timeout unless the preceding stage markers prove launch/install/listing completed.

## Official Puppeteer 25.4.0 contract

Use the already-installed Puppeteer `25.4.0` and exact Chrome for Testing `151.0.7922.47`.

Runtime installation contract:

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

const extensionId = await browser.installExtension(candidateDir);
const extensions = await browser.extensions();
const extension = extensions.get(extensionId);
```

`enableExtensions:true` is mandatory. Do not use manual `spawn()+connect()`, `--load-extension`, the operator browser profile, dependency installation, or production modification.

## Preflight scope

Use the exact reconstructed candidate only as extension bytes; do NOT execute Manual/Autorun commands or provider behavior.

Expected candidate hashes remain:

- `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Hard counters:

- real Ozon requests: 0
- real Performance requests: 0
- operator browser actions: 0
- production modifications: 0

## Mandatory stage markers

Every async stage gets its OWN bounded timeout and markers immediately before and after it.
Never wrap the entire sequence in one anonymous 30s timeout.

Required order:

1. `ENV_PREFLIGHT_01_BEFORE_LAUNCH`
2. launch exact CFT via `puppeteer.launch(...)`
3. `ENV_PREFLIGHT_02_AFTER_LAUNCH`
   - print `browser.process()?.pid`
   - print `browser.version()`
4. `ENV_PREFLIGHT_03_BEFORE_INSTALL_EXTENSION`
5. `browser.installExtension(candidateDir)`
6. `ENV_PREFLIGHT_04_AFTER_INSTALL_EXTENSION id=<id>`
7. `ENV_PREFLIGHT_05_BEFORE_LIST_EXTENSIONS`
8. `browser.extensions()`
9. `ENV_PREFLIGHT_06_AFTER_LIST_EXTENSIONS count=<n>`
   - print each id/name/version/enabled/path
10. require `extensions.get(extensionId)`
11. `ENV_PREFLIGHT_07_CANDIDATE_ENUMERATED`
12. print `browser.targets()` types/URLs immediately; no wait yet
13. `ENV_PREFLIGHT_08_BEFORE_INITIAL_WORKERS`
14. call `extension.workers()` once
15. `ENV_PREFLIGHT_09_AFTER_INITIAL_WORKERS count=<n>` and URLs
16. If candidate worker already exists: emit `ENV_PREFLIGHT_11_WORKER_AVAILABLE`.
17. If worker list is empty, do NOT invent repeated wake strategies. Use exactly one official MV3/background-context observation path:
    - create one inert `about:blank` page;
    - emit `ENV_PREFLIGHT_10_BEFORE_ACTION_WAKE`;
    - call `page.triggerExtensionAction(extension)` exactly once (or `extension.triggerAction(page)` if that is the actual exposed 25.4.0 API in the installed package; introspect method presence and print which method is used);
    - then bounded-poll BOTH `extension.workers()` and `browser.targets()` for a candidate `service_worker` target whose URL starts `chrome-extension://<extensionId>/`;
    - emit `ENV_PREFLIGHT_11_WORKER_AVAILABLE` with worker/target URL when obtained.
18. close browser cleanly and remove only the temporary profile.
19. emit `PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT_PASS` only if stages 1-18 complete.

## Stage timeout rule

Use a separate reasonable bounded timeout per stage (for example 20s launch, 20s install, 10s list, 20s worker observation). The point is diagnostic isolation, not extending one opaque timeout.

On timeout/error, print:

- last completed stage marker;
- operation name that failed;
- exact error name/message/stack;
- browser process exit code/signal if available;
- browser target inventory if browser exists;
- extension inventory if listing already succeeded.

Then STOP. Do not retry that stage in the same preflight and do not alter production.

## Result classification

Allowed results:

- `PUPPETEER_EXTENSION_ENVIRONMENT_PREFLIGHT_PASS`
- `ENVIRONMENT_LAUNCH_FAILURE`
- `ENVIRONMENT_INSTALL_EXTENSION_FAILURE`
- `ENVIRONMENT_EXTENSION_ENUMERATION_FAILURE`
- `ENVIRONMENT_WORKER_DISCOVERY_FAILURE`
- another exact environment classification supported by evidence

A worker classification is forbidden unless `ENV_PREFLIGHT_07_CANDIDATE_ENUMERATED` was already emitted.

## After PASS

Only after this preflight PASS may another complete pre-operator 01-16 Codex gate be dispatched. The full gate must use the exact same qualified launch/install/discovery architecture proven by this preflight.