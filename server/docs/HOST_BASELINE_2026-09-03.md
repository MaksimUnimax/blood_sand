# Product Control Plane host baseline — 2026-09-03

Status: authoritative post-stabilization host snapshot for P1 development work.

## Host

- VPS: `78.17.68.165`
- hostname: `Easyscript`
- OS: Ubuntu 22.04.2 LTS
- kernel: `5.15.0-186-generic`
- architecture: x86_64 / KVM
- CPU: AMD EPYC-Rome, 4 vCPU
- RAM: 8,322,879,488 bytes total; ~6.97 GB available at snapshot
- swap: ~1.16 GB total
- root filesystem: `/dev/vda1` ext4, 63,298,023,424 bytes
- used after stabilization: 34,533,412,864 bytes
- free after stabilization: 25,527,156,736 bytes
- usage: 58%
- no additional persistent volume is attached.

## Stabilization already completed

The pre-stabilization server had a full root filesystem and a log/restart storm. PREP-01/PREP-02 completed before this snapshot:

- five broken/storm services are disabled and inactive:
  - `openai-tunnel-client.service`
  - `server-context-mcp.service`
  - `business-bridge-2-direct.service`
  - `business-bridge-public-hello.service`
  - `ai-court-game.service`
- journald is capped by `/etc/systemd/journald.conf.d/90-product-server-retention.conf`:
  - `SystemMaxUse=512M`
  - `SystemKeepFree=2G`
  - `SystemMaxFileSize=64M`
- rsyslog rotation is now daily, `rotate 7`, compression enabled without delayed compression, `maxsize 100M`.
- retained incident log: `/var/log/syslog.1.gz`, ~499 MB at snapshot.
- current syslog is small and normal.
- root usage dropped from 100% to 58%.

## Protected active services

The following are pre-existing and MUST NOT be modified opportunistically by Product Control Plane P1 work:

- `business-bridge-2.service`
  - active/running
  - PID 654 at snapshot
  - started 2026-08-26 15:22:03 MSK
  - NRestarts 0
  - listener `127.0.0.1:18083`
  - root `/opt/business-bridge-2`
- `business-bridge-control-api.service`
  - active/running
  - listener `127.0.0.1:18080`
- `business-bridge-inspector.service`
  - active/running
- MySQL, nginx, Apache, Docker/containerd and existing VPN containers remain active infrastructure.

P1 MUST NOT read Legacy Bridge DB/state/token/secrets.

## Existing software relevant to P1

- system Node: v12.22.9 — not suitable as the Product Control Plane baseline.
- root NVM Node: v22.22.2 — active dependency of existing tooling and MUST NOT be repurposed or made the product runtime.
- Docker: 29.1.3 — available.
- containerd: 2.2.1 — available.
- PostgreSQL: not installed on host.
- MySQL 8.0.46 exists for unrelated workloads; Product Control Plane does not reuse it as its primary database.
- nginx 1.18.0 active on public port 80.
- Apache 2.4.52 active on loopback 8080.
- Chrome is present; browser-health implementation remains a later roadmap step.
- pnpm is not installed on host.

## Ports

Relevant occupied ports:

- `127.0.0.1:18080` — existing Bridge control API
- `127.0.0.1:18083` — Legacy Business Bridge 2
- public `80` — nginx
- loopback `3306/33060` — MySQL
- loopback `8080` — Apache

Observed free candidates include:

- `3000`
- `3001`
- `5432`
- `6379`
- `18082`
- `18084`
- `18100`
- `19090`

No P1 service should be exposed publicly merely because a port is free.

## Capacity / retention decision for P1

No additional cleanup is required before P1 engineering work.

Material historical/evidence storage remains intentionally untouched for now:

- BBI browser/test workspace: ~6.48 GB
- Direct historical/backup/failed material: ~8.15 GB excluding active Direct runtime/state
- market-intel/browser development material: ~1.05 GB

These are owner-retention decisions, not P1 dependencies. P1 MUST NOT delete them.

The current ~25.5 GB free root capacity is accepted for P1 development/staging foundation. A separate persistent volume/object storage remains strongly recommended before production hardening, especially for PostgreSQL backups and Health evidence.

## P1 host execution decision

P1 remains governed by `TECH_STACK.md`, `P1_CODEX_IMPLEMENTATION_PACKET.md` and `ROADMAP.md`.

Host-specific rules:

1. Do not use system Node v12 as Product Control Plane runtime.
2. Do not mutate the existing root NVM v22 installation used by other tooling.
3. Use Node.js 24 LTS for product build/runtime environments.
4. Use PostgreSQL, not existing MySQL, as the product primary database.
5. Prefer Docker-based reproducible P1 dependencies so host package/runtime coupling stays minimal.
6. No public nginx/firewall exposure is required for P1.
7. Bridge integration remains deferred to P11; P1 must not import Bridge implementation code.

## Snapshot safety

The post-stabilization snapshot that produced this baseline was read-only. No Product Control Plane directory, user, database, service or package had been provisioned at snapshot time.
