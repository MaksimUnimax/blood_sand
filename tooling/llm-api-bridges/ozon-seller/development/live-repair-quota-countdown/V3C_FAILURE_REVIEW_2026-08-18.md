# Ozon live-repair V3C failure review

Date: 2026-08-18
Status: engineering review; V3 remains NOT FROZEN.

## Authority

Exact production candidate remains:

`88a20984c55da1f813ca1184bd90089823f51883`

Frozen Step-4 base remains:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

V3C report commit:

`283af1fde8cb0253cca0b275c245fb48dd9c7ab2`

The V3C report branch is report-only: one commit ahead of the exact candidate, merge-base equal to the candidate, and the only changed file is the V3C report.

## What V3C actually proved

PASS:

- exact repaired worker/content hashes;
- exact protected fifteen files;
- supplied harness syntax;
- actual manual public quota_wait;
- actual autorun public quota_wait;
- public-state privacy;
- Step-1 security carry-forward;
- Step-2 planner/projection carry-forward;
- Step-3 integration surface;
- Step-4 cache/prefetch carry-forward;
- delivery FSM carry-forward;
- real Ozon requests = 0;
- real Performance requests = 0.

## Worker failure classification review

The V3C worker harness timed out waiting for `manual_operation.batch.request_state === "quota_waiting"` in the guarded incompatible-cache-miss scenario.

The supplied fixture used:

`last_provider_request_at = now - 64800`

with effective interval 65000 ms, so its intended guarded boundary was only approximately 200 ms after fixture construction.

The harness then called the real runtime `OZ_EXECUTE_COMMAND` path, which necessarily performs asynchronous admission/planning/cache/storage work before quota acquisition. If that work reaches quota acquisition after the approximately 200 ms test boundary, correct production behavior is to acquire immediately rather than enter `quota_waiting`.

Therefore a timeout waiting specifically for `quota_waiting` does not distinguish a production defect from the fixture boundary expiring before acquisition. The V3C label `PRODUCTION_BEHAVIOR_FAILURE` is not accepted as evidence of a production defect for this scenario.

V3D corrects only this test race by moving the seeded due boundary materially into the future. No production byte changes.

## Browser failure classification review

The V3C browser harness exited before browser execution with:

`ERR_MODULE_NOT_FOUND` for `puppeteer-core` after the `puppeteer` import also failed.

The harness file had been materialized under a standalone V3C harness directory, while the accepted Puppeteer installation lives in a separate QA project. Node ESM resolves bare package imports relative to the importing module's filesystem ancestry; the installed package is therefore not guaranteed to be visible from the standalone harness directory.

This is an environment/module-location failure, not extension behavior evidence.

V3D runs the exact unchanged V3C browser harness bytes from the existing Puppeteer project root after verifying the raw SHA-256. No browser harness semantic change and no production change.

## Decision

- Do not create V4.
- Do not modify V3 production logic based on V3C.
- Do not freeze V3 yet.
- Execute V3D harness-only corrections.
- Only a post-correction assertion failure from the actual worker/browser path may be treated as new production-behavior evidence.
- `REAL_OZON_REQUESTS` and `REAL_PERFORMANCE_REQUESTS` must remain 0.
