import { createHash } from "node:crypto";
import {
  BillingProviderCheckoutInputSchema,
  type BillingProviderPort,
  type BillingProviderCheckoutInput,
  type ProviderCheckoutResult,
} from "@product/billing";

export type BillingSimulatorScenario =
  | "SUCCESS"
  | "REJECTED"
  | "UNAVAILABLE"
  | "UNAVAILABLE_THEN_SUCCESS";

export type BillingSimulatorOptions = {
  scenario?: BillingSimulatorScenario;
};

function id(prefix: string, requestId: string): string {
  const digest = createHash("sha256")
    .update(
      `product-control-plane/billing-simulator/v1/${prefix}\n${requestId}`,
    )
    .digest("hex");
  return `sim_${prefix}_${digest}`;
}

export class DeterministicBillingSimulator implements BillingProviderPort {
  readonly providerKey = "simulator";
  private readonly scenario: BillingSimulatorScenario;
  private readonly attempted = new Set<string>();

  constructor(options: BillingSimulatorOptions = {}) {
    this.scenario = options.scenario ?? "SUCCESS";
  }

  async createCheckout(
    rawInput: BillingProviderCheckoutInput,
  ): Promise<ProviderCheckoutResult> {
    const input = BillingProviderCheckoutInputSchema.parse(rawInput);
    if (this.scenario === "UNAVAILABLE") return { kind: "UNAVAILABLE" };
    if (
      this.scenario === "UNAVAILABLE_THEN_SUCCESS" &&
      !this.attempted.has(input.providerRequestId)
    ) {
      this.attempted.add(input.providerRequestId);
      return { kind: "UNAVAILABLE" };
    }
    if (this.scenario === "REJECTED")
      return { kind: "REJECTED", code: "REJECTED" };
    return {
      kind: "CREATED",
      providerCheckoutId: id("checkout", input.providerRequestId),
      providerPaymentId: id("payment", input.providerRequestId),
      checkoutReference: id("ref", input.providerRequestId),
    };
  }
}

export const createBillingSimulator = (options: BillingSimulatorOptions = {}) =>
  new DeterministicBillingSimulator(options);
