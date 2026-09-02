# Grok browser discovery review — 2026-09-02

Status: PASS1_COMPLETE_ENVIRONMENT_OR_PROVIDER_RENDER_BLOCKED
Scope: Grok only
Source: operator-provided Codex first-pass Grok browser discovery.

## 1. Executive verdict

Grok Pass 1 is complete as a blocked evidence record, not as a provider capability verdict.

Observed facts:

- `https://grok.com/` was reached directly;
- final origin remained `https://grok.com` and pathname `/`;
- document title was `Grok`;
- body exposed only `Skip to main content`;
- no buttons, inputs, textareas, contenteditables, composer, conversation root or Send were available;
- no redirect to X/x.com was observed;
- no authentication page was observed;
- no CAPTCHA, anti-bot challenge or browser-runtime access denial was observed;
- no probe message was inserted or sent.

Therefore the evidence does NOT establish that Grok requires authentication, and does NOT establish that Grok is unsafe/unsupported. The browser reached the provider document, but the usable Grok product DOM did not render in this session.

Canonical Pass-1 classification:

`CONTENT_UNAVAILABLE / ENVIRONMENT_OR_RENDER_BLOCKED / NOT TESTED`

For roadmap simplicity this provider remains in the broader `ENVIRONMENT_BLOCKED / NOT TESTED` bucket, with the precise reason preserved as `blank provider DOM after provider document load`.

## 2. Evidence implications

### Trusted origin

PASS candidate:

`https://grok.com`

No alternate/redirect origin was observed in this pass.

### Positive provider detection

UNRESOLVED.

Origin or document title must never be enough to activate a Grok adapter. Production support requires a later pass with a positive visible Grok conversation root + current composer + scoped Send signature.

### Authentication

UNRESOLVED.

No login surface appeared. The blank/incomplete document must not be reclassified as `AUTH_REQUIRED` without actual provider authentication evidence.

### Conversation identity, turns, composer, lifecycle, code and delivery

All remain untested because no chat DOM existed.

## 3. Required later Grok retry

Do not repeat generic assumptions. A future pass must first resolve the render/access blocker and obtain one explicit Grok state:

1. usable public/guest chat;
2. authenticated chat/login barrier;
3. provider anti-bot/CAPTCHA/region blocker; or
4. reproducible browser-environment incompatibility.

Only after a usable chat loads should the normal deep checklist run:

- positive DOM detection;
- auth boundary;
- new/established routes;
- exact conversation identity;
- reload stability;
- ordered user/assistant turns and stable IDs;
- generation/completion;
- exact composer write/read-back;
- one-shot Send;
- code/raw extraction;
- result delivery confirmation;
- SPA A→B→A;
- different chats in parallel;
- same-chat duplicate tabs;
- Manual;
- established Autorun;
- new-chat Autorun.

## 4. Current provider record

Provider: Grok

Pass 1: COMPLETE AS BLOCKED RECORD

Environment/provider document access: PASS to `https://grok.com/`

Usable chat DOM: BLOCKED — blank/incomplete provider DOM

Authentication requirement: UNRESOLVED

Provider challenge: none observed

Autodetection: UNRESOLVED

Conversation identity: UNRESOLVED

Composer/Send: UNRESOLVED

Turns/message IDs: UNRESOLVED

Completion: UNRESOLVED

Raw code: UNRESOLVED

Delivery: UNRESOLVED

SPA/multichannel: UNRESOLVED

Manual: UNRESOLVED

Established Autorun: UNRESOLVED

New-chat Autorun: UNRESOLVED

Production adapter: NOT AUTHORIZED

Final Pass-1 verdict: `ENVIRONMENT_BLOCKED / NOT TESTED`
