# Ozon Bridge v0.1.19 — progress checkpoint before final Codex readiness

Date: 2026-08-19
Status: `STOP_PRE_CODEX_READINESS_NOT_YET_COMPLETE`

Repository: `MaksimUnimax/blood_sand`
Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

This checkpoint records the exact state after the current readiness audit. It is a continuation document only. It is not a Codex PASS, not packaging authority, and not a release promotion.

## 1. Production candidate remains unchanged

Exact current candidate authority remains:

- frozen ZIP: `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`
- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch bytes: `13648`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js` SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js` SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: exactly `17` files
- production delta: only `service_worker.js` and `content_script.js`
- protected remaining `15` production files: byte-identical to frozen ZIP.

No production byte was changed during the work recorded below.

## 2. Current final-validation process remains document-only

Current Codex authority remains:

`tooling/llm-api-bridges/ozon-seller/validation/CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md`

Status in that document:

`CODEX_TEST_CHECKLIST_DOCUMENT_ONLY`

Operational consequence:

- Codex does not create/modify `.js/.mjs/.py/.ps1` test files;
- Codex does not create validator/runner/harness/fixture/helper/ready-test/assertion-ledger/authority-bundle infrastructure;
- Codex only validates the exact candidate with already-available ordinary environment capabilities;
- packaging remains separate and forbidden until a reviewed complete B01–B15 PASS.

## 3. Ad-hoc GitHub Actions test infrastructure was removed

Two temporary workflows created during engineering exploration were removed and are not authority:

- `.github/workflows/ozon-current-test-path-audit.yml`
- `.github/workflows/ozon-current-test-path-audit-r2.yml`

They must not be resurrected as the final Codex validation method.

## 4. Browser/runtime authority was reconciled

Current file:

`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_WINDOWS_CFT_QUALIFIED_ENVIRONMENT_2026-08-19.md`

now distinguishes two actually executed layers instead of mixing them:

### Layer A — owned-copy/materialization

