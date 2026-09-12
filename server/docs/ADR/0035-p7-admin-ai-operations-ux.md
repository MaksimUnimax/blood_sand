# ADR-0035 — P7.5 Admin AI operations UX

Status: Implemented; locally accepted; remote acceptance pending
Date: 2026-09-12

## Decision

P7.5 is a UI/BFF-only layer over the remotely accepted P7.4 Admin AI API.
The corrected P7.4 API, request schemas, response schemas, permissions,
database, migrations, and OpenAPI document are reused without expansion.

The Admin Portal provides permission-driven workspaces at:

- `/ai/registry` — adapter → surface → variant hierarchy and bounded metadata/status operations;
- `/ai/profiles` — stable profile identities and the DRAFT → CANDIDATE → PUBLISHED → RETIRED lifecycle;
- `/ai/assignments` — scope creation and DIRECT/ROLLOUT/percentage/pause/resume/complete/rollback operations.

The BFF allowlist remains exact and explicit: 49 pre-P7.5 admin tuples plus
35 P7 tuples plus 2 OTP tuples equals 86. The assignment mutation paths are
the corrected flat forms:

- `POST /v1/admin/ai/assignments/{assignment_id}/direct`
- `POST /v1/admin/ai/assignments/{assignment_id}/rollout`
- `POST /v1/admin/ai/assignments/{assignment_id}/percentage`
- `POST /v1/admin/ai/assignments/{assignment_id}/pause`
- `POST /v1/admin/ai/assignments/{assignment_id}/resume`
- `POST /v1/admin/ai/assignments/{assignment_id}/complete`
- `POST /v1/admin/ai/assignments/{assignment_id}/rollback`

Nested `/rollout/percentage`, `/rollout/pause`, `/rollout/resume`, and
`/rollout/complete` aliases are not allowed.

## UX and safety contract

- Navigation is derived from `GET /v1/admin/me`; the client does not rebuild a role matrix.
- Owner and Ops can manage; Support sees read-only workspaces; BillingReadonly sees no AI navigation. Direct routes remain server-authorized.
- Registry machine keys and hierarchy bindings are immutable. Metadata/status writes use `updatedAt`; stale review is invalidated and never retried.
- The profile editor is a bounded, structured `adapter_profile_v1` and compatibility form. It accepts packaged references, fixed roles/strategies, bounded timeouts/observations, accepted contours, browser families, and versions only. It has no executable code, selectors, URLs, headers, HTTP, filesystem, module, WASM, or eval capability.
- Only DRAFT content is editable. CANDIDATE, PUBLISHED, and RETIRED revisions are read-only. Fingerprints, actors, timestamps, and compatibility remain server-authoritative.
- Every mutation requires an explicit reason, review, confirmation, and one request. High-impact operations display authoritative state/revision/fingerprint as applicable.
- Assignment changes send `expectedLatestAssignmentRevision`, convert percentages exactly to basis points, and refresh assignment detail/history after success. The mutation response is treated as exactly `revision`, `mode`, `baselineProfileRevisionId`, `candidateProfileRevisionId`, `percentageBps`, and `createdAt`; no internal mutation ID, cohort seed, or stored reason is expected or rendered.
- No privileged draft data is persisted in localStorage, sessionStorage, or IndexedDB. HttpOnly admin sessions are not read by browser JavaScript. CSRF, same-origin BFF forwarding, no-store responses, safe headers, and the existing mutation coordinator remain in force.

## Boundaries

P7.5 does not implement Health, Bridge integration, provider calls, manual
profile override, P7.6, P8, new API routes/schemas, OpenAPI changes, database
changes, or migrations. P7.6 remains the final P7 security, architecture,
regression, and acceptance review.
