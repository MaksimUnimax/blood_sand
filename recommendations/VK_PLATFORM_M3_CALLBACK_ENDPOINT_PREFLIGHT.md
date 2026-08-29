# VK Platform M3 Callback Endpoint Preflight

Status: **READ-ONLY SERVER DISCOVERY**  
Captured: 2026-08-29

This evidence concerns server infrastructure only. It creates no Callback
server, route, receiver, TLS configuration, or VK mutation.

```text
SERVER_HTTPS_LISTENER = yes
HTTPS_PROXY = nginx
PUBLIC_HOSTNAMES_FOUND =
- autopostmanager.ru
- www.autopostmanager.ru
- api.autopostmanager.ru
- app.autopostmanager.ru
- openscript.ru
- www.openscript.ru

TLS_CERTIFICATE_CONFIGURED = yes
SAFE_ISOLATED_ROUTE_POSSIBLE = yes
SERVER_HOSTNAME_PRESENT = yes
CERTIFICATE_PRESENT = yes
PROJECT_OWNERSHIP_PROVEN = no
PROJECT_OWNERSHIP_UNVERIFIED = yes

EXISTING_CALLBACK_SERVER = legacy_or_external_unknown
EXISTING_CALLBACK_SERVER_MUTATION_ALLOWED = no
PROJECT_CALLBACK_SERVER = not_provisioned

HTTPS_CALLBACK_ENDPOINT_CANDIDATE = BLOCKED
CANDIDATE_HOSTNAME = none
CANDIDATE_PATH = none
```

## Sanitized factual evidence

- nginx owns public TCP port 443 on IPv4 and IPv6 and is running.
- Enabled nginx virtual hosts configure the listed public hostnames. Their TLS
  blocks reference Let’s Encrypt certificate paths under `/etc/letsencrypt/live/`.
- The active virtual hosts route only their existing named applications. No
  configured route collides with the proposed exact path `/vk-staging/callback`.
  A future exact-match location could technically be isolated without overwriting
  an existing location.
- These hostnames are present on this VPS and certificates are configured, but
  no project authority proves that any hostname is assigned to the KIP VK
  Recommendation Bot. The existing names identify other deployments; presence
  is not proof of project ownership.
- The staging fixture has one Callback server (id `3`, title `botConstructor`,
  URL `http://mobile-etis.ru/webhook/35722386`, status `failed`). Its ownership is
  unverified and it is classified legacy or external unknown. The separately
  captured settings (`api_version=5.130`, `message_new=1`, `message_reply=1`)
  describe that existing server only; they do not authorize a project migration
  to API `5.199`.

The candidate is blocked only by missing authority to use a particular existing
hostname for this project. No domain, tunnel, certificate provider, or route is
invented in this preflight.

## Next controlled write-stage plan (not executed)

After an authorized HTTPS hostname is identified:

1. Deploy an isolated minimal Callback confirmation/event receiver.
2. Verify public HTTPS reachability.
3. Call `groups.setSettings` with only project-required values.
4. Create a new dedicated Callback server; never mutate legacy server id `3`.
5. Configure the new server with `api_version=5.199`, `message_new=true`, and
   `message_event=false` unless a later requirement enables it.
6. Perform Callback confirmation and verify the new server reaches `ok`.
7. Induce one staging-user `message_new` and capture a sanitized nested fixture.
8. Perform one controlled `messages.send` and capture sanitized success evidence.
9. Only then freeze retry/error policy.
