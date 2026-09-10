# AI_TEST_REPORT_FORMAT_CURRENT

Status: CURRENT mandatory reporting contract for Ozon Bridge business tests and executable repairs.

## Required report sections

1. Identity: repository, branch, base authority, exact source commit/tree, exact artifact name/bytes/SHA-256, CI run, runtime version, pre-handoff/live status.
2. What / how / why: exact business or defect objective, path, product-value reason, PASS criteria, actual result, remaining unknowns, next action.
3. Request truth/accounting: exact envelope/fingerprint where permitted, request ID, HTTP/provider verdict, `external_request_executed`, logical result count, physical business request count, exact/transformed metadata, pagination/retry metadata and opaque-dependency provenance.
4. Dependency audit: producer → normalization → validation → branches → all readers/consumers → state/storage → recovery/lifecycle → module boundaries → permissions/policy/entitlement → planning → transport/request → parsing/transformation → output → redaction/security → accounting → tests → packaged runtime → live workflow.
5. Secondary sweep and closed-set audit after the first confirmed root cause.
6. Totals required for pre-handoff PASS: `unaccounted_dependencies=0`, `stale_assumptions=0`, `available_but_unverified_dependencies=0`.
7. Evidence-only statuses: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, `PENDING POST-INSTALL`. Planned work is never reported as complete. `PRE-HANDOFF PASS` is not `LIVE PASS`.

## GATE-01 through GATE-35

- GATE-01 explicit operator authorization.
- GATE-02 prior live/evidence state correctly closed or frozen.
- GATE-03 exact repair scope/diff identified.
- GATE-04 no hidden/out-of-scope changes or unauthorized ref mutation.
- GATE-05 failing workflow reconstructed end-to-end.
- GATE-06 diagnosis continued after first root cause.
- GATE-07 complete dependency/state inventory.
- GATE-08 each dependency traced to terminal behavior/test.
- GATE-09 repair aligned with existing architecture.
- GATE-10 provider/account blockers not mislabeled as Bridge defects.
- GATE-11 durability/fail-closed semantics classified.
- GATE-12 lifecycle recreation covered when state crosses lifecycle boundaries.
- GATE-13 same-instance testing is not sole evidence when lifecycle matters.
- GATE-14 positive flow uses fresh real dependencies.
- GATE-15 stale/unknown/malformed/expired dependencies fail closed.
- GATE-16 browser/MV3 boundary covered.
- GATE-17 manifest/runtime/network permission parity.
- GATE-18 exact installable artifact verified.
- GATE-19 post-build executable changes invalidate old package evidence.
- GATE-20 exact/transformed request semantics truthful.
- GATE-21 logical/physical/external accounting truthful.
- GATE-22 no hidden retry/duplicate/refetch/provider requests.
- GATE-23 positive and negative controls.
- GATE-24 entitlement fail-honest.
- GATE-25 privacy/personal-data policy preserved.
- GATE-26 provenance preserved.
- GATE-27 redaction preserved.
- GATE-28 protected URL/base64/credential/raw-data leakage absent.
- GATE-29 trusted-host/HTTPS/SSRF/credential boundaries preserved.
- GATE-30 targeted regression for the new defect.
- GATE-31 regressions for intersecting prior repairs.
- GATE-32 fullest available deterministic product-flow reproduction.
- GATE-33 no stale/fabricated success dependencies.
- GATE-34 no undeclared provider-side mutation.
- GATE-35 full green run after the last executable change.

## LIVE-GATE-01 through LIVE-GATE-05

Always report LIVE-GATE-01, LIVE-GATE-02, LIVE-GATE-03, LIVE-GATE-04 and LIVE-GATE-05 individually. Any genuinely live-only check not yet executed is `PENDING POST-INSTALL`, never `PASS`.
