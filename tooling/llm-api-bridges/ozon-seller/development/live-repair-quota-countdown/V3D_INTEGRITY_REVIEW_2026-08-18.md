# Ozon live-repair V3D integrity review

Date: 2026-08-18
Status: engineering review only; no production change, no freeze, no live-provider authorization.

## Authority

Exact V3 production candidate remains:

`88a20984c55da1f813ca1184bd90089823f51883`

Frozen Step-4 base remains:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

V3D report commit:

`9bc364feb79664fb07928ab417c01c542f0c78d1`

## Finding

The V3D report classified both runners as `HARNESS_INTEGRITY_ERROR` because its computed SHA-256 table did not match the SHA-256 constants carried by the runners.

That table is internally inconsistent with the prior V3C report for the same immutable Git blobs. The three SHA-256 values are cyclically reassigned while the file paths, immutable Git blob IDs, and byte sizes remain associated with the correct files.

Direct live Git blob inspection independently confirms:

- blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce` contains `V3_WORKER_ACTUAL_PATH_HARNESS.mjs`;
- blob `841429741d5ff9144a8a40506e657dc4392fe37c` contains `V3_BROWSER_COUNTDOWN_HARNESS.mjs`;
- blob `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5` contains `V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs`.

Because Git blob IDs are content-addressed, one immutable blob cannot legitimately rotate among three different byte-content identities. Therefore the V3D SHA-256 association is a test bookkeeping/materialization-labeling defect. It is not evidence of a V3 production defect.

## Correct integrity method for V3E

V3E removes the secondary SHA-256 mapping from source-harness identity checks.

Each runner computes the canonical Git blob SHA-1 over the actual input bytes:

`SHA1("blob " + byte_length + NUL + bytes)`

and compares that directly to the authoritative Git blob ID.

Worker source authority:

`0da73bdd1bb1608074781bb0c594c7875a4fe3ce`

Browser source authority:

`841429741d5ff9144a8a40506e657dc4392fe37c`

The worker runner then applies exactly one test-only fixture change:

- old: `last = now - 64800`, guarded due about +200 ms;
- new: `last = now - 57000`, guarded due about +8000 ms.

No production byte is edited.

The browser runner copies the exact browser harness bytes into the existing Puppeteer project root and verifies the relocated file has the same Git blob ID before execution.

## Safety

`REAL_OZON_REQUESTS = 0`

`REAL_PERFORMANCE_REQUESTS = 0`

No V4 is created. No production code, patch, credential, dependency, Puppeteer installation, or Chrome installation is changed by this review.