ENV6 evidence proves:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- canonical CFT inventory `308` files;
- canonical CFT digest `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
- fresh validation-owned copy;
- copied `setup.exe --configure-browser-in-directory=<copy>` exit `78`;
- extension installation/enumeration;
- version `0.1.19`.

### Layer B — functional raw PAGE/direct-worker CDP

Later exact-current-candidate RERUN13/RERUN18 evidence proves:

- raw PAGE Runtime/Page/Fetch substrate works;
- local synthetic page interception works;
- exact candidate worker direct CDP Runtime and Network observation work;
- browser/worker liveness works;
- real Ozon/Performance/ChatGPT requests stayed zero;
- functional direct-CDP validation required the validator-only `--no-sandbox` exception in the demonstrated environment.

RERUN18 reached the browser substrate successfully but correctly invalidated its umbrella marker because its Phase C/D did not execute the complete B01–B15 functional matrix. That was harness completeness failure, not a demonstrated production browser failure.

RERUN19–RERUN21 failed in later artificial runner/authority-bundle layers before a complete functional matrix and do not supersede the RERUN18 substrate PASS.

## 5. Existing current-candidate engineering evidence was reclassified correctly

Existing exact-current-candidate engineering evidence already demonstrates product behavior for:

- B02/B03 strict command/security behavior;
- B04 Seller capability behavior;
- B05 planner/coalescing;
- B06 real elapsed quota wait/resume including `60000 + 5000 = 65000`, same/different Seller, key rotation, restart/no replay and 429/Retry-After;
- B07 verifier/errors;
- B08 verified cache;
- B09 common batch;
- B11/B12 composer wait and narrow Manual OFF cancellation;
- B14 Seller/Performance boundary;
- zero real Seller/Performance requests in those engineering runs.

This evidence means no production defect is currently proven in those paths.

But it is **not** automatically final Codex readiness where the behavior was exercised through temporary engineering fixtures that Codex is now forbidden to create/adapt.

## 6. Full B01–B15 readiness matrix was created

Current file:

`tooling/llm-api-bridges/ozon-seller/validation/engineering-preflight/PRE_CODEX_B01_B15_READINESS_MATRIX_2026-08-19.md`

Current recorded status:

`STOP_NOT_READY_FOR_CODEX_SINGLE_ROOT_CAPABILITY_GAP`

The audit reduced the earlier scattered BLOCKED set to one root environment capability question rather than treating every B-block as an independent unknown.

Current classification in that matrix:

- B01: READY
- B02: READY
- B03: READY
- B04: NOT_READY
- B05: NOT_READY
- B06: NOT_READY
- B07: NOT_READY
- B08: NOT_READY
- B09: NOT_READY
- B10: PARTIAL
- B11: PARTIAL
- B12: PARTIAL
- B13: PARTIAL
- B14: NOT_READY
- B15: PARTIAL

Those NOT_READY/PARTIAL states share the same root gap below.

## 7. Single remaining root gap

Recorded root gap:

`EXISTING_FILELESS_SAFE_WORKER_PROVIDER_RESPONSE_MOCK_NOT_YET_PROVEN`

Already proven ordinary environment capability:

- exact extension install/enumeration;
- synthetic ChatGPT/Alice pages;
- PAGE `Fetch` interception;
- direct candidate worker Runtime access;
- direct candidate worker Network observation;
- external Seller/Performance/ChatGPT network can remain blocked/zero.

Still not physically proven in the exact qualified environment:

- attach the standard DevTools `Fetch` domain to the **extension service-worker target**;
- pause a normal worker-originated Seller/Performance request before real network;
- return a controlled synthetic HTTP status/body/headers with `Fetch.fulfillRequest`, or controlled transport failure with `Fetch.failRequest`;
- count the exact physical product requests;
- keep real external request counters at zero;
- do all of this without creating/persisting any validator/runner/harness/fixture/helper/test file.

This fileless worker-side response interception is the common missing execution capability for current B04–B09/B14 and, transitively, complete B10–B15 browser flows.

## 8. Important discovery immediately before this checkpoint

Repository/source audit identified a technically appropriate ordinary-environment route:

- use the already-proven direct exact-candidate worker CDP session;
- use Chrome DevTools `Fetch.enable` on that worker target;
- for fixed Seller/Performance hosts, use `Fetch.fulfillRequest` for synthetic responses or `Fetch.failRequest` for deliberate transport failure;
- never use `Fetch.continueRequest` for Seller/Performance in synthetic validation;
- keep existing host-resolver blocking as defense in depth.

This is promising because it is a standard DevTools capability, not a new test program.

However this route has **not yet been physically executed/proven on the exact qualified worker target in this checkpoint**, so the readiness matrix must remain STOP. A draft environment-protocol creation was started but interrupted before commit; therefore no such protocol file is currently authority.

## 9. Performance-specific conclusion

Do not invent a Performance business response schema merely to make B14 pass.

B14 only needs the Performance boundary proven:

- use exact current product Performance command/contract discovered from candidate itself;
- synthetic token response may be fulfilled through worker-side DevTools interception;
- observe the subsequent Performance business request's fixed host/method/auth boundary;
- fail that business request locally before external network if no response schema is required by the boundary assertion;
- verify Seller capability probe = 0;
- verify Seller analytics quota/cache state is not entered/mutated by the Performance flow;
- require `REAL_PERFORMANCE_REQUESTS=0`.

This must still be demonstrated using the ordinary environment before B14 is moved to READY.

## 10. Current STOP rules

Until the worker-side standard DevTools response-interception capability is physically proven:

- new Codex prompt: `FORBIDDEN`
- new Codex run: `FORBIDDEN`
- production edit: `FORBIDDEN` unless a real production defect is independently proven
- packaging: `FORBIDDEN`
- new validator/runner/harness/fixture/helper/ready-test: `FORBIDDEN`

## 11. Exact next action

Resume from this checkpoint with one bounded engineering/environment task only:

1. In the already-qualified exact-candidate Windows/CFT environment, attach to the exact installed extension service worker using the already-proven direct CDP transport.
2. Issue standard `Fetch.enable` for fixed Seller/Performance request patterns **without creating a test file**.
3. Trigger one normal product request with fake validation credentials.
4. Prove a worker-originated provider request is paused before real network.
5. Fulfill one safe synthetic response (Seller is sufficient for the capability proof), observe normal product handling, and require real provider request count zero.
6. Prove the same ordinary mechanism supports selected status/body/headers and `Fetch.failRequest` needed by B04–B09/B14.
7. Only after this proof, update the document-only checklist and the B01–B15 readiness matrix.
8. Re-audit every B01–B15 row.
9. Only if all rows are READY, prepare one complete Codex prompt directly in chat for one consolidated run.

Do not restart the earlier validator/runner/RERUN architecture.
