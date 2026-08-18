# Targeted evidence canonical harness update — 2026-08-18

Status: `AUTHORITATIVE_TARGETED_HARNESS_UPDATE`

This note supersedes only the earlier canonical targeted-harness byte count/hash recorded in `IMPLEMENTATION_AND_TARGETED_EVIDENCE_2026-08-18.md` before the live `COMPOSER_NOT_FOUND` regression was added.

The production repair patch is unchanged:

- bytes: `13648`
- SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Current canonical targeted harness is reconstructed from all four GitHub parts listed in `PATCH_AND_TARGETED_TEST_PARTS.md`:

- bytes: `21942`
- SHA-256: `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`

The added live-regression assertion is:

`TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`

It verifies that a Manual pre-insert delivery with a temporarily unavailable composer does not throw `COMPOSER_NOT_FOUND`, does not request insert commit, and instead enters the same recoverable Manual composer wait.

The exact canonical four-part harness passed `node --check` and then emitted all prior targeted PASS markers plus `TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS` against the repaired V3/frozen-content-compatible fixture.

The earlier three-part harness SHA `ba5f90e3dcde4cf877e81d645f2b724e545a314ccd07e4f7e0588a11142283ad` is historical development evidence only and MUST NOT be used as the current targeted-test authority.