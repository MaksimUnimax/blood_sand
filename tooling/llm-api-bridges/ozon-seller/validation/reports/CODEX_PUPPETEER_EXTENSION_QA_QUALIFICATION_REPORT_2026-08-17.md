# Codex Puppeteer Extension QA Qualification Report

## Identity

- Date/time: 2026-08-17 16:43:53 +05:00
- Timezone: Asia/Qyzylorda
- Windows: Microsoft Windows 11 Home Single Language, version 10.0.26200, build 26200, x64
- PowerShell: 7.6.4
- Git: 2.40.1.windows.1
- Node: v24.12.0
- npm: 11.6.2
- Puppeteer: 25.4.0
- Chrome for Testing: 152.0.7977.42
- Chrome executable: `C:\Users\unyma\.cache\puppeteer\chrome\win64-152.0.7977.42\chrome-win64\chrome.exe`
- Repository: `MaksimUnimax/blood_sand`
- Branch: `work/ozon-data-collection-2026-08-11`
- Exact tested HEAD: `52371a8432939928185b0950d52f5f0aa852c392`
- Production status before: clean
- Production status after: clean

## Capability Matrix

| Capability | Status | Evidence |
|---|---|---|
| PUPPETEER_LOCAL_INSTALL | PASS | `npm ls puppeteer` reported `puppeteer@25.4.0` |
| CHROME_FOR_TESTING_LAUNCH | PARTIAL | Chrome for Testing launched headful with the dedicated profile; `puppeteer.launch()` itself hit a Windows Crashpad startup failure, so the harness used automated local `Start-Process` plus `puppeteer.connect()` |
| UNPACKED_EXTENSION_AUTOMATED_LOAD | PASS | Puppeteer inventory reported synthetic extension ID, name, version, and fixed source path |
| MV3_CONTENT_SCRIPT_V1 | PASS | V1 marker, dataset, and content console marker observed |
| MV3_SERVICE_WORKER_TARGET | PASS | `service_worker` target found and harmless evaluation returned `{ready:true}` |
| EXTENSION_REALM_INSPECTION | PASS | `page.extensionRealms()` returned matching origin and extension ID |
| PERSISTENT_QA_PROFILE | FAIL | `localStorage` persisted; `document.cookie` did not persist across clean restarts in this Windows environment |
| FIXED_PATH_SOURCE_CHANGE_RELAUNCH | PASS | Same extension directory and profile were relaunched after V1→V2 source edit; no ZIP or manual installation used |
| MV3_CONTENT_SCRIPT_V2 | PASS | V2 marker, dataset, and content console marker observed; V1 marker absent |
| EXTENSION_ID_STABILITY | PASS | V1 and V2 both used `jedjofmmofghjnpnaadkkogifhkeaefn` |
| PUPPETEER_MULTITAB | PASS | Separate tabs had independent URLs, titles, JS state, and extension markers |
| PUPPETEER_CONSOLE_CAPTURE | PASS | `CODEX_PUPPETEER_CONTENT_V1` and `CODEX_PUPPETEER_CONTENT_V2` captured |
| PUPPETEER_NETWORK_OBSERVATION | PASS | Request event observed for `http://127.0.0.1:8766/` |
| GITHUB_PUSH_AUTHENTICATION | PASS | Local Git push authentication was previously verified and is available |

## Evidence

### Repository and local harness

```text
HEAD: 52371a8432939928185b0950d52f5f0aa852c392
branch: work/ozon-data-collection-2026-08-11
git status --short: clean
```

The synthetic harness exists only under `D:\codex\Test\qa-harness\puppeteer-extension-qa`. The local site listened only on `127.0.0.1:8766` and returned HTTP 200 with `CODEX_PUPPETEER_LOCAL_SITE_READY`.

### V1 hashes

```text
manifest.json     DE2F5ADCDDF6A589DD0C8F83BA82C703D19E9CE1912C569C4084E8D76EB17602
content.js        6A731ABC03D32D7DFAA44E49840D89428B533618344963D8816374513202166A
service_worker.js 02AF5F409C1EFD3A338B5B8ECF8145F87A3089D896B0E4F607E89C69FAAAD33E
```

Observed V1:

- visible marker: `CODEX_PUPPETEER_MV3_V1`
- dataset: `v1`
- console: `CODEX_PUPPETEER_CONTENT_V1`
- service-worker target: `chrome-extension://jedjofmmofghjnpnaadkkogifhkeaefn/service_worker.js`
- service-worker harmless evaluation: `{ "ready": true }`

### V2 hashes

```text
manifest.json     DE2F5ADCDDF6A589DD0C8F83BA82C703D19E9CE1912C569C4084E8D76EB17602
content.js        ADF00530CE8BFBD592DD8539696DBAF2382788F1A7870DE6DBEC7DFE8B34A946
service_worker.js E41E0216E578BFAA6220FE6A700665DB3DB3ACCE55A987972428396DE1021F87
```

Observed V2 after relaunch from the same fixed directory:

- visible marker: `CODEX_PUPPETEER_MV3_V2`
- V1 marker absent: `true`
- dataset: `v2`
- console: `CODEX_PUPPETEER_CONTENT_V2`
- same extension ID: `jedjofmmofghjnpnaadkkogifhkeaefn`
- service-worker target remained present and evaluated successfully

### Persistence, tabs, console, and network

- Dedicated profile: `D:\codex\Test\qa-harness\puppeteer-extension-qa\browser-profile`
- `localStorage` value `codex_qa_storage=persist_v1` persisted across relaunch.
- `document.cookie` value `codex_qa_cookie=persist_v1` was present during a run but absent after restart; therefore the strict persistence result is FAIL.
- Three or more browser pages were visible to Puppeteer during runs; two test tabs independently returned the localhost URL/title and extension marker.
- Page console capture observed the exact V1 and V2 content-script markers.
- Network observation observed the document URL without logging request bodies, cookies, or headers.

The service-worker target was proven, but the exact startup console line was not claimed because MV3 service-worker startup logging can occur before the listener attaches.

### Launch note

Chrome for Testing was genuinely launched headful and controlled through Puppeteer 25.4.0. In this Windows session, direct `puppeteer.launch()` failed with `crash server failed to launch`; the reproducible automated workaround was a local PowerShell `Start-Process` of the downloaded Chrome for Testing executable followed by `puppeteer.connect()`. No operator action, ZIP, Chrome extension page, or user Chrome profile was used.

No Ozon credentials, real accounts, cookies from real sites, secrets, or Ozon API endpoints were used.

## Key Question

**PARTIAL_AUTOMATION**

Codex can automatically test each new revision from the same fixed unpacked directory in a real Chrome for Testing browser, including content scripts, MV3 service-worker target, DOM, console, network, and multitabs. The qualification is partial because the pure `puppeteer.launch()` path was blocked by the Windows Crashpad startup issue and required an automated launcher workaround; cookie persistence also failed.

## Development Implication

**AUTOMATED_DEV_LOOP_PARTIAL**

The fixed-path source → Chrome for Testing → Puppeteer → assertions loop works without ZIP downloads, manual installation, or operator Reload. The harness currently needs the local launcher workaround and should not be treated as proof of persistence for real user accounts.

## Final Verdict

**PUPPETEER_EXTENSION_QA_PARTIALLY_QUALIFIED**

## Cleanup

- Chrome for Testing was closed after each Puppeteer run.
- Loopback server PID 3412 was stopped.
- The disposable harness was retained for reproducibility.
- No harness files were added to the repository.
- Canonical production tree remained clean.
