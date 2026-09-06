# P4.3 Price Revision / New-Sale Grandfathering Local Evidence

Technical ID: `PRODUCT-CONTROL-PLANE-P4.3-PRICE-REVISION-NEW-SALES-GRANDFATHERING-CORRECTIVE-LOCAL`  
Attempt: 2  
Date: 2026-09-06

## Attempt history

Attempt 1: `LOCAL PASS CLAIM INVALIDATED BY CHATGPT REVIEW`.

Reason: only 2 distinct P4.3 real-PostgreSQL cases existed while acceptance
required at least 22 independent physical cases. The Attempt-1 patch and
untracked archive remain preserved as invalidated candidate artifacts.

Attempt 2: `52-CASE CORRECTIVE TEST HARDENING`.

Current status: `ACCEPTED — P4.3 DONE`.

## Implementation

The Attempt-1 implementation was preserved and inspected before test
expansion. New physical tests exposed two root defects, both corrected without
schema or architecture drift:

1. Price revision/update/publication and sale/status mutations did not
   consistently re-read the parent plan status. They now enforce the shared
   `p4-plan:<planId>` serialization and reject stale post-archive mutations.
2. An exact repeat of the current sale assignment appended a duplicate row.
   It now returns `changed: false` with no duplicate audit.

No other implementation correction was required.

## Physical PostgreSQL matrix

`server/integration/p4-3-price-commands.integration.test.ts` contains 52
distinct passing `it(...)` cases. The matrix maps as follows:

| Required evidence | Physical test names |
| --- | --- |
| Create and code concurrency | creates a DRAFT price with stable identity and one PRICE_CREATED audit; rejects duplicate price code without a second audit; serializes concurrent same-code creates to one row and one audit; rejects price creation under an archived plan without mutation or audit |
| Revision allocation and binding | allocates sequential draft price revisions on the server; allocates distinct revision numbers for concurrent draft creation; allows a DRAFT price revision to bind to a same-plan DRAFT plan revision; rejects cross-plan draft revision binding without mutation or audit; rejects new draft revision creation for an archived price |
| Fingerprint and draft editing | returns a deterministic current draft fingerprint; updates valid draft terms, changes the fingerprint, and audits once; rejects a stale second writer and preserves the first writer without stale audit; treats same resulting draft terms as a no-op without duplicate audit; allows same-plan rebind and changes the draft fingerprint; rejects cross-plan draft rebind without changing terms or audit; rejects invalid money, interval, and effective-window inputs before commercial mutation |
| Publication | publishes a price against a published plan revision with injected time and one audit; rejects publication while the bound plan revision is DRAFT; makes second publication idempotent with unchanged publishedAt and no audit; rejects stale fingerprint publication; rolls back publication and audit when audit insertion fails; retains the P4.1 database protection against direct published-term mutation |
| Price lifecycle | requires a published price revision before DRAFT can become ACTIVE; allows DRAFT to become ACTIVE after publication and audits the transition; supports ACTIVE to HIDDEN and HIDDEN to ACTIVE; rejects ACTIVE or HIDDEN to DRAFT; makes ARCHIVED terminal; treats same-state price status changes as no-ops without audit; rejects ACTIVE and HIDDEN targets when the parent plan is archived; can archive a price after its parent plan is already archived |
| Sale assignment | creates the first sale assignment with server revision and one audit; rejects selecting a DRAFT price revision without assignment mutation; rejects a cross-price selected revision; rejects assignment effectiveFrom outside the selected revision window; serializes concurrent assignments with one optimistic-concurrency winner and final DB revision 1; makes an exact current assignment idempotent without a duplicate row or audit; appends a new assignment revision when the schedule differs; appends a NULL selected revision as an explicit closure; rolls back sale assignment append and audit when audit insertion fails |
| New-sale resolution | rejects new-sale resolution when no assignment is effective; rejects resolution when the parent plan is not ACTIVE; rejects resolution when the price is not ACTIVE; resolves an active plan and price to exact immutable published terms; ignores a future assignment before its effectiveFrom; selects the highest assignment revision when multiple assignments are effective; resolves an effective NULL assignment as explicitly closed; fails closed at the exact selected revision effectiveTo; does not fall back when the highest effective assignment selects an expired revision; performs resolution without audit mutation |
| Historical behavior and serialization | grandfathers exact published revision 1 after switching new sales to revision 2; supports selection, NULL closure, and reopen with a new selected revision; serializes plan archival against a price mutation with a deterministic archive-first gate |

