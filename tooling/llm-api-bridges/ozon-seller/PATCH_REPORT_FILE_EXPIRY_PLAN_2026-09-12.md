# Report-file expiry repair — frozen scope, 2026-09-12

Authorization: owner requested the patch, all applicable checks, no workarounds, an installable build and a full explanation of why related functionality is preserved.

Base evidence HEAD: `0aa8f53528e304a91530f663060445e85e2af60b`.
Base production executable: `0cc968ee4b76d41e9c0361a905812fe49f313585`.
Repair branch: `repair/ozon-report-file-expiry-2026-09-12`.
Canonical rules: `OZON_PATCH_DELIVERY_GATE.md`; all GATE-01..35 apply, live-only checks remain separate.

## Incident facts and corrections to the conversational diagnosis

Owner-provided logs: explicit MANUAL admission in Alice, not evidence of Autorun HELP_V2 live acceptance. Report-info request `425d9e02-ee67-412a-85fe-940a86b6e8bb` completed at 09:06:08.452Z with HTTP 200; report metadata gives expires_at `2026-09-12T07:55:46.389080Z`. File request `7db1a5fd-b438-45cf-93b7-92fa0ee4f2ec` started at 09:06:17.783Z and returned report_file HTTP 403 at 09:06:19.019Z. The expiry violation is proven. This does not establish that every 403 means expiry, or reveal the unavailable raw server error body.

Two earlier REF_NOT_FOUND outcomes and one personal-data-policy rejection were local, with zero external requests. They are not the HTTP 403. A new opaque ref does not renew an expired provider URL.

## Verified API contract

Pinned Ozon Swagger reconstructed by validation/step7-authority-v2/reconstruct_exact_swagger.py: SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, 463 operations. Reportinfo.expires_at defines the access deadline and may be empty for reports formed before 2025-10-14. Reportinfo.file describes SELLER_RETURNS links as available for five minutes after the request. These distinctions must be retained; missing expiry is not equivalent to malformed supplied expiry. This is the repository's pinned provider contract; live documentation freshness is not claimed.

## Scoped defects / required behavior

1. An expired report must not produce a fresh actionable URL ref or download continuation.
2. A valid provider deadline must survive full module/worker recreation and be checked before the one permitted external GET.
3. Malformed supplied dates must fail closed, rather than silently acquiring a new local lifetime.
4. Returns must respect the documented five-minute window as well as any earlier provider expiry and existing local retention.
5. Processing/failed reports must not be marked file-ready just because a stale file field is present.
6. Delayed outgoing results must not offer an already expired download instruction.

Expected production scope: shared/ozon_provider.js and shared/llm_output_report_workflow_patch.js only. No API endpoint, credentials, host permission, content ingress, DnD, XLSX parser or settings changes.

## Lifetime design

Use an absolute deadline: earliest of the existing 30-minute URL-ref retention, the supplied valid provider expiry, and the documented returns window. Keep bounded legacy behavior for absent/null/empty expiry. Persist and validate the absolute deadline; never rebase it when reading or restoring. Use schema migration to reject legacy URL refs whose provider deadline was discarded, while retaining independently valid provenance facts and inline PDF bytes. Require explicit fresh resolution; do not silently refetch or recreate reports.

Provenance audit: missing/expired report-create provenance deliberately falls back to personal-data-required. Do not downgrade a ref based on its filename or report_type. The incident alone does not justify weakening that policy; its current 30-minute retention and unknown-history behavior will be tested and documented, not quietly changed.

## Proof plan

Reproduce six independent invariants on the exact pre-fix package, then execute the same tests on the ephemeral candidate. Include valid controls, missing/invalid dates, timezone/fractional precision, exact boundary times, async storage delays, schema migration, all report-create operations, all seven generated-URL consumers, both inline PDF consumers, privacy on/off, trusted-host/credentials, real valid-URL 403 preservation, command accounting, full worker admission, concurrent independent commands and recreation. Inventory every consumer, including downloaded-byte artifacts whose own lifetime must remain independent of URL expiry.

Run the 39 HELP_V2 scenarios, 31 prior regression scripts, Chrome adapter/attachment/MV3 tests, Linux and Windows on an identical deterministic ZIP verified against all 32 canonical Git blobs. Full post-final-candidate run required. Do not claim live certification.

Provider calls during repair: zero. No hidden retries, polling, pagination, fan-out, refetch or resend.

## Preparation failures (not production RED)

The first source snapshot CI failed because depth-1 checkout omitted its pinned parent object; diagnosed from the log, corrected to check out the exact base SHA. A separate artifact-download attempt used the wrong connector action and failed without changes. Local new-test preparation exposed cross-realm plain-object validation and a too-short synthetic UUID; fixture inputs were corrected to the real command contract before accepting baseline evidence. These are harness preparation errors, not product causes and not waived tests.
