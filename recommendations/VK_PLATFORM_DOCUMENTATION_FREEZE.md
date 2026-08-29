# VK Platform Documentation Freeze — pre-code checkpoint

Версия: 0.1  
Статус: **DOCUMENTATION-FIRST ARCHITECTURE FREEZE**  
Дата: 2026-08-29  
Бренд: «Кровь и Песок»

## 1. Цель checkpoint

Зафиксировать, что перед новым VK runtime code выполнен отдельный documentation-first этап:

```text
официальные VK contracts
→ contract ledger
→ Bot platform architecture
→ PRE-M3 contract
→ Mini App platform architecture
→ PRE-M5 contract
→ cross-channel PRE-M6 boundary
→ full implementation architecture
→ milestone gate matrix
→ backend dependency/lock authority
→ только потом implementation
```

Этот checkpoint существует специально для предотвращения реализации VK transport/UI «по памяти» или методом проб и догадок.

---

## 2. Pre-freeze branch baseline

Documentation phase started after hybrid roadmap authority at:

```text
54a0cefb858f71047896ef38171813c0ecc929ab
```

Immediately before this freeze marker, remote development branch was independently verified at:

```text
4aad7dbc77efb45de45eefef93cd4cb98ec52a86
```

Compare from `54a0ce...` to `4aad7dbc...`:

```text
15 commits ahead
0 behind
only recommendations/*.md documentation files changed/added
no runtime source code added or modified
no machine-readable recommendation data changed
no schemas changed
```

Main remained:

```text
91d4a5e945416bba9d1cf6b6fa1bbeee08bfeb28
```

---

## 3. Frozen mandatory platform documents

```text
VK_PLATFORM_ARCHITECTURE.md
VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md
VK_PLATFORM_PRE_M3_CONTRACT.md
VK_PLATFORM_PRE_M5_CONTRACT.md
VK_PLATFORM_PRE_M6_CONTRACT.md
VK_IMPLEMENTATION_ARCHITECTURE.md
VK_IMPLEMENTATION_GATE_MATRIX.md
M2_BACKEND_DEPENDENCY_ADR.md
```

Supporting current authorities:

```text
RECOMMENDATION_MATRIX.md
PRODUCT_CLASSIFICATION.md
CUSTOMER_RECOMMENDATION_COPY_GUIDE.md
DATA_API_CONTRACT.md
ARCHITECTURE.md
VK_UX_FLOW.md
ROADMAP.md
README.md
```

No implementation prompt may ignore the relevant documents.

---

## 4. Documentation quality rule

Platform statements are classified into separate categories:

```text
VERIFIED
→ supported by current official VK source/staging evidence

OUR ARCHITECTURE DECISION / OUR SECURITY POLICY
→ deliberate project decision, not falsely attributed to VK

REVALIDATE
→ known contract/version that must be checked again immediately before implementation

STAGING_REQUIRED
→ field/behavior exists but exact registered environment behavior must be proven

OFFICIAL_CONFLICT
→ current official sources disagree; no silent choice

UNRESOLVED
→ no sufficient current official contract found; implementation forbidden or feature excluded
```

This classification survives into implementation reviews.

---

## 5. Core VK platform facts frozen

Verified current platform baseline includes at least:

```text
Callback API and Bots Long Poll are distinct supported inbound mechanisms
Callback-first selected by project architecture
Callback confirmation flow
ordinary callback `ok` acknowledgement
current callback envelope type/group_id/event_id/v
VK event_id duplicate-ignore semantics
current message_new nesting object.message + object.client_info
client_info keyboard/capability data
messages keyboard/text/callback/open_app action schemas
messages.send contract and random_id idempotency purpose
current messages.send error inventory
Callback server provisioning/readback/settings methods
Callback server status enum including ok
callback event subscription/version settings
group token permission inspection API
Bots Long Poll server/settings discovery boundary
VK Bridge Init/GetLaunchParams/supportsAsync boundaries
signed Mini App launch signature algorithm
AllowMessagesFromGroup permission boundary
VKWebAppOpenApp boundary
VKWebAppClose existence without assumed dialog destination
VK Mini Apps official static hosting tooling boundary
```

No historical payload compatibility is implemented merely from memory.

---

## 6. Architecture frozen

Target product remains:

```text
ONE VK product
ONE deterministic Recommendation Core
ONE shared Recommendation Application Service/API
TWO coordinated surfaces:
  VK Community Bot
  VK Mini App
```

V1 backend architecture:

```text
FastAPI backend
Recommendation API
later VK Callback endpoint
stdlib SQLite VK state store
persistent inbound inbox
persistent Bot sessions/results
persistent outbound outbox
inbound worker
outbox worker
single outbound VK API adapter
```

MQO/Telegram runtime/state remains separate.

---

## 7. Critical reliability architecture frozen

Callback ordinary event path:

