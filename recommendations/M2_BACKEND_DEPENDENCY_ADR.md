# M2 Backend Dependency ADR

Версия: 0.1  
Статус: **PRE-M2 DEPENDENCY AUTHORITY**  
Дата проверки: 2026-08-29

## 1. Назначение

Этот ADR фиксирует backend technology/dependency baseline до первого M2 runtime commit.

Он является **OUR ARCHITECTURE DECISION**, а не VK platform contract.

Primary sources used:

```text
FastAPI official docs / PyPI verified project
Pydantic official/PyPI verified project
Uvicorn official/PyPI verified project
HTTPX official/PyPI verified project
```

No dependency is selected from memory or an unversioned tutorial.

---

## 2. Python baseline

Project architecture baseline:

```text
Python >= 3.11
```

This is our project decision.

Current researched dependencies all have upstream minimums at or below this baseline:

```text
FastAPI 0.141.1 → Python >=3.10
Uvicorn 0.52.4 → Python >=3.10
Pydantic 2.13.5 → Python >=3.9
HTTPX 0.28.1 → stable release selected
```

Before M2 implementation, local/server interpreter must be recorded:

```text
python3 --version
```

If below 3.11:

```text
M2_RUNTIME_BASELINE = BLOCKED
```

Do not silently lower project baseline just because a server has an older interpreter.

---

## 3. Direct M2 dependencies

Freeze direct versions for M2:

```text
fastapi==0.141.1
uvicorn==0.52.4
pydantic==2.13.5
httpx==0.28.1
```

Why explicit Pydantic pin although FastAPI depends on it:

- request/error serialization is part of our HTTP contract;
- validation behavior must not drift because of an unrelated resolver update;
- M2 tests should run against one reviewed Pydantic version.

Why HTTPX is explicit in M2:

- FastAPI/Starlette test tooling uses HTTPX;
- later VK adapter may use it, but M2 itself must not call VK;
- selecting stable `0.28.1` avoids current HTTPX `1.0.dev*` prerelease line.

---

## 4. FastAPI install mode

Use base package:

```text
fastapi==0.141.1
```

Do NOT use by default:

```text
fastapi[standard]
```

Reason: current FastAPI documentation says the `standard` extra includes additional optional tools such as Uvicorn standard extras and FastAPI CLI/cloud-related packages. This project wants a deliberately minimal, explicit server dependency set.

Uvicorn is pinned separately.

No FastAPI Cloud deployment dependency belongs in this product architecture.

---

## 5. Uvicorn mode

Use explicit:

```text
uvicorn==0.52.4
```

Do not require `uvicorn[standard]` unless a later measured deployment need justifies the extra runtime dependencies.

Production TLS termination remains outside application process behind the selected HTTPS proxy/load balancer.

Development/reload behavior is not production configuration.

---

## 6. HTTPX stability boundary

Research-time PyPI state:

```text
HTTPX stable latest = 0.28.1
HTTPX 1.0.dev* = prerelease
```

Therefore:

```text
httpx==0.28.1
```

is the M2 baseline.

Do not opt into 1.0 prerelease without a separate compatibility ADR and passing test suite.

---

## 7. Dependency lock requirement

Exact direct versions are necessary but not sufficient for reproducible installation.

Before application source is committed, M2 setup must produce and commit a deterministic dependency artifact containing the resolved transitive versions.

Acceptable implementation shape:

```text
pyproject.toml / requirements input with exact direct pins
+
committed resolved lock file
```

The chosen lock mechanism must:

- be usable non-interactively in CI/server install;
- pin transitive versions;
- be committed to repository;
- fail rather than silently upgrade on normal reproducible install;
- not depend on a global mutable environment.

Exact lock tooling is selected in the M2 setup slice after checking what is available/current on the server. If a new lock tool is introduced, its version is also pinned/documented.

No application-code commit is allowed before the lock artifact exists and clean install/tests pass from it.

---

## 8. Intentionally not selected for M2

Do not add merely because common FastAPI examples use them:

```text
SQLAlchemy
Alembic
PostgreSQL driver
Redis/Celery
Jinja
python-multipart
orjson/ujson
pydantic-settings
JWT library
OAuth library
FastAPI Cloud CLI
```

M2 Recommendation API needs none of these.

M3 VK state persistence uses stdlib `sqlite3` by current implementation architecture; its migration layer is project-owned, not SQLAlchemy/Alembic by default.

M5 frontend is a separate dependency authority.

---

## 9. Configuration strategy

M2 does not need an external settings library.

Use a small typed application configuration boundary built from:

```text
stdlib os.environ / explicit constructor input
```

with startup validation.

No secrets are required for M2 Recommendation API itself.

M3/M5 later add platform secrets under their own configuration authority.

---

## 10. Test dependency policy

Prefer testing through installed runtime dependencies already required by the service.

HTTP API contract tests may use:

```text
FastAPI/Starlette TestClient or HTTPX ASGI transport
```

provided the exact test method is compatible with pinned `httpx==0.28.1`.

Do not add pytest solely because it is popular if the current repository remains on `unittest`; preserve the existing test convention unless there is a concrete test capability gap.

Existing M1 tests use Python `unittest` and must continue passing.

---

## 11. Upgrade policy

Dependency upgrades are not automatic semantic changes.

Future upgrade procedure:

```text
check primary release notes
→ update direct pin
→ regenerate lock
→ full M1/M2 regression
→ inspect error/schema/OpenAPI changes
→ commit as explicit dependency upgrade
```

Never allow floating runtime dependencies to update during ordinary deployment.

---

## 12. M2 dependency gate

Before M2 code:

```text
LOCAL_PYTHON_VERSION >= 3.11
DIRECT_DEPENDENCY_PINS = exact values in this ADR
LOCK_ARTIFACT = committed
CLEAN_INSTALL_FROM_LOCK = PASS
M1_REGRESSION_FROM_LOCKED_ENV = PASS
```

Current approved direct baseline:

```text
FASTAPI = 0.141.1
UVICORN = 0.52.4
PYDANTIC = 2.13.5
HTTPX = 0.28.1 stable
```

Decision marker:

```text
KIP_M2_BACKEND_DEPENDENCY_BASELINE_2026_08_29
```
