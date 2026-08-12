# Ozon Bridge reference 0.1.5

Immutable evidence snapshot for the v0.1.5 manual/error-delivery correction.

`prepare_test_tree.py` reconstructs canonical v0.1.4 from its sibling reference, applies the reviewed v0.1.4→v0.1.5 patch, and verifies SHA-256 for all 16 production files.

`run_tests.sh` then runs the complete 67-test regression suite with Node coverage and deterministically rebuilds the production ZIP. Expected release SHA-256: `130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651`.

The production fix does not add a parallel manual-preexec message protocol. Manual Copy always uses the existing `OZ_EXECUTE_COMMAND` path; parsing/validation and error ownership are centralized in the worker, while manual and autorun share generic pre-execution/execution error result builders.
