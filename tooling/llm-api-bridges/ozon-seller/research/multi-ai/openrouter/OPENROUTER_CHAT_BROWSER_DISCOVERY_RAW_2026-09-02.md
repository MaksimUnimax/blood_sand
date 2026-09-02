# OpenRouter Chat discovery — 2026-09-02

| ID | Requirement | Status | Evidence location | Blocker |
| -- | ----------- | ------ | ----------------- | ------- |
| OPENROUTER-01 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-02 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-03 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-04 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-05 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-06 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-07 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-08 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-09 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-10 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-11 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-12 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-13 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-14 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-15 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-16 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-17 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-18 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-19 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-20 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-21 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-22 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-23 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-24 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-25 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-26 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-27 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-28 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-29 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-30 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-31 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-32 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-33 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-34 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-35 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-36 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-37 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-38 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-39 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |
| OPENROUTER-40 | Checklist item | BLOCKED | §access | CONTENT_UNAVAILABLE |

## §access

Browser action: opened `https://openrouter.ai/chat` and inspected bounded DOM.
Final URL/origin/path: `https://openrouter.ai/chat`, `https://openrouter.ai`,
`/chat`; title `AI Chat Playground - Compare AI Models Side by Side |
OpenRouter`. Visible navigation included Search, Models, Benchmarks, Chat,
Rankings, Apps, Enterprise and Docs. No textarea, input, contenteditable or
chat composer was present; no model was selected and no message was sent.

```html
<!-- SANITIZED: provider=openrouter_chat, case=playground-shell, purpose=surface -->
<nav>Search Models Benchmarks Chat Rankings Apps Enterprise Docs</nav>
<main><no-chat-composer /></main>
```

OPENROUTER-01 and OPENROUTER-02: PASS for live URL/surface classification.
OPENROUTER-03 through OPENROUTER-40: BLOCKED with exact blocker
`CONTENT_UNAVAILABLE / /chat rendered navigation shell with zero composer
elements`. This includes authentication/model selection, probes, identity,
turns, lifecycle, code, delivery, SPA and tab tests; none can be tested without
a real chat surface. The web provider identity remains `openrouter_chat`; no
underlying model was selected or treated as an adapter identity.

Provider: OpenRouter Chat  
provider_id: openrouter_chat  
Requested/final URL: `https://openrouter.ai/chat`  
Environment access: provider document rendered  
Product surface: navigation/playground shell without chat composer  
Overall first-pass verdict: CONTENT_UNAVAILABLE / NOT TESTED  
Remaining FAIL items: none  
Remaining BLOCKED items: OPENROUTER-03–40.
