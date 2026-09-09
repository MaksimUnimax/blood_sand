# P6.5 Attempt 3 administrative mutation ledger — 2026-09-09

This ledger preserves the 31 administrative mutation entry points exposed by
the accepted P6.1–P6.4 contract. The two session endpoints are included for
completeness; they are authentication transitions and are not stale-capable.
Every other row is stale-capable and has a concrete accepted authoritative
read target. `Mutation` means the shared rendered coordinator; `direct` means
the existing commercial/compatibility handler with its synchronous pending
ref and explicit high-impact confirmation where required.

| # | Action | Method | Exact API path/template | UI entry point | Reason | Review/confirmation | Pending guard | Duplicate guard | Concurrency authority | Stale/conflict | Authoritative refresh target | Automatic retry |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Elevate admin session | POST | `/v1/admin/session` | Login / Continue | Portal auth flow | Elevation action | Login busy | Login busy | Portal session | NO: auth transition has no revision contract | `GET /v1/admin/me` | NO |
| 2 | End admin session | DELETE | `/v1/admin/session` | Shell / End admin session | Existing admin session | Explicit logout | In-flight request | In-flight request | Admin session guard | NO: revoke contract has no revision contract | `GET /v1/admin/me` after server success | NO |
| 3 | Grant subscription | POST | `/v1/admin/accounts/{account_id}/subscription/grant` | Account workspace / Grant subscription | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded subscription state | YES | `GET /v1/admin/accounts/{account_id}/subscription` | NO |
| 4 | Extend subscription | POST | `/v1/admin/accounts/{account_id}/subscription/{subscription_id}/extend` | Account workspace / Extend subscription | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded subscription `stateRevision` | YES | Subscription read above | NO |
| 5 | Suspend subscription | POST | `/v1/admin/accounts/{account_id}/subscription/{subscription_id}/suspend` | Account workspace / Suspend subscription | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded subscription `stateRevision` | YES | Subscription read above | NO |
| 6 | Restore subscription | POST | `/v1/admin/accounts/{account_id}/subscription/{subscription_id}/restore` | Account workspace / Restore subscription | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded subscription `stateRevision` | YES | Subscription read above | NO |
| 7 | Revoke device | POST | `/v1/admin/accounts/{account_id}/devices/{device_id}/revoke` | Account workspace / Revoke | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded device list | YES | `GET /v1/admin/accounts/{account_id}/devices` | NO |
| 8 | Set entitlement override | POST | `/v1/admin/accounts/{account_id}/entitlement-overrides/{entitlement_key}/set` | Account workspace / Set override | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded override `revision`; fail closed if missing | YES | Filtered override history GET | NO |
| 9 | Clear entitlement override | POST | `/v1/admin/accounts/{account_id}/entitlement-overrides/{entitlement_key}/clear` | Account workspace / Clear override | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded override `revision`; fail closed if missing | YES | Filtered override history GET | NO |
| 10 | Create principal | POST | `/v1/admin/principals` | Principals / Create principal | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded principal projection | YES | `GET /v1/admin/principals` | NO |
| 11 | Grant role | POST | `/v1/admin/principals/{principal_id}/roles/{role}/grant` | Principals row / Grant role | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Principal `revision` | YES | Principals GET | NO |
| 12 | Revoke role | POST | `/v1/admin/principals/{principal_id}/roles/{role}/revoke` | Principals row / Revoke role | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Principal `revision` | YES | Principals GET | NO |
| 13 | Suspend principal | POST | `/v1/admin/principals/{principal_id}/suspend` | Principals row / Suspend | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Principal `revision` | YES | Principals GET | NO |
| 14 | Restore principal | POST | `/v1/admin/principals/{principal_id}/restore` | Principals row / Restore | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Principal `revision` | YES | Principals GET | NO |
| 15 | Create entitlement definition | POST | `/v1/admin/commercial/entitlements/definitions` | Entitlements / Create entitlement | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Server definition uniqueness | YES | `GET /v1/admin/commercial/entitlements/definitions` | NO |
| 16 | Update definition description | POST | `/v1/admin/commercial/entitlements/definitions/{entitlement_key}/description` | Entitlement row / Update description | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded description | YES | Definitions GET | NO |
| 17 | Deprecate definition | POST | `/v1/admin/commercial/entitlements/definitions/{entitlement_key}/deprecate` | Entitlement row / Deprecate | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Server definition state | YES | Definitions GET | NO |
| 18 | Create plan | POST | `/v1/admin/commercial/plans` | Plans / Create plan | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Server plan uniqueness | YES | `GET /v1/admin/commercial/plans` | NO |
| 19 | Create plan revision | POST | `/v1/admin/commercial/plans/{plan_id}/revisions` | Plan detail / Create draft revision | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Server plan revision state | YES | `GET /v1/admin/commercial/plans/{plan_id}` | NO |
| 20 | Remove draft entitlement | POST | `/v1/admin/commercial/plans/{plan_id}/revisions/{plan_revision_id}/entitlements/{entitlement_key}/remove` | Plan detail / Remove entitlement | Required | Explicit high-impact confirmation | `busyRef` | `busyRef` + disabled control | Loaded content fingerprint | YES | Plan detail GET | NO |
| 21 | Set draft entitlement | POST | `/v1/admin/commercial/plans/{plan_id}/revisions/{plan_revision_id}/entitlements/{entitlement_key}/set` | Plan detail / Set draft entitlement | Required | Shared review/explicit confirmation | `Mutation.busy` | `Mutation.busyRef` | Loaded content fingerprint | YES | Plan detail GET | NO |
| 22 | Publish plan revision | POST | `/v1/admin/commercial/plans/{plan_id}/revisions/{plan_revision_id}/publish` | Plan detail / Publish revision | Required | Explicit high-impact confirmation | `busyRef` | `busyRef` + disabled control | Loaded content fingerprint | YES | Plan detail GET | NO |
| 23 | Update draft revision | POST | `/v1/admin/commercial/plans/{plan_id}/revisions/{plan_revision_id}/update` | Plan detail / Update draft revision | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded content fingerprint | YES | Plan detail GET | NO |
| 24 | Change plan status | POST | `/v1/admin/commercial/plans/{plan_id}/status` | Plan detail / Change plan status or Archive plan | Required | Mutation review; archive is explicit | `Mutation.busy` or `busyRef` | Matching ref + disabled control | Loaded plan status | YES | Plan detail GET | NO |
| 25 | Create price | POST | `/v1/admin/commercial/prices` | Prices / Create price | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Server price uniqueness | YES | `GET /v1/admin/commercial/prices` | NO |
| 26 | Create price revision | POST | `/v1/admin/commercial/prices/{price_id}/revisions` | Price detail / Create draft revision | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Server price revision state | YES | `GET /v1/admin/commercial/prices/{price_id}` | NO |
| 27 | Publish price revision | POST | `/v1/admin/commercial/prices/{price_id}/revisions/{price_revision_id}/publish` | Price detail / Publish revision | Required | Explicit high-impact confirmation | `busyRef` | `busyRef` + disabled control | Loaded content fingerprint | YES | Price detail GET | NO |
| 28 | Update price revision | POST | `/v1/admin/commercial/prices/{price_id}/revisions/{price_revision_id}/update` | Price detail / Update draft revision | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded content fingerprint | YES | Price detail GET | NO |
| 29 | Assign/close sale | POST | `/v1/admin/commercial/prices/{price_id}/sale-assignments` | Price detail / Assign sale price | Required | Mutation review | `Mutation.busy` | `Mutation.busyRef` | Loaded assignment revision | YES | Price detail GET | NO |
| 30 | Change price status | POST | `/v1/admin/commercial/prices/{price_id}/status` | Price detail / Change price status or Archive price | Required | Mutation review; archive is explicit | `Mutation.busy` or `busyRef` | Matching ref + disabled control | Loaded price status | YES | Price detail GET | NO |
| 31 | Publish compatibility revision | POST | `/v1/admin/compatibility/policies/{policy_key}/publish` | Compatibility / Publish revision | Required | Explicit confirmation | `busy` | `busyRef` | Server policy revision | YES | `GET /v1/admin/compatibility/policies` | NO |

## Count and safety reconciliation

- `ACTUAL_MUTATION_PATH_COUNT=31` including the two admin-session endpoints;
  `DOMAIN_MUTATION_PATH_COUNT=29`.
- `STALE_CAPABLE_PATH_COUNT=29` and `STALE_PATHS_WITHOUT_RELOAD=0`.
- The two session rows are explicitly `STALE_CAPABLE=NO` because the accepted
  session contracts have no expected revision/version response.
- There are no automatic mutation retries. A stale/conflict response is
  terminal, invalidates the review, refreshes the row's authoritative read,
  and requires a new review.
