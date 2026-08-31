# Ozon Performance Step 8 validation

This directory closes the terminal authority matrix for all `48` Performance operations without changing the accepted production bridge implementation.

The gate is derived exclusively from repository-frozen evidence:

- `OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json`;
- `OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.json`;
- accepted Step 6 Performance read coverage and its regression;
- formal Seller Step 7 acceptance.

Required invariants:

- exactly `48/48` Performance operations have unique identities and terminal decisions;
- `unknown = pending = unresolved = 0`;
- the accepted current Performance read surface remains `21`;
- the accepted Seller read surface remains `245`;
- full current read integration count is `266`;
- Linux and Windows outputs are byte-identical;
- generated evidence is frozen into the Step 8 branch before formal acceptance;
- canonical is not modified.

Entry points:

- `build_step8_performance_terminal.py` — deterministic matrix, proof and package builder;
- `verify_step8_performance_output.py` — fail-closed output and package verifier.
