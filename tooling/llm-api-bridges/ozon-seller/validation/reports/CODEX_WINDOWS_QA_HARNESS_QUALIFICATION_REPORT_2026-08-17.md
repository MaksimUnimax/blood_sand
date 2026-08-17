# Codex Windows QA Harness Qualification Report

## Identity

- Date/time: 2026-08-17 16:09:36 +05:00
- Timezone: Asia/Qyzylorda
- Windows: Microsoft Windows 11 Home Single Language, version 10.0.26200, build 26200, x64
- ChatGPT/Codex desktop app version: UNKNOWN (not exposed reliably)
- PowerShell: 7.6.4
- Git: 2.40.1.windows.1
- Node: v24.12.0
- npm: 11.6.2
- Repository: `MaksimUnimax/blood_sand`
- Branch: `work/ozon-data-collection-2026-08-11`
- Exact tested HEAD: `7fe723f43a7c1355cea724e124c380286c1f1fe3`
- `dee546afdbf72a4232ae948152e4431e52a8b81f` ancestor: YES
- `7fe723f43a7c1355cea724e124c380286c1f1fe3` ancestor: YES

## Capability Matrix

| Capability | Status | Evidence |
|---|---|---|
| LOCAL_WORKSPACE_READ_WRITE | PASS | Workspace write test passed; disposable files created under `D:\codex\Test\qa-harness` |
| REPOSITORY_CLONE_FETCH_CHECKOUT | PASS | Clone, fetch, branch checkout, clean status, and ancestry checks succeeded |
| GITHUB_PUSH_AUTHENTICATION | PASS | `git push --dry-run` accepted creation of validation branch |
| IN_APP_BROWSER_NAVIGATION | PASS | In-app browser opened `http://127.0.0.1:8765/` and saw `CODEX_LOCAL_SITE_READY` |
| IN_APP_BROWSER_FULL_CDP | PASS | CDP Runtime, Log, and Network domains enabled; Runtime.evaluate returned URL/title/marker |
| REAL_CHROME_CONTROL | NOT_AVAILABLE | Chrome browser selector unavailable; Chrome Extension Lab MCP returned UNAVAILABLE (SSE 404) |
| REAL_CHROME_FULL_CDP | NOT_AVAILABLE | No real Chrome control surface was available |
| CHROME_EXTENSIONS_PAGE_ACCESS | NOT_AVAILABLE | Real Chrome was unavailable; `chrome://extensions/` was not tested |
| UNPACKED_EXTENSION_LOAD | MANUAL_BOUNDARY | Could not reach real Chrome extension-management UI |
| UNPACKED_EXTENSION_RELOAD | MANUAL_BOUNDARY | Same-extension Reload could not be attempted without real Chrome |
| CONTENT_SCRIPT_CONSOLE_INSPECTION | NOT_AVAILABLE | Synthetic extension was not loaded in a browser |
| EXTENSION_SERVICE_WORKER_INSPECTION | NOT_AVAILABLE | Synthetic extension was not loaded in a browser |
| REAL_CHROME_MULTITAB_CONTROL | NOT_AVAILABLE | Real Chrome was unavailable |

## Evidence

### Repository

```text
git status --short --branch
## work/ozon-data-collection-2026-08-11...origin/work/ozon-data-collection-2026-08-11

git rev-parse HEAD
7fe723f43a7c1355cea724e124c380286c1f1fe3
```

The working tree was clean. Production source was not changed.

### Synthetic MV3 harness

Created only under `D:\codex\Test\qa-harness\mv3-reload-test`:

- `manifest.json`
- `content.js`
- `service_worker.js`

The local site was served only on `127.0.0.1:8765`; PowerShell verification returned HTTP 200 and `CODEX_LOCAL_SITE_READY`. Node syntax checks passed for both JavaScript files.

V1 SHA-256:

```text
manifest.json     0BA059126E101A8698BDCA27C9CD3B1391F8E70385F3D470FEA41D599CA6B05D
content.js        7E7ECFE1C7CFE8EB84946493DE5E814C4638F0EF487E80F928CBAF6DECEB0976
service_worker.js F34305F1D6159F0396FEA9DF7192978975124F6A366617365C4E66DCB53B4AF9
```

V2 SHA-256 after editing only the disposable harness:

```text
manifest.json     0BA059126E101A8698BDCA27C9CD3B1391F8E70385F3D470FEA41D599CA6B05D
content.js        B772DA061F67D398A8E5E6E95E89561A08577A76160F276E1950B7698A7DF8A7
service_worker.js DAA9C757554C7EC43CE8FA04BD158B4C8E7960E34C9F7F019507DA1D2DD86824
```

The V1-to-V2 source edit and syntax checks succeeded. Browser execution markers for the extension were not claimed because no real Chrome extension load occurred.

### In-app browser/CDP

Observed exact page marker: `CODEX_LOCAL_SITE_READY`.

Returned page state:

```json
{"url":"http://127.0.0.1:8765/","title":"Codex Local Site","marker":true}
```

CDP `Runtime.evaluate` worked. `Runtime.enable`, `Log.enable`, and `Network.enable` worked. No console events were expected from the plain local page.

### Chrome integration

The real Chrome selector reported unavailable. The separately exposed Chrome Extension Lab capability probe returned `UNAVAILABLE` because its MCP SSE endpoint returned HTTP 404. Therefore no claims are made for `chrome://extensions`, Load unpacked, extension Reload, service-worker inspection, or real-Chrome multitabs.

## Manual Boundaries

- A working real-Chrome integration/permission surface must be made available before Chrome extension management can be automated.
- With the current session state, an operator would have to perform or provide the real-Chrome extension-management actions manually; this qualification did not execute them.
- No passwords, tokens, cookies, API keys, Ozon credentials, or Ozon API requests were used.

## Key Question

**NO_EXTENSION_MANAGEMENT_BLOCKED**

The fixed-directory source edit and V2 verification were prepared locally, but Codex could not reach a real Chrome extension-management surface. The critical same-extension Reload workflow therefore remains unproven and blocked.

## Final Verdict

**QA_HARNESS_PARTIALLY_QUALIFIED**

Local workspace, Git, Node/npm, repository checkout, loopback site, in-app browser, and in-app CDP are qualified. Real Chrome extension management is not qualified in this session because the real Chrome integration was unavailable.

## Cleanup

- Loopback HTTP server stopped (PID 10140).
- No extension was installed, so no extension removal was needed.
- `D:\codex\Test\qa-harness` and `D:\codex\Test\CODEX_WORKSPACE_WRITE_TEST.txt` were retained.
- No production Ozon Bridge files were changed.
