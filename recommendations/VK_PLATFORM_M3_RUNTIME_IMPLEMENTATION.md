# VK Platform M3 runtime implementation

Decision/scope: `M3_PLAIN_TEXT_RUNTIME_IMPLEMENTATION_V1`.

`START_HEAD = 7b6dd698847ec7d9fa9dddf9f202840903307625`

Implemented modules: configuration, Callback trust boundary and normalizer,
versioned SQLite state, deterministic text parser/session orchestration,
presenter, inbound/outbox workers, and the narrow `messages.send` adapter.

The application Callback route is `POST /internal/vk/callback` (an application
decision for later nginx deployment). Schema version is 1. Callback
deduplication is `UNIQUE(vk_group_id, transport, event_id)`; the session key is
`(vk_group_id, peer_id)`. A single transaction commits session transition and
one outbox row before a send. Each row owns one persisted integer `random_id`.

Only plain text is implemented. Keyboard sending is **NOT_IMPLEMENTED /
BLOCKED_BY_KEYBOARD_GATE**. The sole runtime VK method is `messages.send`.
The retry policy is one retry (two attempts total) for explicit 6/10/36 or an
unknown transport result, reusing the random id; every other parsed error is
terminal. The five-second retry delay is application policy.

VK is disabled unless `KIP_VK_ENABLED` is true and all required `KIP_VK_*`
configuration is supplied. No runtime calls or deployment occurred in this run.
Next stage: controlled staging deployment and an end-to-end plain-text Bot
conversation.
