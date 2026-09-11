# ADR-0033 — P7.3 Bootstrap AI Resolution and Signed Profile Binding

Date: 2026-09-11
Status: Implemented; remotely accepted

## Decision

P7.3 activates the previously reserved `ai` section of the existing signed
P3 bootstrap snapshot. It keeps the identifiers `control_plane_v1`,
`bootstrap_snapshot_v1`, and `bootstrap_envelope_v1`, the Ed25519 algorithm,
signature domain, signing-key lifecycle, and envelope format unchanged. This
is signed profile distribution inside the existing trust plane, not a second
bootstrap or profile-fetch protocol.

The signed AI union is `UNCONFIGURED`, `UNAVAILABLE`, or `RESOLVED`.
`UNAVAILABLE` carries only the normalized detected family/surface/variant and
one of `UNSUPPORTED_DETECTED_AI`, `AI_DISABLED`, `NO_PROFILE`, or
`PROFILE_INCOMPATIBLE`. `RESOLVED` carries the stable profile key, revision,
scope variant, `adapter_profile_v1` content, compatibility object, and
fingerprint. Assignment UUIDs, revision UUIDs, cohort seeds, and account or
device identifiers never cross this wire boundary.

For a detected family/surface/variant, unknown identities never fall back.
An active exact-variant assignment is selected first; a surface-default
assignment is used only when no configured exact assignment revision exists.
An exact scope row without a revision therefore does not mask a valid default.
Null detected variants use the surface default. A structurally corrupt
selected assignment or profile fails the whole bootstrap safely. Profile
selection reuses P7.2 `selectAssignedProfileRevision`, which in turn reuses
the accepted P3 `selectRolloutCandidateV1` primitive. Account and device
subject identity comes from the authenticated bootstrap principal.

The server obtains hierarchy, assignment, latest assignment revision, and all
selected target profile rows with one PostgreSQL statement snapshot. Before
signing, it verifies active hierarchy/profile ownership, `PUBLISHED` state,
strict registry schemas, and recomputed fingerprint equality, then checks the
actual contract, browser, browser-version, and extension-version request.
Commercial bootstrap eligibility remains the existing authority; an
ineligible account cannot receive a usable resolved profile and AI resolution
does not extend any commercial deadline.

The simulated client verifies the existing envelope before trusting the AI
payload, validates the outer contract and strict registry schemas, recomputes
the fingerprint, checks compatibility, and enforces exact detected-context
and variant binding. A surface-default result may have a null scope variant
for a known non-null detected variant; a non-null scope variant must equal the
detected variant. Cached/offline use requires current packaged detection,
cached request context, and signed detected context to agree. Offline grace
and signature freshness remain P3.6 policy.

The packaged detector is bounded simulated fixture knowledge for exact HTTPS
origin `https://chatgpt.com`: ChatGPT Standard maps to
`standard_composer_v1`, and ChatGPT Work maps to `work_composer_v3`. It does
not claim knowledge of the live ChatGPT DOM. Diagnostic fixtures may inject
tab state, but not a profile, assignment, cohort seed, or server result.

## Boundaries and consequences

No P7.4 admin API, P7 RBAC permission, P7.5 portal, P8 Health runner, P9
diagnostics, P11 Bridge integration, provider call, migration, or remote
capability expansion is introduced. Health states such as `HEALTHY` remain a
P8 concern. Profiles remain declarative and cannot contain executable code,
remote modules, arbitrary URLs, or transport capabilities.
