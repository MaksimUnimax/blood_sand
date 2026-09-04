# ADR-0011 — P3 Deterministic Policy and Rollout Resolution

Date: 2026-09-04
Status: Accepted

## Decision

P3.3 resolves compatibility and remote boolean feature restrictions only from
immutable records pinned by an immutable config release. SemVer precedence is
SemVer 2.0 precedence; Chromium-family versions use one to four unsigned
decimal components, padded with zeros. Invalid comparison inputs fail closed.

Config selection uses the reserved `bootstrap.config` rollout when present;
otherwise it uses the latest compatible immutable config release. Cohorts are
deterministic SHA-256 buckets over the fixed rollout domain, rollout identity,
seed, subject kind, and stable account/device identifier. Rollout edits append
revisions; pause and rollback never rewrite history.

Remote features are stable boolean restriction primitives. There is no generic
targeting expression or JSON policy language. Publication commands and their
required audit events commit in one transaction. A config-release manifest is
strict, canonical, and contains only immutable source identifiers and public
signing metadata.

## Boundaries

This decision adds no entitlement semantics, private signing-key handling,
runtime signing, or HTTP/bootstrap endpoint. P3.4 owns snapshot composition;
P3.5 owns signing-key lifecycle eligibility.
