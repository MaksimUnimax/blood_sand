# Ozon Bridge — Windows CFT sandbox permission provisioning

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This correction authorizes no production edit and no functional gate execution.

## Evidence

Preflight4 report commit:
`959794ff00293f4621423649700098d225f67df2`

Preflight4 proved:

- exact candidate hashes were unchanged;
- Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`;
- native launch completed;
- actual Chrome spawn arguments exactly matched the already-proven minimal historical harness arguments;
- before/during `browser.installExtension(candidateDir)`, Chrome repeatedly logged GPU child-process exit code `-1073741790` (`0xC0000022`, Windows `STATUS_ACCESS_DENIED`), then terminated with `GPU process isn't usable. Goodbye.`;
- `Extensions.loadUnpacked` then failed only because the browser target closed.

The candidate extension did not reach an installation-success marker. No extension enumeration or worker assertion ran.

## Puppeteer 25.4.0 authority

The exact Puppeteer `25.4.0` source in `packages/browsers/src/install.ts` runs a Windows-specific post-install setup for Chrome:

- resolve the browser directory next to `chrome.exe`;
- if `setup.exe` exists, execute exactly:
  `setup.exe --configure-browser-in-directory=<browserDir>`;
- source comment: `On Windows for Chrome invoke setup.exe to configure sandboxes.`

The exact Puppeteer `25.4.0` troubleshooting documentation states that Chrome sandboxes on Windows require additional permissions on downloaded Chrome files and that Puppeteer attempts to configure them by running Chrome's `setup.exe` during browser installation.

Therefore the next environment check must verify/provision the exact CFT directory using Chrome/Puppeteer's own supported setup mechanism before changing any browser launch behavior.

## Authorized preflight-only provisioning

Use the exact existing CFT directory containing:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64\chrome.exe`

Let `browserDir = dirname(chrome.exe)`.

Before provisioning, record:

1. SHA-256 of `chrome.exe`;
2. existence/path/SHA-256 of `setup.exe` if present;
3. `icacls` output for `chrome.exe`, `chrome_elf.dll` if present, and `browserDir`;
4. whether the current process can stat/read/execute `chrome.exe` and `setup.exe`;
5. no candidate or production file may be changed.

If `setup.exe` is absent: STOP and classify `ENVIRONMENT_CFT_SETUP_TOOL_MISSING`. Do not improvise permissions and do not add sandbox-bypass flags.

If present, execute exactly once:

`setup.exe --configure-browser-in-directory=<browserDir>`

using the current validation user, `shell:false`, and capture exit status/stdout/stderr. Do not elevate privileges automatically. Do not use `--no-sandbox`, `--disable-gpu-sandbox`, or manual broad ACL grants as substitutes.

After setup returns, record the same ACL diagnostics again and verify SHA-256 of `chrome.exe` and `setup.exe` are byte-identical to pre-provision values. ACL metadata may change; executable bytes must not.

Then execute one environment preflight only, using the preflight4 exact minimal launch arguments and no `--disable-gpu`:

- launch exact CFT;
- verify actual spawn args still exactly match the preflight4 minimal list;
- call `browser.installExtension(candidateDir)` once;
- if successful, call `browser.extensions()` once and require returned extension ID to be present;
- query initial `extension.workers()` once; zero workers is allowed;
- do not wake the worker;
- do not run functional browser assertions;
- do not open synthetic ChatGPT/Alice pages;
- do not package.

## Hard safety rules

- production modifications: 0;
- candidate byte modifications: 0;
- real Ozon requests: 0;
- real Performance requests: 0;
- operator browser actions: 0;
- no dependency update/install;
- no browser version change;
- no retry after a failed preflight stage;
- no launch-flag experimentation.

If provisioning itself fails, preserve exact setup exit/output and ACL evidence and STOP. If Chrome still terminates with `STATUS_ACCESS_DENIED` after successful provisioning, classify that exact environment failure and do not alter production.