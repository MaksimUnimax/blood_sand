# Server capacity audit — 2026-08-27

Статус: `READY_WITH_WARNINGS`  
Назначение: pre-deployment capacity snapshot перед началом server-side implementation Recommendation API / VK Bot / VK Mini App backend.

## Host

- hostname: `unymax20141.fvds.ru`
- OS: Ubuntu 24.04.3 LTS
- kernel: `6.8.0-124-generic`
- architecture: `x86_64`
- timezone: `Europe/Amsterdam`
- uptime на момент снимка: ~56 дней
- load average: `0.15 / 0.21 / 0.18`

## CPU

- AMD EPYC 9655 (KVM)
- 4 physical/logical CPU
- текущая нагрузка низкая

Вывод: CPU достаточно для небольшого Node.js/TypeScript Recommendation API, VK bot и статического Mini App frontend.

## RAM / swap

- RAM total: `7.7 GiB`
- RAM available: `4.7 GiB`
- swap total: `3.8 GiB`
- swap used: `1.3 GiB`

На сервере уже работают MySQL, Node/Python services, Docker и Codex. RAM достаточна для небольшого сервиса, но сервер shared/busy; новый тяжёлый DB/runtime stack без необходимости не добавлять.

## Root filesystem

- filesystem: `/dev/vda3`, ext4
- total: `79 GiB`
- used: `63 GiB`
- free: `13 GiB`
- usage: `84%`

`/home`, `/var`, `/opt`, `/srv`, `/tmp` и `/var/lib/docker` находятся на том же root filesystem.

### Inodes

- total: 5,120,000
- used: 1,457,267 (29%)
- free: 3,662,733 (71%)

Inode-risk отсутствует.

## Major disk consumers

- `/var`: ~22 GiB
  - `/var/lib`: ~17 GiB
  - `/var/backups`: ~2.3 GiB
  - `/var/local`: ~1.7 GiB
  - `/var/log`: ~1.3 GiB
- `/opt`: ~19 GiB
  - `/opt/autopostmanager`: ~5.6 GiB
  - `/opt/avito-mayak-worktrees`: ~4.8 GiB
  - `/opt/ai-starter-community-worktrees`: ~1.8 GiB
  - `/opt/opendesign-lab`: ~1.7 GiB
  - `/opt/avito-mayak-runtime`: ~1.6 GiB
- `/root`: ~9.5 GiB
- `/tmp`: ~7.3 GiB
- `/usr`: ~6.2 GiB

Large observed file: FileHub snapshot ZIP ~659 MiB.

## Docker

Docker Engine `29.2.1` installed and active.

- containers: 43 total / 37 running / 6 stopped
- images logical usage: 9.733 GB; reported reclaimable: 8.857 GB
- containers: 2.473 GB; reported reclaimable: ~262 MB
- volumes: 4.518 GB; reported reclaimable: 2.543 GB
- build cache: 2.066 GB; reported reclaimable: 863.1 MB

Important: reclaimable numbers are diagnostic only. Because this is a shared production-like host, no Docker prune is approved without object-level verification.

## Logs and caches

- systemd journal: ~1.1 GiB
- `/var/log`: ~1.3 GiB
- `/root/.npm`: ~209 MiB
- `/root/.cache`: ~384 MiB

Potential cleanup candidates exist, but no cleanup was performed during audit.

## Existing services / shared-host risk

Observed active services include nginx, apache2, docker/containerd, MySQL, PostgreSQL workloads, Node apps, Python/Uvicorn services, Codex-related services, FileHub, ISPmanager-related services and other bridges/APIs.

Deployment must therefore explicitly allocate:

- service name;
- listen port;
- reverse-proxy route;
- process/container ownership;
- log path;
- restart policy;
- network isolation as appropriate.

## Codex environment

- Codex path: `/root/.nvm/versions/node/v22.22.1/bin/codex`
- Codex version: `0.149.1`
- Node.js: `v22.22.1`
- npm: `10.9.4`
- Git: `2.43.0`
- Python: `3.12.3`

## Repository checkout state

A local checkout of `MaksimUnimax/blood_sand` was **not identified** during the audit.

Therefore server-side coding must not begin until an explicit checkout/worktree location is chosen and verified. Clone/fetch operations are deferred until disk-capacity preparation is complete.

## Capacity calculation

Target policy: keep at least 20% of the 79 GiB root filesystem free.

- 20% reserve: ~15.8 GiB
- current free: ~13 GiB
- current deficit just to restore 20% reserve: ~2.8 GiB

Estimated V1 disk footprint:

- minimal: 2–3 GiB
- comfortable: 5–8 GiB

To keep 20% free **after** adding the project:

- for a 3 GiB footprint, pre-deployment free space should be at least ~18.8 GiB → reclaim ~5.8 GiB from current state;
- for a 5 GiB footprint, pre-deployment free space should be at least ~20.8 GiB → reclaim ~7.8 GiB;
- for an 8 GiB comfortable ceiling, pre-deployment free space should be at least ~23.8 GiB → reclaim ~10.8 GiB.

Operational target before server-side implementation/deployment: **21–24 GiB free on `/`**, with preference toward the upper end if Docker builds or local PostgreSQL are later introduced.

## Recommended deployment posture for V1

Until capacity is reclaimed:

- do not start Docker-based build/deployment for this project;
- do not add a new local PostgreSQL instance;
- do not clone/build large dependency trees unnecessarily;
- keep Recommendation Core implementation repository-only where possible.

After capacity is reclaimed, initial runtime should remain small: Node/TypeScript API + bot + static frontend; database can be deferred until a concrete persistence requirement is approved.

## Cleanup investigation order

Before deleting anything, perform a second read-only object-level audit in this order:

1. `/tmp` historical directories (~7.3 GiB total);
2. Docker build cache and unused image objects;
3. stopped acceptance containers;
4. Docker volumes reported reclaimable, with ownership/attachment verification;
5. old project worktrees under `/opt`;
6. systemd journal retention;
7. `/var/backups` contents and retention ownership;
8. package caches;
9. large FileHub snapshot.

No wildcard prune/delete is approved from this document.

## Gate

Current verdict:

```text
SERVER_CAPACITY_READY_WITH_WARNINGS
```

Before starting server-side implementation/deployment, desired gate:

```text
SERVER_CAPACITY_PREP_PASS
```

Recommended criteria:

- root free >= 21 GiB minimum, preferably >= 24 GiB if Docker is planned;
- inode free remains > 50%;
- no OOM / no-space errors;
- selected service port and reverse-proxy route do not collide;
- repository checkout location is explicitly chosen;
- no unreviewed production data/volumes removed.

Audit reported `NO_CHANGES_MADE=true`.
