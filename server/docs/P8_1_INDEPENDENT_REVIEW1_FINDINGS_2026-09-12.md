# P8.1 Independent Review1 Findings — 2026-09-12

## Reviewed candidate

- Reviewed tree: `94a3bb89ce1022723083bb747b2699d38db180b6`
- Result: `FAIL`
- CRITICAL: `0`
- HIGH: `1`
- MEDIUM: `2`
- LOW: `0`

Review1 was an independent review of the Attempt2 P8.1 health domain,
classifier, suite registry, H0 boundary, and test evidence. It was not a PASS.

## Findings

### R1-HIGH-001 — fallback-outcome bypass

The classifier could classify a primary failure as `DRIFT` when a selected
fallback was present and had favorable quality, without requiring the actual
selected fallback result to be `PASS`. Corrective authority: fallback selection
and quality are not fallback success; only an observed `PASS` selected fallback
with the approved-equivalent quality may provide `DRIFT` recovery semantics.

### R1-MEDIUM-001 — maintenance/unknown relational-validation bypass

`MAINTENANCE` and `UNKNOWN` precedence could return before complete relational
validation of contour results. Corrective authority: raw shape validation and
complete suite/result relational validation precede every final Health-state
return, including precedence returns.

### R1-MEDIUM-002 — material test-evidence gaps

The focused tests did not meaningfully cover the contradictory failing-fallback
case, malformed duplicate/unexpected/missing results under precedence, explicit
valid `UNKNOWN` and `MAINTENANCE` combinations, or selected-fallback
declaration/result relationships. Corrective authority: add adversarial tests
for each required case while preserving valid product precedence coverage.

## Accepted unaffected areas

Review1 found no critical findings and no findings against the H0 profile
boundary, strict declarative schema vocabulary, suite registry and fingerprint,
13-contour baseline catalog, six-state/six-level vocabulary, P7 schema reuse,
OpenAPI, migrations, Bridge boundary, provider boundary, or P8 decomposition.

The corrective rework is limited to the health classifier, its focused unit
tests, and truthful P8.1 documentation. Review1 remains `FAIL` until its three
findings are independently re-reviewed.
