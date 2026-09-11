# P7.2 exact unit-test count provenance correction — 2026-09-11

Technical ID: `PRODUCT-CONTROL-PLANE-P7_3-ATTEMPT3-PROVENANCE-AUTHORITY-CORRECTION-2026-09-11`

Status: `P7.2 DONE / REMOTE ACCEPTED; provenance classification corrected for P7.3 regression comparison`.

This is a provenance correction only. It does not alter P7.2 product
acceptance, product verdicts, historical result lines, or the accepted P7.2
remote state.

## Authority decision

The accepted P7.2 evidence file
`P7_2_PROFILE_LIFECYCLE_ASSIGNMENT_LOCAL_EVIDENCE_2026-09-10.md` preserved
historical local observations of:

- `BASE_EXACT_PNPM_TEST_TOTAL = 1169`.
- `ATTEMPT3_EXACT_PNPM_TEST_TOTAL = 1173`.
- earlier/lower observations of `1110`, `1112`, `1112`, and `1113`.

Those values and their result lines remain preserved as historical local
observations. The discrepancy/root cause was never established. This document
does not claim that the 1169/1173 runs never happened and assigns no cause to
the difference.

The higher-authority exact-SHA execution for the P7.2 regression baseline is
GitHub Actions run `34487778764`:

```text
GITHUB_RUN_ID = 34487778764
GITHUB_RUN_HEAD_SHA = 3fcc8becfe697554594a480c311d729fa1f2b73e
GITHUB_RUN_STATUS = completed
GITHUB_RUN_CONCLUSION = success
NODE = 24.20.0
PNPM = 10.34.5
INSTALL_COMMAND = pnpm install --frozen-lockfile
UNIT_COMMAND = pnpm test
UNIT_COMMAND_EXPANSION = pnpm -r test && pnpm bridge:guard
CANONICAL_CI_UNIT_PACKAGE_COUNT = 31
CANONICAL_CI_UNIT_NONZERO_PACKAGE_RESULT_COUNT = 30
CANONICAL_CI_UNIT_TEST_TOTAL = 1113
CANONICAL_CI_UNIT_FAILED = 0
CANONICAL_CI_UNIT_SKIPPED = 0
```

The run checked out the exact canonical SHA. Its `pnpm test` result was kept
separate from the later workflow steps: the separately executed integration
result was `1475` passed and the separately executed E2E result was `69`
passed. Neither is included in the unit total. `bridge:guard` is a workflow
command, not a test case.

## Machine-readable canonical unit breakdown

The package-level counts below are the independently checked breakdown for the
canonical exact-command unit collection. The exact canonical CI total is
`1113`; the arithmetic was independently recomputed from these package rows.
The recursive workflow scope contains 31 of 32 workspace projects. The one
zero-test project is listed explicitly as zero under `--passWithNoTests`.

```text
CANONICAL_CI_UNIT_PACKAGE_COUNT = 31
CANONICAL_CI_UNIT_TEST_TOTAL = 1113
CANONICAL_CI_UNIT_ARITHMETIC =
  admin 92 + admin-billing 0 + api 210 + health-runner 1 + portal 36 + worker 16 +
  adapter-registry 10 + admin-auth 38 + admin-commercial 89 + admin-ops 107 +
  auth 9 + billing 175 + billing-simulator 42 + bootstrap 9 + commercial-access 65 +
  commercial-catalog 3 + compatibility 3 + contracts 6 + db 11 + device-auth 9 +
  device-management 3 + email 2 + entitlements 10 + extension-auth 9 +
  observability 2 + plans 12 + pricing 6 + remote-config 34 + shared 2 +
  simulated-extension-client 33 + subscriptions 69 = 1113
```

The package rows (30 nonzero result lines plus the explicit zero-test row) are:

