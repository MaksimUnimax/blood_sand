# Ozon Performance Step 8 — terminal acceptance roadmap

**Status:** `ACCEPTED`

## Starting point

- Accepted Seller Step 7 executable candidate: `b567b7fc481b2baff964ce96b9a9a334d841ae30`.
- Step 8 branch: `repair/ozon-step8-performance-48-terminal-2026-08-31`.
- Canonical branch remains protected and unchanged: `repair/ozon-v2-b1-stocks-warehouse-2026-08-29` at `8ee16f38bf2ec60e4b2e42192c2f41d87021b214`.
- Performance authority contains `48` operations.
- Previously accepted current-read surface contains `21` operations.
- Step 8 terminal work queue therefore contains `27` operations.

## Rules

1. Do not modify or promote canonical during candidate work.
2. Every authority decision must be terminal and evidence-backed: implemented read, already accepted read, unavailable in current official authority, out of read scope, write/mutation, or another explicit terminal class.
3. Unknown, pending and unresolved states are forbidden at formal acceptance.
4. Every implemented business operation must preserve the one-operation/one-physical-request invariant.
5. Personal Data surfaces must reuse the existing explicit authorization gate; denial must execute zero physical requests and must never auto-replay a command.
6. Existing Seller `245` read behavior and accepted Performance `21` behavior are regression-protected.
7. Generated inventories, proofs and packages must be reproducible and byte-identical on Linux and Windows.
8. Candidate and evidence commits are separate from canonical promotion.

## Work plan

### P8.1 — Authority inventory

- Reconstruct the authoritative Performance `48`-operation matrix from repository evidence.
- Prove operation identity uniqueness.
- Prove `48 / 21 / 27` arithmetic.
- Freeze a machine-readable JSON/CSV/Markdown baseline.

### P8.2 — Existing-decision normalization

- Normalize each of the `48` records into operation id, method, path, existing decision and evidence locator.
- Match the `21` previously accepted current reads to production operation names.
- Produce the exact remaining `27`-operation queue.

### P8.3 — Terminal classification

For every remaining operation, record exactly one terminal result:

- `IMPLEMENT_READ`;
- `SAFE_PROJECTION_READ`;
- `PERSONAL_DATA_GUARDED_READ`;
- `ALREADY_ACCEPTED_READ`;
- `NO_CURRENT_OFFICIAL_AUTHORITY`;
- `OUT_OF_READ_SCOPE`;
- `WRITE_OR_MUTATION`;
- another explicit fail-closed terminal class with evidence.

### P8.4 — Implementation

- Add only operations authorized as current reads.
- Preserve exact request/response schemas and fail-closed validation.
- Regenerate registry, bundle and extension candidate.

### P8.5 — Runtime and privacy

- Execute every new read through mocked physical transport.
- Prove one operation equals one physical request.
- Prove Personal Data denial, authorized explicit resubmit and zero replay.

### P8.6 — Regression

- Re-run Seller `245` coverage.
- Re-run previously accepted Performance `21` coverage.
- Run the complete Performance terminal matrix.

### P8.7 — Cross-platform and freeze

- Run Linux and Windows independently.
- Compare all generated evidence and package bytes.
- Freeze the candidate in the repository and reproduce it from a fresh checkout.

### P8.8 — Formal acceptance

Required closing conditions:

```text
PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS
PERFORMANCE_STEP8_UNKNOWN_0_PASS
PERFORMANCE_STEP8_PENDING_0_PASS
PERFORMANCE_STEP8_UNRESOLVED_0_PASS
PERFORMANCE_STEP8_RUNTIME_ONE_REQUEST_PASS
PERFORMANCE_STEP8_PRIVACY_PASS
PERFORMANCE_STEP8_REGRESSION_PASS
PERFORMANCE_STEP8_LINUX_WINDOWS_BYTE_IDENTICAL_PASS
OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED
```

## Current progress

- P8.1 local builder reproduction: `PASS`.
- Authoritative total: `48`.
- Existing accepted current reads: `21`.
- Remaining queue: `27`.
- Repository cross-platform baseline CI: pending.

## Formal completion — v2

- Source commit: `fb8e984791150605d4c1b84534c58a7a076e0734`.
- Workflow run: `33478203985`.
- Performance operations terminal: `48 / 48`.
- Current Performance reads preserved: `21`.
- Remaining source-terminal decisions: `27`.
- New runtime implementation required: `0`.
- Unknown / pending / unresolved: `0 / 0 / 0`.
- Linux/Windows byte identity: `PASS`.
- Fresh repository freeze verification: `PASS`.
- Independent reverification: `PASS`.
- `OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED`.
- Next stage: `repair/ozon-step9-full-integration-266-reads-2026-09-01`.
