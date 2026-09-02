# Grok browser discovery — 2026-09-02

Scope: first breadth-first Grok browser pass only; this is the sole task output. No repository, extension, Ozon API, credential, storage, cookie, account, or private conversation data was accessed.

| ID | Requirement | Status | Evidence location | Blocker |
| -- | ----------- | ------ | ----------------- | ------- |
| GROK-01 | Trusted origin / redirects | PASS | §1 | — |
| GROK-02 | Product / surface classification | PASS | §2 | — |
| GROK-03 | Positive Grok chat-app detection | BLOCKED | §3 | CONTENT_UNAVAILABLE / blank provider DOM |
| GROK-04 | Non-chat rejection | BLOCKED | Pending DOM | — |
| GROK-05 | Authentication boundary | BLOCKED | Pending DOM | — |
| GROK-06 | Grok modes / surfaces | BLOCKED | Pending chat | — |
| GROK-07 | Empty-new-chat route | BLOCKED | Pending chat | — |
| GROK-08 | Conversation identity before first Send | BLOCKED | Pending chat | — |
| GROK-09 | First-Send identity timing | BLOCKED | Pending chat | — |
| GROK-10 | Exact durable conversation identity | BLOCKED | Pending chat | — |
| GROK-11 | Conversation ID format/case/normalization | BLOCKED | Pending chat | — |
| GROK-12 | Reload identity stability | BLOCKED | Pending chat | — |
| GROK-13 | User turn | BLOCKED | Pending chat | — |
| GROK-14 | Assistant turn | BLOCKED | Pending chat | — |
| GROK-15 | True orderedTurns() | BLOCKED | Pending chat | — |
| GROK-16 | Message ID stability | BLOCKED | Pending chat | — |
| GROK-17 | Generation-start signal | BLOCKED | Pending Probe A | — |
| GROK-18 | Assistant completion | BLOCKED | Pending Probe A | — |
| GROK-19 | Composer root/editable | BLOCKED | Pending chat | — |
| GROK-20 | Exact composer insertion/read-back | BLOCKED | Pending Probe A | — |
| GROK-21 | Enabled Send | BLOCKED | Pending Probe A | — |
| GROK-22 | Disabled/no-text Send | BLOCKED | Pending chat | — |
| GROK-23 | Stop / Cancel / generating control | BLOCKED | Pending Probe A | — |
| GROK-24 | Exactly-once Send | BLOCKED | Pending Probe A | — |
| GROK-25 | Code-block creation | BLOCKED | Pending Probe B | — |
| GROK-26 | Exact raw-code extraction | BLOCKED | Pending Probe B | — |
| GROK-27 | Code ownership / action anchor | BLOCKED | Pending Probe B | — |
| GROK-28 | Second-turn continuity | BLOCKED | Pending Probe C | — |
| GROK-29 | Delivery-like one-shot Send | BLOCKED | Pending Probe D | — |
| GROK-30 | Result-delivery confirmation | BLOCKED | Pending Probe D | — |
| GROK-31 | SPA A → B | BLOCKED | Pending two chats | — |
| GROK-32 | SPA B → A | BLOCKED | Pending two chats | — |
| GROK-33 | Stale DOM rejection | BLOCKED | Pending SPA evidence | — |
| GROK-34 | Different conversations in two tabs | BLOCKED | Pending two IDs | — |
| GROK-35 | Same conversation duplicate tabs | BLOCKED | Pending durable ID | — |
| GROK-36 | Manual / established Autorun | BLOCKED | Pending requirements | — |
| GROK-37 | New-chat Autorun | BLOCKED | Pending requirements | — |
| GROK-38 | Final adapter/capability record | BLOCKED | Pending checklist closure | — |

## Progress log

Report created before browser interaction. Initial statuses are progress placeholders and will be replaced with terminal evidence statuses.

## §1 — GROK-01 trusted origin / redirects — PASS

Browser action: opened `https://grok.com/` and waited three seconds for a rendered page. Final URL stayed `https://grok.com/`; origin `https://grok.com`; pathname `/`. No redirect to X/x.com or another origin was observed.

## §2 — GROK-02 product / surface classification — PASS

