import type {
  PlanRevisionState,
  PlanStatus,
  TypedEntitlementValue,
} from "@product/plans";
import type { BillingIntervalUnit, PriceStatus } from "@product/pricing";
import { z } from "zod";

export const CommercialCatalogIdentifierSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/);

export type PublicCommercialCatalogQuery = {
  marketKey: string;
  channelKey: string;
  at: Date;
};

export type PublicCommercialOffer = {
  plan: {
    planId: string;
    planCode: string;
    planRevisionId: string;
    planRevision: number;
    displayName: string;
    description: string;
  };
  price: {
    priceId: string;
    priceCode: string;
    priceRevisionId: string;
    priceRevision: number;
    amountMinor: number;
    currency: string;
    billingIntervalUnit: BillingIntervalUnit;
    billingIntervalCount: number;
    effectiveFrom: Date;
    effectiveTo: Date | null;
  };
};

export interface PublicCommercialCatalogReader {
  listPublicOffers(
    input: PublicCommercialCatalogQuery,
  ): Promise<PublicCommercialOffer[]>;
}

export const PurchasableOfferFailureCodeSchema = z.enum([
  "PRICE_REVISION_NOT_FOUND",
  "PRICE_REVISION_NOT_PUBLISHED",
  "PLAN_NOT_ACTIVE",
  "PRICE_NOT_ACTIVE",
  "NO_EFFECTIVE_ASSIGNMENT",
  "EXPLICITLY_CLOSED",
  "PRICE_REVISION_NOT_SELECTED",
  "REVISION_OUTSIDE_EFFECTIVE_WINDOW",
  "PLAN_REVISION_NOT_PUBLISHED",
  "PLAN_REVISION_PLAN_MISMATCH",
]);
export type PurchasableOfferFailureCode = z.infer<
  typeof PurchasableOfferFailureCodeSchema
>;

export type ResolvePurchasableOfferInput = {
  priceRevisionId: string;
  at: Date;
};

export type PurchasableOffer = {
  planId: string;
  planCode: string;
  planRevisionId: string;
  planRevision: number;
  priceId: string;
  priceCode: string;
  priceRevisionId: string;
  priceRevision: number;
  marketKey: string;
  channelKey: string;
  amountMinor: number;
  currency: string;
  billingIntervalUnit: BillingIntervalUnit;
  billingIntervalCount: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type PurchasableOfferResolution =
  | { kind: "OK"; value: PurchasableOffer }
  | { kind: "REJECTED"; code: PurchasableOfferFailureCode };

export interface PurchasableOfferResolver {
  resolvePurchasableOffer(
    input: ResolvePurchasableOfferInput,
  ): Promise<PurchasableOfferResolution>;
}

export type InspectedEntitlement = {
  entitlementKey: string;
  value: TypedEntitlementValue;
  definition: {
    valueType: "BOOLEAN" | "INTEGER";
    securityClassification: "CAPABILITY" | "LIMIT";
    deprecatedAt: Date | null;
  } | null;
};

export type InspectedPlanRevision = {
  id: string;
  revision: number;
  state: PlanRevisionState;
  displayName: string;
  description: string;
  createdAt: Date;
  publishedAt: Date | null;
  entitlements: InspectedEntitlement[];
};

export type InspectedPlan = {
  id: string;
  code: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
  revisions: InspectedPlanRevision[];
};

export type InspectedPriceRevision = {
  id: string;
  revision: number;
  planRevisionId: string;
  state: "DRAFT" | "PUBLISHED";
  amountMinor: number;
  currency: string;
  billingIntervalUnit: BillingIntervalUnit;
  billingIntervalCount: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  publishedAt: Date | null;
  contentFingerprintSha256: string;
};

export type InspectedSaleAssignment = {
  id: string;
  assignmentRevision: number;
  selectedPriceRevisionId: string | null;
  effectiveFrom: Date;
  createdAt: Date;
};

export type InspectedPrice = {
  id: string;
  planId: string;
  code: string;
  marketKey: string;
  channelKey: string;
  status: PriceStatus;
  createdAt: Date;
  updatedAt: Date;
  revisions: InspectedPriceRevision[];
  saleAssignments: InspectedSaleAssignment[];
};

export interface CommercialCatalogInspectionReader {
  inspectPlan(planId: string): Promise<InspectedPlan | null>;
  inspectPrice(priceId: string): Promise<InspectedPrice | null>;
}
