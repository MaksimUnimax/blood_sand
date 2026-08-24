# Patch A browser candidate test result

tested_branch: `test/ozon-work-session-lifecycle-patch-a-browser-candidate-2026-08-24`
tested_commit: `34ca3a388a095134c3c464fd7ed478cf06faa0c3`
tested_artifact_path: `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A_BROWSER_CANDIDATE_2026-08-24.zip`

required_sha256: `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`
verified_sha256: `24c7080ede81e3e57c0156b4e44ef1775428395b46c3d04ac11b27b512d64ef7`
artifact_sha256_verification: FAIL
fresh_extraction_file_count: NOT_RUN
browser_environment: NOT_STARTED

## Mandatory preflight

The exact test branch was fetched from GitHub and the exact artifact path was present in the branch. The artifact SHA-256 did not equal the required SHA-256, so the mandatory integrity gate failed. The candidate was not extracted and no browser or product assertion was executed.

This is an input-artifact integrity failure, not a claimed production behavior failure. No alternate artifact was used, and no rebuild or repair was performed.

## Test sections

All sections below were not executed because the required artifact identity precondition failed. They are recorded as rejected test-run sections, not as executed production assertions.

- A — Start in existing chat: FAIL (not executed; artifact integrity precondition failed)
- B — Start in a new empty chat: FAIL (not executed; artifact integrity precondition failed)
- C — Hide/Show and stale buttons: FAIL (not executed; artifact integrity precondition failed)
- D — Explicit Refresh without page reload: FAIL (not executed; artifact integrity precondition failed)
- E — Refresh for hidden session: FAIL (not executed; artifact integrity precondition failed)
- F — Finish and Start after Finish: FAIL (not executed; artifact integrity precondition failed)
- G — ChatGPT Work, real submit button, dictation ignored, three deliveries: FAIL (not executed; artifact integrity precondition failed)
- H — stale/wrong tab, origin, adapter, conversation, and revision fail-closed: FAIL (not executed; artifact integrity precondition failed)
- I — Alice: FAIL (not executed; artifact integrity precondition failed; Alice environment was not probed)

## Counters and changes

real_ozon_business_requests: 0
production_code_modified: 0
production_rebuilt: NO
new_zip_built: NO

final_decision: `PATCH_A_BROWSER_CANDIDATE_REJECTED`
