import { describe, expect, it } from "vitest";
import { createBillingSimulator } from "./index.js";
const id = "sim_payment_status_1";
const snap = {
  kind: "FOUND" as const,
  state: "SUCCEEDED" as const,
  amountMinor: 1900,
  currency: "RUB",
  statusAt: new Date("2026-09-07T12:00:00.000Z"),
};
describe("P5.5 simulator payment status", () => {
  it("implements the separate status port", () =>
    expect(createBillingSimulator().fetchPaymentStatus).toBeTypeOf("function"));
  it("unknown identity is not found", async () =>
    expect(
      await createBillingSimulator().fetchPaymentStatus({
        providerPaymentId: id,
      }),
    ).toEqual({ kind: "NOT_FOUND" }));
  it("stores a deterministic success snapshot", async () => {
    const s = createBillingSimulator();
    s.setPaymentStatus(id, snap);
    expect(await s.fetchPaymentStatus({ providerPaymentId: id })).toEqual(snap);
  });
  it("stores pending", async () => {
    const s = createBillingSimulator();
    s.setPaymentStatus(id, { ...snap, state: "PENDING" });
    expect((await s.fetchPaymentStatus({ providerPaymentId: id })).kind).toBe(
      "FOUND",
    );
  });
  it("stores failed", async () => {
    const s = createBillingSimulator();
    s.setPaymentStatus(id, { ...snap, state: "FAILED" });
    expect((await s.fetchPaymentStatus({ providerPaymentId: id })).kind).toBe(
      "FOUND",
    );
  });
  it("stores canceled", async () => {
    const s = createBillingSimulator();
    s.setPaymentStatus(id, { ...snap, state: "CANCELED" });
    expect((await s.fetchPaymentStatus({ providerPaymentId: id })).kind).toBe(
      "FOUND",
    );
  });
  it("returns unavailable deterministically", async () =>
    expect(
      await createBillingSimulator({
        statusScenario: "UNAVAILABLE",
      }).fetchPaymentStatus({ providerPaymentId: id }),
    ).toEqual({ kind: "UNAVAILABLE" }));
  it("does not expose a mutable snapshot reference", async () => {
    const s = createBillingSimulator();
    s.setPaymentStatus(id, snap);
    const a = await s.fetchPaymentStatus({ providerPaymentId: id });
    if (a.kind === "FOUND") a.statusAt.setTime(0);
    const result = await s.fetchPaymentStatus({ providerPaymentId: id });
    expect(result.kind).toBe("FOUND");
    if (result.kind === "FOUND")
      expect(result.statusAt.getTime()).toBe(snap.statusAt.getTime());
  });
  it("clears a configured snapshot", async () => {
    const s = createBillingSimulator();
    s.setPaymentStatus(id, snap);
    s.clearPaymentStatus(id);
    expect(await s.fetchPaymentStatus({ providerPaymentId: id })).toEqual({
      kind: "NOT_FOUND",
    });
  });
  it("configuration alias is deterministic", async () => {
    const s = createBillingSimulator();
    s.configurePaymentStatus(id, snap);
    expect((await s.fetchPaymentStatus({ providerPaymentId: id })).kind).toBe(
      "FOUND",
    );
  });
});
