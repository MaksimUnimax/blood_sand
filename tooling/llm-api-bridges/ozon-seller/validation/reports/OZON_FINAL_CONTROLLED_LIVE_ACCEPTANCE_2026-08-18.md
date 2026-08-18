# Ozon Bridge final controlled live acceptance — rejected

- candidate SHA: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- accepted synthetic Step 4 report: `4c41f92`
- candidate reconstruction and exact 17-file unpacked preparation passed before the operator run.

## Sanitized primary-run outcome

- ChatGPT-A: one real `analytics_data` request, HTTP 200, successful.
- Alice-B: one real `analytics_data` request, HTTP 200, `external_request_executed=true`; this was not a cache hit. The cache observation is `INCONCLUSIVE` because the fixed 60-second cache window appears to have been missed by operator timing; this is not classified as a proven cache defect.
- ChatGPT-C: entered durable `PROVIDER_QUOTA_WAITING`; local `next_allowed_at` was respected; after scheduler resume, one real `analytics_data` request returned HTTP 429 rate limit with `automatic_retry=false`.

## Hard budget result

- maximum allowed real analytics business requests: `2`
- observed real analytics business requests: `3`
- capability probes: `0`
- Performance requests: `0`
- additional real requests after the observed outcome: `0`
- credentials, raw provider bodies, business metric values, conversation IDs and private diagnostics are not included in this report.

The hard primary-run budget was exceeded. The live gate therefore fails regardless of the successful A request, respected C quota wait, zero capability probes, zero Performance requests and no automatic retry.

## Verdict

`FINAL_LIVE_REJECTED`

No production code was modified, no release was promoted, and no additional real Ozon request was performed after the stop instruction.
