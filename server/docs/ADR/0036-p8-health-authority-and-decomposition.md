# ADR-0036: P8 Health authority and decomposition

Status: Implemented for P8.1 local candidate; later P8 stages are planned

Date: 2026-09-12

## Decision

P8 introduces a deterministic compatibility-health domain. The health package
owns the versioned health vocabulary, suite and contour registry, validated
observations, classification rules, and the H0 profile-candidate boundary. It
does not perform browser work, persistence, provider work, scheduling, or
notifications in P8.1.

The P8.1 foundation is deliberately a local, non-live contract fixture. The
baseline suite contains exactly 13 unique contours, C01 through C13. Contour
definitions are declarative and validated by strict Zod schemas. Selectors,
live handles, navigation commands, scripts, provider operations, and network
authority are not stored or accepted by this foundation.

## Health authority

The only health states are:

`HEALTHY`, `DRIFT`, `DEGRADED`, `BROKEN`, `UNKNOWN`, and `MAINTENANCE`.

The health levels are `H0`, `H1`, `H2`, `H3`, `H4`, and `H5`. P8.1 implements
the vocabulary and deterministic classifier foundation; it does not claim to
implement the later browser or operational levels.

Classification is pure and deterministic:

1. parse and validate the raw input shape;
2. validate every result relationally against the suite, including contour
   membership, required coverage, fallback declarations, and selected-fallback
   result identity;
3. only after relational validation, operator maintenance returns
   `MAINTENANCE`;
4. only after relational validation, controlled-environment uncertainty returns
   `UNKNOWN`;
5. product findings resolve by `BROKEN > DEGRADED > DRIFT > HEALTHY`.

Primary success is `HEALTHY`. Fallback quality does not prove fallback success:
the actual selected-fallback outcome must be `PASS` before fallback recovery can
lower severity. A selected fallback with `PASS` and approved-equivalent quality
produces `DRIFT`; a materially degraded fallback or important non-core failure
produces `DEGRADED`; a required core failure produces `BROKEN`. No LLM, network,
database, browser, or provider call participates in classification.

## H0 profile boundary

H0 reuses the P7 `PersistedProfileRevisionSchema` and canonical
`validateProfileContent` validator. P8.1 does not duplicate the P7 profile
schema, alter profile lifecycle, or introduce executable profile fields. The
strict validator rejects unknown keys and prohibited executable or transport
authority including `script`, `javascript`, `eval`, `wasm`, `module`,
`command`, `shell`, `filesystemPath`, `url`, `headers`, `credentials`,
`providerOperation`, and `arbitrarySelectorScript`.

H0 accepts only a P7 `CANDIDATE` revision whose content fingerprint agrees with
the canonical validated content and compatibility fingerprint. It returns
sanitized deterministic validation evidence and never performs a live browser
or product-provider call.

## Stage decomposition and ownership

| Stage | Frozen responsibility |
| --- | --- |
| P8.1 | Health domain, deterministic classifier, suite registry, and H0 |
| P8.2 | Persistence |
| P8.3 | BrowserDriver and controlled Chrome H2 |
| P8.4 | ChatGPT Standard/Work H3 and sanitized evidence |
| P8.5 | Scheduling, orchestration, and health incidents |
| P8.6 | H4/H5, P7 availability-restriction hooks, and minimal Health admin API/UI |
| P8.7 | Whole-P8 security, privacy, architecture, regression, and final acceptance |

P8.1 does not start any later P8 stage.

P9 owns generic diagnostics, external notification-provider delivery, and
cross-domain alerting. P13 owns actual Yandex Browser live-driver acceptance.
P8.3 owns the controlled Chrome driver boundary; P8.4 owns sanitized evidence
and the later H3 product-surface checks. The active Bridge remains outside this
candidate and is not imported or modified.

## Consequences

The server has one local deterministic authority for health-state semantics and
the baseline suite contract. Persistence, browser observation, evidence
storage, scheduling, incident delivery, diagnostics, and browser-specific live
acceptance must be added in their named stages with independent gates. The
P8.1 candidate is suitable for independent review, but it is not final local
acceptance, commit-ready, or push-ready.
