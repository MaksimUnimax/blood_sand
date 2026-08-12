# Wildberries Bridge v0.1.1 — test evidence

## Provider / contract matrix

**170/170 PASS**. This includes one execution case for every one of the **157** production aliases plus transport/auth/security/error cases.

Each production alias is driven through real `wb_contract.js` + `wb_provider.js` with representative path/query/body data and asserts:

- fixed official origin/path/method;
- local Bearer authorization rather than LLM-supplied headers;
- at most one mock `fetch`;
- `WB_RESULT_V1` result envelope;
- no automatic retry.

## Lifecycle / UI / worker

Node test runner: **174/174 PASS**. Covered contours include manual mode, autorun, conversation binding, 50-way single-flight concurrency, durable start/delivery commits, Pause/Resume/Stop, worker restart/reconciliation, stale owner/run/conversation, request outcome unknown, controlled 429/network errors, credential backup checksum/atomic import, popup errors, status-card dismiss and writing-block capture.

## Every executable production line

Raw V8 merged coverage after the final production changes:

- executable production lines: **7043**
- covered: **7043**
- uncovered: **0**

Coverage is gathered from VM/browser-like test processes and merged per exact production source. Test-only transformed content-script instances are mapped back only when their source lengths/offset transform match the coverage mapper.

## Fresh unpack

The ZIP was extracted to a new directory, production files were compared byte-for-byte (**17/17 PASS**), and the complete test suite was run against the extracted production bytes. After correcting a test-only 100 ms scheduling deadline that was flaky under parallel CPU load, the fresh-unpacked full suite passed **twice consecutively**.
