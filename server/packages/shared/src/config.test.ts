import { describe, expect, it } from "vitest";
import { compareSemVerV1, loadConfig } from "./index.js";

describe("loadConfig", () => {
  it("rejects an absent required database URL deterministically", () => {
    expect(() => loadConfig({ NODE_ENV: "test" })).toThrow();
  });
});

describe("compareSemVerV1", () => {
  it("implements the SemVer 2.0 precedence examples", () => {
    const ascending: Array<[string, string]> = [
      ["1.0.0", "2.0.0"],
      ["2.0.0", "2.1.0"],
      ["2.1.0", "2.1.1"],
      ["1.0.0-alpha", "1.0.0"],
      ["1.0.0-alpha", "1.0.0-alpha.1"],
      ["1.0.0-alpha.1", "1.0.0-alpha.beta"],
      ["1.0.0-alpha.beta", "1.0.0-beta"],
      ["1.0.0-beta", "1.0.0-beta.2"],
      ["1.0.0-beta.2", "1.0.0-beta.11"],
      ["1.0.0-beta.11", "1.0.0-rc.1"],
      ["1.0.0-rc.1", "1.0.0"],
    ];
    for (const [a, b] of ascending) expect(compareSemVerV1(a, b)).toBe(-1);
    expect(compareSemVerV1("1.0.0+build.1", "1.0.0+build.9")).toBe(0);
  });
});