```text
validate trusted Callback envelope
→ durable inbox insert + dedup
→ COMMIT
→ quick `ok`
→ inbound worker later processes state/result/outbox
→ outbox worker later calls messages.send
```

Consequences:

```text
no synchronous full Bot flow before Callback ack
no acknowledged event lost before persistence
same event_id cannot cause second logical transition/send
outbound retry uses same persisted random_id
no external VK HTTP call inside state DB transaction
no fire-and-forget in-memory durable customer action
```

---

## 8. Critical security architecture frozen

```text
Callback trust = expected group_id + configured secret
secrets never logged
Mini App vk_user_id untrusted until signed launch verification
expected vk_app_id must match
Mini App protected key server-only
Bot→Mini App handoff token opaque/unpredictable
handoff server stores token hash where practical
handoff redeem requires expected verified VK user
no trusted DOB/gender/product from URL/hash
no profile sex inference for recommendation
```

Exact application TTLs are not disguised as VK requirements.

---

## 9. Explicit unresolved/platform gates

Current intentionally unresolved or staging-gated items include:

```text
exact numeric Callback delivery/ack timeout
exact M3 API version at implementation date (current baseline 5.199, REVALIDATE)
final required group-token permission names/settings
final bounded messages.send retry allowlist
registered Bot open_app app_id/owner_id behavior
open_app hash/location behavior across selected clients
VK-mandated vk_ts freshness TTL (not found in checked official source)
Mini App → specific community-message-dialog primitive
raw Bots Long Poll failed/recovery protocol
```

No future code may convert these into remembered constants/contracts without updated authority.

---

## 10. Official Mini App dependency conflict frozen

Current official source conflict:

```text
create-vk-mini-app template
→ @vkontakte/vk-miniapps-deploy ^0.1.6

official VKCOM/vk-miniapps-deploy repository
→ versions below 1.0.0 deprecated/unsupported
```

Therefore M5 dependency/scaffold gate remains blocked until current supported deploy version is resolved and pinned from a primary source.

Do not copy the generator dependency blindly.

---

## 11. M2 backend dependency policy frozen

Current research-time direct baseline:

```text
Python project baseline >=3.11
FastAPI 0.141.1
Uvicorn 0.52.4
Pydantic 2.13.5
HTTPX stable 0.28.1
uv lock/project tool 0.12.7
```

Dependency authority:

```text
pyproject.toml
uv.lock
```

Normal reproducible commands:

```text
uv sync --locked
uv run --locked ...
```

Production/CI automatic uv Python downloads:

```text
disabled
```

M2 application source is not yet allowed until actual locked setup/regression is audited.

---

## 12. Current code gates

```text
M1 = CLOSED/PASS
```

```text
M2_ARCHITECTURE_GATE = PASS
M2_DEPENDENCY_POLICY_GATE = PASS
M2_SETUP_ONLY_GATE = OPEN
M2_APPLICATION_CODE_GATE = BLOCKED until setup audit
```

M2 setup-only means exactly:

```text
safe local branch fast-forward
verify Python >=3.11
verify/install exact uv 0.12.7
create exact pyproject.toml
create uv.lock
clean uv sync --locked with Python downloads disabled
run all M1 regression through uv run --locked
prove lock unchanged
commit/push setup only
independent GitHub audit
```

It explicitly does NOT include API endpoint/application code.

```text
M3_CODE_GATE = BLOCKED
reason = staging community/token/Callback/send fixtures + retry policy pending
```

```text
M4_CODE_GATE = BLOCKED
reason = destination/availability data-source authority pending
```

```text
M5_CODE_GATE = BLOCKED
reason = deploy conflict + registered app staging + security policy pending
```

```text
M6_CODE_GATE = BLOCKED
reason = Bot→App staging + App→community-dialog unresolved/exclusion decision
```

---

## 13. Review discipline after freeze

Every implementation slice is reviewed against:

```text
business authority
official platform contract / staging fixture
application architecture/policy
milestone scope
crash/idempotency behavior
security trust boundary
```

Codex report alone never closes a milestone.

After every implementation result independently verify GitHub:

```text
branch head
parent
compare/diff
changed files
source
relevant tests
main unchanged
```

Where execution proof is local-only, distinguish:

```text
Codex reports local execution PASS
GitHub audit confirms committed source/tests/fixtures
```

unless CI evidence exists.

---

## 14. Next permitted action

After this documentation freeze the next permitted action is NOT M2 API implementation.

It is:

```text
M2 SETUP-ONLY SLICE
```

Purpose:

```text
bring local VK worktree safely to this documentation authority
and establish the exact locked Python environment
before application code exists
```

Only after independent audit of that setup slice may an M2 application implementation prompt be issued.

Decision marker:

```text
KIP_VK_PLATFORM_DOCUMENTATION_FIRST_FREEZE_2026_08_29
```
