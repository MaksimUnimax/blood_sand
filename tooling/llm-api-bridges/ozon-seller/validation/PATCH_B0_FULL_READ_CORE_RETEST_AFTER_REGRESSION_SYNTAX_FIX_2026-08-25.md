# Patch B0 Full Read Core — retest after deterministic regression syntax repair

Date: 2026-08-25
Status: `READY_FOR_INDEPENDENT_RETEST_AFTER_VALIDATION_FIX`

Repository: `MaksimUnimax/blood_sand`
Branch: `feature/ozon-full-read-core-b0-2026-08-25`
Previous tested HEAD: `d6789436902995ffba924d568fee186f10c2b6f7`
Previous result commit: `fd5f7810cf31a458d422e431982e4fde9dadcad3`
Regression syntax repair commit: `36140b283613432527516f46dea0ce6366981db0`

## Authority already proven by the previous independent run

The previous run successfully materialized the exact B0 production candidate.

Required authority remains unchanged:

- production files: `21`
- production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- accepted A.5 tree SHA-256: `4b77ed8500e3caacefff43a82002dc6ef5bfd562511bf10ef57a5392069c22a0`
- B0 patch SHA-256: `7842bbe1c9be77ae753a8f5dec25d5d931736ace32e2198acec0da51666a6e21`

All inherited A.5 materializer markers and all six B0 materializer markers were observed PASS in the previous independent run.

The previous candidate was rejected only because the mandatory deterministic regression program itself failed to parse before executing assertions:

```text
SyntaxError: Unexpected token '}'
```

The root cause was an extra object-closing brace in the synthetic Swagger fixture of:

`PATCH_B0_FULL_READ_CORE_REGRESSION_2026-08-25.mjs`

The validation-only repair changes the fixture closing from a double close across two statements to the single valid object close:

```js
  }},paths:{}};
```

No B0 production candidate file, patch bytes, transport chunk, expected production SHA, Autorun behavior, provider code, quota/timing state, cache/history, credentials, or Work-session production logic was changed by this repair.

## Mandatory retest order

1. Record exact branch HEAD before testing.
2. Materialize B0 again into a completely fresh output directory.
3. Require all inherited A.5 markers and all six B0 materializer markers.
4. Require exact 21-file production tree SHA-256 `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`.
5. Run `node --check` on the deterministic regression file itself before executing it.
6. Run the mandatory B0 deterministic regression.
7. Require all seven deterministic B0 markers.
8. Run `node --check` on every materialized production `.js` file.
9. Only then execute the complete browser acceptance matrix.

If deterministic regression still fails, record the exact assertion/stack and stop treating later browser evidence as acceptance authority. Do not modify production code.

## Browser harness isolation requirement

The previous browser attempt used a synthetic fixture that entered `delivering`; subsequent guidance and personal-data commands were then blocked by `MANUAL_OPERATION_ACTIVE`. That state is fixture/test-sequencing contamination and must not be reused as evidence for later independent scenarios.

For this retest:

- each major browser scenario must start from a fresh isolated browser fixture/session or from an explicitly completed/clean Manual state;
- do not carry an unfinished `delivering` operation into guidance, personal-data OFF, personal-data ON, invalid-param, or metadata scenarios;
- temporary Puppeteer/CDP/synthetic ChatGPT harness code may be corrected or rebuilt outside the production candidate tree to accurately model a supported ChatGPT Work DOM and confirmed delivery lifecycle;
- harness/test-fixture corrections are allowed; B0 production code modifications are forbidden;
- if a fixture cannot render extension-owned controls, repair the temporary fixture or mark that fixture attempt environment-only; do not classify a harness mismatch as a production failure without production evidence;
- any accepted personal-data OFF/ON result must come from an actually executed isolated scenario, not inferred from zero requests caused by an unrelated blocked `delivering` state.

## Required browser authority

The complete B0 tester instruction remains authoritative:

`PATCH_B0_FULL_READ_CORE_CODEX_TEST_INSTRUCTION_2026-08-25.md`

In particular require fresh evidence for:

- A.5 Work-session Start/Hide/Show/Finish/Resume non-regression;
- V1 compatibility aliases;
- V2 section guidance;
- personal-data OFF local block with `physical_business_request_count=0`;
- no automatic replay when personal-data setting is enabled;
- explicit personal-data ON resubmit with exactly one fixed Seller request when valid test credentials/data are available;
- invalid personal-data params rejected before provider;
- Premium exact-request preservation where environment can demonstrate the required subscription condition;
- unrestricted analytics behavior;
- metadata update/failure preservation;
- fixed provider path/method and no arbitrary AI-supplied transport/auth fields;
- diagnostics without raw customer payload;
- confirmed-delivery durable payload scrub/no replay.

Environment-only cases must be marked only where the main tester instruction explicitly permits them.

## Result

Update the existing result file only after the retest:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_CODEX_RESULT_2026-08-25.md`

Commit only the updated result/evidence file.

Final decision exactly one of:

- `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED`
- `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

No B1–B8 work starts until B0 receives independent acceptance.
