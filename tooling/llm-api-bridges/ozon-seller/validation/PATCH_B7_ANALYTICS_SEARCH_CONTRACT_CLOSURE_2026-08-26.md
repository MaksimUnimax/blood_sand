# Patch B7 Analytics / Search — contract closure

Date: 2026-08-26

B7 is the `P1_analytics_search` closure on top of accepted B6 authority `d6ec73e48e3ad51da23323016b2dcdf34f21ef0c`.

The three roadmap operations already existed and were executable in accepted B6, inherited from B0. Exact Swagger revalidation confirms their registry metadata, request methods/paths, JSON body style, required fields, SKU limits, page/page-size bounds, sort enums, details `limit_by_sku`, partial-response semantics and the dedicated `analytics_data` quota scheduler are already correct.

The only proven production mismatch is entitlement compiler tier extraction for the details restricted sort.

B7 changes only `shared/ozon_entitlements.js`, adding a word boundary to Premium Pro text matching so `premium-program` cannot be misread as `premium-pro`.

No endpoint is added or removed. No request shape changes. No provider retry, pagination, fanout or report workflow is introduced. The existing `analytics_data` runtime scheduler remains byte-identical with 60-second provider minimum plus 5-second launch safety.
