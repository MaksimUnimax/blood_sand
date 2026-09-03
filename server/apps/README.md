# Server Applications

Application/process boundaries approved by the architecture:

- `api/` — Fastify control-plane HTTP API;
- `worker/` — durable asynchronous jobs;
- `portal/` — user account/device/billing web UI;
- `admin/` — internal operations/admin UI;
- `health-runner/` — controlled-browser AI compatibility checks.

Implementation directories are created by the roadmap step that owns them. Do not place domain business logic directly in application shells when it belongs in reusable domain packages.
