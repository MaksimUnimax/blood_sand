import { describe, expect, it } from "vitest";
import {
  bpsToPercent,
  defaultCompatibility,
  defaultProfileContent,
  percentToBps,
} from "../app/admin-ai";

describe("P7.5 admin AI UI safety helpers", () => {
  it.each([
    ["0", 0],
    ["1", 100],
    ["10.00", 1000],
    ["99.99", 9999],
    ["100.00", 10000],
  ])("converts exact percentage %s to basis points", (input, expected) => {
    expect(percentToBps(input)).toBe(expected);
  });

  it.each(["-1", "1.001", "10.", "01", "100.01", "1e1", "  "])(
    "rejects ambiguous percentage %s",
    (input) => expect(percentToBps(input)).toBeNull(),
  );

  it("formats server basis points without floating ambiguity", () => {
    expect(bpsToPercent(0)).toBe("0.00%");
    expect(bpsToPercent(10001)).toBe("100.01%");
  });

  it("starts with only accepted bounded declarative fields", () => {
    const content = defaultProfileContent();
    const compatibility = defaultCompatibility();
    const serialized = JSON.stringify({ content, compatibility });
    expect(content.schemaVersion).toBe("adapter_profile_v1");
    expect(compatibility.schemaVersion).toBe("profile_compatibility_v1");
    expect(content.contours.length).toBeGreaterThanOrEqual(4);
    expect(serialized).not.toMatch(
      /javascript|eval|http|url|headers|credentials|wasm|modules|filesystem/i,
    );
    expect(serialized).not.toContain("cohort");
  });
});
