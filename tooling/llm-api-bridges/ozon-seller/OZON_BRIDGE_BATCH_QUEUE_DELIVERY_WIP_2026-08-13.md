# Ozon Bridge — WIP checkpoint: multi-command sequential collection + single delivery

Date: 2026-08-13
Status: DESIGN CHECKPOINT ONLY — implementation has NOT started
Repository: `MaksimUnimax/blood_sand`
Branch: `work/ozon-data-collection-2026-08-11`
HEAD observed immediately before this checkpoint: `3417bcd78b2e330c488aaae0457e37ef2bf01062`

## Why this file exists

This checkpoint preserves the exact agreed behavior before implementation work begins. The user explicitly stopped the implementation/design experiment and asked to persist progress so nothing is lost. No production bridge code was changed as part of the interrupted implementation task before this checkpoint.

## Agreed target behavior

### 1. Multiple Ozon commands may appear anywhere in one model message

The bridge must scan the full assistant message and discover every occurrence of the literal marker `OZON_API_V1` in message order.

Formatting must not matter. Commands may be:

- comma-separated;
- adjacent with no separator;
- separated by spaces, newlines, Markdown, prose, headings, lists, code fences, punctuation, or arbitrary ordinary text;
- surrounded by unrelated explanatory text.

The only model-side requirement is effectively:

`OZON_API_V1` + one valid JSON object.

The bridge must not depend on a bare code fence, language tag, writing-block metadata, comma delimiter, newline delimiter, list numbering, or any other message structure.

### 2. Command extraction must be structural, not regex-to-first-brace

For each found `OZON_API_V1` marker:

1. locate the JSON object beginning after that marker;
2. extract exactly one complete JSON object by balanced-brace parsing;
3. correctly ignore braces inside JSON strings;
4. correctly handle escaped quotes and backslashes inside strings;
5. pass the extracted object through real JSON parsing and the existing strict Ozon contract validation;
6. after the object ends, ignore any arbitrary text until the next `OZON_API_V1` marker;
7. continue scanning until end of assistant message.

Malformed material associated with one marker must not make the parser consume or lose later valid `OZON_API_V1` markers. The implementation must fail locally for that malformed construction and continue discovery from a safe later marker position.

### 3. All discovered Ozon requests execute strictly one by one

If one assistant message contains N commands, the bridge builds a simple ordered queue in appearance order and performs the Ozon provider requests sequentially:

`command 1 -> save result 1 -> command 2 -> save result 2 -> ... -> command N -> save result N`

There must never be multiple Ozon provider HTTP requests running in parallel for this queue.

Existing provider safety remains in force:

- one `OZON_API_V1` command means at most one external Ozon API request;
- no hidden provider retry;
- no hidden pagination loop;
- no hidden fan-out;
- no mutation/write operation;
- fixed host/operation allowlist and credential isolation remain unchanged.

### 4. Nothing is delivered to ChatGPT between individual Ozon requests

This is a fundamental requirement.

The bridge must NOT do:

`request 1 -> deliver result 1 -> request 2 -> deliver result 2`.

It MUST do:

`request 1 -> save result 1 -> request 2 -> save result 2 -> ... -> request N -> save result N -> build one complete report -> one delivery to ChatGPT`.

The ChatGPT composer must not be touched during the collection phase.

### 5. Results are temporary recovery state only

Results may be persisted temporarily while the current queue is running so a service-worker/content-script restart does not lose already collected Ozon responses.

However, the extension must NOT become a historical data store.

No unnecessary `run_id`, `batch_id`, `command_id`, UUID hierarchy, or similar identifier framework is wanted. The state should remain as simple as practical: current ordered command queue, collected results, current position/state, and pending final delivery data only as needed for recovery.

Once the final combined report has been successfully delivered to ChatGPT, all temporary queue/results/report/recovery data for that completed run must be deleted from extension storage immediately. Old completed reports must not accumulate in the extension.

