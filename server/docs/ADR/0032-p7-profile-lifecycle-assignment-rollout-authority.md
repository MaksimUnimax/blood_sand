# ADR-0032  P7 profile lifecycle, assignment and rollout authority

Status: P7.2 local candidate; Correction Attempt 3 awaiting focused independent review
Date: 2026-09-10

## Decision

P7.2 owns internal commands for profile-revision lifecycle and stable profile
assignment scopes. Transport, bootstrap resolution, signed distribution and
health validation remain later roadmap work.

Profile revisions move only DRAFT -> CANDIDATE -> PUBLISHED -> RETIRED.
Draft content and compatibility may be replaced with an exact fingerprint
precondition. A candidate freezes the previously committed identity, content,
compatibility, schema, metadata and fingerprint. Publication changes only
publication metadata; retirement is explicit and is blocked while the revision
is referenced by the latest effective assignment revision.

Physical INSERT into adapter_profile_revisions is DRAFT-only and publication
metadata is unset. PostgreSQL enforces this boundary and the legal lifecycle
graph. The database does not semantically recompute the profile fingerprint:
P7.2 application/domain command authority validates strict content and
compatibility, recomputes profileRevisionFingerprint({ content, compatibility
}), and requires equality with the persisted hash before candidate promotion.

adapter_profile_assignments is an immutable scope keyed by adapter, surface,
optional variant and browser family. Surface-default (variant_id IS NULL) and
variant-specific scopes are distinct and use PostgreSQL partial unique indexes.
At stable-scope creation, the server generates the scope's 32-byte cohort seed
with cryptographically secure `randomBytes(32)`. The normal API exposes no
caller-supplied seed or test-seed parameter, and callers cannot override the
persistent value. The seed remains stable for the lifetime of the immutable
assignment scope. The scope also owns an immutable subject kind (ACCOUNT or
DEVICE). Exact variant profiles may only use exact variant assignments;
null-variant profiles may only use surface-default assignments.

adapter_profile_assignment_revisions is append-only. DIRECT has only a
published baseline; ROLLOUT has distinct published baseline/candidate and a
0..10000 basis-point percentage; PAUSED retains the rollout pair and
percentage but always selects baseline. Percentage changes, pause, resume,
completion and rollback append a new revision. Existing-assignment commands
require the exact latest revision number and serialize on the stable assignment
row.

Every assignment revision INSERT first identifies all non-null profile targets,
locks all distinct target UUIDs in ascending UUID-text order, and only then
reads target rows and validates PUBLISHED state, hierarchy, status and browser
compatibility. The same transaction-scoped advisory lock is acquired by the
PUBLISHED -> RETIRED database guard before it checks the latest assignment
revision for active references. The lock namespace is the deterministic
hashtextextended key for
p7.2/profile-revision-target/<target UUID>. It is transaction scoped; no lock
table is added. Assignment target eligibility is trigger-enforced after the
shared lock, so the retirement/assignment race is safe for direct SQL too.

The previous P7.1 mutable raw profile-revision persistence export is retired
from supported production use. @product/db exposes a read-only adapter-registry
catalog and the separate narrow P7.2 lifecycle repository. Supported lifecycle
mutations go through P7.2 command authority and are transactionally audited.
PostgreSQL guards provide structural/lifecycle integrity; they do not create
application audit events for arbitrary privileged DBA SQL.

Rollout cohorts call the accepted P3 selectRolloutCandidateV1 primitive with
the code-defined key ai.profile.assignment. P7.2 does not modify P3 wire
schemas, config-release behavior, bootstrap behavior or feature rollout
behavior. Tests use the persisted server-generated seed for P3 equivalence;
pure selector tests construct fixed in-memory assignment state without
injecting a seed into scope creation.

## Boundaries

P7.3 will own bootstrap AI resolution and signed profile distribution. P7.4
will own admin HTTP/RBAC transport. P8 will own browser execution, health
evidence and automatic rollback. No P7.2 command detects an AI family, reads
a tab/URL, evaluates entitlement, creates a bootstrap payload or signs one.