| Workspace package | Unit cases |
| --- | ---: |
| `apps/admin` | 92 |
| `apps/admin-billing` | 0 |
| `apps/api` | 210 |
| `apps/health-runner` | 1 |
| `apps/portal` | 36 |
| `apps/worker` | 16 |
| `packages/adapter-registry` | 10 |
| `packages/admin-auth` | 38 |
| `packages/admin-commercial` | 89 |
| `packages/admin-ops` | 107 |
| `packages/auth` | 9 |
| `packages/billing` | 175 |
| `packages/billing-simulator` | 42 |
| `packages/bootstrap` | 9 |
| `packages/commercial-access` | 65 |
| `packages/commercial-catalog` | 3 |
| `packages/compatibility` | 3 |
| `packages/contracts` | 6 |
| `packages/db` | 11 |
| `packages/device-auth` | 9 |
| `packages/device-management` | 3 |
| `packages/email` | 2 |
| `packages/entitlements` | 10 |
| `packages/extension-auth` | 9 |
| `packages/observability` | 2 |
| `packages/plans` | 12 |
| `packages/pricing` | 6 |
| `packages/remote-config` | 34 |
| `packages/shared` | 2 |
| `packages/simulated-extension-client` | 33 |
| `packages/subscriptions` | 69 |

The raw anonymous GitHub job-log download endpoint returned HTTP 403 and the
run page requires sign-in for logs in this execution context. Read-only run
metadata independently verified the exact head SHA, completed/success state,
and successful workflow step names; the workflow at that SHA independently
verified Node, pnpm, install, and command configuration. The package rows and
arithmetic above are recorded without guessing omitted packages, and the
canonical total is the owner-side exact-run observation corroborated by the
clean exact-base reproduction below.

## Clean base and P7.3 candidate comparison

A clean local exact-base reproduction on 2026-09-11 checked out
`3fcc8becfe697554594a480c311d729fa1f2b73e` and ran the same repository
command with Node `24.20.0`, pnpm `10.34.5`, and the existing dependency
store. It produced:

```text
CLEAN_EXACT_BASE_PNPM_TEST = 1113 passed / 0 failed / 0 skipped
P7_3_EXACT_PNPM_TEST_CANDIDATE = 1127 passed / 0 failed / 0 skipped
P7_3_UNIT_DELTA = 1127 - 1113 = +14
```

P7.3 contributes exactly two newly collected unit files, seven cases each:

```text
server/packages/bootstrap/src/ai-resolution.test.ts = 7
server/packages/simulated-extension-client/src/ai-binding.test.ts = 7
P7_3_ADDED_COLLECTED_UNIT_FILES = 2
P7_3_ADDED_UNIT_CASES = 14
```

The new PostgreSQL file
`server/packages/db/src/p7.3-bootstrap-ai.integration.test.ts` is excluded
from the unit command by the DB package test script and is counted only in the
focused integration result.

Therefore:

```text
CANONICAL_P7_2_EXACT_PNPM_TEST_BASELINE = 1113
P7_3_EXACT_PNPM_TEST_CANDIDATE = 1127
P7_3_UNIT_DELTA = +14
```

The historical `1169 / 1173` observations remain documented history but must
no longer be used as the exact canonical unit baseline. This classification
correction asserts no explanation for the historical discrepancy.

## Secondary corroboration and boundaries

Implementation run `34485896603` was also read through the read-only GitHub
run endpoint and reported `completed / success` at implementation SHA
`868e0873a6dcf22f2f81e475fe91687f17dd132d`; it is secondary corroboration
only. The canonical baseline authority is run `34487778764` at
`3fcc8becfe697554594a480c311d729fa1f2b73e`.

Integration and E2E totals remain separate: `1475` integration cases and `69`
E2E cases. They are not folded into `1113`.

No P7.2 product verdict, `P7.2 DONE / REMOTE ACCEPTED` state, migration,
OpenAPI artifact, Bridge boundary, or P7.3 product implementation is changed
by this document.
