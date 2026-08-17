# Codex Puppeteer Final QA Acceptance Report

## Identity

- Date/time: 2026-08-17 17:01:00 +05:00
- Timezone: Asia/Qyzylorda
- Windows: Microsoft Windows 11 Home Single Language, version 10.0.26200, build 26200, x64
- PowerShell: 7.6.4
- Git: 2.40.1.windows.1
- Node: v24.12.0
- npm: 11.6.2
- Puppeteer: 25.4.0
- Chrome for Testing: 152.0.7977.42
- Executable: `C:\Users\unyma\.cache\puppeteer\chrome\win64-152.0.7977.42\chrome-win64\chrome.exe`
- Repository: `MaksimUnimax/blood_sand`
- Branch: `work/ozon-data-collection-2026-08-11`
- Exact tested HEAD: `8c6669d3c8266c49bd26429f7e8f67614df0630e`
- Production status before: clean
- Production status after: clean

## Launcher

- Intended reusable launcher: `D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.ps1`
- Startup timeout: 30 seconds
- Remote debugging: loopback `127.0.0.1`, port 9238
- Route: Start-Process Chrome for Testing → wait for `/json/version` → Puppeteer connect
- Dedicated profile: `D:\codex\Test\qa-harness\puppeteer-extension-qa\browser-profile-final`
- Fixed extension directory: `D:\codex\Test\qa-harness\puppeteer-extension-qa\mv3-extension`
- Crashpad/GPU workaround flags were included.
- Operator browser actions: 0

The launcher failed to expose its DevTools endpoint within the deterministic 30-second timeout. A direct equivalent command had previously worked in this environment, but the reusable `.ps1` launcher did not reproduce that route reliably. No R1/R2/R3 acceptance run was started after this blocker, so no extension PASS is claimed for this final acceptance.

## Three Run Matrix

| Run | Result | Reason |
|---|---|---|
| R1 | FAIL | Reusable launcher did not expose DevTools endpoint; run not started |
| R2 | FAIL | Not attempted because R1 failed under fail-closed policy |
| R3 | FAIL | Not attempted because R1 failed under fail-closed policy |

No final-run hashes, markers, datasets, service-worker target, multitab, network, or clean-shutdown evidence are claimed. Earlier qualification evidence is not substituted for this final three-run acceptance.

## Persistence

- R1 → R2 localStorage: NOT_RUN
- R1 → R2 persistent cookie: NOT_RUN
- R2 → R3 localStorage: NOT_RUN
- R2 → R3 persistent cookie: NOT_RUN
- Persistent cookie design for any future run: `codex_qa_cookie_final=persist_final; Max-Age=86400; Path=/; SameSite=Lax`

`AUTH_SESSION_PERSISTENCE_NOT_PROVEN`

## Required Final Answers

```text
ZERO_OPERATOR_EXTENSION_REINSTALL = YES
THREE_CONSECUTIVE_AUTOMATED_REVISIONS = FAIL
EXTENSION_ID_STABLE = FAIL
PERSISTENT_LOCALSTORAGE = FAIL
PERSISTENT_COOKIE = FAIL
QA_HARNESS_CORE_VERDICT = QA_HARNESS_REJECTED_FOR_DEV
PROFILE_PERSISTENCE_VERDICT = PROFILE_PERSISTENCE_LIMITED
```

## Safety and Cleanup

- No Ozon production source, credentials, real accounts, Ozon endpoints, or reference evidence directories were accessed.
- No ZIP installation, `chrome://extensions`, manual Load unpacked, manual Reload, or operator browser action was used.
- Loopback server PID 11644 was stopped.
- Chrome for Testing processes started by the harness were stopped; none remained.
- QA harness files remain under `D:\codex\Test\qa-harness\puppeteer-extension-qa` and were not added to the repository.
- Canonical production tree remained clean.
