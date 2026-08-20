# Ozon Bridge v0.1.19 — independent acceptance of generic cold-start session launcher

Date: 2026-08-20  
Status: `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_PERMITTED_FINAL_B01_B15_STILL_STOPPED`

Repository: `MaksimUnimax/blood_sand`  
Development branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Purpose

The previous read-only environment measurement proved that no existing unmodified generic session-acquisition asset exists in the standing Windows QA environment.

ChatGPT engineering has therefore prepared one environment-only component outside the final gate:

`tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER.mjs`

with contract:

`tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER_CONTRACT_2026-08-20.md`

This acceptance step is allowed only to independently execute and verify that frozen environment component. It is not B01–B15 and does not authorize packaging.

## Frozen launcher identity

Expected launcher SHA-256:

`0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600`

Codex must verify the actual file hash before execution.

If it differs, stop with `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_BLOCKED` and do not modify it.

## Allowed actions

Codex may:

- read the launcher and contract;
- run `node --check` on the committed launcher;
- reconstruct one fresh exact current candidate using ordinary filesystem/Git commands;
- execute the committed launcher exactly once against that candidate;
- inspect launcher-created temporary session artifacts, metadata and diagnostics;
- query the published localhost DevTools HTTP discovery endpoint read-only (`/json/version`, `/json/list`) after the launcher process has exited/disconnected;
- inspect the owned Chrome PID/process and exact command line;
- terminate only the launcher-owned Chrome process after evidence is captured;
- remove only launcher-created temporary session directories after evidence is captured;
- publish one Markdown acceptance report on a pre-created validation branch.

## Forbidden actions

Codex must not:

- modify the launcher;
- copy it to a new source file and patch it;
- create another `.js`, `.mjs`, `.py`, `.ps1`, runner, helper, harness, validator, workflow or fixture;
- use `node -e` or another inline replacement program to implement missing launcher behavior;
- modify production or candidate bytes;
- execute or score B01–B15;
- submit Ozon product commands;
- use real Seller/Performance credentials;
- make real Seller/Performance/ChatGPT requests;
- build a ZIP;
- continue to the final gate after this acceptance.

If the launcher itself has a defect, record the exact defect and stop. Do not repair it during acceptance.

## Exact candidate

Frozen ZIP SHA-256:

`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Repair patch bytes:

`13648`

Repair patch SHA-256:

`bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Expected final worker:

`dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`

Expected final content:

`ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Version:

`0.1.19`

Inventory:

`17`

The launcher invocation must pass these values through its existing CLI expectation arguments. Do not edit launcher source to set them.

## Required acceptance sequence

Start from cold validation state: no launcher-owned Chrome/session from a previous attempt.

1. Verify launcher SHA-256 and `node --check`.
2. Reconstruct one fresh candidate and verify the exact current identity above.
3. Run the frozen launcher using its documented CLI and a fresh empty session root.
4. Require terminal marker `OZON_GENERIC_SESSION_READY`.
5. Read `<sessionRoot>\session.json` and verify:
   - Node `v24.12.0`;
   - Puppeteer `25.4.0`;
   - CFT `151.0.7922.47`;
   - CFT source file count `308`;
   - CFT canonical digest `d7b8a2b0c29abcbfba85ea3296097af3bef45c0b2b60c98055d523b9c`;
   - setup exit `78`;
   - candidate file count `17`;
   - candidate version `0.1.19`;
   - extension inventory version `0.1.19`;
   - worker URL under the returned exact extension id;
   - worker Runtime `1+1 === 2`;
   - worker Network enabled;
   - worker Fetch enabled;
   - browser alive after launcher disconnect.
6. Independently, after launcher exit/disconnect, query the recorded localhost `endpoint` with ordinary read-only HTTP commands:
   - `/json/version` must return success;
   - `/json/list` must return a valid current target list.
   This is the separate read-only reuse check; no new CDP client program is required.
7. Verify the Chrome process command line exactly matches the contract and belongs to the launcher-created copied CFT/session root.
8. Verify the original candidate bytes are unchanged.
9. Verify the source CFT tree is unchanged.
10. Capture diagnostics.
11. Terminate only the launcher-owned Chrome PID/process tree and verify the endpoint is gone.
12. Remove only the launcher-created temporary session root after evidence capture.

## PASS

Return `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_PASS` only if every required sequence item above actually passes and:

- production modifications = `0`;
- candidate modifications = `0`;
- source CFT modifications = `0`;
- test infrastructure modifications by Codex = `0`;
- operator browser actions = `0`;
- real Ozon requests = `0`;
- real Performance requests = `0`;
- real ChatGPT requests = `0`;
- ZIP = `NOT_BUILT`.

A PASS is only session-environment readiness evidence. ChatGPT must review it and re-audit B01–B15 before any final gate prompt.

## FAIL/BLOCKED

If the immutable launcher runs but violates its own contract, verdict:

`GENERIC_SESSION_LAUNCHER_ACCEPTANCE_FAIL`

If execution is prevented by an external environment/policy condition before launcher behavior can be evaluated, verdict:

`GENERIC_SESSION_LAUNCHER_ACCEPTANCE_BLOCKED`

Do not classify launcher/environment defects as production failures.

## Final gate status

Until this acceptance report is reviewed and PASS:

`FINAL_B01_B15_CODEX_GATE = STOPPED`

After report publication: STOP.
