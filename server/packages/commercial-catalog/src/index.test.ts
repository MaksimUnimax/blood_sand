import { describe, expect, it } from "vitest";
import {
  CommercialCatalogIdentifierSchema,
  PurchasableOfferFailureCodeSchema,
  type CommercialCatalogInspectionReader,
  type PublicCommercialCatalogReader,
  type PurchasableOfferResolver,
} from "./index.js";

describe("commercial catalog read ports", () => {
  it("uses the strict lower-case commercial identifier grammar", () => {
    expect(CommercialCatalogIdentifierSchema.safeParse("ru.web").success).toBe(
      true,
    );
    for (const value of ["1ru", "RU", "ru web", "ru/"].map(String))
      expect(CommercialCatalogIdentifierSchema.safeParse(value).success).toBe(
        false,
      );
  });

  it("exposes stable exact-purchase failure codes", () => {
    expect(
      PurchasableOfferFailureCodeSchema.parse("PRICE_REVISION_NOT_SELECTED"),
    ).toBe("PRICE_REVISION_NOT_SELECTED");
  });

  it("keeps the three read ports mutation-free", () => {
    const publicReader: PublicCommercialCatalogReader = {
      listPublicOffers: async () => [],
    };
    const resolver: PurchasableOfferResolver = {
      resolvePurchasableOffer: async () => ({
        kind: "REJECTED",
        code: "NO_EFFECTIVE_ASSIGNMENT",
      }),
    };
    const inspection: CommercialCatalogInspectionReader = {
      inspectPlan: async () => null,
      inspectPrice: async () => null,
    };
    expect(publicReader.listPublicOffers).toBeTypeOf("function");
    expect(resolver.resolvePurchasableOffer).toBeTypeOf("function");
    expect(inspection.inspectPlan).toBeTypeOf("function");
    expect(inspection.inspectPrice).toBeTypeOf("function");
  });
});
