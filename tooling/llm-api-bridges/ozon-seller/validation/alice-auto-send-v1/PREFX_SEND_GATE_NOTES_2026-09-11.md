# Alice auto-send corrective gate — test-first notes

This validation line is for the live attached-but-unsent failure captured after installing `OZON_BRIDGE_v0.1.19_ALICE_DRAG_DROP_CORRECTIVE_20260911.zip`.

Required deterministic pre-fix reproduction:

- realistic Alice topology with composer field and input controls as siblings inside the same `.StandaloneInput-Container` / `.Standalone-Input` shell;
- no assumption that `context.root` is the narrow textarea-local node;
- exact known Alice send-control identity `data-testid="oknyx"` with `id="oknyx-button"` / `data-highlight-id="alice-oknyx-button"` as corroborating selectors;
- attached document already ready and marker already staged;
- `alice.sendButton(context)` must resolve the unique active Send control;
- `BB2ComposerSend.validateTarget` must accept the composer/control relationship;
- `waitForValidatedTarget` must hold the same target for three samples;
- `clickSynchronously` must produce exactly one click.

Negative controls:

- ready/microphone state is never Send;
- stop state is never Send;
- disabled active-send control is never clicked;
- unknown aria/state fails closed;
- two candidate oknyx controls fail closed;
- unrelated oknyx outside the Alice composer shell is ignored;
- mismatched marker/user text fails closed;
- detached composer/control fails closed.

No production write is permitted before this gate proves the current code fails the realistic sibling-topology positive control while the negative controls remain meaningful.