### 6. Recovery must not replay already collected provider requests

If commands 1..K already have safely stored results and the extension restarts, collection resumes with the next not-yet-completed command.

A provider result already stored must not be requested again because of a content-script restart, React rerender, tab UI problem, or delivery problem.

A delivery failure after provider collection is a UI-delivery problem only and must never automatically cause another Ozon API request.

The design must explicitly account for the crash window around an in-flight provider request so that unsafe blind replay is not introduced.

### 7. Final report is inserted once as text; the bridge does not create files

After every command in the queue has finished and every result has been collected, the bridge creates one complete combined textual report containing the full collected results in command order and inserts that complete text into the ChatGPT composer once.

The extension itself must NOT:

- create a JSON/TXT file for large reports;
- create a Blob/download;
- attach a file itself;
- choose a file-size threshold or a separate bridge `file-mode`;
- inspect whether a resulting ChatGPT attachment was created.

If the pasted text is very large and ChatGPT itself converts the pasted content into a file/attachment, that is ChatGPT behavior. The bridge simply performs the text insertion and then follows the same delivery state machine regardless of whether ChatGPT leaves it as text or converts it into a file.

### 8. Completely remove post-insertion composer-content verification

After the combined report is programmatically inserted, the bridge must not inspect composer contents at all.

Remove/avoid all post-insertion use of:

- `textContent`;
- `innerText`;
- composer text/value length checks;
- full-text hashing;
- string comparison against the expected report;
- start/end text checks;
- repeated stable samples;
- any visual/textual `composer is empty` test;
- any attempt to verify the full pasted text or a ChatGPT-generated file/attachment.

The same prohibition applies during recovery.

The reason is that future reports can be extremely large and ChatGPT may transform a paste into a heavy attachment. Delivery cost after insertion must not scale with report size.

### 9. Final delivery state machine

After insertion of the complete combined report:

`INSERT -> BLIND WAIT 2s -> CHECK -> WAIT 2s -> CHECK -> ...`

Rules:

1. Immediately after insertion, perform a blind 2-second wait. Do not inspect composer contents or treat the pre-existing microphone as delivery success during this initial wait.
2. Only after those 2 seconds start a temporary event-scoped `delivery-watch` for this pending final report.
3. Every subsequent check occurs at a 2-second interval.
4. On every check, reacquire the current composer control from the current DOM; do not rely on a previously stored React DOM node.
5. Classify only known states: active Send, disabled Send, Stop, Microphone, or Unknown.
6. Click only a strictly recognized bound Send control.
7. Before each click, cheaply re-check that the element is still connected, visible, enabled, and still matches the Send binding.
8. Disabled Send is never clicked; wait 2 seconds and check again.
9. Stop is never clicked; wait 2 seconds and check again.
10. Unknown controls are never clicked; wait 2 seconds and check again.
11. A Send click is only an attempt, never success by itself.
12. After a Send click, wait 2 seconds and classify the current control again.
13. If active Send is present again, click it again after the normal checks.
14. The process may continue indefinitely at 2-second intervals while ChatGPT is processing a very large paste/file.
15. There is no automatic short timeout for heavy text/file processing.
16. Manual Abort/Stop remains available for a truly stuck delivery.
17. A strictly recognized Microphone after the initial blind wait is the sole final success marker: immediately mark `DELIVERY_SUCCESS` and destroy the delivery watcher.
18. Microphone is never clicked.
19. No repeated three-sample Microphone confirmation is required.
20. After `DELIVERY_SUCCESS`, no background Send/Microphone polling remains active.

### 10. Microphone binding behavior

Microphone must be recognized by a built-in/default binding in production code, just as normal operation should work without mandatory operator setup.

Manual Microphone bind/rebind is a fallback for non-standard situations only, such as ChatGPT changing the relevant DOM/test-id/aria/structure and the built-in recognition no longer working.

