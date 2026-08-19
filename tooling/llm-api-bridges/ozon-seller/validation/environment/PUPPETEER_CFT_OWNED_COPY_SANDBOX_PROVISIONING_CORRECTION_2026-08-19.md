# Ozon Bridge — CFT owned-copy AppContainer provisioning correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

Production candidate remains immutable. This authorizes no production edit, no browser replacement, no manual ACL grant, no sandbox bypass, and no full functional gate.

## Evidence

Preflight5 report commit:
`0cd007fad80de450848f9c2e2cfaef08072d2d2b`

The exact CFT `151.0.7922.47` setup program was present and invoked exactly as Puppeteer 25.4.0 does on Windows:

`setup.exe --configure-browser-in-directory=<browserDir>`

It returned exit code `79`. Chromium defines:

- `78 = CONFIGURE_APP_CONTAINER_SANDBOX_SUCCESS`
- `79 = CONFIGURE_APP_CONTAINER_SANDBOX_FAILED`

The Chromium implementation of `--configure-browser-in-directory` calls `ConfigureAppContainerSandbox()`. That function grants the Chrome and LPAC install-files capability SIDs read/execute access on the browser directory. `GrantAccessToPath()` writes the DACL by opening the target with `WRITE_DAC`.

Preflight5 captured the two expected capability SIDs already present as inherited ACEs. The validation identity was `hp\\codexsandboxoffline`; its visible group grants on the existing QA browser tree were `M`, while Administrators and SYSTEM had `F`. The setup invocation did not change the captured ACLs and returned `79`.

This is sufficient to stop mutating or re-running setup against the shared QA browser directory. It is not sufficient to authorize a manual ACL grant.

## Authorized environment materialization

For the next environment-only preflight:

1. Keep the source CFT tree immutable at:
   `D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64`
2. Enumerate every regular file in that source tree and record relative path, size, and SHA-256.
3. Create a fresh validation-owned temporary browser directory as the current process identity. Do not copy source ACLs intentionally.
4. Byte-copy the entire CFT browser tree into that fresh directory.
5. Re-enumerate every regular file and require identical relative-path set, sizes, and SHA-256s before any setup call.
6. Record owner and ACL of the new browser root, `chrome.exe`, `chrome_elf.dll`, and `setup.exe`.
7. Run the copied `setup.exe` exactly once with:
   `--configure-browser-in-directory=<copiedBrowserDir>`
   using `shell:false`, no elevation, and no extra setup switches.
8. Treat setup exit code `78` as the required Chromium success status. `0` is not the expected success status for this non-install operation. Any other code is failure.
9. Re-enumerate every regular file after setup and require the complete relative-path/size/SHA-256 inventory to remain byte-identical to the source CFT tree.
10. Capture post-setup owner/ACL for the same paths and require the two Chromium install-files capability SIDs to have read/execute inheritance on the copied browser root.
11. Only if steps 1-10 pass, launch the copied `chrome.exe` with the already-qualified minimal browser arguments and Puppeteer 25.4.0. Do not add `--disable-gpu`, `--no-sandbox`, or any new Chrome flag.
12. Require launch success and exact actual spawn-argument match.
13. Call `browser.installExtension(candidateDir)` once.
14. If install succeeds, call `browser.extensions()` and require the returned candidate extension id to enumerate.
15. Observe `extension.workers()` once. Zero active workers is allowed and is not a failure in this environment preflight. Do not wake the worker.
16. Close browser and remove only the temporary copied browser/profile trees.

## Safety / invariants

- production modifications: 0
- candidate modifications: 0
- source CFT modifications: 0
- real Ozon requests: 0
- real Performance requests: 0
- operator browser actions: 0
- dependency installs/updates: 0
- manual `icacls /grant`: forbidden
- elevation: forbidden
- `--no-sandbox`: forbidden
- `--disable-gpu`: forbidden
- functional 01-16 gate: forbidden in this preflight

A PASS here qualifies only the browser environment/materialization route. It does not constitute production behavior acceptance or operator handoff acceptance.