Concurrency tests assert final database state. Rollback tests assert absent
partial rows/state and unchanged audit counts. Grandfathering re-reads the old
published row and verifies its UUID and terms are unchanged.

## Required status

Final status:

`ACCEPTED — P4.3 DONE`

## Remote acceptance

- Implementation commit: `c6bb2cda0643c1032842f7f79a8a23ae2c4d1107`, parent
  `20cf3adbef703ad4cb5a478dbab8a81e731b8609`, message
  `feat(server): add price revision sale selection services`.
- Code CI: GitHub Actions `Server CI`, run `34014838177`, head
  `c6bb2cda0643c1032842f7f79a8a23ae2c4d1107`, succeeded. Results: 221 unit,
  196 integration, 52 P4.3, 21 P4.2, 30 P4.1, 12/12 P3.1 crypto, and 24/24
  E2E; OpenAPI remained the exact accepted artifact and migrations remained
  `0000..0008`.
- Remote committed review: `PASS`. Parent-plan archival enforcement and exact
  duplicate sale-assignment no-op are present remotely. Grandfathering,
  expiry-fail-closed, no-fallback, audit rollback, and P4.3 boundaries pass.

## Final acceptance gates

- Unit/regression: 221 passed, 0 failed, 0 skipped/todo. P3.1 crypto: 12/12.
- Real PostgreSQL integration: 196 passed, 0 failed, 0 skipped/todo; baseline
  144 and P4.3 52. P4.1: 30/30. P4.2: 21/21.
- Migrations: `0000..0008` only; first and second runs passed. Migration
  `0008_p4_1_commercial_catalog.sql` SHA-256:
  `d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1`.
- OpenAPI: 15 routes; both checks passed; artifact SHA-256
  `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- E2E: 24/24 passed.
- DB-down and DB-up lint, format, typecheck, unit, integration, OpenAPI,
  bridge, build gates passed. Dedicated disposable PostgreSQL resources and
  E2E test-result artifacts were removed. Final disk usage: 79%.

## Recovery

- Attempt-1 artifacts preserved unchanged. Invalidation checkpoint patch:
  `/var/backups/product-control-plane/git/blood_sand-p4.3-attempt1-invalidated.patch`,
  2128 bytes, SHA-256
  `2985ad6119828d2483ffa84325cdca6a4f1b9826bc8da15bc61f97147f6e2864`.
- Attempt-1 invalidation checkpoint archive:
  `/var/backups/product-control-plane/git/blood_sand-p4.3-attempt1-invalidated-untracked.tar.gz`,
  10518 bytes, SHA-256
  `112d95f9cd7028f73f55b2496981bc040e57a2d3bc5e0bec837244a300ca64d5`.
- Attempt-2 accepted patch:
  `/var/backups/product-control-plane/git/blood_sand-p4.3-attempt2-local-accepted-uncommitted.patch`,
  3248 bytes, SHA-256
  `b6664b367736cb1ef5823af54914e5f1f86ecfdeaeb024644673e955c1940227`.
- Attempt-2 accepted untracked archive:
  `/var/backups/product-control-plane/git/blood_sand-p4.3-attempt2-local-accepted-untracked.tar.gz`,
  19119 bytes, SHA-256
  `ed213ff55677e26a34ed03836f2023188f1c34ab3e8176beaea977125205aedc`.
  Untracked count: 8.

P4.1 remains DONE, P4.2 remains DONE, P4.3 is DONE, P4.4 is NEXT, and
P4.5/P4.6 remain PLANNED. P5–P15 remain PLANNED. P4.4 was not executed.