Action: bounded DOM/state inspection. The document title was `Grok`, but the only visible body text was `Skip to main content`; there were zero buttons, inputs, textareas, contenteditables and chat controls. The observed surface is a blank/incomplete provider document, not an executable public chat.

## §3–§37 — Chat-dependent checks — BLOCKED

Exact browser action: provider navigation followed by bounded DOM inspection. Observed URL/path: `https://grok.com/`. Observed state: title `Grok`, body text `Skip to main content`, zero interactive/chat nodes. Because the Grok document was reached but no product chat DOM loaded, every chat-dependent check is `BLOCKED` with blocker `CONTENT_UNAVAILABLE / blank provider DOM`: positive signature, modes, new chat, identity, all four probes, turns, IDs, lifecycle, composer/Send, code, delivery, SPA and two-tab checks cannot be performed. No authentication page, CAPTCHA, challenge, redirect, or browser-runtime denial was observed; no message was inserted or sent.

For GROK-04, the evidence rule is: `CONFIRMED` requires trusted origin plus a positive visible conversation root, composer and scoped Send; origin without those is `PENDING_PAGE_READY` only while loading and `CONTENT_UNAVAILABLE` once the bounded inspection remains blank; login/challenge/marketing is `CONFLICT`; other origins are `UNSUPPORTED`; multiple visible candidates are `AMBIGUOUS`.

```html
<!-- SANITIZED: provider=grok, case=blank-document, purpose=surface-classification -->
<body>Skip to main content</body>
```

## §38 — Final adapter/capability record — BLOCKED

provider_id: `grok`  
surface_id: `UNRESOLVED`  
trusted_origins: `https://grok.com`  
authentication_requirement: `UNRESOLVED`  
positive_dom_signature: `UNRESOLVED`  
negative_dom_signatures: blank provider document with only skip-link text  
new_chat_routes: `UNRESOLVED`  
established_chat_routes: `UNRESOLVED`  
conversation_identity_sources: `UNRESOLVED`  
conversation_id_format: `UNRESOLVED`  
conversation_id_normalization: `UNRESOLVED`  
conversation_id_case_policy: `UNRESOLVED`  
ordered_turn_strategy: `UNRESOLVED`  
user_role_strategy: `UNRESOLVED`  
assistant_role_strategy: `UNRESOLVED`  
message_id_strategy: `UNRESOLVED`  
generation_start_policy: `UNRESOLVED`  
assistant_completion_policy: `UNRESOLVED`  
code_block_strategy: `UNRESOLVED`  
raw_code_strategy: `UNRESOLVED`  
composer_strategy: `UNRESOLVED`  
composer_write_strategy: `UNRESOLVED`  
send_strategy: `UNRESOLVED`  
disabled_send_strategy: `UNRESOLVED`  
stop_or_cancel_strategy: `UNRESOLVED`  
ready_strategy: `UNRESOLVED`  
delivery_confirmation_policy: `UNRESOLVED`  
spa_invalidation_policy: `UNRESOLVED`  
duplicate_tab_policy: `UNRESOLVED`  
manual_capability: `UNRESOLVED`  
established_autorun_capability: `UNRESOLVED`  
new_chat_autorun_capability: `UNRESOLVED`  
think_mode_special_cases: `UNRESOLVED`  
search_special_cases: `UNRESOLVED`  
deepsearch_special_cases: `UNRESOLVED`  
additional_surface_notes: blank provider DOM

Provider: Grok  
Requested URL: `https://grok.com/`  
Final provider URL/origin: `https://grok.com/` / `https://grok.com`  
Access without authentication: not determinable  
Authentication required for: not determinable  
Environment access: provider document reached  
Provider challenge/anti-bot state: none observed  
Autodetection through New-chat Autorun: BLOCKED  
Overall first-pass verdict: ENVIRONMENT_BLOCKED / NOT TESTED  
Required authenticated second-pass items: all chat-dependent checks if an auth surface is subsequently observed  
Required environment retry items: reloadable Grok document with positive chat or explicit provider access state  
Remaining FAIL items: none  
Remaining BLOCKED items: GROK-03 through GROK-38.
