# Ozon Bridge v0.1.19 — generic session launcher working-tree EOL correction

Date: 2026-08-20  
Status: `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_RERUN_PERMITTED_AFTER_EOL_PIN_FINAL_B01_B15_STILL_STOPPED`

Repository: `MaksimUnimax/blood_sand`  
Development branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Purpose

This correction addresses the concrete blocker recorded by the checkout-sync acceptance rerun report commit:

`a73dda6f8bbb08cf3f7e1000257f70bc94df5cf0`

The rerun proved that ordinary Git fetch plus a fresh detached worktree successfully obtained the exact authority commit and the exact committed launcher Git blob:

`1cbd85f244f8dc54c51ac9a044e36b13b0bd0320`

The launcher path existed and `node --check` exited `0`, but the Windows working-tree file SHA-256 was:

`6a226a12ff7afa77f21dee77f0975a5b09d0e9b192740c88126eb288452c7c69`

while the frozen launcher SHA-256 authority requires:

`0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600`

Because the Git blob identity matched exactly while only the checked-out file bytes differed, the blocker is a repository checkout reproducibility issue, not evidence of a launcher source change or production defect.

The repository previously had no root `.gitattributes`, so the required working-tree EOL representation of this frozen text asset was not repository-enforced across Git client configurations.

## Repository correction

A root `.gitattributes` file now contains exactly this narrow rule:

`tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER.mjs text eol=lf`

The rule is intentionally scoped to the frozen generic session launcher only.

It does not change the launcher Git blob, production candidate bytes, CFT, test programs, or product behavior. It only makes the checked-out byte representation of this tracked text asset deterministic across Windows Git configurations.

The launcher Git blob must remain:

`1cbd85f244f8dc54c51ac9a044e36b13b0bd0320`

The required checked-out launcher SHA-256 remains:

`0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600`

Do not weaken or remove the SHA-256 requirement.

## Required next acceptance acquisition

The next independent launcher acceptance must again start from ordinary Git and a NEW empty detached worktree pinned to the exact authority commit supplied by ChatGPT.

Required sequence before any launcher execution:

1. `git fetch origin` sufficient to obtain the exact authority commit.
2. Create a fresh detached worktree at that exact commit.
3. Verify detached worktree `HEAD` equals the exact authority commit.
4. Verify the launcher path exists.
5. Verify the launcher Git blob is exactly `1cbd85f244f8dc54c51ac9a044e36b13b0bd0320`.
6. Verify Git attributes for the launcher resolve to `text: set` and `eol: lf` using ordinary Git attribute inspection.
7. Verify working-tree launcher SHA-256 is exactly `0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600`.
8. Run `node --check` on that exact launcher file and require exit code `0`.

If any item above fails, return `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_BLOCKED`, record the exact new blocker, publish the report, and STOP. Do not copy, rewrite, normalize, or otherwise materialize a replacement launcher outside the normal Git checkout.

If all items pass, continue the already-authorized generic session launcher acceptance exactly as defined by:

`tooling/llm-api-bridges/ozon-seller/validation/engineering-preflight/PRE_CODEX_GENERIC_SESSION_LAUNCHER_ACCEPTANCE_2026-08-20.md`

and:

`tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER_CONTRACT_2026-08-20.md`

## Frozen product candidate remains unchanged

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch bytes: `13648`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- version: `0.1.19`
- production inventory: `17`

## Restrictions carried forward

- no B01–B15 execution or scoring during launcher acceptance;
- no production or candidate edits;
- no launcher edits;
- no new `.js`, `.mjs`, `.py`, `.ps1`, runner, helper, harness, validator, fixture or workflow;
- no inline replacement implementation;
- no real Seller/Performance credentials;
- no real Ozon/Performance/ChatGPT requests;
- no ZIP build;
- no continuation into the final B01–B15 gate after acceptance report publication.

A launcher acceptance PASS proves only that the standing session-acquisition environment is ready. ChatGPT must review the full report and then re-audit physical executability of every B01–B15 item before issuing any final gate prompt.
