# Claude browser discovery — 2026-09-02

Scope: first breadth-first Claude pass only; this is the sole output. No
repository, extension, Ozon API, credential, cookie, storage, account or
private conversation data was accessed.

| ID | Requirement | Status | Evidence location | Blocker |
| -- | ----------- | ------ | ----------------- | ------- |
| CLAUDE-01 | Requested/final URL | PASS | §auth | — |
| CLAUDE-02 | Product surface | PASS | §auth | — |
| CLAUDE-03 | Authentication boundary | PASS | §auth | — |
| CLAUDE-04 | Positive chat detection | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-05 | Non-chat rejection | PASS | §auth | — |
| CLAUDE-06 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-07 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-08 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-09 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-10 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-11 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-12 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-13 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-14 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-15 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-16 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-17 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-18 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-19 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-20 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-21 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-22 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-23 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-24 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-25 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-26 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-27 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-28 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-29 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-30 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-31 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-32 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-33 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-34 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-35 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-36 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-37 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |
| CLAUDE-38 | Checklist item | BLOCKED | §auth | AUTH_REQUIRED |

## Progress

The rows were created before browser interaction and are terminal only after
the access boundary is observed and recorded below.

## §auth — First-pass authentication boundary

Browser action: opened `https://claude.ai/` and waited for the visible document.
Observed final URL `https://claude.ai/login`; origin `https://claude.ai`;
pathname `/login`; title `Sign in - Claude`. The rendered page offered Google,
Apple, email, and SSO continuation and contained no visible Claude chat
composer, conversation root, user/assistant turns, Send, Stop, or code block.
No login control was used.

```html
<!-- SANITIZED: provider=claude, case=login, purpose=auth-boundary -->
<main>
  <button>Continue with Google</button>
  <button>Continue with Apple</button>
  <button>Continue with email</button>
  <button>Continue with SSO</button>
</main>
```

Checklist closure: CLAUDE-01 and CLAUDE-02 are PASS for the observed redirect
and login classification. CLAUDE-03 is PASS: basic chat requires authentication
in this browser session. CLAUDE-04 and CLAUDE-06 through CLAUDE-26 and
CLAUDE-28 through CLAUDE-38 are BLOCKED / AUTH_REQUIRED because no chat exists
before login. CLAUDE-05 is PASS: exact origin plus `/login` or auth-only
controls is `CONFLICT`, never executable chat; `CONFIRMED` requires origin plus
positive visible chat root, current composer, and scoped Send; missing chat DOM
on a trusted origin is `PENDING_PAGE_READY` while loading or
`CONTENT_UNAVAILABLE` when absent; multiple candidates are `AMBIGUOUS`; another
origin is `UNSUPPORTED`. CLAUDE-27 is NOT_APPLICABLE because no authorized code
probe was sent and no artifact was created.

Provider: Claude  
Requested URL: `https://claude.ai/`  
Final URL/origin: `https://claude.ai/login` / `https://claude.ai`  
Environment access: PASS — Claude document rendered  
Access without authentication: login surface only  
Authentication required for: basic chat, composer, Send, turns and history  
Autodetection: BLOCKED — no positive chat DOM  
Conversation identity through New-chat Autorun: BLOCKED / AUTH_REQUIRED  
Artifact/code distinction: NOT_APPLICABLE  
Overall first-pass verdict: AUTHENTICATED_REDISCOVERY_REQUIRED  
Required authenticated follow-up items: CLAUDE-04 and CLAUDE-06–38 except 27  
Remaining FAIL items: none  
Remaining BLOCKED items: CLAUDE-04, 06–26, 28–38; AUTH_REQUIRED.
