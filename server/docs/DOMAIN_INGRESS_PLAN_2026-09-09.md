# SellerAgents production domain and public ingress plan — 2026-09-09

Status: approved infrastructure input; implementation/public exposure is not yet accepted production launch.

## 1. Domain authority

The product domain is `selleragents.ru`.

DNS prepared by the owner:

- `selleragents.ru` — `A 78.17.68.165`;
- `api.selleragents.ru` — `A 78.17.68.165`;
- `docs.selleragents.ru` — `A 78.17.68.165`;
- `www.selleragents.ru` — `CNAME selleragents.ru`.

Existing zone `NS`, `SOA` and mail `MX` records are outside Product Control Plane ingress ownership and are not changed by this decision.

## 2. Intended public topology

The initial production-facing topology is:

- `https://selleragents.ru/` — user portal;
- `https://selleragents.ru/admin/` — admin portal on the same web origin as the user portal;
- `https://api.selleragents.ru/` — public Control Plane API used by packaged clients/extension and server web BFFs as applicable;
- `https://docs.selleragents.ru/` — product/operator documentation;
- `https://www.selleragents.ru/` — canonical redirect to `https://selleragents.ru/`.

An `admin.selleragents.ru` hostname is not part of the initial topology. Keeping Portal and Admin on one host avoids introducing an unnecessary cross-origin cookie/CSRF boundary while the accepted admin session model depends on the source portal session.

## 3. Ingress/security requirements

DNS resolution alone does not make the services production-ready. Before public acceptance:

1. nginx (or the accepted production reverse proxy) must terminate public HTTP(S) ingress;
2. TLS certificates must cover every enabled public hostname;
3. HTTP must redirect to HTTPS;
4. Portal/Admin/API application ports must remain non-public/loopback or otherwise privately bound behind ingress;
5. routing must preserve the accepted portal/admin cookie, CSRF and BFF boundaries;
6. API exposure must preserve authentication, rate limiting, exact route/contract boundaries and security headers;
7. `www` must not become a second independent application origin;
8. production observability must distinguish portal/admin/API ingress without logging secrets;
9. certificate renewal and rollback must be documented and tested before launch.

## 4. Email boundary

The presence of `MX` records pointing to `mail.selleragents.ru` is not treated as acceptance of a production email provider or OTP delivery path. Production OTP email remains governed by the email-provider/SMTP configuration and its own deliverability/security acceptance. No mail-host DNS record is invented by Product Control Plane work without an explicit mail-provider decision.

## 5. Roadmap impact

Domain acquisition and DNS preparation are completed prerequisites, but they do **not** start or complete P14.

P14 production hardening must consume this domain authority to implement and accept:

- HTTPS ingress;
- certificate lifecycle;
- canonical redirects;
- same-origin Portal/Admin routing;
- API routing;
- non-public internal application ports;
- deployment/rollback and monitoring for the public endpoints.

P6.5, P6.6 and P7 boundaries are unchanged by the DNS preparation.
