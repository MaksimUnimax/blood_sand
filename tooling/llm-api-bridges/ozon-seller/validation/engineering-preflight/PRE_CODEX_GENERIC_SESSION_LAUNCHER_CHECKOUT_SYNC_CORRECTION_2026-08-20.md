# Ozon Bridge v0.1.19 — generic session launcher acceptance checkout-sync correction

Date: 2026-08-20  
Status: `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_RERUN_PERMITTED_AFTER_EXACT_GIT_CHECKOUT_FINAL_B01_B15_STILL_STOPPED`

Repository: `MaksimUnimax/blood_sand`  
Development branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Purpose

This correction addresses the concrete environment blocker reported by the first independent generic-session-launcher acceptance.

Previous acceptance report commit:

`579a52462d9b638968a3238171c7619f373e5c54`

Previous verdict:

`GENERIC_SESSION_LAUNCHER_ACCEPTANCE_BLOCKED`

Observed blocker:

- the committed launcher was readable from live GitHub;
- the launcher blob identity was `1cbd85f244f8dc54c51ac9a044e36b13b0bd0320`;
- the required launcher was absent only from the pre-existing local checkout at `D:\codex\Test\blood_sand`;
- therefore local launcher SHA-256, `node --check`, launcher execution and all downstream session checks were not observed;
- production/candidate/source-CFT/test-infrastructure modifications were zero and ZIP was not built.

This is a checkout-synchronization blocker. It is not a production failure and it did not evaluate launcher behavior.

## Why a rerun is now permitted

The committed launcher already exists in repository authority. The missing capability was not a new runner/helper/harness; it was obtaining the exact committed repository tree locally.

For the rerun, the acceptance must not depend on the stale pre-existing checkout. It must use ordinary Git to create a fresh detached worktree pinned to the exact acceptance authority commit supplied in the rerun prompt.

A Git worktree is a repository checkout, not newly authored test infrastructure and not a replacement launcher implementation. No launcher source may be copied, patched, regenerated or reconstructed outside Git.

This changes the factual condition that produced the previous BLOCKED result.

## Required checkout acquisition before launcher checks

Starting from the existing Git repository at `D:\codex\Test\blood_sand`:

1. Confirm the repository has no operation in progress that would make read-only fetch unsafe.
2. Run an ordinary `git fetch origin` sufficient to obtain the exact acceptance authority commit supplied by ChatGPT.
3. Create a fresh detached Git worktree under a new empty validation-owned directory, pinned to that exact authority commit. Recommended shape:

   `git -C D:\codex\Test\blood_sand worktree add --detach <freshWorktreePath> <exactAuthorityCommit>`

4. Do not use the old working tree as launcher authority after this point.
5. In the fresh detached worktree, require the committed launcher path to exist:

   `tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER.mjs`

6. Verify its Git blob identity is exactly:

   `1cbd85f244f8dc54c51ac9a044e36b13b0bd0320`

7. Verify its SHA-256 is exactly:

   `0ab082d81848b5c31cae5594c66d42cc775674b8fb1f03bef1c3dea582475600`

8. Run `node --check` on that exact worktree file.

If the exact commit cannot be fetched/checked out, the worktree cannot be created, the launcher path is absent in the exact worktree, the blob differs, the SHA differs, or `node --check` fails, return `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_BLOCKED` and stop. Do not create a replacement source file.

## Acceptance authority carried forward

After the checkout acquisition above succeeds, execute the launcher acceptance defined by:

`tooling/llm-api-bridges/ozon-seller/validation/engineering-preflight/PRE_CODEX_GENERIC_SESSION_LAUNCHER_ACCEPTANCE_2026-08-20.md`

and the launcher contract:

`tooling/llm-api-bridges/ozon-seller/validation/environment/session-launcher/OZON_GENERIC_SESSION_LAUNCHER_CONTRACT_2026-08-20.md`

The frozen launcher remains byte-identical. No launcher repair is authorized in acceptance.

The exact product candidate remains unchanged:

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch bytes: `13648`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- version: `0.1.19`
- production inventory: `17`

## Allowed filesystem effects

The rerun may create only normal Git/runtime temporary state required by the already-authorized acceptance:

- one fresh detached repository worktree;
- one fresh reconstructed candidate directory;
- one fresh launcher session root/profile/CFT copy and diagnostics;
- normal Git administrative metadata for the worktree.

After evidence is captured, remove only validation-owned temporary runtime directories and the validation-owned detached worktree through ordinary Git worktree removal. Do not alter the source repository history or production candidate.

## Forbidden actions

The previous restrictions remain in force:

- no B01–B15 execution or scoring;
- no production or candidate edits;
- no launcher edits;
- no new `.js`, `.mjs`, `.py`, `.ps1`, runner, helper, harness, validator, fixture or workflow;
- no inline replacement implementation;
- no real Seller/Performance credentials;
- no real Ozon/Performance/ChatGPT requests;
- no ZIP build;
- no continuation into the final gate.

## Rerun result

Return `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_PASS` only if the exact Git checkout acquisition succeeds and every launcher acceptance requirement is actually observed and passes.

If an external Git/filesystem/policy condition still prevents obtaining or executing the committed launcher, return `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_BLOCKED` with the exact changed blocker.

If the launcher executes and violates its immutable contract, return `GENERIC_SESSION_LAUNCHER_ACCEPTANCE_FAIL`.

After publishing the single report, STOP.

## Final gate status

`FINAL_B01_B15_CODEX_GATE = STOPPED`

A launcher PASS is environment-readiness evidence only. ChatGPT must review the full report and re-audit the physical executability of every B01–B15 item before any final consolidated Codex gate may be issued.
