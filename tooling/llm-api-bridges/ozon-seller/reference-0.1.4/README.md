# Ozon Bridge reference 0.1.4

This reference stores the reviewed v0.1.3→v0.1.4 production patch, executable regression tests, and release evidence.

`run_tests.sh` reconstructs the v0.1.4 production tree from the sibling canonical `reference-0.1.3/archive-exact/` artifact, applies `evidence/OZON_BRIDGE_V0.1.4_PATCH.diff`, verifies SHA-256 for all 16 production files, then runs the 26-test Node suite with coverage.

After `python prepare_test_tree.py`, `python build_release.py` deterministically creates `ozon-bridge-v0.1.4-extension.zip`; the verified build is byte-identical to the release artifact SHA below.

Behavioral change: autorun pre-execution failures (including malformed `OZON_API_V1` parsing and watcher runtime failures) now enter the worker-owned `OZON_RESULT_V1` delivery lifecycle with `external_request_executed=false`, instead of remaining toast-only.

The separately packaged release ZIP has SHA-256 `df344f34f3ed5d0a16648d5ba7aa274f16512efc87223c5e81fac5ffb23da98a`.
