import { describe, expect, it } from "vitest";
import { DeterministicBillingSimulator } from "./index.js";

const input = {
  providerRequestId: "11111111-1111-4111-8111-111111111111",
  amountMinor: 19000,
  currency: "RUB",
  billingIntervalUnit: "MONTH" as const,
  billingIntervalCount: 1,
};

describe("deterministic billing simulator", () => {
  it("uses the exact simulator provider key", () =>
    expect(new DeterministicBillingSimulator().providerKey).toBe("simulator"));
  it("succeeds by default", async () =>
    expect(
      (await new DeterministicBillingSimulator().createCheckout(input)).kind,
    ).toBe("CREATED"));
  it("returns safe opaque references", async () =>
    expect(
      await new DeterministicBillingSimulator().createCheckout(input),
    ).toMatchObject({
      providerCheckoutId: expect.stringMatching(/^[A-Za-z0-9._:-]+$/),
      providerPaymentId: expect.stringMatching(/^[A-Za-z0-9._:-]+$/),
      checkoutReference: expect.stringMatching(/^[A-Za-z0-9._:-]+$/),
    }));
  it("is stable for the same request", async () => {
    const simulator = new DeterministicBillingSimulator();
    expect(await simulator.createCheckout(input)).toEqual(
      await simulator.createCheckout(input),
    );
  });
  it("changes IDs for a different request", async () => {
    const simulator = new DeterministicBillingSimulator();
    const a = await simulator.createCheckout(input);
    const b = await simulator.createCheckout({
      ...input,
      providerRequestId: "22222222-2222-4222-8222-222222222222",
    });
    expect(a).not.toEqual(b);
  });
  it("supports rejected scenario", async () =>
    expect(
      await new DeterministicBillingSimulator({
        scenario: "REJECTED",
      }).createCheckout(input),
    ).toEqual({ kind: "REJECTED", code: "REJECTED" }));
  it("supports unavailable scenario", async () =>
    expect(
      await new DeterministicBillingSimulator({
        scenario: "UNAVAILABLE",
      }).createCheckout(input),
    ).toEqual({ kind: "UNAVAILABLE" }));
  it("returns unavailable once in retry scenario", async () => {
    const simulator = new DeterministicBillingSimulator({
      scenario: "UNAVAILABLE_THEN_SUCCESS",
    });
    expect(await simulator.createCheckout(input)).toEqual({
      kind: "UNAVAILABLE",
    });
    expect((await simulator.createCheckout(input)).kind).toBe("CREATED");
  });
  it("returns the same success after retry", async () => {
    const simulator = new DeterministicBillingSimulator({
      scenario: "UNAVAILABLE_THEN_SUCCESS",
    });
    await simulator.createCheckout(input);
    const a = await simulator.createCheckout(input);
    const b = await simulator.createCheckout(input);
    expect(a).toEqual(b);
  });
  it("tracks unavailable attempts per request id", async () => {
    const simulator = new DeterministicBillingSimulator({
      scenario: "UNAVAILABLE_THEN_SUCCESS",
    });
    expect((await simulator.createCheckout(input)).kind).toBe("UNAVAILABLE");
    expect(
      (
        await simulator.createCheckout({
          ...input,
          providerRequestId: "22222222-2222-4222-8222-222222222222",
        })
      ).kind,
    ).toBe("UNAVAILABLE");
  });
  it("does not use a caller idempotency key field", async () =>
    expect(
      new DeterministicBillingSimulator().createCheckout({
        ...input,
        idempotencyKey: "secret-secret-secret",
      } as never),
    ).rejects.toThrow());
});
