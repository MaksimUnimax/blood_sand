import { describe, expect, it } from "vitest";
import {
  buildCompatibilityPublishBody,
  buildPriceCreateBody,
  withCursor,
} from "../app/admin-ui";

describe("admin UI boundary regressions", () => {
  it("continues every paginated path with one current cursor", () => {
    expect(withCursor("/v1/admin/accounts?limit=50", "cursor-2")).toBe(
      "/v1/admin/accounts?limit=50&cursor=cursor-2",
    );
    expect(
      withCursor("/v1/admin/accounts?limit=50&cursor=cursor-2", "cursor-3"),
    ).toBe("/v1/admin/accounts?limit=50&cursor=cursor-3");
  });

  it("builds the complete strict price-create body", () => {
    expect(
      buildPriceCreateBody({
        planId: "plan-id",
        code: "price-code",
        marketKey: "global",
        channelKey: "web",
      }),
    ).toEqual({
      planId: "plan-id",
      code: "price-code",
      marketKey: "global",
      channelKey: "web",
    });
  });

  it("does not send fields outside the strict compatibility publish body", () => {
    expect(buildCompatibilityPublishBody("maintenance window")).toEqual({
      browserFamily: null,
      minimumExtensionVersion: null,
      recommendedExtensionVersion: null,
      minimumBrowserVersion: null,
      maintenanceMode: false,
      maintenanceCode: null,
      blockedVersions: [],
      reason: "maintenance window",
    });
  });
});
