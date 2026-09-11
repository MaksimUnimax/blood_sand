# Alice Oknyx disabled/file-state findings

Public first-party authority fetched from `https://yastatic.net/s3/alicestatic/_/v2/main-chunk.51931803b8138641.js`.

SHA-256: `fb482e6ff25c77ed12081dd1cdab44c871297b9318b702c08843907e8aef619d`
Probe run: `34556754639`
Provider calls: `0`

## Proven current Oknyx contract

`StandaloneOknyx` renders one `button#oknyx-button[data-testid="oknyx"]` with `disabled=er`.

The first-party disabled predicate is:

`er = disabledProp || aliceState === "disabled" || veilVisibility || specialEmptyInputBlock || editingEmpty || isEditingUnchanged || browserControlConfirmActive`

Its aria state remains separately derived as microphone/stop/send; therefore an arrow/send rendering alone is not sufficient proof that the native button is enabled.

## Proven current file-state contribution

The current Alice aggregate state explicitly subscribes to `inputFilesStore`. If any attached file has `statusUpload.status` other than `done` or `error`, Alice publishes the aggregate state `disabled`.

The current file preview renderer distinguishes:

- `uploading` -> progress/loading UI;
- `uploaded` -> description `Изучаю файл`;
- `error` -> error UI;
- settled/non-uploading/non-uploaded state -> normal file metadata description such as MIME/type and size.

The owner's live screenshot shows a normal settled-looking metadata description (`TXT · 375.5 KB`), not an upload spinner or `Изучаю файл`. This strongly narrows the live failure away from ordinary upload-pending state, but the screenshot does not expose the native `disabled` attribute. It is not promoted to proof that the button was enabled.

## Consequence

The previous Bridge `attachmentReady()` check already rejects `uploading/loading/обработ/...` status text. A blind patch that merely waits longer for upload processing is not justified by current evidence.

Next deterministic boundary: execute the entire persisted READY -> SEND_COMMIT -> browser click -> user-turn confirmation state machine against the current Alice DOM contract, including an explicit enabled/disabled Send-control transition and lifecycle recovery. If that passes, the remaining live-only gap must be instrumented at runtime rather than guessed.