Send, Copy, and Microphone bindings remain independently rebindable. Manual binding is not intended to be a normal installation step.

### 11. Watcher scope and duplicate prevention

`delivery-watch` must exist only while one final report is pending delivery. It must not be a permanent page-wide polling loop.

There must not be two concurrent watchers clicking Send for the same pending delivery after recovery/reinitialization. The implementation should use the simplest reliable ownership/single-flight mechanism possible rather than introducing an unnecessary identifier architecture.

### 12. Logging direction

Delivery diagnostics should describe state transitions rather than report contents, for example:

- `DELIVERY_INSERTED`
- `BLIND_WAIT_STARTED`
- `BUTTON_SEND_ACTIVE`
- `SEND_CLICKED`
- `BUTTON_SEND_DISABLED`
- `BUTTON_STOP`
- `BUTTON_UNKNOWN`
- `BUTTON_MICROPHONE`
- `DELIVERY_SUCCESS`
- `RECOVERY_STARTED`
- `DELIVERY_ABORTED`

Collection diagnostics may record simple queue/progress events, but must not turn into a permanent archive of completed Ozon results.

## Required engineering process when work resumes

Before implementing, the requested process is:

1. re-read live GitHub and current production/reference evidence;
2. identify every production file and dependency affected by multi-command discovery, sequential provider execution, temporary recovery persistence, combined-report construction, Send/Microphone binding, and delivery recovery;
3. design three materially different implementation approaches;
4. implement/emulate each candidate sufficiently to test its core behavior in an isolated test environment;
5. test parser robustness with commands adjacent, comma-separated, separated by prose/Markdown, multiline JSON, nested objects, braces inside strings, escapes, malformed earlier commands followed by valid later commands, and large command counts;
6. test strict one-provider-request-at-a-time behavior and prove max provider concurrency = 1;
7. test that no intermediate result is delivered to ChatGPT before the queue completes;
8. test temporary-state recovery and cleanup after confirmed final delivery;
9. test large-result insertion behavior without reading composer content;
10. emulate ChatGPT control sequences over time, including long periods of disabled/Stop/Unknown, delayed Send, repeated active Send after click, and eventual Microphone;
11. test default and manual/rebound Send, Copy, and Microphone recognition;
12. test no duplicate watcher ownership/clicks after recovery;
13. test that delivery failures/recovery never replay a completed Ozon provider request;
14. test all changed dependencies and existing security/read-only invariants;
15. compare the three approaches and explicitly choose the safest/simplest one with reasons;
16. implement the chosen variant in production code;
17. run the full affected test suite plus regression suite against source;
18. inspect behavior-changing source paths and input/output transitions, not only static strings;
19. build/package the extension;
20. unpack the produced extension into a fresh directory and rerun the complete relevant suite against the packaged files;
21. perform syntax/static/package/hash/security checks required by the existing release discipline;
22. append the completed implementation/test/release evidence to the canonical append-only documentation before declaring the new version accepted;
23. do not modify immutable `reference-*` snapshots; create a new version reference only after the implementation is accepted.

## Progress at interruption

Completed before the stop request:

- user requirements were iteratively clarified to the exact behavior recorded above;
- live branch lookup was started;
- current branch HEAD was verified as `3417bcd78b2e330c488aaae0457e37ef2bf01062` before writing this checkpoint;
- the canonical append-only Ozon Bridge history was re-read sufficiently to confirm current accepted release lineage through v0.1.7 and its existing 119/119 package/source acceptance evidence;
- repository tree discovery for the Ozon bridge area had begun.

Not completed / intentionally stopped:

- no three candidate implementations have yet been designed in detail;
- no candidate has been coded or emulated;
- no production extension source has been modified for this feature;
- no new version has been assigned;
- no new feature tests have been written or run;
- no extension package has been built for this feature;
- no release/reference snapshot has been created;
- no acceptance claim has been made.

When work resumes, continue from this checkpoint rather than reconstructing the requirements from chat memory.
