# Ozon operator v0.1.19 exact reconstruction v2

Date: 2026-08-17
Scope: reconstruction-only repair for Step 1 validation. No production logic is changed here.

## Why v2 exists

The first bounded reconstruction bundle at `development/operator-v0.1.19/exact-reconstruction/` was written through a text transport that preserved `00.b64.part` exactly but stored the LAST 19,999 bytes of each larger `01`-`04` part. The independent retest at commit `11e85e093649de06da07190251ddcda7386fd3e7` observed exactly those bytes and stopped before candidate construction or any production behavior test.

The previous retest prompt also carried an incorrect expected SHA-256 for the concatenated base64. The correct concatenated base64 SHA-256 is:

`cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

The decoded operator ZIP pin remains unchanged:

- size: `100320` bytes
- SHA-256: `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

V2 preserves the original truncated files as evidence and adds only the exact missing prefixes plus a verifier. Every newly transported fragment is at most 10,000 bytes, a size already proven to survive the repository transport byte-for-byte.

## Preserved v1 committed suffixes actually used by v2

- `exact-reconstruction/00.b64.part`: size `10000`, SHA-256 `c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a`
- `exact-reconstruction/01.b64.part`: size `19999`, SHA-256 `834702eb1f34ad16939dde63704849648f44e545f5ace7aa482b238d5780e997`
- `exact-reconstruction/02.b64.part`: size `19999`, SHA-256 `b1a00551f41d7371e3fc219aca97ec2827f534d5a2a285338a4be685e9b141ba`
- `exact-reconstruction/03.b64.part`: size `19999`, SHA-256 `f479201cb1e4eb967b2c368a63e3c5316f1b6038a77e691daa8ba5f48ef412b6`
- `exact-reconstruction/04.b64.part`: size `19999`, SHA-256 `71eb0cef609302d82468b978ed8c0fe69a7921dc4e8e9f068675a6f51740da5a`

These are not treated as complete original parts. They are intentionally used as suffix fragments.

## New missing-prefix fragments

- `01.prefix.part`: size `1`, SHA-256 `a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa`
- `02.prefix.a.part`: size `10000`, SHA-256 `8d158aaab37882a812bb59a762e4046cf11ab3bd40ab93b57f887bbd78c59e51`
- `02.prefix.b.part`: size `10000`, SHA-256 `bbf010640377b945789b5098e7857432e32f00377eb9222ea598410f7632668f`
- `02.prefix.c.part`: size `1`, SHA-256 `a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa`
- `03.prefix.a.part`: size `10000`, SHA-256 `8feabdfe53c66c38d75f9d9105ee0545b2dcd306bfaf3c9afa29c8a5793eaef6`
- `03.prefix.b.part`: size `10000`, SHA-256 `eef0d6bd3ede1303acc49efa3d8717270ed68ae25e51896514e669b6cff70fce`
- `03.prefix.c.part`: size `1`, SHA-256 `acac86c0e609ca906f632b0e2dacccb2b77d22b0621f20ebece1a4835b93f6f0`
- `04.prefix.part`: size `3761`, SHA-256 `a94fe9654a7ee800e7474f8b90b8f167bf7e051f35e689d97923c2fef5e429d4`

## Exact reconstruction order

Concatenate raw committed bytes in exactly this order:

1. `exact-reconstruction/00.b64.part`
2. `exact-reconstruction-v2/01.prefix.part`
3. `exact-reconstruction/01.b64.part`
4. `exact-reconstruction-v2/02.prefix.a.part`
5. `exact-reconstruction-v2/02.prefix.b.part`
6. `exact-reconstruction-v2/02.prefix.c.part`
7. `exact-reconstruction/02.b64.part`
8. `exact-reconstruction-v2/03.prefix.a.part`
9. `exact-reconstruction-v2/03.prefix.b.part`
10. `exact-reconstruction-v2/03.prefix.c.part`
11. `exact-reconstruction/03.b64.part`
12. `exact-reconstruction-v2/04.prefix.part`
13. `exact-reconstruction/04.b64.part`

Expected concatenated base64:

- size: `133760` bytes
- SHA-256: `cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

Use `reconstruct_operator_v0.1.19_v2.py` from the exact frozen validation target and write the ZIP to an external QA directory. It validates every fragment, the concatenated base64, decoded ZIP bytes, and the exact 17-file ZIP inventory before writing output. Success marker:

`RECONSTRUCTION_V2_PASS`

Do not use the v1 reconstruction script or its old declared concatenated-base64 hash for the next retest.
