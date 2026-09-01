# OZON_BRIDGE v0.1.19 FULL READ 266 — API-only live test conclusion

Date: 2026-09-01
Branch: `test/ozon-v0.1.19-full-read-266-live-2026-09-01`

## Decision

**API_ONLY_LIVE_TEST_SCOPE_COMPLETE**

The owner explicitly scoped this live acceptance pass to Ozon API behavior only; UI / Work / Manual / lifecycle testing is outside this pass.

## Mandatory API-live coverage completed

- All 26 new Seller read aliases were exercised in the installed owner browser.
- All 13 `safe_projection` operations were live-dispatched to Ozon.
- All 13 `operator_personal_data_gate` operations were verified fail-closed with Personal Data OFF: 13 blocked, 0 provider requests.
- The same 13 gated operations were then explicitly resubmitted with Personal Data enabled: 13 logical commands -> exactly 13 physical provider requests.
- Across the completed live runs, no automatic retry, hidden fan-out, hidden pagination, or capability probe was observed.
- Existing Seller baseline `stocks_current` passed.
- Existing Seller helper `assembly_fbs_posting_list` passed and provided live identifiers for parameterized testing.

## New-operation live outcomes

- HTTP 200 successful business responses: 9 operations.
- Correct endpoint reached but provider permission denied (HTTP 403): 13 operations.
- Correct endpoint reached but provider rejected the supplied test fixture (HTTP 400): 4 operations:
  - `rfbs_returns_get`
  - `fbp_archive_list`
  - `fbp_draft_list`
  - `fbp_order_list`

These four HTTP 400 cases do **not** block the API-only live acceptance because the bridge alias, request construction, provider dispatch, one-command/one-request accounting, and no-retry behavior were all exercised. Additional attempts would only be required if a successful business-semantic HTTP 200 response is specifically required for each endpoint using real account entities.

## Non-blocking optional diagnostics

1. Discover a real rFBS `return_id` through `rfbs_returns_list`, then retry `rfbs_returns_get`.
2. If the account actually has FBP archive/draft/order entities, use real pagination/entity context to retry the three FBP list operations.
3. Permission-blocked HTTP 403 operations can only be converted to HTTP 200 if the tested Seller credentials/account are entitled to those endpoints.

## Scope note

The previous `enable_without_replay` observation is not a blocker for this API-only pass. It belongs to setting/lifecycle behavior, which the owner explicitly excluded from this test scope.

## Next move

Return to the main project roadmap. This live pass is complete and should be used as owner-browser evidence for the subsequent formal integration/release gates.
