# Ozon Bridge reference 0.1.7

Immutable evidence snapshot for Ozon Bridge v0.1.7.

Release purpose: bounded, exactly-once-safe retry of ChatGPT Send-target readiness and browser Send invocation after the live `DELIVERY_SEND_TARGET_NOT_READY_BEFORE_COMMIT` stop.

Key invariant: retry is allowed only while no browser click event has been observed. Once a click event is observed, v0.1.7 performs settlement/reconciliation only and never issues a second Send click for that attempt. Worker commit still precedes the browser click, and Ozon provider requests are never replayed by delivery retry.

Evidence:

- `OZON_BRIDGE_V0.1.7_CHANGELOG_AND_TEST_EVIDENCE.md`
- `OZON_BRIDGE_V0.1.7_REPRODUCIBLE_EVIDENCE.md`
- `OZON_BRIDGE_V0.1.7_PATCH.diff.gz.b64`

Release ZIP SHA-256:

`9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`

Automated acceptance evidence: source 119/119 PASS; fresh ZIP extraction 119/119 PASS; 16/16 production files byte-exact; all production JS parses; Chromium pack exit 0; deterministic ZIP rebuild byte-identical.

Live logged-in ChatGPT field acceptance remains pending installation/testing of v0.1.7.
