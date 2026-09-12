# P1 native Copy / owned button — RED
Date: 2026-09-12
Target: exact initial-error WIP (content SHA256 3e8ba4f19d39483d8252ec3252d45819ef2a2f0cb6058ee7fc910c2d992c26fb). Popup/button code still WB021.
Runner: local tests/own_button_browser.py. Actual Chromium loads all production manifest content scripts against synthetic ChatGPT/Alice DOM and mocked Chrome messages. All external network intercepted; observed network attempts 0, real provider calls 0.

Authoritative completed run: evidence/red-own-button-r2, exit 1: 1 PASS / 11 FAIL.
- FAIL native Copy itself sends WB_EXECUTE_COMMAND.
- FAIL native Copy styles/title are mutated.
- FAIL independent WB button/one Shadow surface missing.
- FAIL selected own-button execution: required own button absent.
- FAIL live raw text through own click: required own button absent.
- FAIL DOM rescan own controls/one host: own controls absent.
- FAIL Work Hide leaves native Copy execution enabled.
- PASS wrong-owner visibility test with initially inactive state does not expose an owned button; limited negative evidence, not full owner isolation.
- FAIL removed-block, global-manual-busy, structure-only discovery and Alice-owned-button scenarios: required own controls absent.
These are 11 failed assertions, not a claim of 11 independent root causes. Native execution and hide bypass were actually exercised. Missing control cases do not prove later click behavior.

First red-own-button run was interrupted by the container command timeout after 3 logged failures because absent-control actions inherited 30-second locator waits. Those flushed rows remain preserved; it is not a completed suite. Harness timeout reduced to 1200 ms and entire bounded matrix rerun in red-own-button-r2. No product edits were made to satisfy the harness.

Next: materialize Ozon-derived top-level Shadow surface, native Copy separation, current-owner structural rescan and manual busy authority. Then execute same browser runner and persist actual source diff/runner/results, not just this report. Popup one-controller and Start transaction acceptance remain open. No installable build or owner test is authorized by this RED record.
