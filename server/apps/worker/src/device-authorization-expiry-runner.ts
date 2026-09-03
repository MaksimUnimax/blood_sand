import { randomUUID } from "node:crypto";
import type { DeviceAuthorizationRepository } from "@product/device-auth";
import type { JobRunner } from "./lifecycle.js";

/** Durable PostgreSQL expiry; SKIP LOCKED in the repository makes concurrent workers safe. */
export class DeviceAuthorizationExpiryRunner implements JobRunner {
  private timer: NodeJS.Timeout | undefined;
  public constructor(
    private readonly repository: DeviceAuthorizationRepository,
    private readonly intervalMs = 30_000,
    private readonly batchSize = 100,
  ) {}
  async start(): Promise<void> {
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
    await this.tick();
  }
  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
  async tick(): Promise<number> {
    return this.repository.expireDue(this.batchSize, randomUUID());
  }
}
