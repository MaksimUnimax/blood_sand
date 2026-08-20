# Ozon Bridge v0.1.19 — generic cold-start QA session launcher contract

Date: 2026-08-20  
Status: `ENGINEERING_ENVIRONMENT_COMPONENT_PENDING_INDEPENDENT_ACCEPTANCE`

This document describes an engineering environment component. It is not a B01–B15 test, not a validator, not a product harness, not a production file, and not packaging authority.

## Purpose

The document-only final gate requires a browser/CDP session to exist before B02–B15 can be executed without creating test code. The previous environment preflight proved that the standing Windows assets cannot create such a fresh exact-candidate session unmodified.

The new component solves only this missing transition:

`cold state -> qualified owned CFT copy -> fresh profile -> exact candidate runtime install -> reusable browser/CDP endpoint -> exact worker CDP qualification`

It performs no Ozon product assertions and must never score B01–B15.

## Component

Path:

`tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER.mjs`

Frozen engineering source SHA-256 for independent acceptance:

`0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600`

The launcher has no hard-coded Ozon candidate SHA or candidate directory. Candidate identity is supplied through CLI expectations, so a later candidate does not require editing launcher source merely to change expected product bytes.

If the launcher fails after starting its own Chrome process, its fail-clean path terminates only that owned Chrome process tree. A successful session is deliberately left alive.

## Qualified dependencies

The launcher requires exactly:

- Node `v24.12.0`;
- Puppeteer `25.4.0` from the standing QA root;
- Chrome for Testing `151.0.7922.47`;
- canonical CFT regular-file count `308`;
- canonical CFT inventory SHA-256 `d7b8a2b0c29abcbfba85ea3296097af3bef45c0b2b60c98055d523b9c`.

Default standing QA root:

`D:\codex\Test\qa-harness\puppeteer-extension-qa`

The canonical inventory algorithm is the current repository authority: recursively sorted regular files, `{path,size,sha256}`, normalized `/` relative paths, records sorted by path, each record JSON-serialized, joined with LF plus final LF, then SHA-256.

## Materialization behavior

For every start the launcher must:

1. verify Node/Puppeteer/CFT authority;
2. inventory the source CFT tree;
3. create a fresh validation-owned session root;
4. byte-copy the full CFT source tree into it;
5. require source/copy canonical inventories to be identical;
6. execute copied `setup.exe --configure-browser-in-directory=<copy>` once with `shell:false`;
7. require setup exit code `78`;
8. require post-setup copied CFT inventory to remain byte-identical to source;
9. create a fresh session profile;
10. launch the copied `chrome.exe` detached;
11. use only the current functional-validation Chrome argument sequence;
12. read `DevToolsActivePort` atomically and expose the actual localhost HTTP/WebSocket endpoint.

Exact Chrome arguments after `chrome.exe`:

```text
--user-data-dir=<fresh-session-profile>
--remote-debugging-port=0
--no-first-run
--no-default-browser-check
--disable-background-networking
--disable-component-update
--disable-sync
--metrics-recording-only
--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0
--no-sandbox
about:blank
```

No `--disable-gpu`, no `--disable-gpu-sandbox`, no operator profile, and no extra Chrome switch is accepted by the component.

## Candidate behavior

Required CLI argument:

`--candidate <candidateDir>`

Optional identity assertions:

- `--expected-version <version>`
- `--expected-worker-sha <sha256>`
- `--expected-content-sha <sha256>`
- `--expected-file-count <n>`
- `--qa-root <path>`
- `--session-root <emptyPath>`

For the current exact candidate the acceptance invocation must supply:

```text
--expected-version 0.1.19
--expected-worker-sha dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
--expected-content-sha ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda
--expected-file-count 17
```

The launcher inventories the candidate before and after session acquisition and must fail if any non-`.git` candidate byte changes.

## Extension/session acquisition

The launcher connects Puppeteer only to the newly launched validation browser and calls:

`browser.installExtension(candidateDir)`

It then requires:

- `browser.extensions()` to contain the returned extension id;
- the optional expected version to match the enumerated extension version;
- an exact extension service-worker target under `chrome-extension://<extensionId>/`.

If the worker is not initially active, the launcher may perform one environment-only synthetic wake through a raw PAGE target:

- `Target.createTarget({url:'about:blank'})`;
- raw PAGE `Runtime.enable`, `Page.enable`, `Fetch.enable`;
- navigate to the fixed synthetic ChatGPT conversation URL;
- fulfill that top-level document locally;
- fail every other request locally;
- close the temporary wake target after worker acquisition.

No real ChatGPT request is permitted by that wake path.

## Worker qualification

Through a raw flattened CDP session to the exact worker, the launcher must require:

- `Runtime.enable`;
- `Runtime.evaluate('1+1') === 2`;
- `Network.enable`;
- `Fetch.enable` accepted for request-stage patterns limited to:
  - `https://api-seller.ozon.ru/*`
  - `https://api-performance.ozon.ru/*`.

No Seller/Performance product request is generated by the launcher.

## Reusable-session rule

On success the launcher MUST NOT call `browser.close()`.

It closes only its temporary Puppeteer/raw-CDP client connections, leaves the detached validation-owned Chrome process alive, verifies `/json/version` is still reachable, and writes:

`<sessionRoot>\session.json`

The metadata includes:

- session root/profile/browser copy;
- Chrome PID;
- exact Chrome args;
- HTTP DevTools endpoint;
- browser WebSocket endpoint;
- candidate digest/version;
- extension id/version;
- worker target id/url;
- Runtime/Network/Fetch qualification results;
- diagnostics paths.

Terminal launcher marker:

`OZON_GENERIC_SESSION_READY`

That persistent localhost DevTools endpoint is the control surface later document-only validation may attach to without creating another launcher/helper.

## Safety boundary

The launcher must maintain:

- production modifications: `0`;
- candidate modifications: `0`;
- source CFT modifications: `0`;
- operator browser actions: `0`;
- real Seller requests: `0`;
- real Performance requests: `0`;
- real ChatGPT requests during synthetic wake: `0`;
- ZIP: `NOT_BUILT`.

The launcher is not allowed to submit user/Ozon commands, manufacture product PASS, write product state, or execute B01–B15 scenarios.

## Independent acceptance required

This component is not authoritative merely because it was written or passes `node --check`.

Before the final B01–B15 gate can resume, Codex must perform one environment-only acceptance from a cold state against the immutable launcher source and current exact candidate.

Required acceptance observations:

1. launcher source SHA matches `0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600`;
2. source CFT canonical inventory PASS;
3. owned copy PASS;
4. setup exit `78`;
5. post-setup byte identity PASS;
6. exact Chrome args PASS;
7. exact candidate runtime installation PASS;
8. extension version `0.1.19` PASS;
9. exact worker acquired;
10. Runtime `1+1` PASS;
11. Network PASS;
12. Fetch.enable PASS;
13. launcher exits/disconnects while Chrome/DevTools endpoint remains alive;
14. a separate read-only attach to the published endpoint succeeds without modifying launcher source;
15. cleanup touches only launcher-owned temporary runtime artifacts;
16. all real-network counters remain zero.

Only after reviewed acceptance PASS may the session-acquisition STOP be removed and B01–B15 readiness be re-audited.
