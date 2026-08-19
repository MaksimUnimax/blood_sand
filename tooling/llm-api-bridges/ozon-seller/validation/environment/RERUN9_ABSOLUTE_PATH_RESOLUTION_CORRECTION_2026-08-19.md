# Ozon RERUN9 validation correction — absolute path resolution

Date: 2026-08-19
Status: `AUTHORIZED_VALIDATION_ONLY_CORRECTION`

## Scope

Validation harness only. No production, candidate, browser behavior, provider behavior, assertion, timeout, packaging, or Chrome-flag change is authorized.

## Evidence

RERUN9 report commit:
`88a48bb6e826c7347a1f0da95cb2a5d735910773`

RERUN9 successfully completed canonical CFT inventory/copy/setup preparation, including setup exit code `78`, then failed before candidate reconstruction with:

`ENOENT ... D:\codex\Test\qa-harness\puppeteer-extension-qa\blood_sand\tooling\llm-api-bridges\ozon-seller\artifacts\OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

The wrapper invocation supplied relative repository and QA-root arguments. The inner consolidated runner resolved the relative repository argument under the QA-root working directory, creating an invalid nested path.

Classification: `HARNESS_ERROR`.

## Authorized correction

For the next authoritative full-gate wrapper:

1. Resolve the repository root to an absolute path in the outer wrapper before any child process is spawned.
2. Resolve the QA project root to an absolute path in the outer wrapper before any child process is spawned.
3. Reject either root if it is not absolute after normalization.
4. Before the one authoritative consolidated execution, perform only non-functional path/integrity assertions allowed by the permanent gate workflow:
   - exact repository root exists;
   - exact QA root exists;
   - frozen artifact exists at the expected absolute repository path;
   - permanent living-gate file exists at the expected absolute repository path;
   - Puppeteer package exists under the exact absolute QA root;
   - source CFT root exists at the exact qualified absolute QA path.
5. Spawn the inner consolidated runner with absolute repository root and absolute QA root arguments only.
6. If a child working directory is supplied, it must not affect path resolution because all authority paths are absolute.
7. Emit diagnostics containing the normalized absolute roots and the absolute frozen-artifact path before candidate reconstruction.

## Forbidden changes

Do not:

- change production or candidate bytes;
- change CFT inventory algorithm;
- change owned-copy/setup semantics;
- change setup success code `78`;
- change Chrome launch flags;
- change worker activation semantics;
- change functional assertions;
- change provider fixtures;
- weaken or skip permanent blocks 01–16;
- retry failed functional assertions;
- use `NOT_APPLICABLE` for existing functionality.

`NOT_RUN` remains the truthful status for an existing block that was not reached.

## Next action

One consolidated RERUN10 may be executed after this correction is incorporated into its temporary validation wrapper. No separate browser/environment preflight is required because RERUN9 already passed canonical source CFT inventory, source/copy identity, setup exit `78`, and copied post-setup byte identity before the path-resolution failure.
