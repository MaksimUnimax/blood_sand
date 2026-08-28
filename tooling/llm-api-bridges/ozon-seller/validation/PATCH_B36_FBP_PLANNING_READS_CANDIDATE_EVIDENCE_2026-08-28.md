# B36 candidate evidence

- Scope: safe FBP planning reference/timeslot reads.
- Added 6 read-only operations for provinces, drop-off points/timetables, and direct-supply timeslots.
- Exact Swagger: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; 463 paths.
- All six operations are current, non-deprecated, ALL_ACCOUNTS, no capability probe.
- No automatic pagination, retries, polling, fanout, provider chaining, or secondary requests.
- Response privacy graph excludes buyer/customer/phone/email/recipient/passport/person/client/contact/sender fields. Business drop-off addresses remain response data only.
- Author gate: PASS. Seller requests = 0; Performance requests = 0; credentials used = 0.
