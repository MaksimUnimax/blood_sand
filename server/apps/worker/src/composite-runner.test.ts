import { describe, expect, it, vi } from "vitest";
import { CompositeJobRunner } from "./composite-runner.js";

describe("CompositeJobRunner", () => {
  it("T1-COMPOSITE-01..04 starts OTP then expiry and stops in reverse", async () => {
    const events: string[] = [];
    const otp = {
      start: vi.fn(async () => void events.push("otp:start")),
      stop: vi.fn(async () => void events.push("otp:stop")),
    };
    const expiry = {
      start: vi.fn(async () => void events.push("expiry:start")),
      stop: vi.fn(async () => void events.push("expiry:stop")),
    };
    const runner = new CompositeJobRunner([otp, expiry]);
    await runner.start();
    await runner.stop();
    await runner.stop();
    expect(events).toEqual([
      "otp:start",
      "expiry:start",
      "expiry:stop",
      "otp:stop",
    ]);
  });

  it("T1-COMPOSITE-05..07 unwinds first child and preserves the startup error", async () => {
    const failure = new Error("expiry unavailable");
    const otp = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    };
    const expiry = {
      start: vi.fn().mockRejectedValue(failure),
      stop: vi.fn().mockResolvedValue(undefined),
    };
    const runner = new CompositeJobRunner([otp, expiry]);
    await expect(runner.start()).rejects.toBe(failure);
    expect(otp.stop).toHaveBeenCalledOnce();
    expect(expiry.stop).not.toHaveBeenCalled();
    await runner.stop();
    expect(otp.stop).toHaveBeenCalledOnce();
  });
});
