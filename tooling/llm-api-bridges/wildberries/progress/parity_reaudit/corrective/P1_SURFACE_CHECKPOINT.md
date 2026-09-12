# P1 independent WB button — exact checkpoint
Date: 2026-09-12
Status: OWNED SURFACE IMPLEMENTED / CHROMIUM TARGETED PASS / POPUP AND WORK BACKEND STILL OPEN

## Recoverable code, not only a description
Remote `p1_surface/part01.b64` through `part07.b64` were read back together at `4b4cf14c5a8355cb32d34bbad361709e4c23aac5`. All seven Git blob hashes and byte sizes equal the local manifest. Concatenate parts in numeric order, remove whitespace, Base64-decode. Expected gzip tar archive: 14079 bytes, SHA256 `6a1356c68078f6f7270ebc3cb45431659453808e208c6964fbd2552ce2d13935`.

Expected part blobs: 01=fcd2661416b6c99b1ad4dee9107df27a2ab3c4ba; 02=50b875a661ae680ca7ff5ae0efdc617c059c2653; 03=df24f1264a37d11209bcc535fecbf8dec0c8c4f4; 04=afc84099769c8a7f9e427a1da5156f3022153a81; 05=d006482c203085f2385d43648e35fb158cdaa93a; 06=ce4aaeadd7a5cc18ea6c888885cce9878c7a1400; 07=72273bdd64fceeedc3974f5edb70240d9b4407a2. Parts 01–06 are 2801 bytes each; 07 is 1973 bytes.

Rebuild order: exact WB021 COPY -> INITIAL_ERRORS.patch from INITIAL_ERRORS_CHECKPOINT.md -> archive member P1_SURFACE.patch. The latter is incremental, SHA256 `fa4cab591fd8c6f080a33b24550a0f24554109ce489c196142ef85c4ad6436c6`. Resulting content_script.js SHA256: `548050fb905726fcf416893bbe7967aec3a289014eaadac50888c5c2dd96d725`. Other production files are unchanged from the initial-errors checkpoint.

Archive contains actual materializer `apply_own_button.py`, exact runner `tests/own_button_browser.py`, source identity and raw RED/GREEN results/stdout/stderr. Current local directory: `/mnt/data/wb_parity_corrective_2026-09-12/candidate`.

## Implemented behavior
Adapted the actual late Ozon structural own-button functions into WB. Native Copy has no WB execution handler or style/title replacement. A separate WB action is anchored to the code-block Copy geometry, inside one extension-owned top-level Shadow surface. It uses WB violet/magenta styling. Selection captures raw text only on WB click, checks current conversation/runtime and block membership, prevents parallel manual starts, rescans structural block replacements and removes own controls on Hide. Command text is not used to decide which assistant blocks receive a button. Visibility events reject a foreign conversation and older revision.

## Authoritative tests
Actual production manifest content scripts loaded in Chromium against synthetic ChatGPT/Alice DOM. Chrome runtime responses are mocked; this tests content/DOM behavior, not installed logged-in chat or complete real-worker integration.
- `red-own-button-r3`: 1 PASS / 11 FAIL, exit 1, baseline is exact initial-errors candidate before the surface patch.
- `green-own-button-02`: 12 PASS / 0 FAIL, exit 0; intercepted external network attempts 0; page errors 0.
- `node --check content_script.js`: PASS.

Cases: native Copy no WB execution; native attributes unchanged; one Shadow surface; only selected block executes; raw text read on click; DOM rescan/no duplicates; Hide removes controls/execution; wrong-owner visibility rejected from inactive state; removed block no stale execution; global manual single-flight; structure-only discovery; Alice Copy separation.

## Preserved harness/publication corrections
The first RED timed out with only three rows because absent controls inherited 30-second locator waits. It is incomplete, not a finished matrix. The final runner uses 1200 ms waits. `green-own-button-01` had 10 PASS and two fixture TypeErrors from an incorrect writing-block selector; corrected the fixture only, then reran both RED and GREEN. r3/green-02 supersede the earlier fixture-invalid full comparisons, without erasing them.
Initial remote part02 at ca916bdbf63ce875c5f3270e713283bcd4e7eb82 had blob 534e712d0293f5f880f5bb60e184c769378db958 and wrong size 2946. Readback caught it. Corrected by 3db5ab95b1f5f6c8fe77204157307d783e91e075 and verified in the final seven-part readback. Never reconstruct using that earlier part02.

## Exact next action
Popup is still unmodified. Worker getManualMode still reads a legacy boolean and can contradict Work on later synchronization; fix this dependency before any handoff. Unify popup rendering and Work-only visibility, remove production Autorun/manual checkbox, retain independent result auto-send and WB credential/diagnostic controls. Add worker and real-popup synthetic DOM RED/GREEN. Latest Ozon pending Start transaction remains P4/P7: do not label immediate active_visible as correct Start. Full P2–P9 and exact final integration remain open. No further operator tests or real provider calls; this is not an installable release.
