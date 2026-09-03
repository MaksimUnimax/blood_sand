# Server Infrastructure

Target infrastructure subareas:

- `compose/` — reproducible local dependencies;
- `docker/` — application container definitions when implementation begins;
- `opentofu/` — production infrastructure-as-code when provisioning begins;
- `runbooks/` — backup/recovery/deploy/billing/health incident procedures.

Baseline architecture intentionally avoids Kubernetes, Kafka and mandatory Redis. Provider-specific production hosting is selected later without changing domain architecture.
