# Codex Puppeteer Launcher Correction Report

Date: 2026-08-17

## Environment

- Tested canonical HEAD: `b24cffa72d3ea1493537df5aacc483a430dd51e9`
- Repository checkout: `D:\codex\Test\blood_sand`
- Production tree before/after: clean; no Ozon Bridge production source or `reference-*` evidence changed
- Puppeteer: `25.4.0`
- Chrome for Testing: `151.0.7922.47`
- Chrome executable: `D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64\chrome.exe`
- Node launcher: `D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`
- Dedicated profile: `D:\codex\Test\qa-harness\puppeteer-extension-qa\browser-profile-final-node`
- Fixed extension source: `D:\codex\Test\qa-harness\puppeteer-extension-qa\mv3-extension`
- Operator browser actions: `0`

## Launcher

The corrected launcher uses `child_process.spawn(executable, argsArray, options)`. Chrome receives `--remote-debugging-port=0`; the launcher reads `DevToolsActivePort`, records the selected port and browser WebSocket path, verifies `/json/version`, and then Puppeteer connects to the discovered endpoint. Chrome stdout/stderr are written to harness-local diagnostics files.

`NODE_SPAWN_DYNAMIC_DEVTOOLS = PASS`

| Revision | Selected port | Browser WebSocket path |
|---|---:|---|
| R1 | 60986 | `/devtools/browser/35327b97-e287-43b1-bcc8-199977af1c14` |
| R2 | 55704 | `/devtools/browser/99e40459-9c68-4e47-a5f7-193a2e1e1015` |
| R3 | 53305 | `/devtools/browser/b453f363-2387-4979-8b21-12796b0af756` |

## Extension installation

`EXTENSION_INSTALL_ROUTE = RUNTIME_INSTALL`

Each run connected first, then called Puppeteer `browser.installExtension()` for the same fixed unpacked extension directory. No `chrome://extensions`, manual Load unpacked, manual Reload, ZIP, normal Chrome profile, credentials, Ozon account, or Ozon API was used.

Stable extension identity in all runs:

- ID: `jedjofmmofghjnpnaadkkogifhkeaefn`
- Name: `Codex Puppeteer MV3 Harness`
- Version: `1.0.0`

## Revision results

All three runs passed the core loop: local site marker, revision marker, dataset, content console marker, localhost document network request, two independent tabs, extension inventory, and MV3 service-worker target.

### R1

- Result: `PASS`
- Visible marker: `CODEX_NODE_QA_R1`
- Dataset: `r1`
- Content console: `CODEX_NODE_CONTENT_R1`
- Service worker target: `chrome-extension://jedjofmmofghjnpnaadkkogifhkeaef9/service_worker.js`
- Service worker revision log: `CODEX_NODE_SW_R1`
- Multitabs: `PASS` (`2` tabs)
- Network: `PASS` (`http://127.0.0.1:8766/`)

### R2

- Result: `PASS`
- Visible marker: `CODEX_NODE_QA_R2`; R1 marker absent
- Dataset: `r2`
- Content console: `CODEX_NODE_CONTENT_R2`
- Service worker target: same stable extension ID
- Service worker revision log: `CODEX_NODE_SW_R2`
- Multitabs: `PASS` (`2` tabs)
- Network: `PASS` (`http://127.0.0.1:8766/`)

### R3

- Result: `PASS`
- Visible marker: `CODEX_NODE_QA_R3`; R1 and R2 markers absent
- Dataset: `r3`
- Content console: `CODEX_NODE_CONTENT_R3`
- Service worker target: same stable extension ID
- Service worker revision log: `CODEX_NODE_SW_R3`
- Multitabs: `PASS` (`2` tabs)
- Network: `PASS` (`http://127.0.0.1:8766/`)

## SHA-256 hashes

`manifest.json` was unchanged across runs:

`DE2F5ADCDDF6A589DD0C8F83BA82C703D19E9CE1912C569C4084E8D76EB17602`

| Revision | `content.js` | `service_worker.js` |
|---|---|---|
| R1 | `252610B2900A86916DD8B9D7CAD4106775310BF9413B81777C324E6A7EDD7FAD` | `ACEFCC9EC3C8CFCB9A6D219A284E3F4A98F443C330E67832275ACAD067DC312C` |
| R2 | `CC5307FD5BC4F808065EE652B08B1EE65CF2B256057ABFF629CE1BBE0D471488` | `4D454E0F733FF09580BD1EA51E502ED5602B6EB92181B9FB6360927019652587` |
| R3 | `F6FAA6126E607F9B46FD5E361805A1ABF0C94876EA1D91233304EE379640412C` | `E6EA6ED3B5CFE5EAFBA0809167DC3B2939098CD7C07CB2F3E8181519649B9FD2` |

## Persistence

- R1 wrote and read `localStorage` value `persist_final` and persistent cookie `codex_qa_cookie_final=persist_final` with `Max-Age=86400`, `Path=/`, `SameSite=Lax`.
- R2 after clean browser restart: localStorage `persist_final`, cookie `persist_final`.
- R3 after clean browser restart: localStorage `persist_final`, cookie `persist_final`.

`PERSISTENT_LOCALSTORAGE = PASS`

`PERSISTENT_COOKIE = PASS`

## Required answers

```text
NODE_SPAWN_DYNAMIC_DEVTOOLS = PASS
EXTENSION_INSTALL_ROUTE = RUNTIME_INSTALL
R1 = PASS
R2 = PASS
R3 = PASS
EXTENSION_ID_STABLE = PASS
PERSISTENT_LOCALSTORAGE = PASS
PERSISTENT_COOKIE = PASS
ZERO_OPERATOR_EXTENSION_REINSTALL = YES
QA_HARNESS_CORE_VERDICT = QA_HARNESS_ACCEPTED_FOR_DEV
PROFILE_PERSISTENCE_VERDICT = PROFILE_PERSISTENCE_ACCEPTED
```

Only this report is added to the production repository. The report branch is based on the exact tested canonical HEAD and is not merged.
