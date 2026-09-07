import { describe, expect, it } from "vitest";
import {
  buildSimulatorBillingEventEnvelope,
  createBillingSimulator,
  simulatorEventPayloadSha256,
  simulatorEventProof,
} from "./index.js";

const input = {
  provider: "simulator",
  eventIdentity: "sim_event_001",
  eventType: "payment.succeeded" as const,
  providerPaymentId: "sim_payment_001",
  amountMinor: 19000,
  currency: "RUB",
  occurredAt: "2026-01-31T12:34:56.789Z",
};

describe("P5.4 deterministic simulator event verification", () => {
  it("builds a stable envelope", () => {
    expect(buildSimulatorBillingEventEnvelope(input)).toEqual(
      buildSimulatorBillingEventEnvelope(input),
    );
  });

  it("uses the simulator provider key", () => {
    expect(buildSimulatorBillingEventEnvelope(input).event.provider).toBe(
      "simulator",
    );
  });

  it("normalizes occurredAt to ISO UTC", () => {
    expect(buildSimulatorBillingEventEnvelope(input).event.occurredAt).toBe(
      "2026-01-31T12:34:56.789Z",
    );
  });

  it("produces a lowercase SHA-256 payload fingerprint", () => {
    const envelope = buildSimulatorBillingEventEnvelope(input);
    expect(envelope.event.payloadSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces a proof in a distinct domain", () => {
    const envelope = buildSimulatorBillingEventEnvelope(input);
    expect(envelope.proof).not.toBe(envelope.event.payloadSha256);
    expect(
      simulatorEventProof({
        ...envelope.event,
        occurredAt: new Date(envelope.event.occurredAt),
      }),
    ).toBe(envelope.proof);
  });

  it("re-verifies a valid envelope", () => {
    const simulator = createBillingSimulator();
    expect(
      simulator.verifyEvent(buildSimulatorBillingEventEnvelope(input)),
    ).toMatchObject({
      kind: "VERIFIED",
      event: { eventIdentity: "sim_event_001", eventType: "payment.succeeded" },
    });
  });

  it.each([
    "provider",
    "eventIdentity",
    "eventType",
    "providerPaymentId",
    "amountMinor",
    "currency",
    "occurredAt",
  ])("detects tampering of %s without a new proof", (field) => {
    const envelope = buildSimulatorBillingEventEnvelope(input);
    const value = { ...envelope, event: { ...envelope.event } };
    if (field === "amountMinor") value.event.amountMinor += 1;
    else if (field === "provider") value.event.provider = "other";
    else if (field === "eventIdentity")
      value.event.eventIdentity = "sim_event_002";
    else if (field === "eventType") value.event.eventType = "payment.failed";
    else if (field === "providerPaymentId")
      value.event.providerPaymentId = "other_payment";
    else if (field === "currency") value.event.currency = "USD";
    else value.event.occurredAt = "2026-02-01T12:34:56.789Z";
    expect(createBillingSimulator().verifyEvent(value)).toEqual({
      kind: "REJECTED",
      code: field === "provider" ? "MALFORMED_EVENT" : "INVALID_EVENT_PROOF",
    });
  });

  it("rejects malformed envelope structure", () => {
    expect(createBillingSimulator().verifyEvent({})).toEqual({
      kind: "REJECTED",
      code: "MALFORMED_EVENT",
    });
  });

  it("rejects an extra provider body field", () => {
    const envelope = buildSimulatorBillingEventEnvelope(input);
    expect(
      createBillingSimulator().verifyEvent({
        ...envelope,
        rawProviderBody: {},
      }),
    ).toEqual({ kind: "REJECTED", code: "MALFORMED_EVENT" });
  });

  it("rejects unsupported normalized event types as malformed", () => {
    const envelope = buildSimulatorBillingEventEnvelope(input);
    expect(
      createBillingSimulator().verifyEvent({
        ...envelope,
        event: { ...envelope.event, eventType: "payment.refunded" },
      }),
    ).toEqual({ kind: "REJECTED", code: "MALFORMED_EVENT" });
  });

  it("rejects a non-simulator provider", () => {
    const envelope = buildSimulatorBillingEventEnvelope({
      ...input,
      provider: "other",
    });
    expect(createBillingSimulator().verifyEvent(envelope)).toEqual({
      kind: "REJECTED",
      code: "MALFORMED_EVENT",
    });
  });

  it("recomputes the payload hash from canonical fields", () => {
    const envelope = buildSimulatorBillingEventEnvelope(input);
    expect(
      simulatorEventPayloadSha256({
        ...envelope.event,
        occurredAt: new Date(envelope.event.occurredAt),
      }),
    ).toBe(envelope.event.payloadSha256);
  });

  it("keeps proof deterministic across simulator instances", () => {
    const one = createBillingSimulator().buildEventEnvelope(input);
    const two = createBillingSimulator().buildEventEnvelope(input);
    expect(one.proof).toBe(two.proof);
  });

  it.each(["payment.failed", "payment.canceled"] as const)(
    "verifies terminal event type %s",
    (eventType) => {
      const envelope = buildSimulatorBillingEventEnvelope({
        ...input,
        eventType,
      });
      expect(createBillingSimulator().verifyEvent(envelope)).toMatchObject({
        kind: "VERIFIED",
        event: { eventType },
      });
    },
  );
});
