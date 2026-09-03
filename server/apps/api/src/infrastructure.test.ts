import { describe, expect, it, vi } from "vitest";
import { createInfrastructureReadiness } from "./infrastructure.js";

describe("createInfrastructureReadiness", () => {
  it("returns true when the database is ready", async () => {
    const ready = vi.fn().mockResolvedValue(undefined);

    await expect(createInfrastructureReadiness({ ready })()).resolves.toBe(
      true,
    );
    expect(ready).toHaveBeenCalledOnce();
  });

  it("returns false when the database readiness check rejects", async () => {
    const ready = vi.fn().mockRejectedValue(new Error("database unavailable"));

    await expect(createInfrastructureReadiness({ ready })()).resolves.toBe(
      false,
    );
    expect(ready).toHaveBeenCalledOnce();
  });
});
