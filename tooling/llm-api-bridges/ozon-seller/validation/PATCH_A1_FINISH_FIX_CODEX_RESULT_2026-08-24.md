# Patch A.1 Finish-fix browser retest

## Scope and identity

- Tested branch: `fix/ozon-work-session-finish-no-autorun-2026-08-24`
- Expected and fetched HEAD: `7522c709c9216823a33b85f0b0cd31b9b569e8b9`
- Candidate was reconstructed afresh by the repository materializer, not taken from a ZIP.
- Candidate directory: `D:\codex\Test\ozon-a1-candidate-20260824`
- Production files: 19
- `service_worker.js` SHA-256: `f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c`
- Tree manifest SHA-256: `bb3cd062be3b5839c7dc11b029ba3d661caaa78e298669742884b920c1d5df33`
- Materializer identity markers: all five required `PATCH_A1_*_PASS` markers observed.
- `node --check`: PASS for every production JavaScript file.

## Environment

- Windows CFT: Chrome/151.0.7922.47
- Puppeteer: 25.4.0 (existing QA project)
- Node: v24.12.0
- Browser page was synthetic and request-intercepted; no operator profile was used.

## Results

| Section | Result | Evidence |
|---|---|---|
| A — existing-chat Start, active repeat, no Autorun | PASS | Existing conversation bound; first Start sent one prompt; active repeat returned `resent_prompt_only=true` and sent exactly one additional prompt; state was `active_visible`; `auto_run` was not waiting. |
| B — new-chat pending Start and duplicate | PASS | Pending Start returned `pending_start.prompt_delivered=true`; duplicate returned `WORK_START_ALREADY_PENDING`; exactly one synthetic prompt send; correlated state reached `active_visible`. |
| C — Hide/Show | PASS | Ozon button count changed `3 -> 0 -> 3`; Hide and Show both returned `ok=true`. |
| D — explicit Refresh | NOT_EXECUTED | Not completed in this browser run. |
| E — hidden Refresh/restore | NOT_EXECUTED | Not completed in this browser run. |
| F — Finish and Start after Finish | PASS | `OZ_WORK_FINISH` returned `ok=true`; post-finish session was `inactive`, binding retired, and `auto_run` remained absent; subsequent Start returned `ok=true`, reached `active_visible`, and sent exactly one prompt. |
| G — Work control and dictation discrimination | PASS | Exact Work selector was present; `aria-disabled` was read as `false`; persistent `composer-speech-button` was present and had `dictationClicks=0`. |
| H — stale/wrong pending identity fail-closed | PASS | Wrong identity returned `WORK_PENDING_STALE_OR_INVALID`. |
| I — Alice | NOT_EXECUTED | No installed Alice test environment was available. |

## Required three-delivery evidence

NOT_EXECUTED. The run did not complete the required three consecutive local `OZON_HELP_V1` deliveries with the full delivery assertions. This is not classified as a production failure.

## Requests and modifications

- `REAL_OZON_SELLER_REQUESTS = 0`
- `REAL_PERFORMANCE_REQUESTS = 0`
- `REAL_CHATGPT_REQUESTS = 0`
- `OPERATOR_BROWSER_ACTIONS = 0`
- Production code modified by tester: 0
- Candidate rebuilt or fixed: no
- ZIP created: no

## Final decision

`PATCH_A1_BROWSER_CANDIDATE_REJECTED`

Failed/incomplete scenarios: explicit Refresh; hidden Refresh/restore; required three consecutive local deliveries; Alice scenario unavailable. No executed product assertion produced an F-level Finish defect.
