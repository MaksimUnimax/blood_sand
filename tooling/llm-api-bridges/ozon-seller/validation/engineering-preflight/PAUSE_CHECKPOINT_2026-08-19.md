# Ozon v0.1.19 — engineering pause checkpoint

Date: 2026-08-19
Status: `PAUSED_BY_OPERATOR`

This checkpoint records engineering progress only. It is not a Codex PASS, does not authorize packaging, and does not change production/candidate bytes.

## Exact branch state at pause request

Repository: `MaksimUnimax/blood_sand`

Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

HEAD observed immediately before this checkpoint commit:

`e53696508d17076ab534850adfd428cf66378b94` — `test: preserve Ozon browser evidence after bounded execution R6`

R6 workflow file:

`.github/workflows/ozon-current-test-path-audit-r2.yml`

R6 is engineering-preflight only. At the moment the pause was requested, no R6 bot-evidence commit had yet been observed. Do not infer PASS or FAIL from absence of evidence.

## Frozen candidate remains unchanged

Frozen ZIP:

`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

- ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- patch bytes: `13648`
- patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js` SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js` SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- authorized production delta remains exactly `service_worker.js` + `content_script.js`
- no production edit was made during the engineering preflight work recorded here.

## Engineering execution evidence already obtained

Primary evidence file:

`validation/engineering-preflight/CURRENT_TEST_PATH_AUDIT_2026-08-19.md`

Initial current-hash run proved B02/B03 and B04 executable GREEN, B11/B12 targeted composer-wait GREEN, and B14 helper GREEN, while B05/B08, B06 and B09 exposed fixture defects/timeouts.

Engineering follow-up R2 corrected only temporary validation fixtures and then executed all remaining VM paths successfully against the exact current candidate:

- B05/B07/B08: PASS, exit 0
- B06: PASS, exit 0
- B09: PASS, exit 0
- `VM_R2_FAILURE_COUNT=0`
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`

The R2 browser path reconstructed the exact candidate and launched CFT successfully, then failed only on the browser countdown fixture assertion:

`Error: countdown did not decrease: 7,7,5`

This was classified as a validation-fixture timing issue, not a proven production defect.

## Browser preflight changes after R2

R3/R4/R5 were engineering attempts to make the browser path deterministic and preserve evidence. They did not produce a published evidence checkpoint before the pause.

R6 currently:

- reconstructs the exact candidate from the frozen ZIP + exact two-part patch;
- pins Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`;
- adapts the countdown assertion to collect three actually decreasing values within a bounded 5-second window instead of assuming each 1.1-second sample crosses the rendered second boundary;
- bounds the browser execution step to 4 minutes;
- gives setup/dependency work a larger job envelope so `always()` evidence can still be saved after a browser timeout;
- writes only validation workflow/evidence, not production.

## Unresolved authority conflict discovered immediately before pause

Two live repo documents currently disagree on the exact validator Chrome argument list:

1. `validation/environment/PUPPETEER_WINDOWS_CFT_QUALIFIED_ENVIRONMENT_2026-08-19.md` says the exact authorized args do **not** include `--no-sandbox` and explicitly says not to add it.
2. `validation/full-gate/FULL_GATE_RESOLVED_AUTHORITY_LEDGER_2026-08-19.md` says the exact normalized validator args **do** include `--no-sandbox` and labels it validator-only.

R6 currently follows the qualified-environment document and removes `--no-sandbox` from the temporary browser fixture.

This conflict must be resolved from live precedence/history before any future browser result is promoted to final readiness. Do not silently choose one side and do not change production to resolve it.

## What is proven vs not proven at pause

Proven engineering-executable on the exact candidate:

- B02/B03 current contract/security helper path
- B04 capability helper path
- B05/B07/B08 corrected current VM path
- B06 corrected current VM quota path
- B09 corrected current VM batch path
- B11/B12 targeted composer-wait helper path
- B14 current Performance-boundary helper path

Not yet proven ready for final Codex handoff:

- the complete qualified Windows browser execution for B10/B13/B15;
- full checklist-level coverage mapping for every individual B01–B15 assertion, especially browser-observable B10–B13 semantics beyond the current helper's existing coverage;
- final resolution of the `--no-sandbox` authority conflict;
- one consolidated pre-Codex readiness run proving all required paths together.

Therefore current status remains:

`ENGINEERING_PREFLIGHT_IN_PROGRESS`

`NOT_READY_FOR_CODEX_FINAL_GATE`

`NOT_READY_FOR_PACKAGING`

## Resume point

On explicit operator command to continue:

1. Re-read live branch HEAD first.
2. Check whether R6 produced evidence after this pause checkpoint; review the full output before changing anything.
3. Resolve the live `--no-sandbox` authority conflict using document precedence/history.
4. Continue only with validation-fixture/environment work needed to make every B01–B15 path executable; production remains frozen unless a real production defect is actually proven.
5. Do not issue another Codex prompt until engineering preflight proves the complete validation path is ready.

Pause now. No further engineering action until an explicit continue command.