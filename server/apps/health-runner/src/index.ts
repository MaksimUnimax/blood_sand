import type { BrowserFamily } from "@product/shared";

export type { BrowserFamily } from "@product/shared";
export interface BrowserDriver {
  readonly family: BrowserFamily;
  start(): Promise<void>;
  stop(): Promise<void>;
}
export class NoopBrowserDriver implements BrowserDriver {
  public constructor(public readonly family: BrowserFamily) {}
  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
}
