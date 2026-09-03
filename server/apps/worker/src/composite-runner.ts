import type { JobRunner } from "./lifecycle.js";
export class CompositeJobRunner implements JobRunner {
  private started: JobRunner[] = [];
  public constructor(private readonly children: readonly JobRunner[]) {}
  async start(): Promise<void> {
    try {
      for (const child of this.children) {
        await child.start();
        this.started.push(child);
      }
    } catch (error) {
      await this.stop();
      throw error;
    }
  }
  async stop(): Promise<void> {
    const running = this.started.splice(0).reverse();
    for (const child of running) await child.stop();
  }
}
