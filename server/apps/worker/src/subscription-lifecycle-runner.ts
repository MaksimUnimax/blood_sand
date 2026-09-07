import { randomUUID } from "node:crypto";
import type { SubscriptionLifecycleJobRepository } from "@product/db";
import type { SubscriptionLifecycleProcessSummary } from "@product/db";
import type { JobRunner } from "./lifecycle.js";
export class SubscriptionLifecycleRunner implements JobRunner {
  private timer: NodeJS.Timeout | undefined;
  constructor(
    private readonly repository: SubscriptionLifecycleJobRepository,
    private readonly intervalMs = 30_000,
    private readonly batchSize = 100,
    private readonly now: () => Date = () => new Date(),
  ) {}
  async start(): Promise<void> {
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
    await this.tick();
  }
  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
  async tick(
    correlationId: string = randomUUID(),
  ): Promise<SubscriptionLifecycleProcessSummary> {
    return this.repository.processDue({
      now: new Date(this.now().getTime()),
      batchSize: this.batchSize,
      correlationId,
    });
  }
}
