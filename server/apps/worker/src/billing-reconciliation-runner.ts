import { randomUUID } from "node:crypto";
import type {
  BillingReconciliationRepository,
  BillingPaymentStatusPort,
} from "@product/billing";
import { createBillingReconciliationService as makeService } from "@product/billing";
import type { JobRunner } from "./lifecycle.js";

export type BillingReconciliationRunnerOptions = {
  repository: BillingReconciliationRepository;
  statusPort: BillingPaymentStatusPort;
  intervalMs?: number;
  batchSize?: number;
  leaseMs?: number;
  retryDelayMs?: number;
  now?: () => Date;
};
export class BillingReconciliationRunner implements JobRunner {
  private timer: NodeJS.Timeout | undefined;
  private readonly service: ReturnType<typeof makeService>;
  constructor(private readonly options: BillingReconciliationRunnerOptions) {
    this.service = makeService({
      repository: options.repository,
      statusPort: options.statusPort,
      now: options.now,
      retryDelayMs: options.retryDelayMs,
    });
  }
  async start(): Promise<void> {
    this.timer = setInterval(
      () => void this.tick(),
      this.options.intervalMs ?? 30_000,
    );
    await this.tick();
  }
  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
  async tick(
    correlationId: string = randomUUID(),
  ): Promise<{ claimed: number; completed: number }> {
    const claims = await this.options.repository.claimDue({
      now: new Date((this.options.now ?? (() => new Date()))().getTime()),
      leaseMs: this.options.leaseMs ?? 30_000,
      batchSize: this.options.batchSize ?? 100,
    });
    const results = await Promise.all(
      claims.map((claim) => this.service.processClaim(claim, correlationId)),
    );
    return { claimed: claims.length, completed: results.length };
  }
}
