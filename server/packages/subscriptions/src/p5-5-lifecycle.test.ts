import { describe, expect, it } from "vitest";
import {
  decideSubscriptionLifecycle,
  subscriptionLifecycleJobIdentity,
  type SubscriptionState,
} from "./index.js";
const end = new Date("2026-09-07T12:00:00.000Z");
const before = new Date("2026-09-07T11:59:59.999Z");
const after = new Date("2026-09-07T12:00:00.001Z");
const base = {
  cancelAtPeriodEnd: false,
  currentPeriodEnd: end,
  graceUntil: null,
  now: end,
};
describe("P5.5 lifecycle decision matrix", () => {
  it("trial before boundary no-ops", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, now: before, state: "TRIAL" })
        .kind,
    ).toBe("NOOP"));
  it("trial exact boundary expires", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "TRIAL" }),
    ).toMatchObject({
      kind: "TRANSITION",
      toState: "EXPIRED",
      reason: "TRIAL_PERIOD_ENDED",
      dueAt: end,
    }));
  it("active before boundary no-ops", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, now: before, state: "ACTIVE" })
        .kind,
    ).toBe("NOOP"));
  it("active exact boundary expires", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "ACTIVE" }),
    ).toMatchObject({ kind: "TRANSITION", toState: "EXPIRED" }));
  it("active cancel period has exact reason", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        cancelAtPeriodEnd: true,
        state: "ACTIVE",
      }),
    ).toMatchObject({ reason: "CANCEL_AT_PERIOD_END" }));
  it("canceled exact boundary expires", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "CANCELED" }),
    ).toMatchObject({ toState: "EXPIRED", reason: "CANCELED_PERIOD_ENDED" }));
  it("grace before grace deadline no-ops", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        state: "GRACE",
        graceUntil: after,
        now: end,
      }).kind,
    ).toBe("NOOP"));
  it("grace exact deadline becomes past due", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "GRACE", graceUntil: end }),
    ).toMatchObject({ toState: "PAST_DUE", reason: "GRACE_WINDOW_ENDED" }));
  it("grace null fails closed", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "GRACE" }),
    ).toMatchObject({ kind: "CORRUPTED" }));
  it("past due no-ops", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "PAST_DUE" }).kind,
    ).toBe("NOOP"));
  it("expired no-ops", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "EXPIRED" }).kind,
    ).toBe("NOOP"));
  it("suspended active origin expires", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        state: "SUSPENDED",
        suspendedOrigin: "ACTIVE",
      }),
    ).toMatchObject({ toState: "EXPIRED" }));
  it("suspended trial origin expires", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        state: "SUSPENDED",
        suspendedOrigin: "TRIAL",
      }),
    ).toMatchObject({ toState: "EXPIRED" }));
  it("suspended canceled origin expires", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        state: "SUSPENDED",
        suspendedOrigin: "CANCELED",
      }),
    ).toMatchObject({ toState: "EXPIRED" }));
  it("suspended grace origin uses grace boundary", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        state: "SUSPENDED",
        suspendedOrigin: "GRACE",
        graceUntil: end,
      }),
    ).toMatchObject({ toState: "EXPIRED", dueAt: end }));
  it("suspended past due has no deadline", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        state: "SUSPENDED",
        suspendedOrigin: "PAST_DUE",
      }).kind,
    ).toBe("NOOP"));
  it("suspended missing origin fails closed", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "SUSPENDED" }),
    ).toMatchObject({ kind: "CORRUPTED" }));
  it("suspended grace missing deadline fails closed", () =>
    expect(
      decideSubscriptionLifecycle({
        ...base,
        state: "SUSPENDED",
        suspendedOrigin: "GRACE",
      }),
    ).toMatchObject({ kind: "CORRUPTED" }));
  it("late processing still uses due timestamp", () =>
    expect(
      decideSubscriptionLifecycle({ ...base, state: "ACTIVE", now: after }),
    ).toMatchObject({ dueAt: end }));
  it("stable identity has job namespace", () =>
    expect(
      subscriptionLifecycleJobIdentity({
        subscriptionId: "a",
        oldState: "ACTIVE",
        oldStateRevision: 1,
        toState: "EXPIRED",
        dueAt: end,
      }),
    ).toMatch(/^job_v1_[0-9a-f]{64}$/));
  it("stable identity repeats", () => {
    const v = {
      subscriptionId: "a",
      oldState: "ACTIVE" as const,
      oldStateRevision: 1,
      toState: "EXPIRED" as const,
      dueAt: end,
    };
    expect(subscriptionLifecycleJobIdentity(v)).toBe(
      subscriptionLifecycleJobIdentity(v),
    );
  });
  it("identity changes subscription", () => {
    const v = {
      oldState: "ACTIVE" as const,
      oldStateRevision: 1,
      toState: "EXPIRED" as const,
      dueAt: end,
    };
    expect(
      subscriptionLifecycleJobIdentity({ ...v, subscriptionId: "a" }),
    ).not.toBe(subscriptionLifecycleJobIdentity({ ...v, subscriptionId: "b" }));
  });
  it("identity changes revision", () => {
    const v = {
      subscriptionId: "a",
      oldState: "ACTIVE" as const,
      toState: "EXPIRED" as const,
      dueAt: end,
    };
    expect(
      subscriptionLifecycleJobIdentity({ ...v, oldStateRevision: 1 }),
    ).not.toBe(subscriptionLifecycleJobIdentity({ ...v, oldStateRevision: 2 }));
  });
  it("identity changes due time", () => {
    const v = {
      subscriptionId: "a",
      oldState: "ACTIVE" as const,
      oldStateRevision: 1,
      toState: "EXPIRED" as const,
    };
    expect(subscriptionLifecycleJobIdentity({ ...v, dueAt: end })).not.toBe(
      subscriptionLifecycleJobIdentity({ ...v, dueAt: after }),
    );
  });
  for (const state of ["TRIAL", "ACTIVE", "CANCELED"] as SubscriptionState[])
    it(`does not expire ${state} early`, () =>
      expect(
        decideSubscriptionLifecycle({ ...base, state, now: before }).kind,
      ).toBe("NOOP"));
  for (const origin of ["TRIAL", "ACTIVE", "CANCELED"] as SubscriptionState[])
    it(`expires suspended ${origin}`, () =>
      expect(
        decideSubscriptionLifecycle({
          ...base,
          state: "SUSPENDED",
          suspendedOrigin: origin,
        }),
      ).toMatchObject({ kind: "TRANSITION", toState: "EXPIRED" }));
});
