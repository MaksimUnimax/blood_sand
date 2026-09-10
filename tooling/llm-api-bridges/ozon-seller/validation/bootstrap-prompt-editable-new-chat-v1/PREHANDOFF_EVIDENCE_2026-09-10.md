# Editable bootstrap prompt before conversation identity — preliminary pre-handoff evidence

- operator authorization: PASS — `Делай патч, следуй правилам`
- base authority: `da762fec61f55793406dae96d9f8aaae757425f4`
- scope: only bootstrap/start-prompt editability before stable conversation identity
- separate Alice wording defect: OUT OF SCOPE
- built-in default wording changed: NO
- targeted regression on pre-fix: intended FAIL confirmed
- targeted regression on candidate: PASS
- custom per-conversation override isolation: PASS
- explicit per-dialog override Save All contract: PASS; ordinary Save All cannot create an override while opt-in is OFF
- legacy default-copy migration to global inheritance: PASS
- work-session model/pending-start regressions: PASS
- historical refresh guard: `BASELINE_STALE_SAME_RESULT`
- historical pending-start guard: `BASELINE_STALE_SAME_RESULT`
- current pending-start/show-hide visibility guard: `PASS_BASE_AND_CANDIDATE`
- prior mixed HELP/API + command-envelope regressions: PASS
- intersecting delivery/lifecycle/accounting regressions: PASS
- manifest/service-worker entry: unchanged
- provider/request/credential/quota/transport surfaces: unchanged
- dependency inventory rows: `300`
- Chrome MV3 service-worker bootstrap: PENDING current CI step
- package fresh-extract targeted regression: PASS
- package SHA-256: `654ccae84d714f7c28988fe5697898dcad312b9de0831ea67df6a1b50138c3ba`
- package bytes: `248034`
- LIVE-GATE-01..05: PENDING POST-INSTALL

This is PRE-HANDOFF evidence only and is not LIVE certification.
