# Execution notes — combined report XLSX/Alice UI repair

Final CI authority: `34690423195`.

- Baseline RED workflow `34689034974` proved the old exact executable stored opaque XLSX as `.bin` and the attachment status had no close control.
- Diagnostic `34689204367` proved `result.parsed.format="xlsx"` already existed and could classify the same bytes without refetch.
- Multiple materialization attempts failed closed before production publication due stale test assumptions / malformed test-only diff / outdated closed-set assertions; none were promoted.
- Targeted materialization `34689839528` finally passed all combined gates, fifth-file negative control, prior regressions, and only then published production commit `aafd23cca6cb657ed8c453c54c6a0b70b5bf21f3`.
- The final package run reran the exact frozen executable on Linux, pinned Chrome and Windows.

No real Ozon business request was made by CI.
