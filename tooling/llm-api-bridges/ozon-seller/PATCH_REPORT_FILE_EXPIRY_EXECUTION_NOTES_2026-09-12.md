# Report-file expiry — execution notes

## Source and fixture preparation

Source snapshot run 34685635009 failed before exporting because shallow checkout did not contain the explicitly requested base tree. After reading job 103532025319, checkout was pinned directly to base 0aa8f53528e304a91530f663060445e85e2af60b. Corrected source-snapshot run 34685691419 succeeded. A wrong artifact-download connector action was rejected without changing repository/runtime; the correct Actions artifact downloader was then used.

Local fixture preparation corrected VM cross-realm JSON inputs, a synthetic UUID shorter than the production contract, and inconsistent MIME/file extension. Production guards were not relaxed. Local checkout lacked Git history and local Chrome144 CDP pipe was not operational; authoritative execution used full-history GitHub Actions and Chrome for Testing152.0.7977.82.

## Targeted materialization first failure

Run 34687231974, job 103536232034: source-carrier hash validation, all six baseline RED reproductions, all new Linux tests, 39 HELP_V2 tests, all31 prior regression scripts and seven real-Chrome tests succeeded. The actual Chrome worker was stopped and a new worker activated; session deadline and downloaded-byte independence passed.

Materialization stopped BEFORE any production commit at git diff --cached --check. Reason: the stored unified production.patch represented blank context as one-space lines, which the outer Git diff treated as trailing whitespace. No production source whitespace defect and no behavioral failure were observed.

Correction: after hash-verifying and applying the exact original diff, store its canonical zero-context git diff --unified=0 equivalent and prove reverse application with --unidiff-zero. Source before/after hashes remain identical. The whitespace check is retained, not bypassed; no production logic was changed.

The complete targeted job was run again, not resumed after the failed check. Run 34687308933 succeeded and published the exact tested production executable 3f543bde2f8b4c0a561ecb50aeba111ff108751a, tree eac9f8849e2b73dcee6e6cc5b795e879a481ee9f. This is targeted CODE FIXED evidence, not final package or owner-live acceptance.

## Scope limits and corrections

The supplied incident uses MANUAL_BATCH_ACCEPTED / owner_kind=manual. It is not evidence that the earlier HELP_V2 Autorun patch passed operator-installed live certification. The new build preserves and rechecks that patch, without retrospectively changing its live status.

The provider expiry was already in the past before the observed file GET. That omission is reproduced and repaired. The raw report-host error body was not supplied; the patch must not classify every HTTP403 as expiry. The valid-deadline HTTP403 positive control remains a real provider error with one request and no hidden retry.

Missing/expired report-create provenance still falls back to personal-data-required. Its existing retention policy is not silently lengthened; no rpf_p is converted to rpf_s from report_type/name. This conservative restriction remains documented and tested.

No production settings, external API hosts, credentials, user data, or business state are modified by these preparation corrections. Production changes remain exactly two files. Provider business calls during patch validation: zero.
