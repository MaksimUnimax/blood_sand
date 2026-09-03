# ADR 0007: device limit and activation boundary

Status: accepted (P2.5)

P2.3 approval records human/account intent only. Capability is granted at the P2.5 exchange boundary, where device, extension session, and generation-zero refresh hash are created atomically. The active-device limit is therefore enforced inside that transaction, serialized per account.

`DeviceLimitResolver` is the stable port. Until P4, its production adapter returns `maxActive: 1` and `source: PRE_ENTITLEMENT_BASELINE`. This is a transitional fail-safe, not a plan, subscription, entitlement record, or account override, and is not persisted. P4 replaces only the resolver implementation with effective `device.max_active` entitlement resolution; the activation transaction remains unchanged.
