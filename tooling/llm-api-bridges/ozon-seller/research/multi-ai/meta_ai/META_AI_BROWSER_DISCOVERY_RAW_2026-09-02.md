# Meta AI browser discovery — 2026-09-02

Scope: first breadth-first Meta AI pass only; this is the sole output. No
repository, extension, Ozon API, credential, cookie, storage, account or
private conversation data was accessed.

| ID | Requirement | Status | Evidence location | Blocker |
| -- | ----------- | ------ | ----------------- | ------- |
| META-01 | Requested/final origin and redirects | PASS | §1 | — |
| META-02 | Product/surface classification | PASS | §2 | — |
| META-03 | Authentication boundary | PASS | §3 | — |
| META-04 | Positive Meta AI chat detection | PASS | §4 | — |
| META-05 | Non-chat rejection | PASS | §5 | — |
| META-06 | Empty/new-chat surface | BLOCKED | Pending chat | — |
| META-07 | Conversation identity before first Send | BLOCKED | Pending chat | — |
| META-08 | Composer root/editable before Send | PASS | §8 | — |
| META-09 | First-Send identity timing | BLOCKED | Pending chat | — |
| META-10 | Durable conversation identity | BLOCKED | Pending chat | — |
| META-11 | ID case / normalization | BLOCKED | Pending ID | — |
| META-12 | Reload identity durability | BLOCKED | Pending ID | — |
| META-13 | User-turn root | BLOCKED | Pending chat | — |
| META-14 | Assistant-turn root | BLOCKED | Pending chat | — |
| META-15 | True orderedTurns() | BLOCKED | Pending chat | — |
| META-16 | Message-ID stability | BLOCKED | Pending chat | — |
| META-17 | Generation-start signal | BLOCKED | Pending Probe A | — |
| META-18 | Assistant completion | BLOCKED | Pending Probe A | — |
| META-19 | Exact composer write/read-back | FAIL | §19 | Input removes required newline. |
| META-20 | Enabled Send | PASS | §20 | — |
| META-21 | Disabled/no-text Send | PASS | §21 | — |
| META-22 | Stop/Cancel/generating | BLOCKED | Pending Probe A | — |
| META-23 | Exactly-once Send | BLOCKED | Pending Probe A | — |
| META-24 | Code-block creation | BLOCKED | Pending Probe B | — |
| META-25 | Exact raw-code extraction | BLOCKED | Pending Probe B | — |
| META-26 | Code ownership / future action anchor | BLOCKED | Pending Probe B | — |
| META-27 | Second-turn continuity | BLOCKED | Pending Probe C | — |
| META-28 | Delivery-like one-shot Send | BLOCKED | Pending Probe D | — |
| META-29 | Result-delivery confirmation | BLOCKED | Pending Probe D | — |
| META-30 | SPA A → B | BLOCKED | Pending two chats | — |
| META-31 | SPA B → A | BLOCKED | Pending two chats | — |
| META-32 | Stale DOM rejection | BLOCKED | Pending SPA | — |
| META-33 | Different conversations in separate tabs | BLOCKED | Pending two IDs | — |
| META-34 | Same conversation duplicate tabs | BLOCKED | Pending ID | — |
| META-35 | Duplicate-tab owner policy | BLOCKED | Pending duplicate chat | — |
| META-36 | Manual / established Autorun | BLOCKED | Pending prerequisites | — |
| META-37 | New-chat Autorun | BLOCKED | Pending prerequisites | — |
| META-38 | Final capability/access record | PASS | §38 | — |

## §1–§5 — Origin, surface, access and rejection

Action: opened `https://meta.ai/` and inspected bounded interactive DOM. Final
URL/origin/path remained `https://meta.ai/`, `https://meta.ai`, `/`; no redirect
was observed. The visible surface is guest Meta AI chat: `input[aria-label="Спросите Meta AI"]`, one attachment button and one disabled Send were present,
with separate login/register controls. Guest chat is visible without auth;
durable history and post-Send access are not yet proven.

Positive signature: exact origin plus visible Meta-AI-labelled input,
`button[aria-label="Отправить"]`, and `button[data-testid="login-button"]`.
This must be scoped to the chat surface. Login/account-only surfaces without the
input are `CONFLICT`; trusted origin without loaded controls is
`PENDING_PAGE_READY`; multiple visible composer/send pairs are `AMBIGUOUS`;
different origins are `UNSUPPORTED`; blank DOM is `CONTENT_UNAVAILABLE`.

```html
<!-- SANITIZED: provider=meta_ai, case=guest-empty, purpose=positive-signature -->
<input type="text" aria-label="Спросите Meta AI" placeholder="Спросите Meta AI…">
<button aria-label="Добавить вложение"></button>
<button aria-label="Отправить" disabled></button>
<button data-testid="login-button">Войти</button>
```

## §8, §19–§21 — Composer and Send evidence

Action: filled the unique visible Meta AI input with the two-line authorized
Probe A. It read back as a single line with the required newline removed. This
is non-identical and not reversible from the observed input state; no Send was
clicked. The one Send button was disabled before text and became enabled after
text. Composer: one native text input, no observed hidden duplicate.

## §6–§7, §9–§18, §22–§37 — BLOCKED

No probe was sent because QWEN-style two-line Probe A did not pass exact
composer read-back. Therefore new-chat identity, turns, messages, lifecycle,
code, delivery, SPA, tab isolation and capabilities cannot be tested without
weakening the exact-payload requirement. Blocker: `EXACT_COMPOSER_READBACK_FAILED`.

## §38 — Final record

provider_id: `meta_ai`  
surface_id: `guest_chat` (observed)  
requested_origin/final_origin: `https://meta.ai`  
authentication_requirement: guest composer visible; post-Send/durable chat UNRESOLVED  
positive_dom_signature: Meta-AI input + local Send + origin  
negative_dom_signatures: missing input; login/account-only page  
conversation, turns, IDs, lifecycle, code, delivery, SPA and tabs: `UNRESOLVED`  
composer_strategy: one native text input with `aria-label="Спросите Meta AI"`  
composer_write_strategy: exact multiline fails  
send_strategy: one `button[aria-label="Отправить"]`  
disabled_send_strategy: same Send node disabled when empty  
manual/autorun: `UNRESOLVED`

Provider: Meta AI  
Access without authentication: guest composer visible  
Authentication required for: UNRESOLVED  
Autodetection: PASS  
Composer: FAIL for required multiline exactness  
Exactly-once Send: BLOCKED  
Overall first-pass verdict: MANUAL_ONLY_CANDIDATE  
Remaining FAIL items: META-19  
Remaining BLOCKED items: META-06–07, 09–18, 22–37; exact read-back failed.
