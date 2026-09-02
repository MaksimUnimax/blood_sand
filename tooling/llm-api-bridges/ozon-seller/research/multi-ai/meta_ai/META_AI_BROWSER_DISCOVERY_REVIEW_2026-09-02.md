# Meta AI browser discovery review — 2026-09-02

Status: PASS1_COMPLETE_PROVIDER_SPECIAL_COMPOSER_BLOCKED
Provider: Meta AI
Provider ID: `meta_ai`
Source: operator-provided Codex first-pass report preserved in `META_AI_BROWSER_DISCOVERY_RAW_2026-09-02.md`.

## Executive verdict

Meta AI exposed a real guest chat surface without immediate authentication redirect, but the first-pass Send test was intentionally stopped because the observed native one-line `<input>` did not preserve the required multiline probe payload.

Observed facts:

- final origin/path remained `https://meta.ai/` / `/`;
- a guest Meta AI composer was visible without authentication;
- candidate editor: native text input labelled `Спросите Meta AI`;
- local Send control existed and changed from disabled to enabled after text entry;
- a login control was present separately from the guest composer;
- the authorized two-line probe read back as one line because the native input removed the newline;
- exact canonical read-back therefore failed;
- no Send click occurred;
- no user turn, assistant turn, conversation identity, code block, delivery, SPA or duplicate-tab evidence was produced.

The raw report's `MANUAL_ONLY_CANDIDATE` conclusion is too strong because no message was actually sent. Project status is instead:

`PROVIDER_SPECIAL_COMPOSER_BLOCKED / POST_SEND_BEHAVIOR_UNRESOLVED`

Patch readiness:

`NEEDS_PROVIDER_SPECIAL_COMPOSER_RESEARCH`

## Proven evidence

### Surface/autodetection candidate

Observed positive candidate signature combines:

- trusted origin `https://meta.ai`;
- one visible Meta-AI-labelled input;
- one local Send control;
- separate login control.

This is useful positive surface evidence, but production activation still requires post-Send/channel evidence.

### Composer and Send

Observed:

- one native text input;
- empty state: Send disabled;
- after text: same Send became enabled;
- multiline text cannot be represented exactly by the observed input semantics.

Therefore a provider-specific write/canonicalization strategy must be defined before any real Send test.

## Missing evidence

Unproven:

- guest Send authorization boundary;
- post-Send auth behavior;
- new-chat route/identity timing;
- exact durable conversation identity;
- reload identity durability;
- user/assistant turn roots and message IDs;
- ordered turn traversal;
- generation/completion lifecycle;
- exactly-once Send acceptance;
- fenced code/raw extraction;
- delivery confirmation;
- SPA A→B→A;
- different-chat parallel tabs;
- same-chat duplicate tabs;
- Manual;
- established Autorun;
- new-chat Autorun.

## Exact next Meta AI work

1. Determine a valid provider-specific composer-write contract compatible with the actual one-line input semantics.
2. Decide whether Ozon Bridge start/delivery messages for Meta must be canonical single-line payloads or whether another editor surface exists for multiline input.
3. Re-run exact read-back using the chosen canonical payload contract.
4. Only if read-back is exact, perform one-shot Send and observe auth boundary/identity timing.
5. Then close turns, completion, code extraction, delivery, SPA and tab ownership.

## Final status

Provider: Meta AI
Basic guest surface: OBSERVED
Autodetection candidate: PASS
Authentication requirement: guest composer visible; Send/history/durable identity unresolved
Conversation identity: UNRESOLVED
Composer: provider-specific multiline incompatibility observed
Send lifecycle: only disabled/enabled pre-Send state observed
Exactly-once Send: NOT TESTED
Turns/completion: NOT TESTED
Code extraction: NOT TESTED
Delivery: NOT TESTED
SPA/tabs: NOT TESTED
Manual: UNRESOLVED
Autorun: UNRESOLVED
Overall first-pass verdict: `PROVIDER_SPECIAL_COMPOSER_BLOCKED`
Patch readiness: `NEEDS_PROVIDER_SPECIAL_COMPOSER_RESEARCH`
